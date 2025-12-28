import SkeletonPokemonDetails from "@/components/SkeletonPokemonDetails";
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get("window");

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

/* =======================
   Type Icons
======================= */
const typeIcons: Record<string, any> = {
    fire: require("@/assets/type-icons/fire.png"),
    water: require("@/assets/type-icons/water.png"),
    grass: require("@/assets/type-icons/grass.png"),
    electric: require("@/assets/type-icons/electric.png"),
    ice: require("@/assets/type-icons/ice.png"),
    fighting: require("@/assets/type-icons/fighting.png"),
    poison: require("@/assets/type-icons/poison.png"),
    ground: require("@/assets/type-icons/ground.png"),
    flying: require("@/assets/type-icons/flying.png"),
    psychic: require("@/assets/type-icons/psychic.png"),
    bug: require("@/assets/type-icons/bug.png"),
    rock: require("@/assets/type-icons/rock.png"),
    ghost: require("@/assets/type-icons/ghost.png"),
    dragon: require("@/assets/type-icons/dragon.png"),
    dark: require("@/assets/type-icons/dark.png"),
    steel: require("@/assets/type-icons/steel.png"),
    fairy: require("@/assets/type-icons/fairy.png"),
    normal: require("@/assets/type-icons/normal.png"),
};

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

const ROLE_STRENGTHS = {
    Attacker: ['High DPS', 'Fast raid clears', 'Gym sweeping'],
    Defender: ['Gym longevity', 'High defense', 'Wastes opponent time'],
    Tank: ['High survivability', 'Good for new players', 'No dodging needed'],
    Balanced: ['Versatile', 'No major weaknesses', 'Easy to use'],
    'Raid Specialist': ['Type coverage', 'Versatile', 'Good against multiple bosses'],
};

const ROLE_WEAKNESSES = {
    Attacker: ['Low survivability', 'Needs dodging'],
    Defender: ['Low damage output', 'Slow battles'],
    Tank: ['Slow battles', 'Poor time efficiency'],
    Balanced: ['Jack of all trades, master of none'],
    'Raid Specialist': ['May not be best in class'],
};

const ROLE_BEST_FOR = {
    Attacker: ['Raids', 'Gym attacks', 'Team Rocket battles'],
    Defender: ['Gym defense', 'Stalling in PvP'],
    Tank: ['Solo raids', 'Learning battles', 'Tanky teams'],
    Balanced: ['General play', 'Early game', 'All-around use'],
    'Raid Specialist': ['Versatile raiding', 'Multiple raid bosses'],
};

