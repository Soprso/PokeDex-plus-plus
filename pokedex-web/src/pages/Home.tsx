import { SafeAreaView } from '@/components/native/SafeAreaView';
import { useUser } from '@clerk/clerk-react';
// import { useNavigation } from '@react-navigation/native'; // REMOVED
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigate } from 'react-router-dom'; // ADDED

// Components
import { FilterBar } from '@/components/home/FilterBar';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PokemonGrid } from '@/components/home/PokemonGrid';
import { RadialMenu } from '@/components/home/RadialMenu';
import { ToastNotification } from '@/components/home/ToastNotification';
import { BuddyModal } from '@/components/home/modals/BuddyModal';
import { BuddyProgressModal } from '@/components/home/modals/BuddyProgressModal';
import { ComingSoonModal } from '@/components/home/modals/ComingSoonModal';
import { EconomyModal } from '@/components/home/modals/EconomyModal';
import { FilterModal } from '@/components/home/modals/FilterModal';
import { NicknameModal } from '@/components/home/modals/NicknameModal';
import { SettingsModal } from '@/components/home/modals/SettingsModal';
import { SortModal } from '@/components/home/modals/SortModal';

// Hooks & Data
import type { PokemonType } from '@/constants/pokemonTypes';
import { REGIONS } from '@/constants/regions';
import { calculateBuddyLevel, canGiveHeart, getHeartTracker, getRemainingHearts, getTodayDate } from '@/hooks/useHeartSystem';
import { usePokemonData } from '@/hooks/usePokemonData';
import type { BuddyData, DailyHeartTracker, PokemonWithNickname } from '@/types';

