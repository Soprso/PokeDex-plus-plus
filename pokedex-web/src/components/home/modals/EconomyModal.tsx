import dexCoinImage from '@/assets/images/dex-coin.png';
import dexWalletImage from '@/assets/images/dex-wallet.png'; // Corrected if it was wrong
import { GlowBorder, ShineOverlay } from '@/components/card-effects';
import { Image, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from '@/components/native';
import { Animated } from 'react-native';

import { Ionicons } from '@/components/native/Icons';
import { TYPE_BACKGROUNDS } from '@/constants/pokemonTypes';
import { type ShopItem } from '@/constants/shopItems';
import { useState } from 'react';

// Coin Bundle Assets
import imgChest from '@/assets/images/shop/coins_large.png';
import imgSack from '@/assets/images/shop/coins_medium.png';
import imgHandful from '@/assets/images/shop/coins_small.png';

interface EconomyModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'info' | 'reward' | 'error' | 'confirm';
    title: string;
    message: string;
    balance: number;
    streak: number;
    darkMode: boolean;
    onAction?: () => void;
    actionLabel?: string;
    isSignedIn?: boolean;
    onSignIn?: () => void;
    item?: ShopItem | null;
    selectedCurrency?: string;
}

export function EconomyModal({
    visible,
    onClose,
    type,
    title,
    message,
    balance,
    streak,
    darkMode,
    onAction,
    actionLabel,
    isSignedIn = true,
    onSignIn,
    item,
    selectedCurrency = 'USD'
}: EconomyModalProps) {
    const isReward = type === 'reward';
    const isError = type === 'error';
    const isConfirm = type === 'confirm';

    // Animation state
    const [buttonScale] = useState(new Animated.Value(1));

    const handleClaim = () => {
        if (onAction) {
            // Pulse animation before closing
            Animated.sequence([
                Animated.timing(buttonScale, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonScale, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start(() => {
                onAction();
                onClose();
                // Reset scale for next time
                buttonScale.setValue(1);
            });
        } else {
            onClose();
        }
    };


    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>

            <View style={styles.centeredModalOverlay}>
                <View style={[
                    styles.modalContent,
                    styles.economyModalContent,
                    darkMode && styles.modalContentDark,
                    type === 'reward' && styles.economyModalReward,
                    isError && styles.economyModalError
                ]}>

                    {/* Header */}
                    <View style={styles.headerWrapper}>
                        <ImageBackground
                            source={{ uri: dexWalletImage }}
                            style={[
                                styles.economyModalHeader,
                                type === 'reward' ? styles.economyModalHeaderReward : styles.economyModalHeaderInfo,
                                isError ? styles.economyModalHeaderError : {},
                                isConfirm ? styles.economyModalHeaderConfirm : {},
                                darkMode ? styles.economyModalHeaderDark : {}
                            ] as any}
                            resizeMode="cover"
                        >
                            <ShineOverlay color={isError ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 215, 0, 0.4)"} duration={3000} />
                            <GlowBorder color={isError ? "#ef4444" : "#FFD700"} borderWidth={2} cornerRadius={24} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />

                            <View style={styles.rewardIconContainer}>
                                {isError ? (
                                    <Ionicons name="alert-circle" size={80} color="#ef4444" />
                                ) : isConfirm ? (
                                    <Ionicons name="cart" size={80} color="#6366f1" />
                                ) : (
                                    <Image source={{ uri: dexCoinImage }} style={isReward ? styles.rewardCoinIconLarge : styles.rewardCoinIcon} />
                                )}

                                {type === 'reward' && (
                                    <View style={styles.rewardBadgeContainer}>
                                        <Ionicons name="gift" size={20} color="#fff" />
                                    </View>
                                )}
                                {type === 'info' && (
                                    <Text style={styles.walletBalanceText}>{balance}</Text>
                                )}
                            </View>

                            <Text style={[
                                styles.economyModalTitle as any,
                                {
                                    marginTop: (type === 'info' || isError || isConfirm) ? 8 : 16,
                                    color: darkMode ? '#fff' : '#000',
                                    textShadow: darkMode ? '0 0 4px rgba(0,0,0,0.8)' : '0 0 4px rgba(255,255,255,0.3)',
                                }
                            ]}>

                                {title}
                            </Text>
                        </ImageBackground>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>
                        {isConfirm && item && (
                            <View style={styles.itemPreviewContainer}>
                                <ImageBackground
                                    source={TYPE_BACKGROUNDS['electric']}
                                    style={styles.itemPreviewBg}
                                    imageStyle={{ borderRadius: 16 }}
                                >
                                    <View style={[styles.itemPreviewCard, darkMode && styles.itemPreviewCardDark]}>
                                        <Image
                                            source={item.currency === 'usd' ? (
                                                item.id === 'coins_small' ? imgHandful :
                                                    item.id === 'coins_medium' ? imgSack :
                                                        item.id === 'coins_large' ? imgChest :
                                                            { uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }
                                            ) : { uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
                                            style={[
                                                styles.itemPreviewImage,
                                                item.currency === 'usd' && { mixBlendMode: 'screen' } as any
                                            ]}
                                            resizeMode="contain"
                                        />
                                        <View style={styles.itemPreviewBadge}>
                                            <Text style={styles.itemPreviewBadgeText}>{item.category.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                </ImageBackground>
                                <View style={styles.priceTag}>
                                    {item.currency === 'usd' ? (
                                        <Text style={styles.priceTagText}>
                                            {selectedCurrency === 'INR' ? '₹' : '$'}
                                            {selectedCurrency === 'INR' ? Math.round(item.price * 83) : item.price.toFixed(2)}
                                        </Text>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={dexCoinImage} style={{ width: 16, height: 16, marginRight: 4 }} />
                                            <Text style={styles.priceTagText}>{item.price}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        <Text style={[styles.messageText as any, darkMode && (styles.messageTextDark as any), isConfirm && ({ fontSize: 16, fontWeight: '600', marginBottom: 24 } as any)]}>
                            {message.replace(/🔥 Current Streak: \d+ Days/, '')}
                        </Text>

                        {!isSignedIn && (
                            <View style={[styles.loginIncentive, darkMode ? styles.loginIncentiveDark : {}]}>
                                <Ionicons name="information-circle-outline" size={20} color={darkMode ? "#60a5fa" : "#2563eb"} />
                                <Text style={[styles.loginIncentiveText as any, darkMode ? (styles.loginIncentiveTextDark as any) : {}]}>
                                    Sign in to start earning coins, maintaining streaks, and participating in events!
                                </Text>
                            </View>
                        )}


                        {(type === 'info' || message.includes('Streak')) && (
                            <StreakCard streak={streak} darkMode={darkMode} />
                        )}

                        {!isSignedIn ? (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.loginButton,
                                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                                ]}
                                onPress={() => {
                                    onClose();
                                    if (onSignIn) onSignIn();
                                }}
                            >
                                <Ionicons name="log-in" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Sign In to Get Rewards</Text>
                            </Pressable>
                        ) : isConfirm ? (
                            <View style={styles.buttonRow}>
                                <Pressable
                                    style={[styles.button, styles.cancelButton, darkMode && styles.cancelButtonDark]}
                                    onPress={onClose}
                                >
                                    <Text style={[styles.buttonText, styles.cancelButtonText, darkMode && styles.cancelButtonTextDark]}>
                                        Cancel
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={() => {
                                        if (onAction) onAction();
                                        onClose();
                                    }}
                                >
                                    <Text style={styles.buttonText}>
                                        {actionLabel || 'Confirm'}
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Animated.View style={{ width: '100%', transform: [{ scale: buttonScale }] }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        isError ? styles.errorButton : {},
                                        darkMode ? styles.buttonDark : {},
                                        pressed ? { opacity: 0.9, transform: 'scale(0.98)' } : {}
                                    ] as any}
                                    onPress={isReward ? handleClaim : () => {
                                        if (onAction) onAction();
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.buttonText as any, darkMode ? (styles.buttonTextDark as any) : {}]}>
                                        {isReward ? 'Claim Reward' : 'Got it'}
                                    </Text>
                                </Pressable>

                            </Animated.View>
                        )}

                    </View>
                </View>
            </View>
        </Modal>
    );
}

function StreakCard({ streak = 1, darkMode }: { streak: number, darkMode: boolean }) {
    return (
        <View style={[styles.streakCard, darkMode && styles.streakCardDark]}>
            <View style={styles.streakHeader}>
                <Ionicons name="flame" size={20} color="#FF6B6B" />
                <Text style={[styles.streakTitle, darkMode && styles.textDark]}>Current Streak</Text>
            </View>
            <Text style={[styles.streakCountMain, darkMode && styles.textDark]}>
                {streak} <Text style={styles.streakCountLabel}>Days</Text>
            </Text>
            <View style={styles.streakContainer}>
                {[...Array(7)].map((_, index) => {
                    const filledCount = (streak > 0 && streak % 7 === 0) ? 7 : streak % 7;
                    const isFilled = index < filledCount;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.streakCircle,
                                darkMode && styles.streakCircleDark,
                                isFilled && styles.streakCircleFilled,
                                isFilled && index === filledCount - 1 && styles.streakCircleActive
                            ]}
                        />
                    );
                })}
            </View>
            <Text style={[styles.streakSubtitle, darkMode && styles.textDark]}>
                Keep it up for a 350 coin bonus!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    centeredModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: '85%',
        maxWidth: 340,
        alignItems: 'center',
    },
    modalContentDark: {
        backgroundColor: '#222',
    },
    economyModalContent: {
        padding: 0,
    },
    economyModalReward: {
        borderColor: '#FFD700',
        borderWidth: 2,
        shadowColor: '#FFD700',
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
    headerWrapper: {
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    economyModalHeader: {
        width: '100%',
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    economyModalHeaderReward: {
        backgroundColor: '#6366f1',
    },
    economyModalHeaderInfo: {
        backgroundColor: '#f1f5f9',
    },
    economyModalHeaderDark: {
        backgroundColor: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    rewardIconContainer: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rewardCoinIconLarge: {
        width: 80,
        height: 80,
    },
    rewardCoinIcon: {
        width: 60,
        height: 60,
    },
    rewardBadgeContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FF4500',
        borderRadius: 15,
        padding: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    walletBalanceText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFC107',
        marginTop: 8,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    economyModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    body: {
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    messageTextDark: {
        color: '#ccc',
    },
    button: {
        backgroundColor: '#6366f1',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        width: '100%',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDark: {
        backgroundColor: '#fff',
        shadowColor: '#fff',
        shadowOpacity: 0.2,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    buttonTextDark: {
        color: '#000',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        shadowColor: 'transparent',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 0,
    },
    cancelButtonDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    cancelButtonText: {
        color: '#64748b',
    },
    cancelButtonTextDark: {
        color: '#94a3b8',
    },
    confirmButton: {
        flex: 1,
        marginTop: 0,
    },
    errorButton: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
    },
    economyModalError: {
        borderColor: '#ef4444',
    },
    economyModalHeaderError: {
        backgroundColor: '#fef2f2',
    },
    economyModalHeaderConfirm: {
        backgroundColor: '#eef2ff',
    },
    // Streak Card Styles
    streakCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    streakCardDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    streakHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    streakTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textDark: {
        color: '#fff',
    },
    streakCountMain: {
        fontSize: 32,
        fontWeight: '800',
        color: '#333',
        marginBottom: 8,
    },
    streakCountLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        gap: 8,
        height: 30,
    },
    streakCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        borderWidth: 2,
        borderColor: '#ccc',
    },
    streakCircleDark: {
        backgroundColor: '#444',
        borderColor: '#555',
    },
    streakCircleFilled: {
        backgroundColor: '#FFD700',
        borderColor: '#DAA520',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 4,
    },
    streakCircleActive: {
        transform: [{ scale: 1.2 }],
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 1,
    },
    streakSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    loginIncentive: {
        flexDirection: 'row',
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    loginIncentiveDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    loginIncentiveText: {
        fontSize: 13,
        color: '#1e40af',
        flex: 1,
        lineHeight: 18,
        fontWeight: '500',
    },
    loginIncentiveTextDark: {
        color: '#93c5fd',
    },
    loginButton: {
        flexDirection: 'row',
        backgroundColor: '#2563eb',
    },
    itemPreviewContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    itemPreviewBg: {
        width: 140,
        height: 140,
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    itemPreviewCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    itemPreviewCardDark: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    itemPreviewImage: {
        width: 100,
        height: 100,
    },
    itemPreviewBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    itemPreviewBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    priceTag: {
        position: 'absolute',
        bottom: -15,
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    priceTagText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
});
