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

// Effect Backgrounds
import bgAirSlash from '@/assets/card-effects/air-slash.jpg';
import bgBubbleBeam from '@/assets/card-effects/bubble-beam.jpg';
import bgExtraLove from '@/assets/card-effects/extra-love.jpg';
import bgFrenzyPlant from '@/assets/card-effects/frenzy-plant.jpg';
import bgGhostlyMist from '@/assets/card-effects/ghostly-mist.jpg';
import bgGoldenGlory from '@/assets/card-effects/golden-glory.jpg';
import bgIcyWind from '@/assets/card-effects/icy-wind.jpg';
import bgMagmaStorm from '@/assets/card-effects/magma-storm.jpg';
import bgNeonCyber from '@/assets/card-effects/neon-cyber.jpg';
import bgRockTomb from '@/assets/card-effects/rock-tomb.jpg';

// Coin Bundle Assets
import imgChest from '/home/shadowmonarch/.gemini/antigravity/brain/47369331-c68c-438c-a025-655e3d64eb77/chest_of_coins_1771095764529.png';
import bgCoins from '/home/shadowmonarch/.gemini/antigravity/brain/47369331-c68c-438c-a025-655e3d64eb77/coins_bg_1771095782639.png';
import imgHandful from '/home/shadowmonarch/.gemini/antigravity/brain/47369331-c68c-438c-a025-655e3d64eb77/handful_of_coins_1771095479292.png';
import imgSack from '/home/shadowmonarch/.gemini/antigravity/brain/47369331-c68c-438c-a025-655e3d64eb77/sack_of_coins_1771095749164.png';

interface ShopItemCardProps {
    item: ShopItem;
    count: number;
    isDark: boolean;
    onBuy: () => void;
    shouldPlay: boolean;
    cardWidth: number;
}

export const ShopItemCard = React.memo(({ item, count, isDark, onBuy, shouldPlay, cardWidth }: ShopItemCardProps) => {
    const getEffectBackground = (id: string) => {
        switch (id) {
            case 'extra_love': return bgExtraLove;
            case 'effect_neon_cyber': return bgNeonCyber;
            case 'effect_ghostly_mist': return bgGhostlyMist;
            case 'effect_golden_glory': return bgGoldenGlory;
            case 'effect_icy_wind': return bgIcyWind;
            case 'effect_magma_storm': return bgMagmaStorm;
            case 'effect_frenzy_plant': return bgFrenzyPlant;
            case 'effect_bubble_beam': return bgBubbleBeam;
            case 'effect_air_slash': return bgAirSlash;
            case 'effect_rock_tomb': return bgRockTomb;
            default: return TYPE_BACKGROUNDS['electric'];
        }
    };

    const bgImage = item.type === 'effect' ? getEffectBackground(item.id) : (
        item.currency === 'usd' ? { uri: bgCoins } : TYPE_BACKGROUNDS['electric']
    );

    const getBundleImage = (id: string) => {
        switch (id) {
            case 'coins_small': return imgHandful;
            case 'coins_medium': return imgSack;
            case 'coins_large': return imgChest;
            default: return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
        }
    };
    const isSpecialEffect = ['extra_love', 'effect_neon_cyber', 'effect_golden_glory', 'effect_ghostly_mist', 'effect_icy_wind', 'effect_magma_storm', 'effect_frenzy_plant', 'effect_bubble_beam', 'effect_air_slash', 'effect_rock_tomb'].includes(item.id);

    return (
        <View style={[styles.itemCard, isDark && styles.itemCardDark, { width: cardWidth }] as any}>
            <ImageBackground
                source={bgImage}
                style={styles.cardBackground}
                imageStyle={styles.cardBackgroundImage}
            >
                {/* Watermark */}
                <Image source={{ uri: pokeballWatermark }} style={styles.watermark} resizeMode="contain" />

                {/* Live Effect Preview - Always render in Shop for max fidelity */}
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
                            source={{ uri: item.currency === 'usd' ? getBundleImage(item.id) : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Name */}
                    <Text style={styles.cardName}>{item.currency === 'usd' ? 'Coins' : 'Pikachu'}</Text>

                    {/* Types */}
                    <View style={styles.cardTypeContainer}>
                        {item.currency === 'usd' ? (
                            <View style={[styles.typePill, { backgroundColor: '#FFD700' }]}>
                                <Image source={CoinIcon} style={styles.cardTypeIcon} />
                            </View>
                        ) : (
                            <View style={[styles.typePill, { backgroundColor: TYPE_COLORS['electric'] }]}>
                                <Image source={TYPE_ICONS['electric']} style={styles.cardTypeIcon} />
                            </View>
                        )}
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
                {count > 0 && <View style={styles.ownedBadge}><Text style={styles.ownedText}>{count}</Text></View>}

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
                <Pressable
                    style={[
                        styles.buyButton,
                        item.currency === 'usd' && styles.buyButtonUSD
                    ] as any}
                    onPress={onBuy}
                >
                    <Text style={[
                        styles.buyButtonText,
                        item.currency === 'usd' && styles.buyButtonTextUSD
                    ] as any}>
                        {item.currency === 'usd' ? `$${item.price.toFixed(2)}` : (item.price === 0 ? 'Free' : item.price)}
                    </Text>
                    {item.currency !== 'usd' && <Image source={CoinIcon} style={styles.coinIconSmall} />}
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    itemCard: { height: 320, borderRadius: 24, overflow: 'hidden', marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, position: 'relative', backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
    itemCardDark: { backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.05)' },
    cardBackground: { flex: 1, position: 'relative' },
    cardBackgroundImage: {
        borderRadius: 24,
        opacity: 1.0, // Set to 1.0 for clear effects as requested
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
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 100,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    categoryBadgeLegendary: { backgroundColor: 'rgba(255, 215, 0, 0.9)', borderColor: '#FFD700', borderWidth: 2 },
    categoryBadgeMythical: { backgroundColor: 'rgba(147, 51, 234, 0.9)', borderColor: '#d8b4fe', borderWidth: 2 },
    categoryText: { color: '#1a1a1a', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    categoryTextPremium: { color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 3, textShadowOffset: { width: 1, height: 1 } },
    cardId: {
        alignSelf: 'flex-start',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
    } as any,
    cardName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
        textTransform: 'capitalize',
        marginTop: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    } as any,
    cardTypeContainer: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    } as any,
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
    cardTypeIcon: { width: 18, height: 18, resizeMode: 'contain' } as any,
    previewImage: {
        width: '100%',
        height: '100%',
    } as any,
    effectIconOverlay: { position: 'absolute', top: 50, left: 12, opacity: 0.9, padding: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 12, zIndex: 100 } as any,
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
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6366f1',
        paddingHorizontal: 28,
        paddingVertical: 14,
        marginTop: 12,
        marginBottom: 8,
        marginRight: 4,
        borderRadius: 32,
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderColor: '#4f46e5',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    } as any,
    buyButtonUSD: {
        backgroundColor: '#10b981', // Emerald green for money
        borderColor: '#059669',
        shadowColor: '#10b981',
        paddingHorizontal: 32,
        paddingVertical: 16,
    } as any,
    buyButtonText: { fontWeight: '800', marginRight: 6, fontSize: 22, color: '#fff' } as any,
    buyButtonTextUSD: { marginRight: 0 } as any,
    coinIconSmall: { width: 26, height: 26 } as any,
    ownedBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#22c55e', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', zIndex: 120, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 } as any,
    ownedText: { color: '#fff', fontSize: 12, fontWeight: '900' } as any,
} as any);
