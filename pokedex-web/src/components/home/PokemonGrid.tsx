import bestBuddyImage from '@/assets/images/best-buddy.png';
import pokeballWatermark from '@/assets/images/pokeball_decorative.png'; // Watermark
import { Ionicons } from '@/components/native/Icons';
import { TYPE_BACKGROUNDS, TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemonTypes';
import type { BuddyData, PokemonWithNickname } from '@/types';
import React from 'react';
import { FlatList, Image, ImageBackground, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

// Interfaces
interface PokemonGridProps {
    pokemon: PokemonWithNickname[];
    onPokemonPress: (pokemon: PokemonWithNickname) => void;
    onPokemonLongPress: (pokemon: PokemonWithNickname) => void;
    onEndReached: () => void;
    listFooterComponent: React.ReactElement;
    buddyData: Record<number, BuddyData>;
    nicknames: Record<number, string>;
    settings: {
        shinySprites: boolean;
        nicknames: boolean;
        darkMode: boolean;
        gridLayout: boolean;
    };
    refreshing?: boolean;
    onRefresh?: () => void;
    onBuddyLongPress: (pokemon: PokemonWithNickname) => void;
    onBuddyHeartClick: (pokemon: PokemonWithNickname) => void;
}

export function PokemonGrid({
    pokemon,
    onPokemonPress,
    onPokemonLongPress,
    onEndReached,
    listFooterComponent,
    buddyData,
    nicknames,
    settings,
    refreshing,
    onRefresh,
    onBuddyLongPress,
    onBuddyHeartClick
}: PokemonGridProps) {
    const { width } = useWindowDimensions();
    const numColumns = width > 768 ? 4 : 2;
    const cardGap = 8;
    const listPadding = 16;
    const cardWidth = (width - (listPadding * 2) - ((numColumns - 1) * cardGap)) / numColumns;

    const renderItem = ({ item }: { item: PokemonWithNickname }) => {
        const isShiny = settings.shinySprites;
        const displayName = settings.nicknames && item.nickname ? item.nickname : item.name;
        const imageUrl = isShiny ? item.shinyImageUrl : item.imageUrl;
        const buddy = buddyData[item.id];
        const isBestBuddy = buddy?.level === 4;

        // Background logic
        const type = item.types[0];
        const bgImage = TYPE_BACKGROUNDS[type] || TYPE_BACKGROUNDS['default'];

        return (
            <View style={[
                styles.card,
                { width: cardWidth },
                settings.darkMode && styles.cardDark
            ]}>
                <Pressable
                    style={({ pressed }) => [
                        styles.cardContentContainer,
                        pressed && { opacity: 0.95 },
                    ]}
                    onPress={() => onPokemonPress(item)}
                    onLongPress={() => onPokemonLongPress(item)}
                >
                    <ImageBackground
                        source={bgImage}
                        style={styles.cardBackground}
                        imageStyle={styles.cardBackgroundImage}
                    >
                        {/* Watermark */}
                        <Image source={{ uri: pokeballWatermark }} style={styles.watermark} resizeMode="contain" />

                        {/* Card Content - Minus Badge */}
                        <View style={styles.cardContent}>
                            {/* ID */}
                            <Text style={styles.idText}>#{String(item.id).padStart(3, '0')}</Text>

                            {/* Image container */}
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: imageUrl }} style={styles.pokemonImage} resizeMode="contain" />
                            </View>

                            {/* Name */}
                            <Text style={styles.nameText} numberOfLines={1}>{displayName}</Text>

                            {/* Types */}
                            <View style={styles.typesContainer}>
                                {item.types.map(t => (
                                    <View key={t} style={[styles.typePill, { backgroundColor: TYPE_COLORS[t] }]}>
                                        <Image source={TYPE_ICONS[t]} style={styles.typeIcon} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ImageBackground>
                </Pressable>

                {/* Buddy Badge - Moved Outside as Sibling */}
                <Pressable
                    style={styles.buddyBadgeContainer}
                    onPress={() => {
                        console.log('Buddy Heart Click triggered for:', item.name);
                        if (onBuddyHeartClick) onBuddyHeartClick(item);
                    }}
                    onLongPress={() => {
                        console.log('Buddy Long Press triggered for:', item.name);
                        if (onBuddyLongPress) onBuddyLongPress(item);
                    }}
                    delayLongPress={200}
                    hitSlop={15}
                >
                    <View style={styles.heartsRow}>
                        {[0, 1, 2, 3].map((i) => (
                            <Ionicons
                                key={i}
                                name="heart"
                                size={10}
                                color={buddy && i < buddy.level ? "#FF6B6B" : "rgba(0,0,0,0.1)"}
                                style={{ opacity: buddy && i < buddy.level ? 1 : 0.5 }}
                            />
                        ))}
                    </View>
                    {isBestBuddy && <Image source={{ uri: bestBuddyImage }} style={styles.bestBuddyBadge} />}
                </Pressable>
            </View>
        );
    };

    return (
        <FlatList
            style={{ flex: 1 }}
            data={pokemon}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            numColumns={numColumns}
            key={numColumns} // Force re-render on column change
            contentContainerStyle={[styles.listContent, { padding: listPadding }]}
            columnWrapperStyle={{ gap: cardGap }}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={listFooterComponent}
            removeClippedSubviews={Platform.OS === 'android'} // Improve perf
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            refreshing={refreshing}
            onRefresh={onRefresh}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 100, // Space for FAB
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'transparent',
        minHeight: 220,
        overflow: 'hidden',
        position: 'relative', // For absolute positioning of badge
    },
    cardContentContainer: {
        flex: 1,
        cursor: 'pointer', // Move cursor here
    },
    cardDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
    },
    cardBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    cardBackgroundImage: {
        borderRadius: 16,
        opacity: 0.35, // Increased from 0.15 for more prominent backgrounds
    },
    cardContent: {
        width: '100%',
        alignItems: 'center',
        padding: 12,
    },
    idText: {
        alignSelf: 'flex-start',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
    },
    buddyBadgeContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        alignItems: 'flex-end',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 4,
        borderRadius: 12,
        zIndex: 100, // Ensure it's on top
        elevation: 5,
    },
    watermark: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
        zIndex: 0,
        transform: [{ scale: 0.8 }, { rotate: '-20deg' }],
    },
    heartsRow: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 2,
    },
    bestBuddyBadge: {
        width: 20,
        height: 20,
    },
    imageContainer: {
        width: 120,
        height: 120,
        marginVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pokemonImage: {
        width: '100%',
        height: '100%',
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize',
        marginTop: 4,
    },
    typesContainer: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    typePill: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    typeIcon: {
        width: 18,
        height: 18,
    },
});
