import { SafeAreaView } from '@/components/native/SafeAreaView';
import { useUser } from '@clerk/clerk-react';
// import { useNavigation } from '@react-navigation/native'; // REMOVED
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigate, useSearchParams } from 'react-router-dom'; // UPDATED

// Components
import { FilterBar } from '@/components/home/FilterBar';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PokemonGrid } from '@/components/home/PokemonGrid';
import { PokemonGridSkeleton } from '@/components/home/PokemonGridSkeleton';
import { RadialMenu } from '@/components/home/RadialMenu';
import { ToastNotification } from '@/components/home/ToastNotification';
import { BuddyProgressModal } from '@/components/home/modals/BuddyProgressModal';
import { CardStyleModal } from '@/components/home/modals/CardStyleModal';
import { ComingSoonModal } from '@/components/home/modals/ComingSoonModal';
import { EconomyModal } from '@/components/home/modals/EconomyModal';
import { FilterModal } from '@/components/home/modals/FilterModal';
import { SettingsModal } from '@/components/home/modals/SettingsModal';
import { SortModal } from '@/components/home/modals/SortModal';
import { WelcomeModal } from '@/components/home/modals/WelcomeModal';
import AuthModal from '@/modals/auth';
import type { CardEffects, Inventory } from '@/types';

// Hooks & Data
import type { PokemonType } from '@/constants/pokemonTypes';
import { REGIONS } from '@/constants/regions';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { useEconomySystem } from '@/hooks/useEconomySystem';
import { calculateBuddyLevel, canGiveHeart, getHeartTracker, getRemainingHearts, getTodayDate } from '@/hooks/useHeartSystem';
import { usePokemonData } from '@/hooks/usePokemonData';
import type { BuddyData, DailyHeartTracker, PokemonWithNickname } from '@/types';

