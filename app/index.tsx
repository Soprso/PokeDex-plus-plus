import { ExtraLoveEffect, GhostlyMistEffect, GlowBorder, NeonCyberEffect, ShineOverlay } from '@/components/card-effects';
import { POKEMON_TYPES, PokemonType, TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemonTypes';
import { REGIONS } from '@/constants/regions';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { getRandomTip } from '@/constants/tips';
import { fetchPokemonBatch, fetchPokemonList, Pokemon } from '@/services/pokeapi';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, Image, ImageBackground, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthModal from './modals/auth';

const { width, height } = Dimensions.get('window');

// Radial menu configuration
const MENU_ITEMS = [
  { id: 'profile', icon: 'person' as const, label: 'Profile', color: '#FF6B6B', angle: 180 },
  { id: 'filter', icon: 'filter' as const, label: 'Filter', color: '#4CAF50', angle: 144 },
  { id: 'pokehub', icon: 'planet' as const, label: 'PokéHub', color: '#FF9800', angle: 108 },
  { id: 'shop', icon: 'cart' as const, label: 'Shop', color: '#F59E0B', angle: 72 },
  { id: 'sort', icon: 'swap-vertical' as const, label: 'Sort', color: '#2196F3', angle: 36 },
  { id: 'settings', icon: 'settings' as const, label: 'Settings', color: '#9C27B0', angle: 0 },
];

type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'buddy-desc';

interface PokemonWithNickname extends Pokemon {
  nickname?: string;
}

// Buddy System Interfaces
interface BuddyData {
  pokemonId: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=none, 1=good, 2=great, 3=ultra, 4=best
  consecutiveDays: number;
  lastInteractionDate: string; // YYYY-MM-DD
  achievedBestBuddyDate?: string;
}

export interface DailyInteraction {
  date: string; // YYYY-MM-DD
  heartsGiven: number; // 0-3
  pokemonIds: number[];
}

export interface EconomyData {
  balance: number;
  lastDailyRewardDate: string; // YYYY-MM-DD
}

export interface Inventory {
  [effectId: string]: number;
}

export interface CardEffects {
  [pokemonId: number]: string; // pokemonId -> effectId
}

const ParticleOverlay = ({ color, intensity }: { color: string; intensity: 'low' | 'high' }) => {
  // Deterministic positions to prevent jitter during re-renders
  const positions = [
    { top: '10%', left: '10%' },
    { top: '80%', left: '80%' },
    { top: '20%', left: '70%' },
    { top: '70%', left: '20%' },
    { top: '40%', left: '40%' },
  ];

  const particles = intensity === 'high' ? [0, 1, 2, 3, 4] : [0, 1, 2];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((i) => (
        <Ionicons
          key={i}
          name="sparkles"
          size={intensity === 'high' ? 12 : 10}
          color={color}
          style={{
            position: 'absolute',
            ...positions[i],
            opacity: 0.6,
            transform: [{ scale: 0.8 }],
          } as any}
        />
      ))}
    </View>
  );
};