/* =======================
   Radar Chart Component
======================= */
function RadarChart({ stats, size = 200 }: { stats: any[], size?: number }) {
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
        `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Svg width={size} height={size}>
                {/* Outer boundary */}
                <Circle cx={center} cy={center} r={radius} fill="none" stroke="#e0e0e0" strokeWidth={1} />

                {/* Grid circles */}
                <Circle cx={center} cy={center} r={radius * 0.75} fill="none" stroke="#f0f0f0" strokeWidth={1} />
                <Circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="#f0f0f0" strokeWidth={1} />
                <Circle cx={center} cy={center} r={radius * 0.25} fill="none" stroke="#f0f0f0" strokeWidth={1} />

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
                            stroke="#ccc"
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Radar shape */}
                <Path d={pathData} fill="rgba(100, 150, 255, 0.3)" stroke="#4a90e2" strokeWidth={2} />

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
                                fill="#444"
                                fontWeight="bold"
                            >
                                {category}
                            </SvgText>
                            <SvgText
                                x={x}
                                y={y + 14}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#666"
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
    const { name } = useLocalSearchParams<{ name: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
    const [fastMoves, setFastMoves] = useState<any[]>([]);
    const [chargedMoves, setChargedMoves] = useState<any[]>([]);
    const [description, setDescription] = useState<string>("");
    const [damageMap, setDamageMap] = useState<Record<string, number>>({});
    const [evolutionChain, setEvolutionChain] = useState<any[]>([]);
    const [role, setRole] = useState<PokemonRole | null>(null);
    const [battleStats, setBattleStats] = useState<BattleStats | null>(null);
    const [hasEvolution, setHasEvolution] = useState(true);


    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollX = useRef(new Animated.Value(0)).current;
    const statAnims = useRef<Animated.Value[]>([]).current;
    const typeAnim = useRef(new Animated.Value(0)).current;

    /* =======================
       Fetch Pokémon Data
    ======================= */
    useEffect(() => {
        fetchPokemon();
    }, []);

    async function fetchPokemon() {
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
                fetchDescription(data.id),
                fetchEvolutionChain(data.id),
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
       Fetch Descriptions
    ======================= */
    async function fetchDescription(id: number) {
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
        } catch (error) {
            console.error("Error fetching description:", error);
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
            const fast: any[] = [];
            const charged: any[] = [];

            const limitedMoves = moves.slice(0, 24); // Limit for performance

            await Promise.all(
                limitedMoves.map(async (m) => {
                    const res = await fetch(m.move.url);
                    const data = await res.json();

                    const isFast = data.power && data.power <= 50;
                    const isElite = data.meta?.is_elite_tm || false;

                    const moveObj = {
                        name: m.move.name,
                        power: data.power,
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
        return <SkeletonPokemonDetails />;
    }
    if (!pokemon) return null;

    const mainType = pokemon.types[0].type.name;

    /* =======================
       Hero Images
    ======================= */
    const images = [
        pokemon.sprites.other["official-artwork"].front_default,
        pokemon.sprites.other["official-artwork"].front_shiny,
    ];

    /* =======================
       Render
    ======================= */
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <Animated.ScrollView
                style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#fff' }}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO SECTION */}
                <LinearGradient
                    colors={[colorsByType[mainType] + "DD", "#fff"]}
                    style={styles.hero}
                >
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, i) => i.toString()}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        renderItem={({ item }) => (
                            <View style={{ width, alignItems: "center" }}>
                                <Image
                                    source={{ uri: item }}
                                    style={styles.heroImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    />

                    {/* Image Dots Indicator */}
                    <View style={styles.dots}>
                        {images.map((_, i) => {
                            const opacity = scrollX.interpolate({
                                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: "clamp",
                            });
                            return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                        })}
                    </View>

                    <Text style={styles.name}>{pokemon.name}</Text>
                    <Text style={styles.id}>#{pokemon.id}</Text>

                    {/* Type Badges */}
                    <View style={styles.typesRow}>
                        {pokemon.types.map(t => (
                            <View
                                key={t.type.name}
                                style={[
                                    styles.typeBadge,
                                    { backgroundColor: colorsByType[t.type.name] },
                                ]}
                            >
                                {typeIcons[t.type.name] && (
                                    <Image
                                        source={typeIcons[t.type.name]}
                                        style={{ width: 18, height: 18, marginRight: 4 }}
                                    />
                                )}
                                <Text style={styles.typeText}>{t.type.name}</Text>
                            </View>
                        ))}
                    </View>
                </LinearGradient>

                {/* ABOUT SECTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={{ marginBottom: 12 }}>{description}</Text>
                    <View style={styles.aboutRow}>
                        <Text>Height (avg)</Text>
                        <Text>{pokemon.height / 10} m</Text>
                    </View>
                    <View style={styles.aboutRow}>
                        <Text>Weight (avg)</Text>
                        <Text>{pokemon.weight / 10} kg</Text>
                    </View>
                </View>

                {/* STATS SECTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Base Stats</Text>
                    {pokemon.stats.map((stat, index) => {
                        const percent = Math.min(stat.base_stat, 150) / 150;
                        return (
                            <View key={stat.stat.name} style={styles.statRow}>
                                <Text style={styles.statName}>{stat.stat.name.replace('-', ' ').toUpperCase()}</Text>
                                <View style={styles.statBarBg}>
                                    <Animated.View
                                        style={[
                                            styles.statBar,
                                            {
                                                backgroundColor: colorsByType[mainType],
                                                width: statAnims[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ["0%", `${percent * 100}%`],
                                                }),
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.statValue}>{stat.base_stat}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* EVOLUTION CHAIN */}
                {evolutionChain.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Evolution Chain</Text>

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
                                            {evo.image ? (
                                                <Image
                                                    source={{ uri: evo.image }}
                                                    style={styles.evoImage}
                                                />
                                            ) : (
                                                <View style={styles.evoImagePlaceholder} />
                                            )}
                                            <Text style={styles.evoName}>{evo.name}</Text>
                                        </View>

                                        {index < evolutionChain.length - 1 && (
                                            <Text style={styles.evoArrow}>→</Text>
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
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Weaknesses (2× / 4×)</Text>
                            <View style={styles.typesRow}>
                                {[...renderDamage(4), ...renderDamage(2)].map(t => (
                                    <View
                                        key={t}
                                        style={[styles.typeBadge, { backgroundColor: colorsByType[t] }]}
                                    >
                                        <Text style={styles.typeText}>
                                            {t} {damageMap[t] === 4 ? "×4" : "×2"}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                                Resistances (½× / ¼×)
                            </Text>
                            <View style={styles.typesRow}>
                                {[...renderDamage(0.25), ...renderDamage(0.5)].map(t => (
                                    <View
                                        key={t}
                                        style={[styles.typeBadge, { backgroundColor: colorsByType[t] }]}
                                    >
                                        <Text style={styles.typeText}>
                                            {t} {damageMap[t] === 0.25 ? "×¼" : "×½"}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                                Immunities (0×)
                            </Text>
                            <View style={styles.typesRow}>
                                {renderDamage(0).map(t => (
                                    <View
                                        key={t}
                                        style={[styles.typeBadge, { backgroundColor: colorsByType[t] }]}
                                    >
                                        <Text style={styles.typeText}>{t} ×0</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* MOVES SECTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fast Moves</Text>
                    <FlatList
                        data={fastMoves}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={m => m.name}
                        renderItem={({ item }) => (
                            <View style={styles.moveCard}>
                                <Text style={styles.moveText}>{item.name}</Text>
                                {item.elite && <Text style={styles.elite}>Elite</Text>}
                            </View>
                        )}
                    />

                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Charged Moves</Text>
                    <FlatList
                        data={chargedMoves}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={m => m.name}
                        renderItem={({ item }) => (
                            <View style={styles.moveCard}>
                                <Text style={styles.moveText}>{item.name}</Text>
                                {item.elite && <Text style={styles.elite}>Elite</Text>}
                            </View>
                        )}
                    />
                </View>

                {/* BATTLE ROLE ANALYSIS - Last section */}
                {battleStats && role && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Battle Role Analysis</Text>

                        {/* Stats Summary */}
                        <View style={styles.statsSummary}>
                            <View style={styles.statBox}>
                                <Text style={styles.statBoxLabel}>Attack</Text>
                                <Text style={[styles.statBoxValue, { color: '#e74c3c' }]}>
                                    {battleStats.attackScore}
                                </Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statBoxLabel}>Defense</Text>
                                <Text style={[styles.statBoxValue, { color: '#3498db' }]}>
                                    {battleStats.defenseScore}
                                </Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statBoxLabel}>Stamina</Text>
                                <Text style={[styles.statBoxValue, { color: '#2ecc71' }]}>
                                    {battleStats.staminaScore}
                                </Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statBoxLabel}>Overall</Text>
                                <Text style={[styles.statBoxValue, { color: '#9b59b6' }]}>
                                    {battleStats.overallScore}
                                </Text>
                            </View>
                        </View>

                        {/* Radar Chart */}
                        <RadarChart stats={pokemon.stats} size={300} />

                        {/* Primary Role Card */}
                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Primary Role</Text>
                        <View style={styles.roleCard}>
                            <View style={styles.roleHeader}>
                                <Text style={styles.roleTitle}>{role.role}</Text>
                                <View style={styles.ratingContainer}>
                                    <Text style={styles.ratingText}>Rating: {role.rating}/10</Text>
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

                            <Text style={styles.roleDescription}>
                                {ROLE_DESCRIPTIONS[role.role]}
                            </Text>

                            <View style={styles.roleDetails}>
                                <View style={styles.detailColumn}>
                                    <Text style={styles.detailTitle}>Strengths</Text>
                                    {role.strengths.map((strength, i) => (
                                        <Text key={i} style={styles.detailItem}>✓ {strength}</Text>
                                    ))}
                                </View>

                                <View style={styles.detailColumn}>
                                    <Text style={styles.detailTitle}>Best For</Text>
                                    {role.bestFor.map((use, i) => (
                                        <Text key={i} style={styles.detailItem}>• {use}</Text>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.weaknessSection}>
                                <Text style={styles.detailTitle}>Weaknesses</Text>
                                {role.weaknesses.map((weakness, i) => (
                                    <Text key={i} style={styles.detailItem}>⚠️ {weakness}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </Animated.ScrollView>
        </SafeAreaView>
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
    heroImage: {
        width: width * 0.9,
        height: 260,
    },
    dots: {
        flexDirection: "row",
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#000",
        marginHorizontal: 4,
    },
    name: {
        fontSize: 34,
        fontWeight: "bold",
        textTransform: "capitalize",
        marginTop: 10,
    },
    id: {
        opacity: 0.6,
        marginBottom: 6,
    },
    typesRow: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 6,
    },
    typeBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    typeText: {
        color: "#fff",
        fontWeight: "600",
        textTransform: "capitalize",
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
    },
    aboutRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    statRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    statName: {
        width: 90,
        fontWeight: "600",
        color: "#555",
    },
    statBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: "#eee",
        borderRadius: 4,
        marginHorizontal: 8,
    },
    statBar: {
        height: 8,
        borderRadius: 4,
    },
    statValue: {
        width: 40,
        textAlign: "right",
        fontWeight: "700",
    },
    moveCard: {
        backgroundColor: "#eee",
        padding: 14,
        borderRadius: 14,
        marginRight: 10,
        minWidth: 120,
        alignItems: "center",
    },
    moveText: {
        fontWeight: "600",
        textTransform: "capitalize",
    },
    elite: {
        marginTop: 4,
        fontSize: 12,
        color: "#C9A000",
        fontWeight: "700",
    },
    evolutionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    evoWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    evoItem: {
        alignItems: "center",
    },
    evoImage: {
        width: 90,
        height: 90,
    },
    evoName: {
        marginTop: 4,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    evoArrow: {
        fontSize: 26,
        marginHorizontal: 10,
        fontWeight: "bold",
        color: "#444",
    },
    statsSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statBoxLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    statBoxValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    roleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#3498db',
    },
    roleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    ratingContainer: {
        alignItems: 'flex-end',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '600',
    },
    ratingBar: {
        width: 80,
        height: 8,
        backgroundColor: '#ecf0f1',
        borderRadius: 4,
        overflow: 'hidden',
    },
    ratingFill: {
        height: '100%',
        borderRadius: 4,
    },
    roleDescription: {
        color: '#555',
        marginBottom: 16,
        lineHeight: 22,
        fontSize: 14,
    },
    roleDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailColumn: {
        flex: 1,
    },
    detailTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#2c3e50',
        fontSize: 14,
    },
    detailItem: {
        color: '#555',
        marginBottom: 6,
        fontSize: 12,
        lineHeight: 16,
    },
    weaknessSection: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },

    noEvolutionText: {
        color: "#aaa",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 10,
    },

    evoImagePlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#333",
        marginBottom: 6,
    },

});
