import dexCoinImage from '@/assets/images/dex-coin.png';
import dexWalletImage from '@/assets/images/dex-wallet.png'; // Corrected if it was wrong
import { GlowBorder, ShineOverlay } from '@/components/card-effects'; // Assuming these exist
import { Ionicons } from '@/components/native/Icons';
import { Image, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
}

export function EconomyModal({ visible, onClose, type, title, message, balance, streak, darkMode, onAction, actionLabel }: EconomyModalProps) {
    const isError = type === 'error';
    const isConfirm = type === 'confirm';

    return (
        <Modal visible={visible} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
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
                                isError && styles.economyModalHeaderError,
                                isConfirm && styles.economyModalHeaderConfirm,
                                darkMode && styles.economyModalHeaderDark
                            ]}
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
                                    <Image source={{ uri: dexCoinImage }} style={type === 'reward' ? styles.rewardCoinIconLarge : styles.rewardCoinIcon} />
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
                                styles.economyModalTitle,
                                {
                                    marginTop: (type === 'info' || isError || isConfirm) ? 8 : 16,
                                    color: darkMode ? '#fff' : '#000',
                                    textShadowColor: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.3)',
                                    textShadowRadius: 4
                                }
                            ]}>
                                {title}
                            </Text>
                        </ImageBackground>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>
                        <Text style={[styles.messageText, darkMode && styles.messageTextDark]}>
                            {message.replace(/🔥 Current Streak: \d+ Days/, '')}
                        </Text>

                        {(type === 'info' || message.includes('Streak')) && (
                            <StreakCard streak={streak} darkMode={darkMode} />
                        )}

                        {isConfirm ? (
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
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    isError && styles.errorButton,
                                    darkMode && styles.buttonDark,
                                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                                ]}
                                onPress={() => {
                                    if (onAction) onAction();
                                    onClose();
                                }}
                            >
                                <Text style={[styles.buttonText, darkMode && styles.buttonTextDark]}>
                                    {type === 'reward' ? 'Claim Reward' : 'Got it'}
                                </Text>
                            </Pressable>
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
});
