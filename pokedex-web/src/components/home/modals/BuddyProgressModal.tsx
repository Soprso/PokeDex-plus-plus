import { Ionicons } from '@/components/native/Icons';
import type { BuddyData, DailyHeartTracker, PokemonWithNickname } from '@/types';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface BuddyProgressModalProps {
    visible: boolean;
    onClose: () => void;
    pokemon: PokemonWithNickname | null;
    buddyData: BuddyData | null;
    heartTracker: DailyHeartTracker;
    darkMode: boolean;
}

// Constants for buddy progression
const POINTS_PER_LEVEL = {
    1: 1,   // Good Buddy - Day 1
    2: 4,   // Great Buddy - Day 4
    3: 11,  // Ultra Buddy - Day 11
    4: 21,  // Best Buddy - Day 21
};

const MAX_DAILY_HEARTS = 3;

const LEVEL_NAMES = {
    0: 'No Buddy',
    1: 'Good Buddy',
    2: 'Great Buddy',
    3: 'Ultra Buddy',
    4: 'Best Buddy',
};

export function BuddyProgressModal({ visible, onClose, pokemon, buddyData, heartTracker, darkMode }: BuddyProgressModalProps) {
    if (!pokemon) {
        return null;
    }

    // Handle Pokemon without buddy data (level 0)
    if (!buddyData || buddyData.level === 0) {
        return (
            <Modal visible={visible} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                        <View style={styles.header}>
                            <Pressable onPress={onClose} style={styles.closeIcon}>
                                <Ionicons name="close" size={24} color={darkMode ? "#94a3b8" : "#64748b"} />
                            </Pressable>
                            <Image source={{ uri: pokemon.imageUrl }} style={styles.pokemonImage} resizeMode="contain" />
                            <Text style={[styles.pokemonName, darkMode && styles.pokemonNameDark]}>
                                {pokemon.nickname || pokemon.name}
                            </Text>
                        </View>

                        <View style={[styles.statBox, styles.noBuddyBox]}>
                            <Text style={styles.noBuddyText}>❤️ Not a Buddy Yet</Text>
                            <Text style={[styles.noBuddySubtext, darkMode && styles.noBuddySubtextDark]}>
                                Start your buddy journey by giving this Pokémon a heart!
                            </Text>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.closeButton,
                                darkMode && styles.closeButtonDark,
                                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[styles.closeButtonText, darkMode && styles.closeButtonTextDark]}>
                                Close
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        );
    }

    const today = new Date().toISOString().split('T')[0];

    // Global heart tracking
    const totalHeartsGivenToday = heartTracker.date === today ? heartTracker.heartsGivenToday : 0;
    const globalHeartsLeftToday = Math.max(0, MAX_DAILY_HEARTS - totalHeartsGivenToday);
    const hasHeartedThisPokemonToday = heartTracker.date === today && heartTracker.pokemonHeartedToday.includes(pokemon.id);

    // Calculate days to Best Buddy
    const currentPoints = buddyData.points;
    const pointsNeeded = POINTS_PER_LEVEL[4] - currentPoints;
    // We assume 1 heart per day per Pokemon is the limit (since you can only heart a Pokemon once per day)
    const daysRemaining = buddyData.level === 4 ? 0 : Math.ceil(pointsNeeded / 1);

    const levelName = LEVEL_NAMES[buddyData.level as 0 | 1 | 2 | 3 | 4] || 'Unknown';
    const isBestBuddy = buddyData.level === 4;

    return (
        <Modal visible={visible} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    {/* Header with Pokemon */}
                    <View style={styles.header}>
                        <Image source={{ uri: pokemon.imageUrl }} style={styles.pokemonImage} resizeMode="contain" />
                        <Text style={[styles.pokemonName, darkMode && styles.pokemonNameDark]}>
                            {pokemon.nickname || pokemon.name}
                        </Text>
                    </View>

                    {/* Current Level */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
                            Current Level
                        </Text>
                        <View style={styles.levelContainer}>
                            <View style={styles.heartsRow}>
                                {[0, 1, 2, 3].map((i) => (
                                    <Ionicons
                                        key={i}
                                        name="heart"
                                        size={20}
                                        color={i < buddyData.level ? "#FF6B6B" : "#ccc"}
                                    />
                                ))}
                            </View>
                            <Text style={[styles.levelName, darkMode && styles.levelNameDark]}>
                                {levelName}
                            </Text>
                        </View>
                    </View>

                    {/* Days to Best Buddy */}
                    {!isBestBuddy && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
                                Progress to Best Buddy
                            </Text>
                            <View style={[styles.statBox, darkMode && styles.statBoxDark]}>
                                <Text style={[styles.statValue, darkMode && styles.statValueDark]}>
                                    {daysRemaining}
                                </Text>
                                <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>
                                    {daysRemaining === 1 ? 'day remaining' : 'days remaining'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {isBestBuddy && (
                        <View style={styles.section}>
                            <View style={[styles.statBox, styles.bestBuddyBox]}>
                                <Text style={styles.bestBuddyText}>🎉 You are Best Buddies!</Text>
                                {buddyData.achievedBestBuddyDate && (
                                    <Text style={styles.achievedDate}>
                                        Since {new Date(buddyData.achievedBestBuddyDate).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Daily Hearts */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
                            Today's Hearts
                        </Text>
                        <View style={styles.dailyHeartsContainer}>
                            {/* Global Daily Progress */}
                            <View style={[styles.heartStatBox, darkMode && styles.heartStatBoxDark]}>
                                <View style={styles.heartsRow}>
                                    {[0, 1, 2].map((i) => (
                                        <Ionicons
                                            key={i}
                                            name={i < totalHeartsGivenToday ? "heart" : "heart-outline"}
                                            size={16}
                                            color={i < totalHeartsGivenToday ? "#FF6B6B" : "#ccc"}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.heartStatLabel, darkMode && styles.heartStatLabelDark]}>
                                    Total Done: {totalHeartsGivenToday} / {MAX_DAILY_HEARTS}
                                </Text>
                            </View>

                            {/* Remaining Today */}
                            <View style={[styles.heartStatBox, darkMode && styles.heartStatBoxDark]}>
                                <Text style={[styles.heartStatValue, darkMode && styles.heartStatValueDark]}>
                                    {globalHeartsLeftToday}
                                </Text>
                                <Text style={[styles.heartStatLabel, darkMode && styles.heartStatLabelDark]}>
                                    Hearts Left
                                </Text>
                            </View>
                        </View>

                        {/* This Pokemon's Status */}
                        <View style={[styles.indicatorBox, darkMode && styles.indicatorBoxDark, !hasHeartedThisPokemonToday && { backgroundColor: '#f0f0f0' }]}>
                            <Ionicons
                                name={hasHeartedThisPokemonToday ? "checkmark-circle" : "ellipse-outline"}
                                size={18}
                                color={hasHeartedThisPokemonToday ? "#4CAF50" : "#999"}
                            />
                            <Text style={[
                                styles.indicatorText,
                                darkMode && styles.indicatorTextDark,
                                !hasHeartedThisPokemonToday && { color: '#666' }
                            ]}>
                                {hasHeartedThisPokemonToday
                                    ? `Already hearted ${pokemon.nickname || pokemon.name} today!`
                                    : `You haven't hearted ${pokemon.nickname || pokemon.name} today.`}
                            </Text>
                        </View>
                    </View>

                    {/* Close Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.closeButton,
                            darkMode && styles.closeButtonDark,
                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                        ]}
                        onPress={onClose}
                    >
                        <Text style={[styles.closeButtonText, darkMode && styles.closeButtonTextDark]}>
                            Close
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        padding: 24,
    },
    modalContentDark: {
        backgroundColor: '#222',
    },
    header: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 24,
        position: 'relative',
    },
    closeIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 4,
        zIndex: 10,
    },
    pokemonImage: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    pokemonName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        textTransform: 'capitalize',
    },
    pokemonNameDark: {
        color: '#fff',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionTitleDark: {
        color: '#999',
    },
    levelContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
    },
    heartsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    levelName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    levelNameDark: {
        color: '#fff',
    },
    statBox: {
        backgroundColor: '#f0f7ff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statBoxDark: {
        backgroundColor: '#1a2433',
    },
    statValue: {
        fontSize: 36,
        fontWeight: '800',
        color: '#2196F3',
        marginBottom: 4,
    },
    statValueDark: {
        color: '#64B5F6',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statLabelDark: {
        color: '#999',
    },
    bestBuddyBox: {
        backgroundColor: '#fff8e1',
        borderWidth: 2,
        borderColor: '#FFD54F',
    },
    bestBuddyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F57F17',
        marginBottom: 4,
    },
    achievedDate: {
        fontSize: 12,
        color: '#F9A825',
    },
    dailyHeartsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    heartStatBox: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    heartStatBoxDark: {
        backgroundColor: '#2a2a2a',
    },
    heartStatValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FF6B6B',
        marginBottom: 4,
    },
    heartStatValueDark: {
        color: '#FF8A8A',
    },
    heartStatLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    heartStatLabelDark: {
        color: '#999',
    },
    indicatorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    indicatorBoxDark: {
        backgroundColor: '#1b2e1f',
    },
    indicatorText: {
        flex: 1,
        fontSize: 13,
        color: '#2E7D32',
        fontWeight: '600',
    },
    indicatorTextDark: {
        color: '#81C784',
    },
    closeButton: {
        backgroundColor: '#f0f0f0',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    closeButtonDark: {
        backgroundColor: '#333',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    closeButtonTextDark: {
        color: '#fff',
    },
    noBuddyBox: {
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        padding: 24,
        marginBottom: 20,
    },
    noBuddyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    noBuddySubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
    noBuddySubtextDark: {
        color: '#aaa',
    },
});
