import bestBuddyImage from '@/assets/images/best-buddy.png';
import { Ionicons } from '@/components/native/Icons';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface BuddyModalProps {
    visible: boolean;
    onClose: () => void;
    isSignedIn: boolean;
    onSignIn: () => void;
    darkMode: boolean;
}

export function BuddyModal({ visible, onClose, isSignedIn, onSignIn, darkMode }: BuddyModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.content, darkMode && styles.contentDark]}>
                    {/* Compact Header */}
                    <View style={[styles.header, darkMode && styles.headerDark]}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="heart" size={20} color="#ef4444" />
                            <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Buddy System</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.headerClose}>
                            <Ionicons name="close" size={24} color={darkMode ? "#94a3b8" : "#64748b"} />
                        </Pressable>
                    </View>

                    <View style={styles.body}>
                        <Text style={[styles.description, darkMode && styles.descriptionDark]}>
                            Earn hearts to unlock visual effects and badges!
                        </Text>

                        <View style={styles.tierList}>
                            <BuddyTier title="Good Buddy" desc="Friendship Begins" days="Day 1" hearts={1} darkMode={darkMode} />
                            <BuddyTier title="Great Buddy" desc="Blue Neon Glow" days="Day 4" hearts={2} darkMode={darkMode} />
                            <BuddyTier title="Ultra Buddy" desc="Platinum Shine" days="Day 11" hearts={3} darkMode={darkMode} />
                            <BuddyTier title="Best Buddy" desc="Gold Shine + Badge" days="Day 21" hearts={4} darkMode={darkMode} isBest />
                        </View>

                        {!isSignedIn ? (
                            <Pressable style={styles.loginBanner} onPress={onSignIn}>
                                <Ionicons name="lock-closed" size={14} color="#fff" />
                                <Text style={styles.loginText}>Sign in to start your journey</Text>
                            </Pressable>
                        ) : (
                            <View style={[styles.limitBox, darkMode && styles.limitBoxDark]}>
                                <Text style={[styles.limitText, darkMode && styles.limitTextDark]}>Daily Limit: 3 Pokémon buddies</Text>
                            </View>
                        )}

                        <Pressable
                            style={({ pressed }) => [
                                styles.closeButton,
                                pressed && { opacity: 0.8 }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function BuddyTier({ title, desc, days, hearts, darkMode, isBest }: any) {
    return (
        <View style={[styles.tierRow, darkMode && styles.tierRowDark]}>
            <View style={styles.tierMain}>
                <View style={styles.tierHeader}>
                    <Text style={[styles.tierTitle, darkMode && styles.tierTitleDark]}>{title}</Text>
                    {isBest && <Image source={{ uri: bestBuddyImage }} style={styles.bestBadge} />}
                    <Text style={[styles.tierDays, darkMode && styles.tierDaysDark]}>• {days}</Text>
                </View>
                <Text style={[styles.tierDesc, darkMode && styles.tierDescDark]}>{desc}</Text>
            </View>
            <View style={styles.heartsRow}>
                {[1, 2, 3, 4].map((i) => (
                    <Ionicons
                        key={i}
                        name={i <= hearts ? "heart" : "heart-outline"}
                        size={12}
                        color={i <= hearts ? "#ef4444" : "#cbd5e1"}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    content: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    contentDark: {
        backgroundColor: '#1e293b',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
    },
    headerDark: {
        borderColor: '#334155',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    headerTitleDark: {
        color: '#f1f5f9',
    },
    headerClose: {
        padding: 4,
    },
    body: {
        padding: 12,
    },
    description: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 10,
    },
    descriptionDark: {
        color: '#94a3b8',
    },
    tierList: {
        gap: 6,
        marginBottom: 12,
    },
    tierRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 10,
    },
    tierRowDark: {
        backgroundColor: '#334155',
    },
    tierMain: {
        flex: 1,
    },
    tierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    tierTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    tierTitleDark: {
        color: '#f1f5f9',
    },
    tierDays: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    tierDaysDark: {
        color: '#64748b',
    },
    tierDesc: {
        fontSize: 11,
        color: '#64748b',
    },
    tierDescDark: {
        color: '#94a3b8',
    },
    bestBadge: {
        width: 14,
        height: 14,
    },
    heartsRow: {
        flexDirection: 'row',
        gap: 2,
        marginLeft: 8,
    },
    loginBanner: {
        backgroundColor: '#3b82f6',
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 10,
    },
    loginText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    limitBox: {
        backgroundColor: '#f1f5f9',
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    limitBoxDark: {
        backgroundColor: '#334155',
    },
    limitText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
    },
    limitTextDark: {
        color: '#94a3b8',
    },
    closeButton: {
        backgroundColor: '#0f172a',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