export default function HomeScreen() {
  const navigate = useNavigate(); // CHANGED
  const { user } = useUser(); // Clerk authentication

  // Load buddy data from Clerk metadata
  const buddyData: Record<number, BuddyData> = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.buddyData as Record<number, BuddyData>) || {};
  }, [user?.unsafeMetadata]);

  // Load heart tracker from Clerk metadata
  const heartTracker: DailyHeartTracker = useMemo(() => {
    return getHeartTracker(user?.unsafeMetadata);
  }, [user?.unsafeMetadata]);

  // Load economy data from Clerk metadata
  const economy = useMemo(() => {
    const eco = (user?.unsafeMetadata.economy as any) || { balance: 0, streak: 0 };
    return eco;
  }, [user?.unsafeMetadata]);

  // Load nicknames from Clerk metadata
  const nicknames: Record<number, string> = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.nicknames as Record<number, string>) || {};
  }, [user?.unsafeMetadata]);

  // Local nicknames for optimistic updates
  const [localNicknames, setLocalNicknames] = useState<Record<number, string>>({});

  // Sync local nicknames when metadata changes
  useEffect(() => {
    setLocalNicknames(nicknames);
  }, [nicknames]);

  // Load Inventory & Style Data from Clerk
  const inventory: Inventory = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.inventory as Inventory) || {};
  }, [user?.unsafeMetadata]);

  const cardEffects: CardEffects = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.cardEffects as CardEffects) || {};
  }, [user?.unsafeMetadata]);

  const cardFrames: Record<number, string> = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.cardFrames as Record<number, string>) || {};
  }, [user?.unsafeMetadata]);

  const unlockedEffects: Record<number, string[]> = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.unlockedCardEffects as Record<number, string[]>) || {};
  }, [user?.unsafeMetadata]);

  const unlockedFrames: Record<number, string[]> = useMemo(() => {
    if (!user) return {};
    return (user.unsafeMetadata.unlockedCardFrames as Record<number, string[]>) || {};
  }, [user?.unsafeMetadata]);

  // Economy System
  const { checkDailyReward, rewardClaimed, debugSetStreak, resetRewardState } = useEconomySystem();

  // Check daily reward on mount/auth
  useEffect(() => {
    if (user) {
      checkDailyReward();
    }
  }, [user]);

  // Welcome Modal Logic for New Users
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      // Small delay to ensure smooth initial render
      const timer = setTimeout(() => {
        setModals(prev => ({ ...prev, welcome: true }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = () => {
    setModals(prev => ({ ...prev, welcome: false }));
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  // Show reward modal when claimed
  useEffect(() => {
    if (rewardClaimed && !modals.economy) {
      console.log('Home: Opening Economy Modal for Daily Reward', rewardClaimed);
      setModals(m => ({ ...m, economy: true }));
    }
  }, [rewardClaimed]);

  // Data State
  const { allPokemon, loading, refreshing, refetch } = usePokemonData();

  // State Synchronization with URL Parameters
  const [searchParams, setSearchParams] = useSearchParams();

  // Helpers to update search params
  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || (key === 'r' && value === '0')) {
          prev.delete(key);
        } else {
          prev.set(key, value);
        }
      });
      return prev;
    }, { replace: true });
  };

  // Derived Filter State from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedRegionIndex = parseInt(searchParams.get('r') || '0', 10);
  const selectedTypes = useMemo(() =>
    (searchParams.get('t')?.split(',') || []).filter(Boolean) as PokemonType[]
    , [searchParams]);
  const sortOption = (searchParams.get('s') || 'id-asc') as any;

  // Pagination is kept local but could be moved to URL if desired
  const [displayCount, setDisplayCount] = useState(30);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    styleConfirmation: false,
    welcome: false,
  });

  const [styleConfirmationTarget, setStyleConfirmationTarget] = useState<{
    type: 'effect' | 'frame';
    itemId: string;
    itemName: string;
  } | null>(null);

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
  const pokemonWithNicknames = useMemo(() => {
    return allPokemon.map(p => ({
      ...p,
      nickname: localNicknames[p.id] || p.nickname
    }));
  }, [allPokemon, localNicknames]);

  const filteredPokemon = useMemo(() => {
    let result = pokemonWithNicknames;

    // 1. Region Filter
    if (selectedRegionIndex >= 0 && !searchQuery) {
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
    if (!user) {
      setModals({ ...modals, auth: true });
      return;
    }
    setBuddyProgressTarget(pokemon);
    setModals({ ...modals, buddyProgress: true });
  };

  const handleApplyStyle = async (type: 'effect' | 'frame', itemId: string) => {
    if (!user || !nicknameTarget) return;
    const pokemonId = nicknameTarget.id;

    const currentStyles = type === 'effect' ? cardEffects : cardFrames;
    const activeId = currentStyles[pokemonId] || 'none';

    if (activeId === itemId) return;

    // Reset logic
    if (itemId === 'default') {
      const metadataKey = type === 'effect' ? 'cardEffects' : 'cardFrames';
      const updatedStyles = { ...currentStyles, [pokemonId]: 'none' };

      try {
        await user.update({
          unsafeMetadata: {
            [metadataKey]: updatedStyles
          }
        });
        setToast({ visible: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} removed.`, type: 'info' });
      } catch (e) {
        console.error('Failed to reset style:', e);
      }
      return;
    }

    // Unlock/Apply Logic
    const unlockedList = (type === 'effect' ? unlockedEffects[pokemonId] : unlockedFrames[pokemonId]) || [];
    const isUnlocked = unlockedList.includes(itemId);

    if (isUnlocked) {
      const metadataKey = type === 'effect' ? 'cardEffects' : 'cardFrames';
      const updatedStyles = { ...currentStyles, [pokemonId]: itemId };
      try {
        await user.update({
          unsafeMetadata: {
            [metadataKey]: updatedStyles
          }
        });
      } catch (e) {
        console.error('Failed to apply unlocked style:', e);
      }
      return;
    }

    // Consume Inventory to Unlock - Show Confirmation First
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const count = inventory[itemId] || 0;
    if (count <= 0) {
      setToast({ visible: true, message: `You need to purchase this ${type} in the shop first.`, type: 'error' });
      return;
    }

    setStyleConfirmationTarget({ type, itemId, itemName: item.name });
    setModals({ ...modals, styleConfirmation: true });
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const finalizeStyleApplication = async () => {
    if (!user || !nicknameTarget || !styleConfirmationTarget || isProcessing) return;
    setIsProcessing(true);

    try {
      const { type, itemId } = styleConfirmationTarget;
      const pokemonId = nicknameTarget.id;

      // Read latest data from metadata
      const currentMetadata = user.unsafeMetadata;
      const latestInventory = (currentMetadata.inventory as Inventory) || {};
      const latestEffects = (currentMetadata.cardEffects as CardEffects) || {};
      const latestFrames = (currentMetadata.cardFrames as Record<number, string>) || {};
      const latestUnlockedEffects = (currentMetadata.unlockedCardEffects as Record<number, string[]>) || {};
      const latestUnlockedFrames = (currentMetadata.unlockedCardFrames as Record<number, string[]>) || {};

      const count = latestInventory[itemId] || 0;
      if (count <= 0) {
        setToast({ visible: true, message: `You no longer have this ${type} in your inventory.`, type: 'error' });
        setModals(prev => ({ ...prev, styleConfirmation: false }));
        return;
      }

      // Actually Consume
      const newCount = count - 1;
      const newInventory = { ...latestInventory, [itemId]: newCount };
      if (newInventory[itemId] === 0) delete newInventory[itemId];

      const metadataKey = type === 'effect' ? 'cardEffects' : 'cardFrames';
      const unlockedKey = type === 'effect' ? 'unlockedCardEffects' : 'unlockedCardFrames';

      const currentStyles = type === 'effect' ? latestEffects : latestFrames;
      const unlockedList = (type === 'effect' ? latestUnlockedEffects[pokemonId] : latestUnlockedFrames[pokemonId]) || [];

      const updatedStyles = { ...currentStyles, [pokemonId]: itemId };
      const updatedUnlocked = {
        ...(type === 'effect' ? latestUnlockedEffects : latestUnlockedFrames),
        [pokemonId]: [...unlockedList, itemId]
      };

      await user.update({
        unsafeMetadata: {
          inventory: newInventory,
          [metadataKey]: updatedStyles,
          [unlockedKey]: updatedUnlocked
        }
      });
      setToast({ visible: true, message: `${styleConfirmationTarget.itemName} unlocked and applied!`, type: 'success' });
      setModals(prev => ({ ...prev, styleConfirmation: false }));
    } catch (e) {
      console.error('Failed to apply style:', e);
      setToast({ visible: true, message: 'Transaction failed. Please try again.', type: 'error' });
    } finally {
      setIsProcessing(false);
      setStyleConfirmationTarget(null);
    }
  };

  // Handle heart click
  const handleHeartClick = async (pokemon: PokemonWithNickname) => {
    if (!user || isProcessing) return;
    setIsProcessing(true);

    try {
      // Check if can give heart (read latest tracker)
      const currentMetadata = user.unsafeMetadata;
      const latestTracker = getHeartTracker(currentMetadata);

      const check = canGiveHeart(latestTracker, pokemon.id);
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

      await user.update({
        unsafeMetadata: {
          buddyData: {
            ...(currentMetadata.buddyData as Record<number, BuddyData>),
            [pokemon.id]: newBuddyData,
          },
          dailyHeartTracker: {
            date: today,
            heartsGivenToday: latestTracker.heartsGivenToday + 1,
            pokemonHeartedToday: [...latestTracker.pokemonHeartedToday, pokemon.id],
          },
        },
      });

      // Show success toast
      const heartsLeft = getRemainingHearts(latestTracker) - 1;
      const heartText = heartsLeft === 1 ? 'heart' : 'hearts';
      setToast({
        visible: true,
        message: `Heart given to ${pokemon.nickname || pokemon.name}! (${heartsLeft} ${heartText} left today)`,
        type: 'success'
      });
    } catch (e) {
      console.error('Failed to update heart tracker:', e);
      setToast({ visible: true, message: 'Failed to update heart. Please try again.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!nicknameTarget || !user) return;
    try {
      const newNames = {
        ...(user.unsafeMetadata.nicknames as Record<number, string> || {}),
        [nicknameTarget.id]: tempNickname
      };

      // 1. Optimistic Update
      setLocalNicknames(newNames);
      setModals({ ...modals, nickname: false });

      // 2. Persistent Update
      await user.update({
        unsafeMetadata: {
          nicknames: newNames
        }
      });
      setToast({ visible: true, message: `Updated nickname for ${nicknameTarget.name}!`, type: 'success' });
    } catch (error) {
      console.error('Failed to save nickname:', error);
      setToast({ visible: true, message: 'Failed to save nickname.', type: 'error' });
      // Revert on failure
      setLocalNicknames(nicknames);
    }
  };

  // Render
  console.log('Home Render:', { loading, pokemonCount: allPokemon.length, displayedCount: displayedPokemon.length });

  // Show skeleton if loading AND we have no data yet (initial load)
  // OR if we are explicitly refreshing and want to clear the screen (optional, currently we keep data on refresh)
  if (loading && allPokemon.length === 0) {
    console.log('Home: Rendering Skeleton');
    return (
      <SafeAreaView style={[styles.container, settings.darkMode ? styles.darkContainer : undefined]}>
        {/* Header */}
        <HomeHeader
          balance={economy?.balance || 0}
          onBuddyHelpPress={() => setModals({ ...modals, welcome: true })}
          onWalletPress={() => setModals({ ...modals, economy: true })}
          darkMode={settings.darkMode}
        />
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={(q) => updateParams({ q })}
          selectedRegionIndex={selectedRegionIndex}
          onRegionSelect={(r) => updateParams({ r: String(r) })}
          onClearAll={() => setSearchParams({})}
          darkMode={settings.darkMode}
        />
        <PokemonGridSkeleton darkMode={settings.darkMode} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, settings.darkMode ? styles.darkContainer : undefined]}>
      {/* Header */}
      <HomeHeader
        balance={economy?.balance || 0}
        onBuddyHelpPress={() => setModals({ ...modals, welcome: true })}
        onWalletPress={() => setModals({ ...modals, economy: true })}
        darkMode={settings.darkMode}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => updateParams({ q })}
        selectedRegionIndex={selectedRegionIndex}
        onRegionSelect={(r) => updateParams({ r: String(r) })}
        onClearAll={() => setSearchParams({})}
        darkMode={settings.darkMode}
      />

      {/* Grid */}
      <PokemonGrid
        pokemon={displayedPokemon}
        onPokemonPress={handlePokemonPress}
        onPokemonLongPress={(p) => {
          if (!user) {
            setModals({ ...modals, auth: true });
            return;
          }
          setNicknameTarget(p);
          setTempNickname(nicknames[p.id] || p.nickname || '');
          setModals({ ...modals, nickname: true });
        }}
        onEndReached={handleLoadMore}
        listFooterComponent={
          displayCount < filteredPokemon.length ? <ActivityIndicator style={{ padding: 20 }} /> : <View style={{ height: 100 }} />
        }
        buddyData={buddyData}
        nicknames={localNicknames}
        settings={settings}
        refreshing={refreshing}
        onRefresh={refetch}
        onBuddyLongPress={handleBuddyLongPress}
        onBuddyHeartClick={handleHeartClick}
        cardEffects={cardEffects}
        cardFrames={cardFrames}
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
        onDebugSetStreak={debugSetStreak}
      />

      <FilterModal
        visible={modals.filter}
        onClose={() => setModals({ ...modals, filter: false })}
        selectedTypes={selectedTypes}
        onToggleType={(t) => {
          const newTypes = selectedTypes.includes(t)
            ? selectedTypes.filter(x => x !== t)
            : [...selectedTypes, t];
          updateParams({ t: newTypes.join(',') });
        }}
        onClear={() => updateParams({ t: null })}
        onApply={() => setModals({ ...modals, filter: false })}
        darkMode={settings.darkMode}
      />

      <SortModal
        visible={modals.sort}
        onClose={() => setModals({ ...modals, sort: false })}
        sortOption={sortOption}
        onSortSelect={(s) => { updateParams({ s }); setModals({ ...modals, sort: false }); }}
        darkMode={settings.darkMode}
      />

      <AuthModal
        visible={modals.auth}
        onClose={() => setModals({ ...modals, auth: false })}
        darkMode={settings.darkMode}
      />

      <ComingSoonModal
        visible={modals.comingSoon}
        onClose={() => setModals({ ...modals, comingSoon: false })}
        featureName="PokéHub"
        darkMode={settings.darkMode}
      />

      <EconomyModal
        visible={modals.economy}
        onClose={() => {
          setModals({ ...modals, economy: false });
          resetRewardState(); // Clear reward state on close
        }}
        type={rewardClaimed ? 'reward' : 'info'}
        title={rewardClaimed ? 'Daily Reward!' : 'Your Wallet'}
        message={rewardClaimed
          ? `You've earned ${rewardClaimed.amount} coins for logging in today!\n🔥 Current Streak: ${rewardClaimed.streak} Days`
          : 'Manage your coins and view transactions.'}
        streak={economy.streak}
        balance={economy.balance}
        darkMode={settings.darkMode}
        isSignedIn={!!user}
        onSignIn={() => setModals(prev => ({ ...prev, auth: true }))}
      />

      <EconomyModal
        visible={modals.styleConfirmation}
        onClose={() => setModals({ ...modals, styleConfirmation: false })}
        type="confirm"
        title="Apply Style?"
        message={`${nicknameTarget?.nickname || nicknameTarget?.name} will get ${styleConfirmationTarget?.itemName} effect permanently. Do you want to use it?`}
        balance={economy.balance}
        streak={economy.streak}
        darkMode={settings.darkMode}
        onAction={finalizeStyleApplication}
        actionLabel="Apply"
      />

      <WelcomeModal
        visible={modals.welcome}
        onClose={handleCloseWelcome}
        darkMode={settings.darkMode}
      />

      <CardStyleModal
        visible={modals.nickname}
        onClose={() => setModals({ ...modals, nickname: false })}
        nickname={tempNickname}
        onNicknameChange={setTempNickname}
        onSaveNickname={handleSaveNickname}
        pokemonName={nicknameTarget?.name || 'Pokemon'}
        pokemonId={nicknameTarget?.id || 0}
        darkMode={settings.darkMode}
        inventory={inventory}
        unlockedEffects={nicknameTarget ? unlockedEffects[nicknameTarget.id] || [] : []}
        unlockedFrames={nicknameTarget ? unlockedFrames[nicknameTarget.id] || [] : []}
        activeEffect={nicknameTarget ? cardEffects[nicknameTarget.id] || 'none' : 'none'}
        activeFrame={nicknameTarget ? cardFrames[nicknameTarget.id] || 'none' : 'none'}
        onApplyStyle={handleApplyStyle}
        onGoToShop={() => navigate('/shop')}
      />

      <BuddyProgressModal
        visible={modals.buddyProgress}
        onClose={() => setModals({ ...modals, buddyProgress: false })}
        pokemon={buddyProgressTarget}
        buddyData={buddyProgressTarget ? (buddyData[buddyProgressTarget.id] || null) : null}
        heartTracker={heartTracker}
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
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});


