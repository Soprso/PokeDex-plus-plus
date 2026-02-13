import { AirSlashEffect, BubbleBeamEffect, ExtraLoveEffect, FrenzyPlantEffect, GhostlyMistEffect, GoldenGloryEffect, IcyWindEffect, MagmaStormEffect, NeonCyberEffect, RockTombEffect } from '@/components/card-effects';
import { GoldFrame, NeonFrame } from '@/components/frame-effects';
import { Image, Pressable, StyleSheet, Text, View } from '@/components/native';
import { Ionicons } from '@/components/native/Icons';
import { TYPE_BACKGROUNDS, TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemonTypes';
import { type ShopItem } from '@/constants/shopItems';
import React from 'react';
import { ImageBackground } from 'react-native';

// Use standard imports for web assets
// Assets
import CoinIcon from '@/assets/images/dex-coin.png';
import pokeballWatermark from '@/assets/images/pokeball_decorative.png';

interface ShopItemCardProps {
    item: ShopItem;
    count: number;
    isDark: boolean;
    onBuy: () => void;
    shouldPlay: boolean;
}

export const ShopItemCard = React.memo(({ item, count, isDark, onBuy, shouldPlay }: ShopItemCardProps) => {
    const bgImage = TYPE_BACKGROUNDS['electric']; // Pikachu is Electric
    const isSpecialEffect = ['extra_love', 'effect_neon_cyber', 'effect_golden_glory', 'effect_ghostly_mist', 'effect_icy_wind', 'effect_magma_storm', 'effect_frenzy_plant', 'effect_bubble_beam', 'effect_air_slash', 'effect_rock_tomb'].includes(item.id);

    return (
        <View style={[styles.itemCard, isDark && styles.itemCardDark] as any}>
            <ImageBackground
                source={bgImage}
                style={styles.cardBackground}
                imageStyle={styles.cardBackgroundImage}
            >
                {/* Watermark */}
                <Image source={{ uri: pokeballWatermark }} style={styles.watermark} resizeMode="contain" />

                {/* Live Effect Preview - Only if shouldPlay is true */}
                {shouldPlay ? (
                    <>
                        {item.id === 'extra_love' && <ExtraLoveEffect />}
                        {item.id === 'effect_golden_glory' && <GoldenGloryEffect />}
                        {item.id === 'effect_icy_wind' && <IcyWindEffect />}
                        {item.id === 'effect_magma_storm' && <MagmaStormEffect />}
                        {item.id === 'effect_ghostly_mist' && <GhostlyMistEffect />}
                        {item.id === 'effect_frenzy_plant' && <FrenzyPlantEffect />}
                        {item.id === 'effect_bubble_beam' && <BubbleBeamEffect />}
                        {item.id === 'effect_air_slash' && <AirSlashEffect />}
                        {item.id === 'effect_neon_cyber' && <NeonCyberEffect />}
                        {item.id === 'effect_rock_tomb' && <RockTombEffect />}
                    </>
                ) : (
                    // Static placeholder when not playing
                    isSpecialEffect && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#333', opacity: 0.1 }] as any} />
                )}

                {/* Frame Preview - Always render frames to ensure visibility */}
                {item.type === 'frame' && (
                    <View style={StyleSheet.absoluteFill}>
                        {item.id === 'frame_gold' && <GoldFrame />}
                        {item.id === 'frame_neon' && <NeonFrame />}
                    </View>
                )}

                {/* Card Content Structure from PokemonGrid */}
                <View style={styles.cardContent}>
                    {/* ID */}
                    <Text style={styles.cardId}>#025</Text>

                    {/* Image container */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Name */}
                    <Text style={styles.cardName}>Pikachu</Text>

                    {/* Types */}
                    <View style={styles.cardTypeContainer}>
                        <View style={[styles.typePill, { backgroundColor: TYPE_COLORS['electric'] }]}>
                            <Image source={TYPE_ICONS['electric']} style={styles.cardTypeIcon} />
                        </View>
                    </View>
                </View>

                {/* Category Badge */}
                <View style={[
                    styles.categoryBadge,
                    item.category === 'legendary' && styles.categoryBadgeLegendary,
                    item.category === 'mythical' && styles.categoryBadgeMythical
                ] as any}>
                    <Text style={[
                        styles.categoryText,
                        (item.category === 'legendary' || item.category === 'mythical') && styles.categoryTextPremium
                    ] as any}>{item.category.toUpperCase()}</Text>
                </View>

                {/* Owned Badge */}
                {count > 0 && <View style={styles.ownedBadge}><Text style={styles.ownedText}>x{count}</Text></View>}

                {/* Effects Overlay - Static icon if not special effect */}
                {!isSpecialEffect && item.type === 'effect' && (
                    <View style={styles.effectIconOverlay} pointerEvents="none">
                        <Ionicons name="sparkles" size={24} color={item.category === 'mythical' ? '#FFD700' : '#fff'} />
                    </View>
                )}
            </ImageBackground>

            {/* Info Overlay */}
            <View style={[styles.itemInfoOverlay, isDark && styles.itemInfoOverlayDark] as any}>
                <Text style={[styles.itemName, isDark && styles.textDark] as any}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                <Pressable style={styles.buyButton} onPress={onBuy}>
                    <Text style={styles.buyButtonText}>{item.price === 0 ? 'Free' : item.price}</Text>
                    <Image source={CoinIcon} style={styles.coinIconSmall} />
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    itemCard: { width: '48%', height: 320, borderRadius: 24, overflow: 'hidden', marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, position: 'relative', backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
    itemCardDark: { backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.05)' },
    cardBackground: { flex: 1, position: 'relative' },
    cardBackgroundImage: {
        borderRadius: 24,
        opacity: 0.35,
    },
    watermark: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
        zIndex: 0,
        transform: [{ scale: 0.8 }, { rotate: '-20deg' }],
    },
    cardContent: {
        width: '100%',
        alignItems: 'center',
        padding: 12,
    },
    imageContainer: {
        width: 100,
        height: 100,
        marginVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255, 255, 255, 0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 100, elevation: 5 },
    categoryBadgeLegendary: { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderColor: '#FFD700' },
    categoryBadgeMythical: { backgroundColor: 'rgba(147, 51, 234, 0.2)', borderColor: '#d8b4fe' },
    categoryText: { color: '#666', fontSize: 9, fontWeight: '700', letterSpacing: '0.5px' },
    categoryTextPremium: { textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },
    cardId: {
        alignSelf: 'flex-start',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#999',
    } as any,
    cardName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize',
        marginTop: 4,
    } as any,
    cardTypeContainer: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 6,
    } as any,
    typePill: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTypeIcon: { width: 14, height: 14, resizeMode: 'contain' } as any,
    previewImage: {
        width: '100%',
        height: '100%',
    } as any,
    effectIconOverlay: { position: 'absolute', top: 8, right: 8, opacity: 0.9, padding: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 12, zIndex: 100 } as any,
    itemInfoOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.5)',
        zIndex: 110,
    } as any,
    itemInfoOverlayDark: { backgroundColor: 'rgba(30, 30, 30, 0.9)', borderTopColor: 'rgba(255,255,255,0.05)' } as any,
    itemName: { fontSize: 12, fontWeight: '700', marginBottom: 2, color: '#1a1a1a', letterSpacing: '-0.3px' } as any,
    textDark: { color: '#fff' } as any,
    itemDesc: { fontSize: 10, color: '#666', marginBottom: 6, height: 24, lineHeight: '12px' } as any,
    buyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e0f2fe' } as any,
    buyButtonText: { fontWeight: '700', marginRight: 4, fontSize: 12, color: '#0284c7' } as any,
    coinIconSmall: { width: 12, height: 12 } as any,
    ownedBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#fff', zIndex: 120 } as any,
    ownedText: { color: '#fff', fontSize: 9, fontWeight: '800' } as any,
} as any);
