import { Ionicons } from '@/components/native/Icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    onProfilePress: () => void;
    darkMode: boolean;
}

export function AuthModal({ visible, onClose, onProfilePress, darkMode }: AuthModalProps) {
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
                            <Ionicons name="lock-closed" size={18} color="#3b82f6" />
                            <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Sign In Required</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeIcon}>
                            <Ionicons name="close" size={20} color={darkMode ? "#94a3b8" : "#64748b"} />
                        </Pressable>
                    </View>

                    <View style={styles.body}>
                        <Text style={[styles.description, darkMode && styles.descriptionDark]}>
                            Login or signup to continue your journey and start building bonds with your Pokémon!
                        </Text>

                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && { opacity: 0.8 }
                            ]}
                            onPress={onProfilePress}
                        >
                            <Ionicons name="person" size={14} color="#fff" />
                            <Text style={styles.primaryButtonText}>Go to Profile</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed && { opacity: 0.7 }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[styles.secondaryButtonText, darkMode && styles.secondaryButtonTextDark]}>Maybe Later</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
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
        maxWidth: 320,
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
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },
    headerTitleDark: {
        color: '#f1f5f9',
    },
    closeIcon: {
        padding: 4,
    },
    body: {
        padding: 12,
    },
    description: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 18,
    },
    descriptionDark: {
        color: '#94a3b8',
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 6,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '600',
    },
    secondaryButtonTextDark: {
        color: '#94a3b8',
    },
});