export default function HomeScreen() {
  const navigate = useNavigate(); // CHANGED
  const { user, isLoaded } = useUser(); // Clerk authentication

  // Load buddy data from Clerk metadata
  const buddyData: Record<number, BuddyData> = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.buddyData as Record<number, BuddyData>) || {};
  }, [user?.unsafeMetadata]);

  // Load heart tracker from Clerk metadata
  const heartTracker: DailyHeartTracker = useMemo(() => {
    return getHeartTracker(user?.unsafeMetadata);
  }, [user?.unsafeMetadata]);

  // Data State
  const { allPokemon, loading, refreshing, loadProgress, error, refetch } = usePokemonData();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0); // 0 = All
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [sortOption, setSortOption] = useState<'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'buddy-desc'>('id-asc');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(20); // Pagination

  // Modals State
  const [modals, setModals] = useState({
    settings: false,
    filter: false,
    sort: false,
    buddy: false,
    buddyProgress: false,
    economy: false,
    nickname: false,
    auth: false,
    comingSoon: false,
  });

  // Settings State - Load from localStorage on mount
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pokedex-settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse settings:', e);
        }
      }
    }
    return {
      darkMode: false,
      sound: true,
      vibration: true,
      shinySprites: false,
      nicknames: true,
      cacheImages: true,
      gridLayout: true,
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokedex-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Nickname State
  const [nicknameTarget, setNicknameTarget] = useState<PokemonWithNickname | null>(null);
  const [tempNickname, setTempNickname] = useState('');

  // Buddy Progress State
  const [buddyProgressTarget, setBuddyProgressTarget] = useState<PokemonWithNickname | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  // Derived Data
  const filteredPokemon = useMemo(() => {
    let result = allPokemon;

    // 1. Region Filter
    if (selectedRegionIndex > 0 && !searchQuery) {
      const region = REGIONS[selectedRegionIndex];
      const startId = region.offset + 1;
      const endId = region.offset + region.limit;
      result = result.filter(p => p.id >= startId && p.id <= endId);
    }

    // 2. Type Filter
    if (selectedTypes.length > 0) {
      result = result.filter(p =>
        selectedTypes.every(t => p.types.includes(t))
      );
    }

    // 3. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        String(p.id).includes(query) ||
        (p.nickname && p.nickname.toLowerCase().includes(query))
      );
    }

    // 4. Sort
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'id-asc': return a.id - b.id;
        case 'id-desc': return b.id - a.id;
        case 'name-asc': return (a.nickname || a.name).localeCompare(b.nickname || b.name);
        case 'name-desc': return (b.nickname || b.name).localeCompare(a.nickname || a.name);
        default: return a.id - b.id;
      }
    });

    return result;
  }, [allPokemon, selectedRegionIndex, selectedTypes, searchQuery, sortOption]);

  const displayedPokemon = useMemo(() => {
    return filteredPokemon.slice(0, displayCount);
  }, [filteredPokemon, displayCount]);

  // Handlers
  const handleLoadMore = () => {
    if (displayCount < filteredPokemon.length) {
      setDisplayCount(prev => prev + 20);
    }
  };

  const handlePokemonPress = (pokemon: PokemonWithNickname) => {
    navigate(`/details/${pokemon.name}`); // CHANGED to route string
  };

  const handleMenuPress = (id: string) => {
    setIsMenuOpen(false);
    switch (id) {
      case 'settings': setModals({ ...modals, settings: true }); break;
      case 'filter': setModals({ ...modals, filter: true }); break;
      case 'sort': setModals({ ...modals, sort: true }); break;
      case 'shop': navigate('/shop'); break;
      case 'pokehub': setModals({ ...modals, comingSoon: true }); break; // CHANGED to show coming soon
      case 'profile': navigate('/profile'); break;
    }
  };

  const handleBuddyLongPress = (pokemon: PokemonWithNickname) => {
    setBuddyProgressTarget(pokemon);
    setModals({ ...modals, buddyProgress: true });
  };

  // Handle heart click
  const handleHeartClick = async (pokemon: PokemonWithNickname) => {
    // Check if user is logged in
    if (!isLoaded) return; // Still loading auth state

    if (!user) {
      setToast({ visible: true, message: 'Please log in to give hearts to your Pokémon!', type: 'info' });
      setTimeout(() => setModals({ ...modals, auth: true }), 1000); // Open auth modal after toast
      return;
    }

    // Check if can give heart
    const check = canGiveHeart(heartTracker, pokemon.id);
    if (!check.can) {
      setToast({ visible: true, message: check.reason || 'Cannot give heart', type: 'error' });
      return;
    }

    // Calculate new buddy data
    const existing = buddyData[pokemon.id];
    const newPoints = (existing?.points || 0) + 1;
    const newLevel = calculateBuddyLevel(newPoints);
    const today = getTodayDate();

    const newBuddyData: BuddyData = {
      pokemonId: pokemon.id,
      level: newLevel,
      points: newPoints,
      consecutiveDays: existing ? (existing.lastInteractionDate === today ? existing.consecutiveDays : existing.consecutiveDays + 1) : 1,
      lastInteractionDate: today,
      lastHeartDate: today,
      dailyHearts: (existing?.lastHeartDate === today ? existing.dailyHearts : 0) + 1,
      achievedBestBuddyDate: newLevel === 4 && existing?.level !== 4 ? today : existing?.achievedBestBuddyDate,
    };

    // Update Clerk metadata
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          buddyData: {
            ...(user.unsafeMetadata.buddyData as Record<number, BuddyData>),
            [pokemon.id]: newBuddyData,
          },
          dailyHeartTracker: {
            date: today,
            heartsGivenToday: heartTracker.heartsGivenToday + 1,
            pokemonHeartedToday: [...heartTracker.pokemonHeartedToday, pokemon.id],
          },
        },
      });

      // Show success toast
      const heartsLeft = getRemainingHearts(heartTracker) - 1;
      const heartText = heartsLeft === 1 ? 'heart' : 'hearts';
      setToast({
        visible: true,
        message: `Gave 1 ❤️ to ${pokemon.nickname || pokemon.name}! ${heartsLeft} ${heartText} left for today.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to give heart:', error);
      setToast({ visible: true, message: 'Failed to give heart. Please try again.', type: 'error' });
    }
  };

  // Render
  if (loading && allPokemon.length === 0) {
    return (
      <View style={[styles.container, styles.center, settings.darkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading Pokédex...</Text>
        <Text style={styles.loadingSubtext}>{loadProgress.loaded} / {loadProgress.total}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, settings.darkMode ? styles.darkContainer : undefined]}>
      {/* Header */}
      <HomeHeader
        balance={100}
        onBuddyHelpPress={() => setModals({ ...modals, buddy: true })}
        onWalletPress={() => setModals({ ...modals, economy: true })}
        darkMode={settings.darkMode}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegionIndex={selectedRegionIndex}
        onRegionSelect={setSelectedRegionIndex}
        darkMode={settings.darkMode}
      />

      {/* Grid */}
      <PokemonGrid
        pokemon={displayedPokemon}
        onPokemonPress={handlePokemonPress}
        onPokemonLongPress={(p) => {
          setNicknameTarget(p);
          setTempNickname(p.nickname || '');
          setModals({ ...modals, nickname: true });
        }}
        onEndReached={handleLoadMore}
        listFooterComponent={
          displayCount < filteredPokemon.length ? <ActivityIndicator style={{ padding: 20 }} /> : <View style={{ height: 100 }} />
        }
        buddyData={buddyData}
        nicknames={{}} // Placeholder
        settings={settings}
        refreshing={refreshing}
        onRefresh={refetch}
        onBuddyLongPress={handleBuddyLongPress}
        onBuddyHeartClick={handleHeartClick}
      />

      {/* Radial Menu */}
      <RadialMenu
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
        onItemPress={handleMenuPress}
      />

      {/* Modals */}
      <SettingsModal
        visible={modals.settings}
        onClose={() => setModals({ ...modals, settings: false })}
        settings={settings}
        onUpdateSetting={(k, v) => setSettings({ ...settings, [k]: v })}
      />

      <FilterModal
        visible={modals.filter}
        onClose={() => setModals({ ...modals, filter: false })}
        selectedTypes={selectedTypes}
        onToggleType={(t) => {
          setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
        }}
        onClear={() => setSelectedTypes([])}
        onApply={() => setModals({ ...modals, filter: false })}
        darkMode={settings.darkMode}
      />

      <SortModal
        visible={modals.sort}
        onClose={() => setModals({ ...modals, sort: false })}
        sortOption={sortOption}
        onSortSelect={(o) => { setSortOption(o); setModals({ ...modals, sort: false }); }}
        darkMode={settings.darkMode}
      />

      <BuddyModal
        visible={modals.buddy}
        onClose={() => setModals({ ...modals, buddy: false })}
        isSignedIn={!!user}
        onSignIn={() => setModals({ ...modals, auth: true })}
        darkMode={settings.darkMode}
      />

      <ComingSoonModal
        visible={modals.comingSoon}
        onClose={() => setModals({ ...modals, comingSoon: false })}
        featureName="PokéHub"
      />

      <EconomyModal
        visible={modals.economy}
        onClose={() => setModals({ ...modals, economy: false })}
        type="info"
        title="Wallet"
        message=""
        balance={100}
        streak={5}
        darkMode={settings.darkMode}
      />

      <NicknameModal
        visible={modals.nickname}
        onClose={() => setModals({ ...modals, nickname: false })}
        nickname={tempNickname}
        onNicknameChange={setTempNickname}
        onSave={() => {
          // Save logic
          setModals({ ...modals, nickname: false });
        }}
        pokemonName={nicknameTarget?.name || 'Pokemon'}
        darkMode={settings.darkMode}
      />

      <BuddyProgressModal
        visible={modals.buddyProgress}
        onClose={() => setModals({ ...modals, buddyProgress: false })}
        pokemon={buddyProgressTarget}
        buddyData={buddyProgressTarget ? (buddyData[buddyProgressTarget.id] || null) : null}
        darkMode={settings.darkMode}
      />

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  loadingSubtext: {
    marginTop: 8,
    color: '#999',
  }
});
