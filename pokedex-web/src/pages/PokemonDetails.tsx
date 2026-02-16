import SkeletonPokemonDetails from "@/components/SkeletonPokemonDetails";
import TypeEffectOverlay from "@/components/TypeEffectOverlay";
import { LinearGradient, SafeAreaView } from '@/components/native';
import ShinyEffect from "@/components/type-effects/ShinyEffect";
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useNavigate, useParams } from 'react-router-dom';


// Fallback static width for stylesheet, but we use useWindowDimensions in components
const { width: windowWidth } = Dimensions.get("window");

/* =======================
   Types
======================= */
interface PokemonDetails {
    id: number;
    name: string;
    height: number;
    weight: number;
    stats: { base_stat: number; stat: { name: string } }[];
    moves: { move: { name: string; url: string } }[];
    sprites: any;
    types: { type: { name: string } }[];
    abilities: { ability: { name: string; url: string }; is_hidden: boolean }[];
}

interface Ability {
    name: string;
    description: string;
    isHidden: boolean;
}

interface SpeciesInfo {
    genderRatio: number; // -1 for genderless, 0-8 for female ratio (8 = 100% female)
    captureRate: number; // 0-255
    eggGroups: string[];
    isLegendary: boolean;
    isMythical: boolean;
}

interface EnhancedMove {
    name: string;
    power: number | null;
    accuracy: number | null;
    pp: number | null;
    damageClass: string; // physical, special, status
    type: string;
    effectDescription: string;
    elite: boolean;
}

interface PokemonRole {
    role: 'Attacker' | 'Defender' | 'Tank' | 'Balanced' | 'Raid Specialist' | 'Support';
    strengths: string[];
    weaknesses: string[];
    bestFor: string[];
    rating: number;
}

interface BattleStats {
    attackScore: number;
    defenseScore: number;
    staminaScore: number;
    overallScore: number;
}

/* =======================
   Type Colors
======================= */
const colorsByType: Record<string, string> = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A040A0",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#705898",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
};

import { TYPE_BACKGROUNDS, TYPE_ICONS as typeIcons } from '@/constants/pokemonTypes';


/* =======================
   Role Analysis Constants
======================= */
const ROLE_DESCRIPTIONS = {
    Attacker: "High damage output, great for taking down raids quickly. Prioritize moves with high DPS.",
    Defender: "Excellent for holding gyms. High defense means it takes less damage from attackers.",
    Tank: "Can absorb lots of damage. Perfect for surviving long battles where you need to outlast opponents.",
    Balanced: "Well-rounded Pokémon that can perform multiple roles adequately.",
    'Raid Specialist': "Excels in specific raid scenarios. Often has type advantage against common raid bosses.",
    Support: "This Pokémon contributes through utility, setup, disruption, or progression value rather than raw combat stats.",
};


