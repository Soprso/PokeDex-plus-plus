import bestBuddyImage from '@/assets/images/best-buddy.png';
import buddySystemImage from '@/assets/images/buddy-system.png';
import { Ionicons } from '@/components/native/Icons';
import { Image, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface BuddyModalProps {
    visible: boolean;
    onClose: () => void;
    isSignedIn: boolean;
    onSignIn: () => void;
    darkMode: boolean;
}

export function BuddyModal({ visible, onClose, isSignedIn, onSignIn, darkMode }: BuddyModalProps) {
    return (
        <Modal visible={visible} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, styles.buddyModalContent, { padding: 0, overflow: 'hidden' }, darkMode && styles.modalContentDark]}>
                    <ImageBackground
                        source={{ uri: buddySystemImage }}
                        style={{ width: '100%', padding: 24 }}
                        resizeMode="stretch"
                        imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                    >
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                        <View style={{ position: 'relative', zIndex: 1 }}>
                            <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>❤️ Buddy System</Text>

                            <Text style={[styles.buddyModalText, darkMode && styles.buddyModalTextDark]}>
                                Build a bond with your Pokémon by giving them hearts! Progress through 4 levels to unlock premium visual effects.
                                {"\n\n"}
                                ⚠️ Limit: 3 Pokémon per day is the buddy system for your reference.
                            </Text>

                            {!isSignedIn && (
                                <Pressable
                                    style={[styles.signInPrompt, darkMode && styles.signInPromptDark]}
                                    onPress={onSignIn}
                                >
                                    <Text style={styles.signInPromptText}>Sign in to start your journey! 🔐</Text>
                                </Pressable>
                            )}

                            <BuddyTierRow
                                levelName="Good Buddy"
                                desc="Day 1"
                                hearts={[1, 0, 0, 0]}
                                darkMode={darkMode}
                            />
                            <BuddyTierRow
                                levelName="Great Buddy"
                                desc="Day 4 • Blue Neon Glow"
                                hearts={[1, 1, 0, 0]}
                                darkMode={darkMode}
                            />
                            <BuddyTierRow
                                levelName="Ultra Buddy"
                                desc="Day 11 • Platinum Shine"
                                hearts={[1, 1, 1, 0]}
                                darkMode={darkMode}
                            />
                            <BuddyTierRow
                                levelName="Best Buddy"
                                desc="Day 21 • Gold Shine + Badge"
                                hearts={[1, 1, 1, 1]}
                                darkMode={darkMode}
                                isBestBuddy
                            />

                            {/* Removed redundant limit box as it's now in the description */}

                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalClose,
                                    { marginTop: 24 },
                                    pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                                ]}
                                onPress={onClose}
                            >
                                <Text style={styles.modalCloseText}>Got it!</Text>
                            </Pressable>
                        </View>
                    </ImageBackground>
                </View>
            </View>
        </Modal>
    );
}

function BuddyTierRow({ levelName, desc, hearts, darkMode, isBestBuddy }: any) {
    return (
        <View style={styles.buddyLevelRow}>
            <View style={{ flexDirection: 'row', gap: 2 }}>
                {hearts.map((h: number, i: number) => (
                    <Ionicons key={i} name={h ? "heart" : "heart-outline"} size={16} color={h ? "#FF6B6B" : "#ccc"} />
                ))}
            </View>
            <View style={styles.buddyLevelInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.buddyLevelTitle, darkMode && styles.buddyLevelTitleDark]}>{levelName}</Text>
                    {isBestBuddy && <Image source={{ uri: bestBuddyImage }} style={{ width: 16, height: 16, marginLeft: 6 }} resizeMode="contain" />}
                </View>
                <Text style={[styles.buddyLevelDesc, darkMode && styles.buddyLevelDescDark]}>{desc}</Text>
            </View>
        </View>
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
        maxWidth: 360,
    },
    modalContentDark: {
        backgroundColor: '#222',
    },
    buddyModalContent: {
        // specialized styles if needed
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalTitleDark: {
        color: '#fff',
    },
    buddyModalText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 20,
        lineHeight: 20,
        textAlign: 'center',
    },
    buddyModalTextDark: {
        color: '#ccc',
    },
    signInPrompt: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    signInPromptDark: {
        backgroundColor: '#0A84FF',
    },
    signInPromptText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buddyLevelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    buddyLevelInfo: {
        flex: 1,
    },
    buddyLevelTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    buddyLevelTitleDark: {
        color: '#fff',
    },
    buddyLevelDesc: {
        fontSize: 13,
        color: '#666',
    },
    buddyLevelDescDark: {
        color: '#999',
    },
    dailyLimitBox: {
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#ffeeba',
    },
    dailyLimitBoxDark: {
        backgroundColor: '#332b00',
        borderColor: '#665700',
    },
    dailyLimitText: {
        color: '#856404',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    dailyLimitTextDark: {
        color: '#fff3cd',
    },
    modalClose: {
        backgroundColor: '#f0f0f0',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
});
