import { POKEMON_TYPES, PokemonType, TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemonTypes';
import { REGIONS } from '@/constants/regions';
import { getRandomTip } from '@/constants/tips';
import { fetchPokemonBatch, fetchPokemonList, Pokemon } from '@/services/pokeapi';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, Image, ImageBackground, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthModal from './modals/auth';

const { width, height } = Dimensions.get('window');

// Radial menu configuration
const MENU_ITEMS = [
  { id: 'profile', icon: 'person' as const, label: 'Profile', color: '#FF6B6B', angle: 180 },
  { id: 'filter', icon: 'filter' as const, label: 'Filter', color: '#4CAF50', angle: 135 },
  { id: 'pokehub', icon: 'planet' as const, label: 'PokéHub', color: '#FF9800', angle: 90 },
  { id: 'sort', icon: 'swap-vertical' as const, label: 'Sort', color: '#2196F3', angle: 45 },
  { id: 'settings', icon: 'settings' as const, label: 'Settings', color: '#9C27B0', angle: 0 },
];

type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';

interface PokemonWithNickname extends Pokemon {
  nickname?: string;
}

export default function PokedexListScreen() {
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

  // Auth state
  const { isSignedIn } = useAuth();
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
  }, [pokemonWithNicknames, selectedRegionIndex, searchQuery, selectedTypes, sortOption]);

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
          router.push('/coming-soon');
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

    // Grid Layout Card
    if (settings.gridLayout) {
      return (
        <Pressable
          onPress={() => handlePokemonPress(item)}
          onLongPress={() => handlePokemonLongPress(item)}
          style={({ pressed }) => [
            styles.gridCard,
            { backgroundColor: isDualType ? 'transparent' : backgroundColor },
            settings.darkMode && styles.cardDark,
            pressed && styles.cardPressed,
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
          <Image
            source={require('@/assets/images/pokeball.png')}
            style={styles.gridCardWatermark}
          />
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
        <Image
          source={require('@/assets/images/pokeball.png')}
          style={styles.cardWatermark}
        />
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

        <Image
          source={require('@/assets/images/pokedex.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

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
          numColumns={settings.gridLayout ? 3 : 1}
          key={settings.gridLayout ? 'grid' : 'list'}
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
            <Ionicons name="arrow-up" size={24} color={settings.darkMode ? '#fff' : '#6366f1'} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
    alignSelf: 'flex-start',
  },
  gridCardImage: {
    width: 85,
    height: 85,
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
    bottom: 100,
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
});
