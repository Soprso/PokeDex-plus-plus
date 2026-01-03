import { AirSlashEffect, BubbleBeamEffect, ExtraLoveEffect, FrenzyPlantEffect, GhostlyMistEffect, GoldenGloryEffect, IcyWindEffect, MagmaStormEffect, NeonCyberEffect, RockTombEffect } from '@/components/card-effects';
import { GoldFrame, NeonFrame } from '@/components/frame-effects';
import { TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemonTypes';
import { ShopItem } from '@/constants/shopItems';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const CoinIcon = require('@/assets/images/dex-coin.png');
const InteractionIcon = require('@/assets/images/pokeball.png');

interface ShopItemCardProps {
    item: ShopItem;
    count: number;
    isDark: boolean;
    onBuy: () => void;
    shouldPlay: boolean;
}

export const ShopItemCard = React.memo(({ item, count, isDark, onBuy, shouldPlay }: ShopItemCardProps) => {
    const cardBackground = TYPE_COLORS['electric']; // Default background
    const isSpecialEffect = ['extra_love', 'effect_neon_cyber', 'effect_golden_glory', 'effect_ghostly_mist', 'effect_icy_wind', 'effect_magma_storm', 'effect_frenzy_plant', 'effect_bubble_beam', 'effect_air_slash', 'effect_rock_tomb'].includes(item.id);

    return (
        <View style={[styles.itemCard, isDark && styles.itemCardDark]}>
            {/* Full Card Background */}
            <View style={[styles.cardBackground, { backgroundColor: isSpecialEffect ? 'transparent' : cardBackground }]}>
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
                    isSpecialEffect && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#333', opacity: 0.1 }]} />
                )}

                {/* Frame Preview - Always render frames to ensure visibility */}
                {item.type === 'frame' && (
                    <View style={StyleSheet.absoluteFill}>
                        {item.id === 'frame_gold' && <GoldFrame />}
                        {item.id === 'frame_neon' && <NeonFrame />}
                    </View>
                )}

                {/* Category Badge */}
                <View style={[styles.categoryBadge,
                item.category === 'legendary' && styles.categoryBadgeLegendary,
                item.category === 'mythical' && styles.categoryBadgeMythical
                ]}>
                    <Text style={[styles.categoryText,
                    (item.category === 'legendary' || item.category === 'mythical') && styles.categoryTextPremium
                    ]}>{item.category.toUpperCase()}</Text>
                </View>

                {/* Pokemon Preview Card Content */}
                {count > 0 && <View style={[styles.ownedBadge, { top: 12, right: 12 }]}><Text style={styles.ownedText}>x{count}</Text></View>}
                <Text style={styles.cardId}>#025</Text>
                <Image
                    source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
                    style={styles.previewImage}
                />
                <Text style={styles.cardName}>Pikachu</Text>
                <View style={styles.cardTypeContainer}>
                    <Image source={TYPE_ICONS['electric']} style={styles.cardTypeIcon} />
                </View>

                {/* Effects Overlay - Static icon if not special effect */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    {!isSpecialEffect && item.type === 'effect' && (
                        <View style={styles.effectIconOverlay}>
                            <Ionicons name="sparkles" size={24} color={item.category === 'mythical' ? '#FFD700' : '#fff'} />
                        </View>
                    )}
                </View>
            </View>

            {/* Info Overlay */}
            <View style={[styles.itemInfoOverlay, isDark && styles.itemInfoOverlayDark]}>
                <Text style={[styles.itemName, isDark && styles.textDark]}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                <Pressable style={styles.buyButton} onPress={onBuy}>
                    <Text style={styles.buyButtonText}>{item.price}</Text>
                    <Image source={CoinIcon} style={styles.coinIconSmall} />
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    itemCard: { width: '48%', height: 260, borderRadius: 24, overflow: 'hidden', marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, position: 'relative', backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
    itemCardDark: { backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.05)' },
    cardBackground: { flex: 1, alignItems: 'center', paddingTop: 0 },

    categoryBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', zIndex: 5 },
    categoryBadgeLegendary: { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderColor: '#FFD700' },
    categoryBadgeMythical: { backgroundColor: 'rgba(147, 51, 234, 0.2)', borderColor: '#d8b4fe' },
    categoryText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    categoryTextPremium: { textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },

    cardId: {
        fontSize: 10,
        color: '#fff',
        opacity: 0.8,
        alignSelf: 'flex-start',
        marginTop: 36, // Increased margin to clear badge
        marginLeft: 12,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowRadius: 4
    },
    cardName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        textTransform: 'capitalize',
        marginTop: 4,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowRadius: 4
    },
    cardTypeContainer: { flexDirection: 'row', gap: 4, marginTop: 4 },
    cardTypeIcon: { width: 14, height: 14, resizeMode: 'contain' },
    previewImage: {
        width: '75%',
        height: undefined,
        aspectRatio: 1,
        marginVertical: 4,
    },
    effectIconOverlay: { position: 'absolute', top: 12, right: 12, opacity: 0.9, padding: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12 },
    itemInfoOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.5)'
    },
    itemInfoOverlayDark: { backgroundColor: 'rgba(30, 30, 30, 0.9)', borderTopColor: 'rgba(255,255,255,0.05)' },
    itemName: { fontSize: 13, fontWeight: '700', marginBottom: 2, color: '#1a1a1a', letterSpacing: -0.3 },
    textDark: { color: '#fff' },
    itemDesc: { fontSize: 11, color: '#666', marginBottom: 10, height: 28, lineHeight: 14 },
    buyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e0f2fe' },
    buyButtonText: { fontWeight: '700', marginRight: 4, fontSize: 13, color: '#0284c7' },
    coinIconSmall: { width: 14, height: 14 },
    ownedBadge: { position: 'absolute', top: -10, right: 0, backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#fff' },
    ownedText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