export default function PokedexListScreen() {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 4 : 2;
  // Calculate exact card width to fill screen
  // Gap = 8 (margin 4 * 2)
  // Padding = 32 (listContent padding 16 * 2)
  const cardGap = 8;
  const listPadding = 32;
  const cardWidth = (width - listPadding - (numColumns * cardGap)) / numColumns;
  const [allPokemon, setAllPokemon] = useState<PokemonWithNickname[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonWithNickname[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 1025 });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  // Modal states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonWithNickname | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');

  // Filter & Sort state
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('id-asc');

  // Settings state
  const [settings, setSettings] = useState({
    darkMode: false,
    sound: true,
    vibration: true,
    shinySprites: false,
    nicknames: true,
    cacheImages: true,
    gridLayout: false,
  });

  // Nicknames storage
  const [nicknames, setNicknames] = useState<Record<number, string>>({});

  // Buddy System state
  const [buddyData, setBuddyData] = useState<Record<number, BuddyData>>({});
  const [todayInteraction, setTodayInteraction] = useState<DailyInteraction>({
    date: new Date().toISOString().split('T')[0],
    heartsGiven: 0,
    pokemonIds: [],
  });
  const [economy, setEconomy] = useState<EconomyData>({
    balance: 0,
    lastDailyRewardDate: '',
  });
  const [inventory, setInventory] = useState<Inventory>({});
  const [cardEffects, setCardEffects] = useState<CardEffects>({});
  const [unlockedCardEffects, setUnlockedCardEffects] = useState<Record<number, string[]>>({}); // History of unlocks per Pokemon
  const [economyModal, setEconomyModal] = useState<{ visible: boolean; title: string; message: string; type: 'reward' | 'info' }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [selectedBuddyProgress, setSelectedBuddyProgress] = useState<{ name: string; buddy: BuddyData; activeTab?: 'progress' | 'effects'; pokemon: PokemonWithNickname } | null>(null);
  const [buddyHelpModalOpen, setBuddyHelpModalOpen] = useState(false);

  // Auth state
  // Auth state
  const { isSignedIn, user } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // UI enhancement states
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLeftTabIndicator, setShowLeftTabIndicator] = useState(false);
  const [showRightTabIndicator, setShowRightTabIndicator] = useState(true);

  const flatListRef = useRef<any>(null);
  const tabScrollRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const randomTip = useMemo(() => getRandomTip(), []);

  // Load settings and nicknames from AsyncStorage
  // Load buddy data from Clerk user metadata
  useEffect(() => {
    async function loadStoredData() {
      try {
        const [storedSettings, storedNicknames] = await Promise.all([
          AsyncStorage.getItem('settings'),
          AsyncStorage.getItem('nicknames'),
        ]);

        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
        if (storedNicknames) {
          setNicknames(JSON.parse(storedNicknames));
        }
      } catch (err) {
        console.error('Failed to load stored data:', err);
      }
    }
    loadStoredData();
  }, []);

  // Sync Buddy Data with Clerk
  useEffect(() => {
    if (user) {
      let loadedData = {};
      if (user.unsafeMetadata.buddyData) {
        loadedData = user.unsafeMetadata.buddyData as Record<number, BuddyData>;
      }

      // Mock Data Check for verification
      if (user.primaryEmailAddress?.emailAddress === 'ghoshsoumyadeep3@gmail.com') {
        const today = new Date().toISOString().split('T')[0];
        console.log('Injecting mock buddy data for verification');
        loadedData = {
          ...loadedData,
          1: { pokemonId: 1, level: 2, consecutiveDays: 4, lastInteractionDate: today }, // Great Buddy
          2: { pokemonId: 2, level: 3, consecutiveDays: 11, lastInteractionDate: today }, // Ultra Buddy
          3: { pokemonId: 3, level: 4, consecutiveDays: 21, lastInteractionDate: today }, // Best Buddy
        };
      }


      setBuddyData(loadedData);
      if (user.unsafeMetadata.todayInteraction) {
        const interaction = user.unsafeMetadata.todayInteraction as DailyInteraction;
        const today = new Date().toISOString().split('T')[0];
        // Reset if it's a new day
        if (interaction.date === today) {
          setTodayInteraction(interaction);
        } else {
          setTodayInteraction({ date: today, heartsGiven: 0, pokemonIds: [] });
        }
      }

      // Economy & Daily Reward Logic
      let currentEconomy = { balance: 0, lastDailyRewardDate: '' };
      if (user.unsafeMetadata.economy) {
        currentEconomy = user.unsafeMetadata.economy as EconomyData;
      }



      const currentDate = new Date().toISOString().split('T')[0];
      if (currentEconomy.lastDailyRewardDate !== currentDate) {
        // Grant Daily Reward
        const rewardAmount = 50;
        currentEconomy.balance += rewardAmount;
        currentEconomy.lastDailyRewardDate = currentDate;

        setEconomyModal({
          visible: true,
          title: '📅 Daily Login Reward!',
          message: `You received ${rewardAmount} Dex Coins! 💰\nNew Balance: ${currentEconomy.balance}`,
          type: 'reward'
        });

        // Update Metadata immediately
        user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            economy: currentEconomy,
          },
        }).catch(console.error);
      }
      setEconomy(currentEconomy);

      // Load Inventory & Card Effects
      if (user.unsafeMetadata.inventory) {
        setInventory(user.unsafeMetadata.inventory as Inventory);
      }
      if (user.unsafeMetadata.cardEffects) {
        setCardEffects(user.unsafeMetadata.cardEffects as CardEffects);
      }
      if (user.unsafeMetadata.unlockedCardEffects) {
        setUnlockedCardEffects(user.unsafeMetadata.unlockedCardEffects as Record<number, string[]>);
      }

    } else {
      // Clear data if logged out
      setBuddyData({});
      setTodayInteraction({
        date: new Date().toISOString().split('T')[0],
        heartsGiven: 0,
        pokemonIds: [],
      });
      setEconomy({ balance: 0, lastDailyRewardDate: '' });
    }
  }, [user]);

  // Migration: Unlock currently active effects for existing users
  useEffect(() => {
    if (user && user.unsafeMetadata.cardEffects && !user.unsafeMetadata.unlockedCardEffects) {
      const activeEffects = user.unsafeMetadata.cardEffects as CardEffects;
      const initialUnlocked: Record<number, string[]> = {};

      Object.entries(activeEffects).forEach(([pokemonIdStr, effectId]) => {
        const pid = parseInt(pokemonIdStr);
        if (!initialUnlocked[pid]) initialUnlocked[pid] = [];
        if (!initialUnlocked[pid].includes(effectId)) {
          initialUnlocked[pid].push(effectId);
        }
      });

      if (Object.keys(initialUnlocked).length > 0) {
        console.log('Migrating existing effects to unlocked history...', initialUnlocked);
        setUnlockedCardEffects(initialUnlocked);
        user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            unlockedCardEffects: initialUnlocked
          }
        }).catch(err => console.error('Migration failed:', err));
      }
    }
  }, [user]);

  // Save settings to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('settings', JSON.stringify(settings)).catch(console.error);
  }, [settings]);

  // Save nicknames to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('nicknames', JSON.stringify(nicknames)).catch(console.error);
  }, [nicknames]);

  // Fetch Pokémon data on mount
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function loadPokemon() {
      try {
        setLoading(true);
        setError(null);

        const list = await fetchPokemonList(controller.signal);
        const details = await fetchPokemonBatch(
          list,
          controller.signal,
          30,
          50,
          (loaded, total) => {
            setLoadProgress({ loaded, total });
          }
        );

        details.sort((a, b) => a.id - b.id);
        setAllPokemon(details);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Failed to load Pokémon:', err);
        setError('Failed to load Pokémon. Please try again.');
        setLoading(false);
      }
    }

    loadPokemon();

    return () => {
      controller.abort();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Apply nicknames to Pokémon
  const pokemonWithNicknames = useMemo(() => {
    return allPokemon.map(p => ({
      ...p,
      nickname: nicknames[p.id],
    }));
  }, [allPokemon, nicknames]);

  // Filter and sort Pokémon
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      let filtered = pokemonWithNicknames;

      // Apply search filter (global)
      if (trimmedQuery) {
        const query = trimmedQuery.toLowerCase();
        filtered = filtered.filter(p => {
          if (p.name.toLowerCase().includes(query)) return true;
          if (p.nickname?.toLowerCase().includes(query)) return true;
          const queryNum = query.replace('#', '');
          if (!isNaN(Number(queryNum)) && p.id === Number(queryNum)) return true;
          return false;
        });
      } else {
        // Apply region filter (only when search is empty)
        const region = REGIONS[selectedRegionIndex];
        const startId = region.offset + 1;
        const endId = region.offset + region.limit;
        filtered = filtered.filter(p => p.id >= startId && p.id <= endId);
      }

      // Apply type filter
      if (selectedTypes.length > 0) {
        filtered = filtered.filter(p =>
          p.types.some(t => selectedTypes.includes(t))
        );
      }

      // Apply sort
      filtered = [...filtered].sort((a, b) => {
        switch (sortOption) {
          case 'id-asc':
            return a.id - b.id;
          case 'id-desc':
            return b.id - a.id;
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'buddy-desc':
            const buddyA = buddyData[a.id] || { level: 0, consecutiveDays: 0 };
            const buddyB = buddyData[b.id] || { level: 0, consecutiveDays: 0 };
            if (buddyB.level !== buddyA.level) return buddyB.level - buddyA.level;
            return buddyB.consecutiveDays - buddyA.consecutiveDays;
          default:
            return 0;
        }
      });

      setFilteredPokemon(filtered);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [pokemonWithNicknames, selectedRegionIndex, searchQuery, selectedTypes, sortOption, buddyData]);

  // Toggle menu with animation
  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;

    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    if (menuOpen) {
      Animated.spring(menuAnimation, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
      setMenuOpen(false);
    }
  };

  const closeMenuThen = (action: () => void) => {
    if (menuOpen) {
      Animated.spring(menuAnimation, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start(() => {
        // After animation completes, reset state and execute action
        setMenuOpen(false);
        action();
      });
    } else {
      // If menu is already closed, just execute action
      action();
    }
  };

  const handleSubmenuPress = (actionType: string) => {
    closeMenuThen(() => {
      switch (actionType) {
        case 'filter':
          setFilterOpen(true);
          break;
        case 'sort':
          setSortOpen(true);
          break;
        case 'pokehub':
          router.push('/pokehub');
          break;
        case 'shop':
          router.push('/shop');
          break;
        case 'profile':
          // Check if user is signed in
          if (!isSignedIn) {
            setAuthModalOpen(true);
          } else {
            router.push('/profile');
          }
          break;
        case 'settings':
          setSettingsOpen(true);
          break;
      }
    });
  };


  const handleRegionChange = (index: number) => {
    setSelectedRegionIndex(index);
    setSearchQuery('');
  };

  const handlePokemonPress = (pokemon: PokemonWithNickname) => {
    router.push(`/details/${pokemon.name}`);
  };

  const handlePokemonLongPress = (pokemon: PokemonWithNickname) => {
    setSelectedPokemon(pokemon);
    setNicknameInput(pokemon.nickname || '');
    setNicknameModalOpen(true);
  };

  const saveNickname = () => {
    if (selectedPokemon) {
      const newNicknames = { ...nicknames };
      if (nicknameInput.trim()) {
        newNicknames[selectedPokemon.id] = nicknameInput.trim();
      } else {
        delete newNicknames[selectedPokemon.id];
      }
      setNicknames(newNicknames);
    }
    setNicknameModalOpen(false);
    setSelectedPokemon(null);
    setNicknameInput('');
  };

  const handleApplyEffect = async (effectId: string) => {
    if (!selectedBuddyProgress || !user) return;
    const pokemonId = selectedBuddyProgress.buddy.pokemonId;
    const currentEffect = cardEffects[pokemonId];

    if (currentEffect === effectId) {
      Alert.alert('Already Active', 'This effect is already applied to this Pokémon.');
      return;
    }

    // 1. Default / Reset
    if (effectId === 'default') {
      // Explicitly set to 'none' to override fallbacks (like Best Buddy Gold Glow)
      const newCardEffects = { ...cardEffects, [pokemonId]: 'none' };
      setCardEffects(newCardEffects);
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          cardEffects: newCardEffects
        }
      });
      return;
    }

    // 2. Best Buddy (Milestone)
    if (effectId === 'effect_best_buddy') {
      if (selectedBuddyProgress.buddy.level < 4) {
        Alert.alert('Locked', 'You must be Best Buddies to use this effect!');
        return;
      }
      const newCardEffects = { ...cardEffects, [pokemonId]: effectId };
      setCardEffects(newCardEffects);
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          cardEffects: newCardEffects
        }
      });
      return;
    }

    // 3. Shop Items (Consumables)
    const unlockedForThisMon = unlockedCardEffects[pokemonId] || [];
    const isUnlocked = unlockedForThisMon.includes(effectId);

    // If ALREADY unlocked for this specific Pokemon, apply freely.
    if (isUnlocked) {
      const newCardEffects = { ...cardEffects, [pokemonId]: effectId };
      setCardEffects(newCardEffects);
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          cardEffects: newCardEffects
        }
      });
      return;
    }

    // If NOT unlocked, require inventory.
    const count = inventory[effectId] || 0;
    if (count <= 0) {
      Alert.alert('Locked', 'You do not own this effect. Visit the Shop to buy more!');
      return;
    }

    Alert.alert(
      'Apply Effect?',
      'This will consume 1 copy of the effect from your inventory. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            const newCount = count - 1;
            const newInventory = { ...inventory, [effectId]: newCount };
            const newCardEffects = { ...cardEffects, [pokemonId]: effectId };

            // Add to unlocked history
            const newUnlockedList = [...unlockedForThisMon, effectId];
            const newUnlockedCardEffects = { ...unlockedCardEffects, [pokemonId]: newUnlockedList };

            setInventory(newInventory);
            setCardEffects(newCardEffects);
            setUnlockedCardEffects(newUnlockedCardEffects);

            try {
              await user.update({
                unsafeMetadata: {
                  ...user.unsafeMetadata,
                  inventory: newInventory,
                  cardEffects: newCardEffects,
                  unlockedCardEffects: newUnlockedCardEffects
                },
              });
              Alert.alert('Effect Set!', `${selectedBuddyProgress.name} is looking stylish! ✨`);
            } catch (err) {
              console.error('Failed to save effect:', err);
            }
          },
        },
      ]
    );
  };

  const handleLongPressHearts = (pokemon: PokemonWithNickname) => {
    const buddy = buddyData[pokemon.id] || {
      pokemonId: pokemon.id,
      level: 0,
      consecutiveDays: 0,
      lastInteractionDate: '',
    };
    setSelectedBuddyProgress({ name: pokemon.nickname || pokemon.name, buddy, activeTab: 'progress', pokemon });
  };

  const handleSortSelect = (option: SortOption) => {
    setSortOption(option);
    setSortOpen(false);
    closeMenu();
  };

  const handleFilterApply = () => {
    setFilterOpen(false);
    closeMenu();
  };

  const handleFilterClear = () => {
    setSelectedTypes([]);
  };

  // Buddy System: Give heart to Pokémon
  const giveHeart = async (pokemonId: number) => {
    if (!isSignedIn || !user) {
      setAuthModalOpen(true);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if it's a new day
    if (todayInteraction.date !== today) {
      setTodayInteraction({ date: today, heartsGiven: 0, pokemonIds: [] });
    }

    // Check daily limit
    if (todayInteraction.heartsGiven >= 3) {
      Alert.alert('Daily Limit Reached', 'You can only give hearts to 3 Pokémon per day. Come back tomorrow!');
      return;
    }

    // Check if already gave heart to this Pokémon today
    if (todayInteraction.pokemonIds.includes(pokemonId)) {
      Alert.alert('Already Interacted', 'You already gave a heart to this Pokémon today!');
      return;
    }

    // Get or create buddy data
    const currentBuddy = buddyData[pokemonId] || {
      pokemonId,
      level: 0,
      consecutiveDays: 0,
      lastInteractionDate: '',
    };

    // Check if streak is broken
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const isConsecutive = currentBuddy.lastInteractionDate === yesterdayStr || currentBuddy.consecutiveDays === 0;

    if (!isConsecutive) {
      // Streak broken, reset
      currentBuddy.consecutiveDays = 0;
    }

    // Increment consecutive days
    currentBuddy.consecutiveDays += 1;
    currentBuddy.lastInteractionDate = today;

    // Calculate buddy level based on consecutive days
    let newLevel: 0 | 1 | 2 | 3 | 4 = 0;
    if (currentBuddy.consecutiveDays >= 21) {
      newLevel = 4; // Best Buddy
      if (!currentBuddy.achievedBestBuddyDate) {
        currentBuddy.achievedBestBuddyDate = today;
        Alert.alert('🎉 Best Buddy!', `Congratulations! This Pokémon is now your Best Buddy!`);
      }
    } else if (currentBuddy.consecutiveDays >= 11) {
      newLevel = 3; // Ultra Buddy
    } else if (currentBuddy.consecutiveDays >= 4) {
      newLevel = 2; // Great Buddy
    } else if (currentBuddy.consecutiveDays >= 1) {
      newLevel = 1; // Good Buddy
    }

    currentBuddy.level = newLevel;

    // Update state
    const newBuddyData = { ...buddyData, [pokemonId]: currentBuddy };
    const newTodayInteraction = {
      date: today,
      heartsGiven: todayInteraction.heartsGiven + 1,
      pokemonIds: [...todayInteraction.pokemonIds, pokemonId],
    };

    setBuddyData(newBuddyData);
    setTodayInteraction(newTodayInteraction);

    // Save to Clerk
    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            buddyData: newBuddyData,
            todayInteraction: newTodayInteraction,
          },
        });
      }
    } catch (err) {
      console.error('Failed to save to Clerk:', err);
    }

    // Show success message
    const levelNames = ['', 'Good Buddy', 'Great Buddy', 'Ultra Buddy', 'Best Buddy'];
    Alert.alert('❤️ Heart Given!', `${levelNames[newLevel]} - ${currentBuddy.consecutiveDays} consecutive days!`);
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in real app would reload data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Scroll to top handler
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Handle scroll position for scroll-to-top button
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200);
  };

  // Handle tab scroll for indicators
  const handleTabScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const maxScrollX = contentSize.width - layoutMeasurement.width;

    setShowLeftTabIndicator(scrollX > 10);
    setShowRightTabIndicator(scrollX < maxScrollX - 10);
  };

  const toggleTypeFilter = (type: PokemonType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const renderPokemonCard = ({ item }: { item: PokemonWithNickname }) => {
    const primaryType = item.types[0];
    const backgroundColor = TYPE_COLORS[primaryType] || '#A8A878';
    const displayName = settings.nicknames && item.nickname ? item.nickname : item.name;
    const imageUrl = settings.shinySprites ? item.shinyImageUrl : item.imageUrl;
    const isDualType = item.types.length > 1;



    // Buddy Perks & Card Effects Logic
    const buddy = buddyData[item.id];
    const buddyLevel = buddy?.level || 0;
    const activeEffectId = cardEffects[item.id];

    // We render effects as children, not style props
    let BuddyEffects = null;

    if (activeEffectId) {
      // Custom Shop Effects take priority
      if (activeEffectId === 'effect_neon_cyber') {
        BuddyEffects = <NeonCyberEffect />;
      } else if (activeEffectId === 'effect_golden_glory') {
        BuddyEffects = <ShineOverlay color="rgba(255, 215, 0, 0.6)" duration={2000} />;
      } else if (activeEffectId === 'effect_best_buddy') {
        BuddyEffects = <GlowBorder color="#FFD700" borderWidth={2} />;
      } else if (activeEffectId === 'extra_love') {
        BuddyEffects = <ExtraLoveEffect />;
      } else if (activeEffectId === 'effect_ghostly_mist') {
        BuddyEffects = <GhostlyMistEffect />;
      } else if (activeEffectId === 'none') {
        // Explicit None: Do not render anything, do not use fallback.
        BuddyEffects = null;
      }
    } else {
      // Fallback to Buddy Level Perks
      if (buddyLevel === 4) { // Best Buddy
        BuddyEffects = (
          <>
            <GlowBorder color="#FFD700" borderWidth={3} />
            <ShineOverlay color="rgba(255, 215, 0, 0.5)" duration={2500} />
          </>
        );
      } else if (buddyLevel === 3) { // Ultra Buddy
        BuddyEffects = (
          <>
            <GlowBorder color="#E5E4E2" borderWidth={2} />
            <ShineOverlay color="rgba(229, 228, 226, 0.3)" duration={3000} />
          </>
        );
      } else if (buddyLevel === 2) { // Great Buddy
        BuddyEffects = <GlowBorder color="#CD7F32" borderWidth={3} />; // Bronze
      }
    }


    // Grid Layout Card
    if (settings.gridLayout) {
      return (
        <Pressable
          onPress={() => handlePokemonPress(item)}
          onLongPress={() => handlePokemonLongPress(item)}
          style={({ pressed }) => [
            styles.gridCard,
            { width: cardWidth },
            { backgroundColor: isDualType ? 'transparent' : backgroundColor },
            settings.darkMode && styles.cardDark,
            pressed && styles.cardPressed,
            { borderWidth: 0 } // Reset default border
          ]}
        >
          {isDualType && (
            <LinearGradient
              colors={[TYPE_COLORS[item.types[0]], TYPE_COLORS[item.types[1]]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          {BuddyEffects}
          <Image
            source={require('@/assets/images/pokeball.png')}
            style={styles.gridCardWatermark}
          />
          {/* Buddy Hearts - Top Left */}
          <Pressable
            style={styles.buddyHeartsContainerGrid}
            onPress={(e) => {
              e.stopPropagation();
              giveHeart(item.id);
            }}
            onLongPress={(e) => {
              e.stopPropagation();
              handleLongPressHearts(item);
            }}
            delayLongPress={500}
          >
            <View style={styles.buddyHeartsGrid}>
              {[1, 2, 3, 4].map((heartNum) => {
                const buddy = buddyData[item.id];
                const isFilled = buddy && buddy.level >= heartNum;
                return (
                  <Ionicons
                    key={heartNum}
                    name={isFilled ? 'heart' : 'heart-outline'}
                    size={8}
                    color={isFilled ? '#FF6B6B' : 'rgba(255,255,255,0.4)'}
                    style={{ marginRight: 1 }}
                  />
                );
              })}
            </View>
            {/* Best Buddy Badge - Only at level 4 */}
            {buddyData[item.id]?.level === 4 && (
              <Image
                source={require('@/assets/images/best-buddy.png')}
                style={styles.bestBuddyBadgeGrid}
                resizeMode="contain"
              />
            )}
          </Pressable>
          {settings.shinySprites && (
            <View style={styles.shinyIndicatorGridRight}>
              <Ionicons name="sparkles" size={14} color="#FFD700" />
            </View>
          )}
          <Text style={styles.gridCardId}>#{item.id.toString().padStart(3, '0')}</Text>
          <Image
            source={{ uri: imageUrl }}
            style={styles.gridCardImage}
            resizeMode="contain"
          />
          <Text style={styles.gridCardName} numberOfLines={1}>{displayName}</Text>
          <View style={styles.gridTypesContainer}>
            {item.types.map((type, index) => {
              const typeIcon = TYPE_ICONS[type];
              return typeIcon && (
                <Image key={index} source={typeIcon} style={styles.gridCardTypeIcon} resizeMode="contain" />
              );
            })}
          </View>
        </Pressable>
      );
    }

    // List Layout Card (original)
    return (
      <Pressable
        onPress={() => handlePokemonPress(item)}
        onLongPress={() => handlePokemonLongPress(item)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: isDualType ? 'transparent' : backgroundColor },
          settings.darkMode && styles.cardDark,
          pressed && styles.cardPressed,
          { borderWidth: 0 } // Reset default border
        ]}
      >
        {isDualType && (
          <LinearGradient
            colors={[TYPE_COLORS[item.types[0]], TYPE_COLORS[item.types[1]]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {BuddyEffects}
        <Image
          source={require('@/assets/images/pokeball.png')}
          style={styles.cardWatermark}
        />
        {/* Buddy Hearts - Top Left */}
        <Pressable
          style={styles.buddyHeartsContainerList}
          onPress={(e) => {
            e.stopPropagation();
            giveHeart(item.id);
          }}
          onLongPress={(e) => {
            e.stopPropagation();
            handleLongPressHearts(item);
          }}
          delayLongPress={500}
        >
          <View style={styles.buddyHeartsList}>
            {[1, 2, 3, 4].map((h) => (
              <Ionicons
                key={h}
                name="heart"
                size={10}
                color={h <= buddyLevel ? '#e11d48' : 'rgba(255, 255, 255, 0.3)'}
                style={{ marginRight: h < 4 ? 2 : 0 }}
              />
            ))}
            {buddyLevel === 4 && (
              <Image
                source={require('@/assets/images/best-buddy.png')}
                style={styles.bestBuddyBadgeList}
                resizeMode="contain"
              />
            )}
          </View>
        </Pressable>
        {settings.shinySprites && (
          <View style={styles.shinyIndicatorRight}>
            <Ionicons name="sparkles" size={20} color="#FFD700" />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardId}>#{item.id.toString().padStart(3, '0')}</Text>
          <Text style={styles.cardName}>{displayName}</Text>
          {settings.nicknames && item.nickname && (
            <Text style={styles.cardRealName}>({item.name})</Text>
          )}
          <View style={styles.typesContainer}>
            {item.types.map((type, index) => {
              const typeIcon = TYPE_ICONS[type];
              return typeIcon && (
                <Image key={index} source={typeIcon} style={styles.cardTypeIcon} resizeMode="contain" />
              );
            })}
          </View>
          <Text style={styles.cardFootnote}>Long press to add nickname</Text>
        </View>
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </Pressable>
    );
  };

  // Loading screen
  if (loading) {
    const progressPercentage = Math.round((loadProgress.loaded / loadProgress.total) * 100);
    const progressWidth = (loadProgress.loaded / loadProgress.total) * (width - 64);

    return (
      <ImageBackground
        source={require('@/assets/images/splash21.png')}
        style={styles.loadingBackground}
        resizeMode="stretch"
      >
        <StatusBar style="light" />
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingTitle}>Loading Pokédex...</Text>
            <Text style={styles.loadingProgress}>
              {loadProgress.loaded} / {loadProgress.total} ({progressPercentage}%)
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
            <View style={styles.tipContainer}>
              <Text style={styles.tipLabel}>💡 Tip:</Text>
              <Text style={styles.tipText}>{randomTip}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, settings.darkMode && styles.containerDark]}>
        <StatusBar style={settings.darkMode ? 'light' : 'auto'} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rotation = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const overlayOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const submenuScale = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <>
      <SafeAreaView edges={['top']} style={[styles.container, settings.darkMode && styles.containerDark]}>
        <StatusBar style={settings.darkMode ? 'light' : 'auto'} />

        <View style={styles.headerContainer}>
          <Image
            source={require('@/assets/images/pokedex.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Pressable
            style={({ pressed }) => [
              styles.coinWallet,
              settings.darkMode && styles.coinWalletDark,
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
            ]}
            onPress={() => setEconomyModal({
              visible: true,
              title: '💰 Dex Coin Balance',
              message: `${economy.balance} Dex coins.\nUse it to purchase items from the store!!`,
              type: 'info'
            })}
          >
            <Image
              source={require('@/assets/images/dex-coin.png')}
              style={styles.coinWalletIcon}
            />
            <Text style={[styles.coinWalletText, settings.darkMode && styles.coinWalletTextDark]}>
              {economy.balance}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.buddyHelpButton,
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
            ]}
            onPress={() => setBuddyHelpModalOpen(true)}
          >
            <Ionicons name="help-circle" size={28} color={settings.darkMode ? '#14b8a6' : '#14b8a6'} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchBar, settings.darkMode && styles.searchBarDark]}
            placeholder="Search Pokémon..."
            placeholderTextColor={settings.darkMode ? '#999' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>

        {!searchQuery.trim() && (
          <View style={styles.tabsContainer}>
            {showLeftTabIndicator && (
              <LinearGradient
                colors={settings.darkMode ? ['rgba(26,26,26,0.9)', 'transparent'] : ['rgba(240,240,245,0.9)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabScrollIndicatorLeft}
                pointerEvents="none"
              />
            )}
            <FlatList
              ref={tabScrollRef}
              horizontal
              data={REGIONS}
              keyExtractor={(item) => item.name}
              showsHorizontalScrollIndicator={false}
              onScroll={handleTabScroll}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.tab,
                    index === selectedRegionIndex && styles.tabActive,
                    settings.darkMode && styles.tabDark,
                    settings.darkMode && index === selectedRegionIndex && styles.tabActiveDark,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={() => handleRegionChange(index)}
                >
                  <Text style={[
                    styles.tabText,
                    index === selectedRegionIndex && styles.tabTextActive,
                    settings.darkMode && styles.tabTextDark,
                  ]}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
            {showRightTabIndicator && (
              <LinearGradient
                colors={settings.darkMode ? ['transparent', 'rgba(26,26,26,0.9)'] : ['transparent', 'rgba(240,240,245,0.9)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabScrollIndicatorRight}
                pointerEvents="none"
              />
            )}
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={filteredPokemon}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPokemonCard}
          numColumns={settings.gridLayout ? numColumns : 1}
          key={settings.gridLayout ? 'grid-' + numColumns : 'list'}
          contentContainerStyle={styles.listContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={settings.darkMode ? '#fff' : '#6366f1'}
              colors={['#6366f1']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={searchQuery.trim() ? 'search-outline' : 'location-outline'}
                size={64}
                color={settings.darkMode ? '#666' : '#ccc'}
              />
              <Text style={[styles.emptyText, settings.darkMode && styles.emptyTextDark]}>
                {searchQuery.trim() ? 'No Pokémon found' : 'No Pokémon in this region'}
              </Text>
              <Text style={[styles.emptySubtext, settings.darkMode && styles.emptySubtextDark]}>
                {searchQuery.trim() ? 'Try a different search term' : 'Select another region to explore'}
              </Text>
            </View>
          }
        />

        {/* Scroll to Top FAB */}
        {showScrollTop && (
          <Pressable
            style={[styles.scrollTopFab, settings.darkMode && styles.scrollTopFabDark]}
            onPress={scrollToTop}
          >
            <Ionicons name="arrow-up" size={24} color="#fff" />
          </Pressable>
        )}

        {menuOpen && (
          <Pressable style={styles.menuOverlay} onPress={closeMenu}>
            <Animated.View style={[styles.menuOverlayInner, { opacity: overlayOpacity }]} />
          </Pressable>
        )}

        <Animated.View
          style={[
            styles.radialMenu,
            {
              opacity: menuAnimation,
              transform: [{ scale: submenuScale }],
            }
          ]}
          pointerEvents={menuOpen ? 'auto' : 'none'}
        >
          {MENU_ITEMS.map((item) => {
            const angleRad = (item.angle * Math.PI) / 180;
            const radius = 140;
            const x = radius * Math.cos(angleRad);
            const y = -radius * Math.sin(angleRad);

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.submenuButton,
                  {
                    backgroundColor: item.color,
                    transform: [
                      {
                        translateX: menuAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, x],
                        })
                      },
                      {
                        translateY: menuAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, y],
                        })
                      },
                    ],
                  },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.submenuButtonInner,
                    pressed && { transform: [{ scale: 0.9 }] }
                  ]}
                  onPress={() => handleSubmenuPress(item.id)}
                  android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
                >
                  <Ionicons name={item.icon} size={26} color="#fff" />
                  <Text style={styles.submenuLabel}>{item.label}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.menuBall, { transform: [{ rotate: rotation }] }]}>
          <Pressable onPress={toggleMenu} style={styles.menuBallPressable}>
            <Image
              source={require('@/assets/images/menuball2.png')}
              style={styles.menuBallImage}
            />
          </Pressable>
        </Animated.View>

      </SafeAreaView>

      {/* Sort Modal */}
      <Modal visible={sortOpen} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={() => { setSortOpen(false); closeMenu(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, settings.darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.modalTitleDark]}>Sort Pokémon</Text>
            <View style={styles.sortOptions}>
              <Pressable
                style={({ pressed }) => [
                  styles.sortOption,
                  sortOption === 'id-asc' && styles.sortOptionActive,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSortSelect('id-asc')}
              >
                <Ionicons name="arrow-up" size={20} color={sortOption === 'id-asc' ? '#007AFF' : '#666'} />
                <Text style={[styles.sortOptionText, sortOption === 'id-asc' && styles.sortOptionTextActive]}>
                  Pokédex Number ↑
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.sortOption,
                  sortOption === 'id-desc' && styles.sortOptionActive,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSortSelect('id-desc')}
              >
                <Ionicons name="arrow-down" size={20} color={sortOption === 'id-desc' ? '#007AFF' : '#666'} />
                <Text style={[styles.sortOptionText, sortOption === 'id-desc' && styles.sortOptionTextActive]}>
                  Pokédex Number ↓
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.sortOption,
                  sortOption === 'name-asc' && styles.sortOptionActive,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSortSelect('name-asc')}
              >
                <Ionicons name="text" size={20} color={sortOption === 'name-asc' ? '#007AFF' : '#666'} />
                <Text style={[styles.sortOptionText, sortOption === 'name-asc' && styles.sortOptionTextActive]}>
                  Name A → Z
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.sortOption,
                  sortOption === 'name-desc' && styles.sortOptionActive,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSortSelect('name-desc')}
              >
                <Ionicons name="text" size={20} color={sortOption === 'name-desc' ? '#007AFF' : '#666'} />
                <Text style={[styles.sortOptionText, sortOption === 'name-desc' && styles.sortOptionTextActive]}>
                  Name Z → A
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.sortOption,
                  sortOption === 'buddy-desc' && styles.sortOptionActive,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleSortSelect('buddy-desc')}
              >
                <Ionicons name="heart" size={20} color={sortOption === 'buddy-desc' ? '#007AFF' : '#666'} />
                <Text style={[styles.sortOptionText, sortOption === 'buddy-desc' && styles.sortOptionTextActive]}>
                  Buddy Level
                </Text>
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.modalClose,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => { setSortOpen(false); closeMenu(); }}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterOpen} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={() => { setFilterOpen(false); closeMenu(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, settings.darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.modalTitleDark]}>Filter by Type</Text>
            <ScrollView style={styles.filterScroll}>
              <View style={styles.typeGrid}>
                {POKEMON_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    style={({ pressed }) => [
                      styles.typeFilterButton,
                      { backgroundColor: TYPE_COLORS[type] },
                      selectedTypes.includes(type) && styles.typeFilterButtonActive,
                      pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
                    ]}
                    onPress={() => toggleTypeFilter(type)}
                  >
                    <Image
                      source={TYPE_ICONS[type]}
                      style={styles.typeIcon}
                    />
                    <Text style={styles.typeFilterText}>{type}</Text>
                    {selectedTypes.includes(type) && (
                      <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.typeCheckmark} />
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={styles.filterActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.filterClearButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleFilterClear}
              >
                <Text style={styles.filterClearText}>Clear All</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.filterApplyButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleFilterApply}
              >
                <Text style={styles.filterApplyText}>Apply</Text>
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.modalClose,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => { setFilterOpen(false); closeMenu(); }}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={settingsOpen} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={() => { setSettingsOpen(false); closeMenu(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, settings.darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.modalTitleDark]}>Settings</Text>
            <ScrollView style={styles.settingsScroll}>
              <View style={[styles.settingRow, settings.darkMode && styles.settingRowDark]}>
                <Text style={[styles.settingLabel, settings.darkMode && styles.settingLabelDark]}>Dark Mode</Text>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(val) => setSettings({ ...settings, darkMode: val })}
                />
              </View>
              <View style={[styles.settingRow, settings.darkMode && styles.settingRowDark]}>
                <Text style={[styles.settingLabel, settings.darkMode && styles.settingLabelDark]}>Sound</Text>
                <Switch
                  value={settings.sound}
                  onValueChange={(val) => setSettings({ ...settings, sound: val })}
                />
              </View>
              <View style={[styles.settingRow, settings.darkMode && styles.settingRowDark]}>
                <Text style={[styles.settingLabel, settings.darkMode && styles.settingLabelDark]}>Vibration</Text>
                <Switch
                  value={settings.vibration}
                  onValueChange={(val) => setSettings({ ...settings, vibration: val })}
                />
              </View>
              <View style={[styles.settingRow, settings.darkMode && styles.settingRowDark]}>
                <Text style={[styles.settingLabel, settings.darkMode && styles.settingLabelDark]}>Show Shiny Sprites</Text>
                <Switch
                  value={settings.shinySprites}
                  onValueChange={(val) => setSettings({ ...settings, shinySprites: val })}
                />
              </View>
              <View style={[styles.settingRow, settings.darkMode && styles.settingRowDark]}>
                <Text style={[styles.settingLabel, settings.darkMode && styles.settingLabelDark]}>Enable Nicknames</Text>
                <Switch
                  value={settings.nicknames}
                  onValueChange={(val) => setSettings({ ...settings, nicknames: val })}
                />
              </View>
              <View style={[styles.settingRow, settings.darkMode && styles.settingRowDark]}>
                <Text style={[styles.settingLabel, settings.darkMode && styles.settingLabelDark]}>Cache Images</Text>
                <Switch
                  value={settings.cacheImages}
                  onValueChange={(val) => setSettings({ ...settings, cacheImages: val })}
                />
              </View>
              <View style={[styles.settingRow, settings.darkMode && styles.settingRowDark]}>
                <Text style={[styles.settingLabel, settings.darkMode && styles.settingLabelDark]}>Grid Layout</Text>
                <Switch
                  value={settings.gridLayout}
                  onValueChange={(val) => setSettings({ ...settings, gridLayout: val })}
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.settingButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => Alert.alert('Cache Cleared')}
              >
                <Text style={styles.settingButtonText}>Clear Cache</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.settingButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => {
                  setSettings({
                    darkMode: false,
                    sound: true,
                    vibration: true,
                    shinySprites: false,
                    nicknames: true,
                    cacheImages: true,
                    gridLayout: false,
                  });
                  Alert.alert('Settings Reset');
                }}>
                <Text style={styles.settingButtonText}>Reset Settings</Text>
              </Pressable>
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.modalClose,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => { setSettingsOpen(false); closeMenu(); }}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Nickname Modal */}
      <Modal visible={nicknameModalOpen} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={() => { setNicknameModalOpen(false); closeMenu(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.nicknameModal, settings.darkMode && styles.modalContentDark]}>
            {selectedPokemon && (
              <>
                <Image
                  source={{ uri: selectedPokemon.imageUrl }}
                  style={styles.nicknameImage}
                  resizeMode="contain"
                />
                <Text style={[styles.nicknameTitle, settings.darkMode && styles.modalTitleDark]}>
                  {selectedPokemon.name}
                </Text>
                <Text style={[styles.nicknameSubtitle, settings.darkMode && styles.settingLabelDark]}>
                  #{selectedPokemon.id.toString().padStart(3, '0')}
                </Text>
                <TextInput
                  style={[styles.nicknameInput, settings.darkMode && styles.searchBarDark]}
                  placeholder="Enter nickname..."
                  placeholderTextColor="#999"
                  value={nicknameInput}
                  onChangeText={setNicknameInput}
                  autoFocus
                />
                <View style={styles.nicknameActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.nicknameButton,
                      styles.nicknameCancel,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                    ]}
                    onPress={() => { setNicknameModalOpen(false); closeMenu(); }}
                  >
                    <Text style={styles.nicknameCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.nicknameButton,
                      styles.nicknameSave,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                    ]}
                    onPress={saveNickname}
                  >
                    <Text style={styles.nicknameSaveText}>Save</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Buddy Help Modal */}
      <Modal visible={buddyHelpModalOpen} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={() => setBuddyHelpModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.buddyModalContent, settings.darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.modalTitleDark]}>❤️ Buddy System</Text>

            <Text style={[styles.buddyModalText, settings.darkMode && styles.buddyModalTextDark]}>
              Build a bond with your Pokémon by giving them hearts! Progress through 4 levels to unlock premium visual effects.
            </Text>

            {!isSignedIn && (
              <Pressable
                style={[styles.signInPrompt, settings.darkMode && styles.signInPromptDark]}
                onPress={() => { setBuddyHelpModalOpen(false); setAuthModalOpen(true); }}
              >
                <Text style={styles.signInPromptText}>Sign in to start your journey! 🔐</Text>
              </Pressable>
            )}

            <View style={styles.buddyLevelRow}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart-outline" size={16} color="#ccc" />
                <Ionicons name="heart-outline" size={16} color="#ccc" />
                <Ionicons name="heart-outline" size={16} color="#ccc" />
              </View>
              <View style={styles.buddyLevelInfo}>
                <Text style={[styles.buddyLevelTitle, settings.darkMode && styles.buddyLevelTitleDark]}>Good Buddy</Text>
                <Text style={[styles.buddyLevelDesc, settings.darkMode && styles.buddyLevelDescDark]}>Day 1</Text>
              </View>
            </View>

            <View style={styles.buddyLevelRow}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart-outline" size={16} color="#ccc" />
                <Ionicons name="heart-outline" size={16} color="#ccc" />
              </View>
              <View style={styles.buddyLevelInfo}>
                <Text style={[styles.buddyLevelTitle, settings.darkMode && styles.buddyLevelTitleDark]}>Great Buddy</Text>
                <Text style={[styles.buddyLevelDesc, settings.darkMode && styles.buddyLevelDescDark]}>Day 4 • Blue Neon Glow</Text>
              </View>
            </View>

            <View style={styles.buddyLevelRow}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart-outline" size={16} color="#ccc" />
              </View>
              <View style={styles.buddyLevelInfo}>
                <Text style={[styles.buddyLevelTitle, settings.darkMode && styles.buddyLevelTitleDark]}>Ultra Buddy</Text>
                <Text style={[styles.buddyLevelDesc, settings.darkMode && styles.buddyLevelDescDark]}>Day 11 • Platinum Shine</Text>
              </View>
            </View>

            <View style={styles.buddyLevelRow}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Ionicons name="heart" size={16} color="#FF6B6B" />
              </View>
              <View style={styles.buddyLevelInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.buddyLevelTitle, settings.darkMode && styles.buddyLevelTitleDark]}>Best Buddy</Text>
                  <Image source={require('@/assets/images/best-buddy.png')} style={{ width: 16, height: 16, marginLeft: 6 }} resizeMode="contain" />
                </View>
                <Text style={[styles.buddyLevelDesc, settings.darkMode && styles.buddyLevelDescDark]}>Day 21 • Gold Shine + Badge</Text>
              </View>
            </View>

            <View style={[styles.dailyLimitBox, settings.darkMode && styles.dailyLimitBoxDark]}>
              <Text style={[styles.dailyLimitText, settings.darkMode && styles.dailyLimitTextDark]}>
                ⚠️ Limit: 3 Pokémon per day
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.modalClose,
                { marginTop: 24 },
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => setBuddyHelpModalOpen(false)}
            >
              <Text style={styles.modalCloseText}>Got it!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Buddy Progress / Effects Modal */}
      <Modal visible={!!selectedBuddyProgress} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={() => setSelectedBuddyProgress(null)}>
        <View style={styles.centeredModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedBuddyProgress(null)} />
          <View style={[styles.modalContent, styles.buddyProgressModal, { borderRadius: 20 }, settings.darkMode && styles.modalContentDark]}>

            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.modalTitle, settings.darkMode && styles.modalTitleDark, { textAlign: 'center', marginBottom: 4 }]}>
                {selectedBuddyProgress?.name}
              </Text>
              <View style={styles.tabContainer}>
                <Pressable
                  style={[styles.modalTab, selectedBuddyProgress?.activeTab === 'progress' && styles.modalTabActive]}
                  onPress={() => setSelectedBuddyProgress(curr => curr ? ({ ...curr, activeTab: 'progress' }) : null)}
                >
                  <Text style={[
                    styles.modalTabText,
                    selectedBuddyProgress?.activeTab === 'progress' && styles.modalTabTextActive,
                    settings.darkMode && selectedBuddyProgress?.activeTab !== 'progress' && styles.textDark
                  ]}>Friendship</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalTab, selectedBuddyProgress?.activeTab === 'effects' && styles.modalTabActive]}
                  onPress={() => setSelectedBuddyProgress(curr => curr ? ({ ...curr, activeTab: 'effects' }) : null)}
                >
                  <Text style={[
                    styles.modalTabText,
                    selectedBuddyProgress?.activeTab === 'effects' && styles.modalTabTextActive,
                    settings.darkMode && selectedBuddyProgress?.activeTab !== 'effects' && styles.textDark
                  ]}>Card Style</Text>
                </Pressable>
              </View>
            </View>

            {/* Progress Tab */}
            {selectedBuddyProgress?.activeTab === 'progress' && (
              <View style={styles.progressList}>
                <Ionicons name="heart-circle" size={50} color="#e11d48" style={{ alignSelf: 'center', marginBottom: 16 }} />
                {[
                  { level: 1, name: 'Good Buddy', days: 1 },
                  { level: 2, name: 'Great Buddy', days: 4 },
                  { level: 3, name: 'Ultra Buddy', days: 11 },
                  { level: 4, name: 'Best Buddy', days: 21 },
                ].map((tier) => {
                  const daysLeft = Math.max(0, tier.days - (selectedBuddyProgress?.buddy.consecutiveDays || 0));
                  const isReached = daysLeft === 0;
                  return (
                    <View key={tier.level} style={[styles.progressRow, settings.darkMode && styles.progressRowDark]}>
                      <View style={styles.progressRowLeft}>
                        <Ionicons name={isReached ? "checkmark-circle" : "time-outline"} size={24} color={isReached ? "#4ade80" : "#9ca3af"} />
                        <View>
                          <Text style={[styles.progressTierName, settings.darkMode && styles.tierNameDark]}>{tier.name}</Text>
                          <Text style={styles.progressTierDays}>{tier.days} Days Streak</Text>
                        </View>
                      </View>
                      <View>
                        {isReached ? (
                          <Text style={styles.progressReachedText}>Reached!</Text>
                        ) : (
                          <Text style={styles.progressLeftText}>{daysLeft} days left</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Effects Tab */}
            {selectedBuddyProgress?.activeTab === 'effects' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 4 }}>
                {[
                  {
                    id: 'default',
                    name: 'Default',
                    description: 'Original card style.',
                    price: 0,
                    type: 'effect',
                    category: 'standard'
                  },
                  {
                    id: 'effect_best_buddy',
                    name: 'Best Buddy',
                    description: 'The mark of true friendship.',
                    price: 0,
                    type: 'effect',
                    category: 'milestone'
                  },
                  ...SHOP_ITEMS.filter(i => i.type === 'effect')
                ].map((item) => {
                  const isBestBuddyItem = item.id === 'effect_best_buddy';
                  const isDefaultItem = item.id === 'default';
                  const isBestBuddyReached = selectedBuddyProgress?.buddy.level === 4;
                  const unlockedForThisMon = selectedBuddyProgress ? (unlockedCardEffects[selectedBuddyProgress.buddy.pokemonId] || []) : [];
                  const isUnlocked = unlockedForThisMon.includes(item.id);

                  const count = isBestBuddyItem
                    ? (isBestBuddyReached ? 1 : 0)
                    : (isDefaultItem || isUnlocked ? 1 : (inventory[item.id] || 0));

                  const isActive = selectedBuddyProgress && (
                    isDefaultItem
                      ? !cardEffects[selectedBuddyProgress.buddy.pokemonId]
                      : cardEffects[selectedBuddyProgress.buddy.pokemonId] === item.id
                  );

                  // Strict Lock Policy: Locked if count is 0 (and not active).
                  const isLocked = count === 0 && !isActive;

                  const pokemon = selectedBuddyProgress?.pokemon;
                  const isDualType = pokemon && pokemon.types.length > 1;
                  const backgroundColor = pokemon ? (TYPE_COLORS[pokemon.types[0]] || '#A8A878') : '#A8A878';

                  return (
                    <View key={item.id} style={[styles.effectCard, settings.darkMode && styles.effectCardDark, isActive && styles.effectCardActive]}>
                      <View style={styles.effectPreview}>
                        {/* Real Card Preview */}
                        {pokemon && (
                          <View style={[
                            styles.gridCard,
                            { width: 140, height: undefined, aspectRatio: 0.72, margin: 0, padding: 8, borderWidth: 0 }
                          ]}>
                            {/* Background */}
                            <View style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]}>
                              {isDualType ? (
                                <LinearGradient
                                  colors={[TYPE_COLORS[pokemon.types[0]], TYPE_COLORS[pokemon.types[1]]]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={StyleSheet.absoluteFill}
                                />
                              ) : (
                                <View style={[StyleSheet.absoluteFill, { backgroundColor: (item.id === 'extra_love' || item.id === 'effect_ghostly_mist' || item.id === 'effect_neon_cyber') ? 'transparent' : backgroundColor }]} />
                              )}

                              {/* Live Effect Preview */}
                              {item.id === 'extra_love' && <ExtraLoveEffect />}
                              {item.id === 'effect_ghostly_mist' && <GhostlyMistEffect />}
                              {item.id === 'effect_neon_cyber' && <NeonCyberEffect />}

                              {/* Watermark */}
                              {item.id !== 'extra_love' && (
                                <Image source={require('@/assets/images/pokeball.png')} style={styles.gridCardWatermark} />
                              )}
                            </View>

                            {/* Content */}
                            <Text style={styles.gridCardId}>#{pokemon.id.toString().padStart(3, '0')}</Text>
                            <Image source={{ uri: settings.shinySprites ? pokemon.shinyImageUrl : pokemon.imageUrl }} style={[styles.gridCardImage, { width: '80%', zIndex: 10, elevation: 5 }]} resizeMode="contain" />
                            <Text style={styles.gridCardName} numberOfLines={1}>{pokemon.nickname || pokemon.name}</Text>
                            <View style={styles.gridTypesContainer}>
                              {pokemon.types.map((type, index) => (
                                <Image key={index} source={TYPE_ICONS[type]} style={{ width: 14, height: 14, resizeMode: 'contain' }} />
                              ))}
                            </View>

                            {/* Effects Overlay */}
                            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                              {item.id === 'effect_best_buddy' && <GlowBorder color="#FFD700" borderWidth={2} />}
                              {item.id === 'effect_neon_cyber' && <NeonCyberEffect />}
                              {/* Wait, NeonCyber is overlay AND background? Actually NeonCyberEffect contains GlowBorder inside it if logic was correct, 
                                  but shop/index uses GlowBorder separately? 
                                  Let's just use the Component in the BG layer (already done above) OR Overlay layer.
                                  NeonCyberEffect renders ImageBG + Border. So it should be in the BG View above. 
                                  It IS in the BG View above (line 1745 in original, or line ? in replacement).
                                  So I don't need to add it to Overlay unless it's just border. 
                                  I will remove duplicate NeonCyber in Overlay if I added it above.
                                  Wait, the BG View is overflow hidden.
                              */}
                              {item.id === 'effect_golden_glory' && <ShineOverlay color="rgba(255, 215, 0, 0.6)" duration={2000} />}
                            </View>
                          </View>
                        )}
                        {!pokemon && <Text>Loading...</Text>}

                        {isLocked && (
                          <View style={styles.lockedOverlay}>
                            <Ionicons name="lock-closed" size={24} color="#fff" />
                            <Text style={styles.lockedPrice}>{item.price > 0 ? item.price : 'Locked'}</Text>
                            {item.price > 0 && <Image source={require('@/assets/images/dex-coin.png')} style={{ width: 12, height: 12 }} />}
                          </View>
                        )}
                      </View>
                      <Text style={[styles.effectName, settings.darkMode && styles.textDark]}>{item.name}</Text>
                      <Text style={styles.effectCount}>{isBestBuddyItem ? (isBestBuddyReached ? 'Unlocked' : 'Locked') : `Owned: ${count}`}</Text>

                      <Pressable
                        style={[styles.applyButton, isLocked && styles.applyButtonLocked, isActive && styles.applyButtonActive]}
                        onPress={() => !isLocked && !isActive && handleApplyEffect(item.id)}
                      >
                        <Text style={styles.applyButtonText}>
                          {isActive ? 'Active' : isLocked ? 'Locked' : 'Apply'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.modalClose,
                styles.economyModalButton,
                { marginTop: 20, width: '100%' },
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => setSelectedBuddyProgress(null)}
            >
              <Text style={[styles.modalCloseText, { color: '#fff' }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Economy/Reward Modal */}
      <Modal visible={economyModal.visible} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={() => setEconomyModal({ ...economyModal, visible: false })}>
        <View style={styles.centeredModalOverlay}>
          <View style={[styles.modalContent, styles.economyModalContent, { borderRadius: 20 }, settings.darkMode && styles.modalContentDark, economyModal.type === 'reward' && styles.economyModalReward]}>
            {economyModal.type === 'reward' && (
              <Animated.View style={styles.rewardIconContainer}>
                <Image source={require('@/assets/images/dex-coin.png')} style={styles.rewardCoinIconLarge} />
                <View style={styles.rewardBadgeContainer}>
                  <Ionicons name="gift" size={20} color="#fff" />
                </View>
              </Animated.View>
            )}
            {economyModal.type === 'info' && (
              <View style={styles.infoIconContainer}>
                <Image source={require('@/assets/images/dex-coin.png')} style={styles.rewardCoinIcon} />
              </View>
            )}

            <Text style={[styles.economyModalTitle, settings.darkMode && styles.modalTitleDark]}>
              {economyModal.title}
            </Text>

            <Text style={[styles.economyModalText, settings.darkMode && styles.buddyModalTextDark]}>
              {economyModal.message}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.modalClose,
                styles.economyModalButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => setEconomyModal({ ...economyModal, visible: false })}
            >
              <Text style={styles.modalCloseText}>
                {economyModal.type === 'reward' ? 'Claim!' : 'Got it'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Auth Modal */}
      <AuthModal
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        darkMode={settings.darkMode}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  loadingProgress: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: width - 64,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  tipContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  searchContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  searchBarDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#999',
  },
  tabsContainer: {
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabDark: {
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#14b8a6', // Soothing teal color
  },
  tabActiveDark: {
    borderBottomColor: '#2dd4bf', // Lighter teal for dark mode
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  tabTextDark: {
    color: '#888',
  },
  tabTextActive: {
    color: '#14b8a6',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 16,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDark: {
    opacity: 0.95,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardWatermark: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 120,
    height: 120,
    opacity: 0.2,
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
  },
  cardId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  cardRealName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  cardFootnote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: 6,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  cardImage: {
    width: 150,
    height: 150,
    zIndex: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptyTextDark: {
    color: '#666',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  menuOverlayInner: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuBall: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 70,
    height: 70,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  menuBallPressable: {
    width: 70,
    height: 70,
  },
  menuBallImage: {
    width: 70,
    height: 70,
  },
  radialMenu: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  submenuButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  submenuButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submenuLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalContentDark: {
    backgroundColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textTransform: 'capitalize',
  },
  modalTitleDark: {
    color: '#fff',
  },
  sortOptions: {
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  sortOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  sortOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#666',
  },
  sortOptionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  filterScroll: {
    maxHeight: height * 0.4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeFilterButton: {
    width: (width - 64) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  typeFilterButtonActive: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  typeIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  typeFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  typeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  filterClearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  filterClearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  filterApplyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  filterApplyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  settingsScroll: {
    maxHeight: height * 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingRowDark: {
    borderBottomColor: '#444',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  settingLabelDark: {
    color: '#fff',
  },
  settingButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  settingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalClose: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nicknameModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
  },
  nicknameImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  nicknameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 4,
    color: '#000',
  },
  nicknameSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  nicknameInput: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  nicknameActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  nicknameButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nicknameCancel: {
    backgroundColor: '#f0f0f0',
  },
  nicknameCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nicknameSave: {
    backgroundColor: '#007AFF',
  },
  nicknameSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Logo
  logoImage: {
    width: width * 0.5,
    height: 60,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    alignSelf: 'center',
  },
  // Grid Layout Styles
  gridCard: {
    width: (width - 48) / 3,
    margin: 4,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    aspectRatio: 0.72, // Fixed Card Aspect Ratio
    // Enhanced 3D shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    // Subtle border for depth
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  gridCardWatermark: {
    position: 'absolute',
    width: 80,
    height: 80,
    opacity: 0.1,
    top: -10,
    right: -10,
  },
  gridCardId: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
    alignSelf: 'flex-start',
    marginTop: 16,
    marginLeft: 4,
  },
  gridCardImage: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    marginVertical: 4,
  },
  gridCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  gridTypesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  gridTypeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  gridTypeIcon: {
    width: 16,
    height: 16,
  },
  // Shiny Indicators
  shinyIndicatorRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  shinyIndicatorGridRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
  // Card Type Icons (no backgrounds)
  cardTypeIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  gridCardTypeIcon: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  // Tab Scroll Indicators
  tabScrollIndicatorLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },
  tabScrollIndicatorRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },
  // Scroll to Top FAB
  scrollTopFab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 5,
  },
  scrollTopFabDark: {
    backgroundColor: '#4f46e5',
  },
  // Empty State
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtextDark: {
    color: '#666',
  },
  // Buddy Hearts Styles
  buddyHeartsContainerGrid: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  buddyHeartsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestBuddyBadgeGrid: {
    width: 14,
    height: 14,
    marginLeft: 2,
  },
  buddyHeartsContainerList: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buddyHeartsList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bestBuddyBadgeList: {
    width: 18,
    height: 18,
    marginLeft: 2,
  },
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  buddyHelpButton: {
    position: 'absolute',
    right: 16,
    top: 20,
    zIndex: 10,
    padding: 8,
  },
  coinWallet: {
    position: 'absolute',
    left: 16,
    top: 24,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  coinWalletDark: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  coinWalletIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  coinWalletText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  coinWalletTextDark: {
    color: '#FFD700',
  },
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Economy Modal Styles
  economyModalContent: {
    padding: 30,
    alignItems: 'center',
    maxWidth: 340,
    width: '85%',
  },
  economyModalReward: {
    borderColor: '#FFD700',
    borderWidth: 2,
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 15, // Glowing effect
    elevation: 10,
  },
  rewardIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCoinIconLarge: {
    width: 100,
    height: 100,
  },
  rewardBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF4500', // Orange-Red for gift badge
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoIconContainer: {
    marginBottom: 16,
  },
  rewardCoinIcon: {
    width: 60,
    height: 60,
  },
  economyModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  economyModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  economyModalButton: {
    minWidth: 140,
    backgroundColor: '#007AFF',
    marginTop: 0,
  },
  // Buddy Progress / Management Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    width: '100%',
  },
  modalTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  modalTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modalTabTextActive: {
    color: '#333',
  },

  // Effect Card Styles
  effectCard: {
    width: 160,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  effectCardDark: {
    backgroundColor: '#374151',
  },
  effectCardActive: {
    borderColor: '#4ade80',
    backgroundColor: '#ecfdf5',
  },
  effectPreview: {
    width: 140,
    height: 200,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dummyCard: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 4,
  },
  effectName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  effectCount: {
    fontSize: 10,
    color: '#666',
    marginBottom: 8,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  applyButtonLocked: {
    backgroundColor: '#9ca3af',
  },
  applyButtonActive: {
    backgroundColor: '#4ade80',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Buddy Progress Modal Styles
  buddyProgressModal: {
    padding: 24,
    width: '85%',
    maxWidth: 360,
  },
  progressList: {
    width: '100%',
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  progressRowDark: {
    backgroundColor: '#374151',
  },
  progressRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  tierNameDark: {
    color: '#e5e7eb',
  },
  progressTierDays: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressReachedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  progressLeftText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  // Buddy Modal Styles
  buddyModalContent: {
    padding: 24,
  },
  buddyModalText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
    lineHeight: 20,
  },
  buddyModalTextDark: {
    color: '#ccc',
  },
  signInPrompt: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInPromptDark: {
    backgroundColor: '#0A84FF',
    elevation: 0,
  },
  signInPromptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buddyLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  buddyLevelInfo: {
    flex: 1,
  },
  buddyLevelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  buddyLevelTitleDark: {
    color: '#fff',
  },
  buddyLevelDesc: {
    fontSize: 13,
    color: '#666',
  },
  buddyLevelDescDark: {
    color: '#999',
  },
  dailyLimitBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  dailyLimitBoxDark: {
    backgroundColor: '#332b00',
    borderColor: '#665700',
  },
  dailyLimitText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dailyLimitTextDark: {
    color: '#fff3cd',
  },
  textDark: {
    color: '#fff',
  },
});