/* =======================
   Radar Chart Component
======================= */
function RadarChart({ stats, size = 200, darkMode }: { stats: any[], size?: number, darkMode: boolean }) {
    const center = size / 2;
    const radius = size * 0.35;
    const categories = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
    const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

    // Get stats in correct order
    const orderedStats = statNames.map(name =>
        stats.find(s => s.stat.name === name)?.base_stat || 0
    );

    // Use 180 as max for better visualization
    const MAX_STAT_SCALE = 180;

    // Normalize stats (0-100)
    const normalizedStats = orderedStats.map((value, index) => ({
        name: categories[index],
        value: Math.min(100, (value / MAX_STAT_SCALE) * 100),
        rawValue: value,
    }));

    // Calculate points for radar chart
    const points = normalizedStats.map((stat, i) => {
        const angle = (i * 2 * Math.PI) / categories.length;
        const x = center + radius * (stat.value / 100) * Math.cos(angle - Math.PI / 2);
        const y = center + radius * (stat.value / 100) * Math.sin(angle - Math.PI / 2);
        return { x, y };
    });

    // Create path for the radar shape
    const pathData = points.map((point, i) =>
        `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y} `
    ).join(' ') + ' Z';

    return (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Svg width={size} height={size}>
                {/* Outer boundary */}
                <Circle cx={center} cy={center} r={radius} fill="none" stroke={darkMode ? "#334155" : "#e0e0e0"} strokeWidth={1} />

                {/* Grid circles */}
                <Circle cx={center} cy={center} r={radius * 0.75} fill="none" stroke={darkMode ? "#1e293b" : "#f0f0f0"} strokeWidth={1} />
                <Circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke={darkMode ? "#1e293b" : "#f0f0f0"} strokeWidth={1} />
                <Circle cx={center} cy={center} r={radius * 0.25} fill="none" stroke={darkMode ? "#1e293b" : "#f0f0f0"} strokeWidth={1} />

                {/* Category lines */}
                {categories.map((_, i) => {
                    const angle = (i * 2 * Math.PI) / categories.length;
                    const x = center + radius * Math.cos(angle - Math.PI / 2);
                    const y = center + radius * Math.sin(angle - Math.PI / 2);

                    return (
                        <Line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke={darkMode ? "#334155" : "#ccc"}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Radar shape */}
                <Path d={pathData} fill="rgba(74, 144, 226, 0.3)" stroke="#4a90e2" strokeWidth={2} />

                {/* Stat labels at endpoints */}
                {categories.map((category, i) => {
                    const angle = (i * 2 * Math.PI) / categories.length;
                    const labelRadius = radius + 25;
                    const x = center + labelRadius * Math.cos(angle - Math.PI / 2);
                    const y = center + labelRadius * Math.sin(angle - Math.PI / 2);
                    const statValue = orderedStats[i];

                    return (
                        <React.Fragment key={i}>
                            <SvgText
                                x={x}
                                y={y}
                                textAnchor="middle"
                                fontSize="10"
                                fill={darkMode ? "#94a3b8" : "#444"}
                                fontWeight="bold"
                            >
                                {category}
                            </SvgText>
                            <SvgText
                                x={x}
                                y={y + 14}
                                textAnchor="middle"
                                fontSize="9"
                                fill={darkMode ? "#64748b" : "#666"}
                            >
                                {statValue}
                            </SvgText>
                        </React.Fragment>
                    );
                })}

                {/* Dots at each stat point */}
                {points.map((point, i) => (
                    <Circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={3}
                        fill="#4a90e2"
                    />
                ))}
            </Svg>
            <Text style={{ marginTop: 8, fontSize: 12, color: '#666', fontWeight: '500' }}>
                Base Stats Distribution (Max scale: 180)
            </Text>
        </View>
    );
}

/* =======================
   Helper Functions
======================= */

//calcualte bst
function calculateBST(stats: any[]): number {
    return stats.reduce((sum, s) => sum + (s.base_stat ?? 0), 0);
}

// Calculate battle stats based on base stats
function calculateBattleStats(stats: any[]): BattleStats {
    const attack = stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const defense = stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
    const stamina = stats.find(s => s.stat.name === 'hp')?.base_stat || 0;

    // Pokémon Go formula approximations
    const attackScore = Math.floor(attack * 0.79);
    const defenseScore = Math.floor(defense * 0.73);
    const staminaScore = Math.floor(stamina * 1.75);
    const overallScore = Math.floor((attackScore + defenseScore + staminaScore) / 3);

    return {
        attackScore,
        defenseScore,
        staminaScore,
        overallScore,
    };
}

// Determine primary role with FIXED logic
function determinePrimaryRole(stats: any[]): PokemonRole {
    const bst = calculateBST(stats);

    // If Pokémon is too weak overall → Support / Early Game
    if (bst < 380) {
        return {
            role: 'Support',
            rating: clampRating(bst / 40),
            strengths: ['Early-game utility', 'Simple to use', 'Niche strategies'],
            weaknesses: ['Low overall power', 'Outscaled quickly'],
            bestFor: ['Story start', 'Beginner teams'],
        };
    }

    const attack = Math.max(
        stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0,
        stats.find(s => s.stat.name === 'special-attack')?.base_stat ?? 0
    );
    const defense = Math.max(
        stats.find(s => s.stat.name === 'defense')?.base_stat ?? 0,
        stats.find(s => s.stat.name === 'special-defense')?.base_stat ?? 0
    );
    const hp = stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0;

    const sorted = [
        { key: 'attack', value: attack },
        { key: 'defense', value: defense },
        { key: 'hp', value: hp },
    ].sort((a, b) => b.value - a.value);

    const top = sorted[0];
    const second = sorted[1];

    // If top stat is NOT at least 15% higher → Balanced
    if (top.value < second.value * 1.15) {
        const avg = (attack + defense + hp) / 3;
        return {
            role: 'Balanced',
            rating: clampRating(avg / 18),
            strengths: ['Versatile', 'No extreme weaknesses', 'Flexible playstyle'],
            weaknesses: ['Not best in any role'],
            bestFor: ['General gameplay', 'Story progression'],
        };
    }

    // PRIMARY ROLE DECISION
    if (top.key === 'attack') {
        return {
            role: 'Attacker',
            rating: clampRating(attack / 15),
            strengths: ['High damage output', 'Fast clears', 'Strong burst DPS'],
            weaknesses: ['Low survivability', 'Requires dodging'],
            bestFor: ['Raids', 'Gym attacks', 'Offensive teams'],
        };
    }

    if (top.key === 'defense') {
        return {
            role: 'Defender',
            rating: clampRating(defense / 15),
            strengths: ['Damage reduction', 'Excellent stalling', 'Very durable'],
            weaknesses: ['Low DPS', 'Slow battles'],
            bestFor: ['Gym defense', 'PvP stall teams'],
        };
    }

    // HP wins → Tank
    return {
        role: 'Tank',
        rating: clampRating(hp / 20),
        strengths: ['Huge HP pool', 'High endurance', 'Forgiving playstyle'],
        weaknesses: ['Slow clears', 'Low pressure'],
        bestFor: ['Solo content', 'Long battles', 'Beginner-friendly play'],
    };
}


function clampRating(value: number): number {
    return Math.min(10, Math.max(1, Math.round(value)));
}

// Helper function for rating colors
function getRatingColor(rating: number): string {
    if (rating >= 8) return '#2ecc71'; // Green
    if (rating >= 6) return '#f39c12'; // Orange
    if (rating >= 4) return '#3498db'; // Blue
    return '#e74c3c'; // Red
}

/* =======================
   Details Screen
======================= */
export default function Details() {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
    const [fastMoves, setFastMoves] = useState<EnhancedMove[]>([]);
    const [chargedMoves, setChargedMoves] = useState<EnhancedMove[]>([]);
    const [description, setDescription] = useState<string>("");
    const [damageMap, setDamageMap] = useState<Record<string, number>>({});
    const [evolutionChain, setEvolutionChain] = useState<any[]>([]);
    const [role, setRole] = useState<PokemonRole | null>(null);
    const [battleStats, setBattleStats] = useState<BattleStats | null>(null);
    const [hasEvolution, setHasEvolution] = useState(true);
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [speciesInfo, setSpeciesInfo] = useState<SpeciesInfo | null>(null);
    const darkMode = useColorScheme() === 'dark';
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollX = useRef(new Animated.Value(0)).current;
    const statAnims = useRef<Animated.Value[]>([]).current;
    const typeAnim = useRef(new Animated.Value(0)).current;

    const { width } = useWindowDimensions();
    const carouselItemWidth = width > 600 ? 500 : width;

    // Synchronize scroll on width change
    useEffect(() => {
        if (flatListRef.current && activeImageIndex > 0) {
            flatListRef.current.scrollToOffset({
                offset: activeImageIndex * carouselItemWidth,
                animated: false
            });
        }
    }, [width]);

    const scrollNext = () => {
        if (activeImageIndex < images.length - 1) {
            const nextIndex = activeImageIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setActiveImageIndex(nextIndex);
        }
    };

    const scrollPrev = () => {
        if (activeImageIndex > 0) {
            const prevIndex = activeImageIndex - 1;
            flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
            setActiveImageIndex(prevIndex);
        }
    };

    const onScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / carouselItemWidth);
        if (index !== activeImageIndex) {
            setActiveImageIndex(index);
        }
        // Manually update scrollX for Sparkle effect
        scrollX.setValue(contentOffset);
    };

    /* =======================
       Fetch Pokémon Data & Add Global CSS for Web
    ======================= */
    useEffect(() => {
        if (Platform.OS === 'web') {
            const style = document.createElement('style');
            style.textContent = `
                /* Targeted scrollbar removal for Web */
                [data-testid="hero-carousel"] {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }
                [data-testid="hero-carousel"]::-webkit-scrollbar {
                    display: none !important;
                }
            `;
            document.head.append(style);
        }
        fetchPokemon();
    }, []);

    const fetchPokemon = async () => {
        try {
            setIsLoading(true); // Start loading
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const data: PokemonDetails = await res.json();
            setPokemon(data);

            // Initialize stat animations
            statAnims.length = 0;
            data.stats.forEach(() => statAnims.push(new Animated.Value(0)));

            // Calculate role and battle stats
            const primaryRole = determinePrimaryRole(data.stats);
            const calculatedBattleStats = calculateBattleStats(data.stats);

            setRole(primaryRole);
            setBattleStats(calculatedBattleStats);

            // Fetch all related data
            await Promise.all([
                fetchTypeRelationsDual(data.types.map(t => t.type.name)),
                fetchMoveDetails(data.moves),
                fetchSpeciesData(data.id),
                fetchEvolutionChain(data.id),
                fetchAbilityDetails(data.abilities),
            ]);

            // Set loading to false immediately when data is ready
            setIsLoading(false);

            // Run animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.stagger(
                    100,
                    statAnims.map(anim =>
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: false,
                        })
                    )
                ),
            ]).start();
        } catch (error) {
            console.error("Error fetching Pokémon:", error);
            setIsLoading(false); // Make sure to stop loading on error too
        }
    }

    /* =======================
       Fetch Species Data
    ======================= */
    async function fetchSpeciesData(id: number) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            const data = await res.json();

            // Get first English flavor text
            const englishEntry = data.flavor_text_entries.find(
                (entry: any) => entry.language.name === "en"
            );

            if (englishEntry) {
                setDescription(englishEntry.flavor_text.replace(/\n|\f/g, " "));
            }

            // Extract species info
            const speciesData: SpeciesInfo = {
                genderRatio: data.gender_rate, // -1 for genderless, 0-8 for female ratio
                captureRate: data.capture_rate,
                eggGroups: data.egg_groups.map((eg: any) => eg.name),
                isLegendary: data.is_legendary,
                isMythical: data.is_mythical,
            };

            setSpeciesInfo(speciesData);
        } catch (error) {
            console.error("Error fetching species data:", error);
        }
    }

    /* =======================
       Fetch Ability Details
    ======================= */
    async function fetchAbilityDetails(
        abilities: { ability: { name: string; url: string }; is_hidden: boolean }[]
    ) {
        try {
            const abilityPromises = abilities.map(async (abilityData) => {
                const res = await fetch(abilityData.ability.url);
                const data = await res.json();

                // Get English effect description
                const englishEffect = data.effect_entries.find(
                    (entry: any) => entry.language.name === "en"
                );

                return {
                    name: abilityData.ability.name,
                    description: englishEffect?.short_effect || englishEffect?.effect || "No description available",
                    isHidden: abilityData.is_hidden,
                };
            });

            const fetchedAbilities = await Promise.all(abilityPromises);
            setAbilities(fetchedAbilities);
        } catch (error) {
            console.error("Error fetching ability details:", error);
        }
    }

    /* =======================
       Fetch Evolution Chain
    ======================= */
    async function fetchEvolutionChain(pokemonId: number) {
        try {
            setHasEvolution(true);
            setEvolutionChain([]);

            const speciesRes = await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
            );
            const speciesData = await speciesRes.json();

            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();
            const baseChain = evoData.chain;

            // If no evolutions at all
            if (!baseChain.evolves_to || baseChain.evolves_to.length === 0) {
                setEvolutionChain([
                    {
                        name: baseChain.species.name,
                        image: null,
                    },
                ]);
                setHasEvolution(false);
                return;
            }


            const chain: any[] = [];
            let current = evoData.chain;

            while (current) {
                const name = current.species.name;

                const pokeRes = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${name}`
                );
                const pokeData = await pokeRes.json();

                chain.push({
                    name,
                    image: pokeData.sprites.other["official-artwork"].front_default,
                });

                // Move forward ONLY if evolution exists
                if (current.evolves_to.length > 0) {
                    current = current.evolves_to[0];
                } else {
                    break;
                }
            }


            setEvolutionChain(chain);
        } catch (error) {
            console.error("Error fetching evolution chain:", error);
        }
    }

    /* =======================
       Fetch Type Relations
    ======================= */
    async function fetchTypeRelationsDual(types: string[]) {
        try {
            const relations = await Promise.all(
                types.map(t =>
                    fetch(`https://pokeapi.co/api/v2/type/${t}`).then(r => r.json())
                )
            );

            const damage: Record<string, number> = {};

            relations.forEach(typeData => {
                const rel = typeData.damage_relations;

                const applyMultiplier = (list: any[], value: number) => {
                    list.forEach(t => {
                        damage[t.name] = (damage[t.name] ?? 1) * value;
                    });
                };

                applyMultiplier(rel.double_damage_from, 2);
                applyMultiplier(rel.half_damage_from, 0.5);
                applyMultiplier(rel.no_damage_from, 0);
            });

            setDamageMap(damage);

            Animated.timing(typeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error("Error fetching type relations:", error);
        }
    }

    /* =======================
       Fetch Move Details
    ======================= */
    async function fetchMoveDetails(
        moves: { move: { name: string; url: string } }[]
    ) {
        try {
            const fast: EnhancedMove[] = [];
            const charged: EnhancedMove[] = [];

            const limitedMoves = moves.slice(0, 24); // Limit for performance

            await Promise.all(
                limitedMoves.map(async (m) => {
                    const res = await fetch(m.move.url);
                    const data = await res.json();

                    const isFast = data.power && data.power <= 50;
                    const isElite = data.meta?.is_elite_tm || false;

                    // Get English effect description
                    const englishEffect = data.effect_entries.find(
                        (entry: any) => entry.language.name === "en"
                    );

                    const moveObj: EnhancedMove = {
                        name: m.move.name,
                        power: data.power,
                        accuracy: data.accuracy,
                        pp: data.pp,
                        damageClass: data.damage_class?.name || "status",
                        type: data.type?.name || "normal",
                        effectDescription: englishEffect?.short_effect || englishEffect?.effect || "No effect description",
                        elite: isElite,
                    };

                    if (isFast) fast.push(moveObj);
                    else charged.push(moveObj);
                })
            );

            setFastMoves(fast);
            setChargedMoves(charged);
        } catch (error) {
            console.error("Error fetching move details:", error);
        }
    }

    /* =======================
       Helper Functions
    ======================= */
    function renderDamage(multiplier: number) {
        return Object.entries(damageMap)
            .filter(([, v]) => v === multiplier)
            .map(([type]) => type);
    }


    // Loading state check
    if (isLoading) {
        return (
            <>
                <SkeletonPokemonDetails />
            </>
        );
    }
    if (!pokemon) return null;

    const mainType = pokemon.types[0].type.name;

    /* =======================
       Hero Images
    ======================= */
    const images = [
        pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default,
        pokemon.sprites.other?.["official-artwork"]?.front_shiny || pokemon.sprites.front_shiny,
    ].filter(Boolean);

    /* =======================
       Render
    ======================= */
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {/* BACK BUTTON */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigate('/')}
                activeOpacity={0.7}
            >
                <FiArrowLeft size={24} color={darkMode ? '#fff' : '#333'} />
            </TouchableOpacity>

            <Animated.ScrollView
                style={{ flex: 1, opacity: 1, backgroundColor: '#fff' }}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO SECTION */}
                <ImageBackground
                    source={TYPE_BACKGROUNDS[mainType] || TYPE_BACKGROUNDS.default}
                    style={styles.hero}
                    resizeMode="cover"
                >
                    {/* Quality enhancement gradient overlay */}
                    <LinearGradient
                        colors={[
                            colorsByType[mainType] + '60',
                            colorsByType[mainType] + '40',
                            'transparent'
                        ]}
                        style={StyleSheet.absoluteFill as any}
                    />

                    {/* Type-specific animated effects */}

                    <TypeEffectOverlay type={mainType} />

                    {/* Shiny sparkle effect - shows when viewing shiny Pokemon */}
                    <Animated.View
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            opacity: scrollX.interpolate({
                                inputRange: [0, carouselItemWidth * 0.5, carouselItemWidth],
                                outputRange: [0, 0.5, 1],
                                extrapolate: 'clamp',
                            }),
                        }}
                    >
                        <ShinyEffect />
                    </Animated.View>

                    {/* Legendary/Mythical Badges - Shifted down for Back Button */}
                    {speciesInfo?.isLegendary && (
                        <View style={[styles.legendaryBadge, { top: 70 }]}>
                            <Text style={styles.legendaryIcon}>👑</Text>
                            <Text style={styles.legendaryText}>Legendary</Text>
                        </View>
                    )}
                    {speciesInfo?.isMythical && (
                        <View style={[styles.legendaryBadge, { top: speciesInfo?.isLegendary ? 120 : 70 }]}>
                            <Text style={styles.legendaryIcon}>⭐</Text>
                            <Text style={styles.legendaryText}>Mythical</Text>
                        </View>
                    )}

                    {/* Gradient overlay for dual-type Pokemon */}
                    {pokemon.types.length > 1 && (
                        <LinearGradient
                            colors={['transparent', colorsByType[pokemon.types[1].type.name] + '50']}
                            style={StyleSheet.absoluteFill as any}
                        />
                    )}


                    {/* Main Image Carousel */}
                    <View style={[styles.carouselWrapper, { width: carouselItemWidth }]}>
                        <FlatList
                            ref={flatListRef}
                            data={images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            testID="hero-carousel"
                            keyExtractor={(_, i) => i.toString()}
                            getItemLayout={(_, index) => ({
                                length: carouselItemWidth,
                                offset: carouselItemWidth * index,
                                index,
                            })}
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                            renderItem={({ item }) => (
                                <View style={[styles.carouselItem, { width: carouselItemWidth }]}>
                                    <View style={styles.heroImageContainer}>
                                        <Image
                                            source={{ uri: item }}
                                            style={styles.heroImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                            )}
                        />

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                {activeImageIndex > 0 && (
                                    <TouchableOpacity
                                        style={[styles.arrowButton, { left: 10 }]}
                                        onPress={scrollPrev}
                                        activeOpacity={0.7}
                                    >
                                        <FiChevronLeft size={28} color="#fff" />
                                    </TouchableOpacity>
                                )}
                                {activeImageIndex < images.length - 1 && (
                                    <TouchableOpacity
                                        style={[styles.arrowButton, { right: 10 }]}
                                        onPress={scrollNext}
                                        activeOpacity={0.7}
                                    >
                                        <FiChevronRight size={28} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>

                    {/* Image Dots Indicator */}
                    <View style={styles.dots}>
                        {images.map((_, i) => (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        opacity: scrollX.interpolate({
                                            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                            outputRange: [0.4, 1, 0.4],
                                            extrapolate: "clamp",
                                        }),
                                        width: scrollX.interpolate({
                                            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                            outputRange: [6, 12, 6],
                                            extrapolate: "clamp",
                                        })
                                    }
                                ]}
                            />
                        ))}
                    </View>

                    <Text style={styles.name}>{pokemon.name}</Text>
                    <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>

                    {/* Type Badges */}
                    <View style={styles.typesRow}>
                        {pokemon.types.map(t => (
                            <View
                                key={t.type.name}
                                style={[
                                    styles.typeBadge,
                                    { backgroundColor: 'rgba(255,255,255,0.15)' },
                                ]}
                            >
                                {(typeIcons as any)[t.type.name] && (
                                    <Image
                                        source={(typeIcons as any)[t.type.name]}
                                        style={{ width: 14, height: 14, marginRight: 6 }}
                                    />
                                )}
                                <Text style={styles.typeText}>{t.type.name}</Text>
                            </View>
                        ))}
                    </View>
                </ImageBackground>

                {/* ABOUT SECTION */}
                <View style={[styles.section, darkMode && styles.sectionDark]}>
                    <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>About</Text>
                    <Text style={{ marginBottom: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>{description}</Text>
                    <View style={styles.aboutRow}>
                        <Text style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Height (avg)</Text>
                        <Text style={{ color: darkMode ? '#f1f5f9' : '#0f172a', fontWeight: '700' }}>{pokemon.height / 10} m</Text>
                    </View>
                    <View style={styles.aboutRow}>
                        <Text style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Weight (avg)</Text>
                        <Text style={{ color: darkMode ? '#f1f5f9' : '#0f172a', fontWeight: '700' }}>{pokemon.weight / 10} kg</Text>
                    </View>
                </View>

                {/* ABILITIES SECTION */}
                {abilities.length > 0 && (
                    <View style={[styles.section, darkMode && styles.sectionDark]}>
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Abilities</Text>
                        {abilities.map((ability, index) => (
                            <View key={index} style={styles.abilityItem}>
                                <View style={styles.abilityHeader}>
                                    <Text style={[styles.abilityName, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>
                                        {ability.name.replace('-', ' ')}
                                    </Text>
                                    {ability.isHidden && (
                                        <View style={styles.hiddenBadge}>
                                            <Text style={styles.hiddenBadgeText}>Hidden</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.abilityDescription, { color: darkMode ? '#94a3b8' : '#64748b' }]}>{ability.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* BREEDING INFO SECTION */}
                {speciesInfo && (
                    <View style={[styles.section, darkMode && styles.sectionDark]}>
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Breeding</Text>

                        {/* Gender Ratio */}
                        <View style={styles.breedingRow}>
                            <Text style={[styles.breedingLabel, { color: darkMode ? '#94a3b8' : '#64748b' }]}>Gender Ratio</Text>
                            {speciesInfo.genderRatio === -1 ? (
                                <Text style={[styles.breedingValue, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>Genderless</Text>
                            ) : (
                                <View style={styles.genderContainer}>
                                    <View style={styles.genderBar}>
                                        <View
                                            style={[
                                                styles.genderMale,
                                                { width: `${((8 - speciesInfo.genderRatio) / 8) * 100}%` }
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.genderFemale,
                                                { width: `${(speciesInfo.genderRatio / 8) * 100}%` }
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.genderLabels}>
                                        <Text style={[styles.genderText, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
                                            ♂ {((8 - speciesInfo.genderRatio) / 8 * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={[styles.genderText, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
                                            ♀ {(speciesInfo.genderRatio / 8 * 100).toFixed(1)}%
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Egg Groups */}
                        <View style={styles.breedingRow}>
                            <Text style={[styles.breedingLabel, { color: darkMode ? '#94a3b8' : '#64748b' }]}>Egg Groups</Text>
                            <View style={styles.eggGroupsContainer}>
                                {speciesInfo.eggGroups.map((group, index) => (
                                    <View key={index} style={[styles.eggGroupBadge, darkMode && { backgroundColor: 'rgba(33, 150, 243, 0.1)', borderColor: '#2196F3' }]}>
                                        <Text style={styles.eggGroupText}>
                                            {group.replace('-', ' ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* CAPTURE INFO SECTION */}
                {speciesInfo && (
                    <View style={[styles.section, darkMode && styles.sectionDark]}>
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Capture Info</Text>
                        <View style={styles.captureRow}>
                            <Text style={[styles.captureLabel, { color: darkMode ? '#94a3b8' : '#64748b' }]}>Capture Rate</Text>
                            <View style={styles.captureRateContainer}>
                                <View style={[styles.captureBar, darkMode && { backgroundColor: '#334155' }]}>
                                    <Animated.View
                                        style={[
                                            styles.captureBarFill,
                                            {
                                                width: `${(speciesInfo.captureRate / 255) * 100}%`,
                                                backgroundColor:
                                                    speciesInfo.captureRate > 200 ? '#4CAF50' :
                                                        speciesInfo.captureRate > 100 ? '#FF9800' :
                                                            speciesInfo.captureRate > 50 ? '#FF5722' : '#F44336'
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.captureValue, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>
                                    {((speciesInfo.captureRate / 255) * 100).toFixed(1)}%
                                    {' '}
                                    <Text style={{ fontWeight: '400', fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b' }}>
                                        ({
                                            speciesInfo.captureRate > 200 ? 'Very Easy' :
                                                speciesInfo.captureRate > 100 ? 'Easy' :
                                                    speciesInfo.captureRate > 50 ? 'Medium' :
                                                        speciesInfo.captureRate > 25 ? 'Hard' : 'Very Hard'
                                        })
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* STATS SECTION */}
                <View style={[styles.section, darkMode && styles.sectionDark]}>
                    <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Base Stats</Text>
                    {pokemon.stats.map((stat, index) => {
                        // Max PokéAPI base stat is 255 (Blissey HP)
                        const percent = Math.min(stat.base_stat, 255) / 255;
                        return (
                            <View key={stat.stat.name} style={styles.statRow}>
                                <Text style={[styles.statName, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
                                    {stat.stat.name.replace('-', ' ').toUpperCase()}
                                </Text>
                                <View style={[styles.statBarBg, darkMode && { backgroundColor: '#334155' }]}>
                                    <Animated.View
                                        style={[
                                            styles.statBar,
                                            {
                                                backgroundColor: colorsByType[mainType],
                                                // Using static percent for web reliability if Animated fails
                                                width: `${percent * 100}%`,
                                                // Maintain animation if needed, but the primary requirement is accuracy
                                                opacity: statAnims[index] ? statAnims[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 1]
                                                }) : 1
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.statValue, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>{stat.base_stat}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* EVOLUTION CHAIN */}
                {evolutionChain.length > 0 && (
                    <View style={[styles.section, darkMode && styles.sectionDark]}>
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Evolution Chain</Text>

                        {/* No Evolution Case */}
                        {!hasEvolution && (
                            <Text style={styles.noEvolutionText}>
                                This Pokémon does not evolve
                            </Text>
                        )}

                        {/* Evolution Exists */}
                        {hasEvolution && (
                            <View style={styles.evolutionRow}>
                                {evolutionChain.map((evo, index) => (
                                    <View key={evo.name} style={styles.evoWrapper}>
                                        <View style={styles.evoItem}>
                                            <View style={[styles.evoImageBg, darkMode && { backgroundColor: '#334155' }]}>
                                                {evo.image ? (
                                                    <Image
                                                        source={{ uri: evo.image }}
                                                        style={styles.evoImage}
                                                    />
                                                ) : (
                                                    <View style={styles.evoImagePlaceholder} />
                                                )}
                                            </View>
                                            <Text style={[styles.evoName, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>{evo.name}</Text>
                                        </View>

                                        {index < evolutionChain.length - 1 && (
                                            <Text style={[styles.evoArrow, { color: darkMode ? '#334155' : '#e2e8f0' }]}>→</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}


                {/* TYPE STRENGTHS & WEAKNESSES */}
                {Object.keys(damageMap).length > 0 && (
                    <Animated.View style={{ opacity: typeAnim }}>
                        <View style={[styles.section, darkMode && styles.sectionDark]}>
                            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Weaknesses</Text>
                            <View style={styles.typesRowGrid}>
                                {[...renderDamage(4), ...renderDamage(2)].map(t => (
                                    <View
                                        key={t}
                                        style={[styles.typeBadgeGrid, { backgroundColor: colorsByType[t] }]}
                                    >
                                        <Text style={styles.typeTextGrid}>
                                            {t} {damageMap[t] === 4 ? "×4" : "×2"}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: 24 }, darkMode && styles.sectionTitleDark]}>
                                Resistances
                            </Text>
                            <View style={styles.typesRowGrid}>
                                {[...renderDamage(0.25), ...renderDamage(0.5)].map(t => (
                                    <View
                                        key={t}
                                        style={[styles.typeBadgeGrid, { backgroundColor: colorsByType[t] }]}
                                    >
                                        <Text style={styles.typeTextGrid}>
                                            {t} {damageMap[t] === 0.25 ? "×¼" : "×½"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* MOVES SECTION */}
                <View style={[styles.section, darkMode && styles.sectionDark]}>
                    <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Fast Moves</Text>
                    <FlatList
                        data={fastMoves}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={m => m.name}
                        contentContainerStyle={{ paddingBottom: 8 }}
                        renderItem={({ item }) => (
                            <View style={[styles.compactMoveCard, darkMode && styles.compactMoveCardDark]}>
                                <View style={styles.moveHeader}>
                                    <Text style={[styles.moveName, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>{item.name.replace('-', ' ')}</Text>
                                    <View style={[styles.damageClassBadge, { backgroundColor: item.damageClass === 'physical' ? '#C92112' : item.damageClass === 'special' ? '#4A90E2' : '#68A090' }]}>
                                        <Text style={styles.damageClassText}>{item.damageClass === 'physical' ? 'PHY' : item.damageClass === 'special' ? 'SPC' : 'STA'}</Text>
                                    </View>
                                </View>

                                <View style={styles.compactMoveStats}>
                                    <View style={[styles.moveTypeBadge, { backgroundColor: colorsByType[item.type] || '#A8A77A' }]}>
                                        <Text style={styles.moveTypeText}>{item.type}</Text>
                                    </View>
                                    <View style={styles.statLine}>
                                        <Text style={styles.moveStatValue}>{item.power || '—'}</Text>
                                        <Text style={styles.moveStatLabel}> PWR</Text>
                                    </View>
                                    <View style={styles.statLine}>
                                        <Text style={styles.moveStatValue}>{item.accuracy ? `${item.accuracy}%` : '—'}</Text>
                                        <Text style={styles.moveStatLabel}> ACC</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    />

                    <Text style={[styles.sectionTitle, { marginTop: 24 }, darkMode && styles.sectionTitleDark]}>Charged Moves</Text>
                    <FlatList
                        data={chargedMoves}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={m => m.name}
                        contentContainerStyle={{ paddingBottom: 8 }}
                        renderItem={({ item }) => (
                            <View style={[styles.compactMoveCard, darkMode && styles.compactMoveCardDark]}>
                                <View style={styles.moveHeader}>
                                    <Text style={[styles.moveName, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>{item.name.replace('-', ' ')}</Text>
                                    <View style={[styles.damageClassBadge, { backgroundColor: item.damageClass === 'physical' ? '#C92112' : item.damageClass === 'special' ? '#4A90E2' : '#68A090' }]}>
                                        <Text style={styles.damageClassText}>{item.damageClass === 'physical' ? 'PHY' : item.damageClass === 'special' ? 'SPC' : 'STA'}</Text>
                                    </View>
                                </View>

                                <View style={styles.compactMoveStats}>
                                    <View style={[styles.moveTypeBadge, { backgroundColor: colorsByType[item.type] || '#A8A77A' }]}>
                                        <Text style={styles.moveTypeText}>{item.type}</Text>
                                    </View>
                                    <View style={styles.statLine}>
                                        <Text style={styles.moveStatValue}>{item.power || '—'}</Text>
                                        <Text style={styles.moveStatLabel}> PWR</Text>
                                    </View>
                                    <View style={styles.statLine}>
                                        <Text style={styles.moveStatValue}>{item.accuracy ? `${item.accuracy}%` : '—'}</Text>
                                        <Text style={styles.moveStatLabel}> ACC</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                </View>

                {/* BATTLE ROLE ANALYSIS - Last section */}
                {
                    battleStats && role && (
                        <View style={[styles.section, darkMode && styles.sectionDark]}>
                            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Battle Role Analysis</Text>

                            {/* Stats Summary */}
                            <View style={[styles.statsSummary, darkMode && { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statBoxLabel, darkMode && { color: '#94a3b8' }]}>Attack</Text>
                                    <Text style={[styles.statBoxValue, { color: '#e74c3c' }]}>
                                        {battleStats.attackScore}
                                    </Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statBoxLabel, darkMode && { color: '#94a3b8' }]}>Defense</Text>
                                    <Text style={[styles.statBoxValue, { color: '#3498db' }]}>
                                        {battleStats.defenseScore}
                                    </Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statBoxLabel, darkMode && { color: '#94a3b8' }]}>Stamina</Text>
                                    <Text style={[styles.statBoxValue, { color: '#2ecc71' }]}>
                                        {battleStats.staminaScore}
                                    </Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statBoxLabel, darkMode && { color: '#94a3b8' }]}>Overall</Text>
                                    <Text style={[styles.statBoxValue, { color: '#9b59b6' }]}>
                                        {battleStats.overallScore}
                                    </Text>
                                </View>
                            </View>

                            {/* Radar Chart */}
                            <RadarChart stats={pokemon.stats} size={300} darkMode={darkMode} />

                            {/* Primary Role Card */}
                            <Text style={[styles.sectionTitle, { marginTop: 24 }, darkMode && styles.sectionTitleDark]}>Primary Role</Text>
                            <View style={[styles.roleCard, darkMode && styles.roleCardDark]}>
                                <View style={styles.roleHeader}>
                                    <Text style={[styles.roleTitle, darkMode && styles.roleTitleDark]}>{role.role}</Text>
                                    <View style={styles.ratingContainer}>
                                        <Text style={[styles.ratingText, darkMode && { color: '#94a3b8' }]}>Rating: {role.rating}/10</Text>
                                        <View style={styles.ratingBar}>
                                            <View
                                                style={[
                                                    styles.ratingFill,
                                                    {
                                                        width: `${role.rating * 10}%`,
                                                        backgroundColor: getRatingColor(role.rating)
                                                    }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <Text style={[styles.roleDescription, darkMode && { color: '#94a3b8' }]}>
                                    {ROLE_DESCRIPTIONS[role.role]}
                                </Text>

                                <View style={styles.roleDetails}>
                                    <View style={styles.detailColumn}>
                                        <Text style={[styles.detailTitle, darkMode && styles.detailTitleDark]}>Strengths</Text>
                                        {role.strengths.map((strength, i) => (
                                            <Text key={i} style={[styles.detailItem, darkMode && styles.detailItemDark]}>✓ {strength}</Text>
                                        ))}
                                    </View>

                                    <View style={styles.detailColumn}>
                                        <Text style={[styles.detailTitle, darkMode && styles.detailTitleDark]}>Best For</Text>
                                        {role.bestFor.map((use, i) => (
                                            <Text key={i} style={[styles.detailItem, darkMode && styles.detailItemDark]}>• {use}</Text>
                                        ))}
                                    </View>
                                </View>

                                <View style={[styles.weaknessSection, darkMode && { borderTopColor: '#334155' }]}>
                                    <Text style={[styles.detailTitle, darkMode && styles.detailTitleDark]}>Weaknesses</Text>
                                    {role.weaknesses.map((weakness, i) => (
                                        <Text key={i} style={[styles.detailItem, darkMode && styles.detailItemDark]}>⚠️ {weakness}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )
                }
            </Animated.ScrollView >
        </SafeAreaView >
    );
}

/* =======================
   Styles
======================= */
const styles = StyleSheet.create({
    hero: {
        paddingTop: 60,
        paddingBottom: 24,
        alignItems: "center",
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    carouselWrapper: {
        height: 280,
        width: windowWidth > 600 ? 500 : windowWidth,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    carouselItem: {
        width: windowWidth > 600 ? 500 : windowWidth,
        alignItems: "center",
        justifyContent: 'center',
    },
    heroImageContainer: {
        width: '100%',
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImage: {
        width: '85%',
        height: 240,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        // Shadow for premium feel
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    },
    arrowButton: {
        position: 'absolute',
        top: '50%',
        marginTop: -24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    // Legendary/Mythical Badge Styles
    legendaryBadge: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.95)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    legendaryIcon: {
        fontSize: 22,
        marginRight: 6,
    },
    legendaryText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Abilities Section Styles
    abilityItem: {
        marginBottom: 6,
    },
    abilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
    },
    abilityName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        textTransform: 'capitalize',
        marginRight: 8,
    },
    hiddenBadge: {
        backgroundColor: '#9C27B0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    hiddenBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
    },
    abilityDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    // Breeding Section Styles
    breedingRow: {
        marginBottom: 16,
    },
    breedingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    breedingValue: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '700',
    },
    genderContainer: {
        flex: 1,
    },
    genderBar: {
        flexDirection: 'row',
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    genderMale: {
        backgroundColor: '#4A90E2',
    },
    genderFemale: {
        backgroundColor: '#FF69B4',
    },
    genderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    eggGroupsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    eggGroupBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    eggGroupText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2196F3',
        textTransform: 'capitalize',
    },
    // Capture Info Styles
    captureRow: {
        marginBottom: 8,
    },
    captureLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    captureRateContainer: {
        flex: 1,
    },
    captureBar: {
        height: 24,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    captureBarFill: {
        height: '100%',
        borderRadius: 12,
    },
    captureValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    // IMAGE INDICATOR
    dots: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        marginBottom: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
    dotActive: {
        width: 12,
        backgroundColor: "#fff",
    },

    // NAME & ID
    name: {
        fontSize: 32,
        fontWeight: "900",
        color: '#fff',
        textTransform: "capitalize",
        letterSpacing: -1,
        marginBottom: 4,
        textAlign: 'center',
    },
    id: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 12,
        letterSpacing: 2,
        textAlign: 'center',
    },

    // TYPE BADGES
    typesRow: {
        flexDirection: "row",
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    typeText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        textTransform: "capitalize",
    },

    // GLOBAL SECTION / CARD STYLING
    section: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 24,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionDark: {
        backgroundColor: '#1e293b',
        shadowOpacity: 0.2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: '#0f172a',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    sectionTitleDark: {
        color: '#f1f5f9',
    },
    aboutRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    statRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    statName: {
        width: 100,
        fontWeight: "700",
        color: "#64748b",
        fontSize: 11,
    },
    statBarBg: {
        flex: 1,
        height: 10,
        backgroundColor: "#f1f5f9",
        borderRadius: 5,
        marginHorizontal: 12,
    },
    statBar: {
        height: 10,
        borderRadius: 5,
    },
    statValue: {
        width: 30,
        textAlign: "right",
        fontWeight: "900",
        fontSize: 13,
        color: '#0f172a',
    },

    compactMoveCard: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 20,
        marginRight: 12,
        width: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    compactMoveCardDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    compactMoveStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    statLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moveHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    moveName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
        textTransform: 'capitalize',
    },
    eliteBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    eliteBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#000',
        textTransform: 'uppercase',
    },
    moveStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    moveStat: {
        alignItems: 'center',
    },
    moveStatLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    moveStatValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    moveTypeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    moveTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    moveTypeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
    },
    damageClassBadge: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 50,
        alignItems: 'center',
    },
    damageClassText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
    },
    moveEffect: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },

    // Evolution Chain Styles
    evolutionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 12,
    },
    evoWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    evoItem: {
        alignItems: "center",
        width: 100,
    },
    evoImageBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    evoImage: {
        width: 60,
        height: 60,
    },
    evoName: {
        fontSize: 14,
        fontWeight: "700",
        textTransform: "capitalize",
        textAlign: 'center',
    },
    evoArrow: {
        fontSize: 20,
        fontWeight: "900",
        color: "#cbd5e1",
    },
    noEvolutionText: {
        color: "#94a3b8",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 10,
    },
    evoImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#cbd5e1",
    },

    // Type Grid for Weaknesses
    typesRowGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeBadgeGrid: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 90,
        alignItems: 'center',
    },
    typeTextGrid: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },

    // Battle Role Analysis Styles
    statsSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 15,
        borderRadius: 20,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statBoxLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statBoxValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    roleCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 20,
        marginTop: 12,
        borderLeftWidth: 6,
        borderLeftColor: '#4A90E2',
    },
    roleCardDark: {
        backgroundColor: '#1e293b',
        borderLeftColor: '#4A90E2',
    },
    roleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    roleTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
    },
    roleTitleDark: {
        color: '#f1f5f9',
    },
    ratingContainer: {
        alignItems: 'flex-end',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 4,
    },
    ratingBar: {
        width: 100,
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    ratingFill: {
        height: '100%',
    },
    roleDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 20,
    },
    roleDetails: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    detailColumn: {
        flex: 1,
    },
    detailTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailTitleDark: {
        color: '#f1f5f9',
    },
    detailItem: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 6,
    },
    detailItemDark: {
        color: '#94a3b8',
    },
    weaknessSection: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 16,
    },
});
