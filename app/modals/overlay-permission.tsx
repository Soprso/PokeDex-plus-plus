import { setOverlayPermission } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface OverlayPermissionModalProps {
    visible: boolean;
    onClose: () => void;
    onAllow: () => void;
}

export default function OverlayPermissionModal({
    visible,
    onClose,
    onAllow,
}: OverlayPermissionModalProps) {
    const [loading, setLoading] = useState(false);

    const handleAllow = async () => {
        setLoading(true);
        await setOverlayPermission(true);
        setLoading(false);
        onAllow();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="layers-outline" size={48} color="#007AFF" />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Overlay Permission Required</Text>

                    {/* Explanation */}
                    <Text style={styles.explanation}>
                        To scan Pokémon from Pokémon GO, this app needs permission to display over other
                        apps.
                    </Text>

                    <Text style={styles.note}>
                        Note: This is currently mocked for Expo compatibility. Full overlay functionality
                        requires native code.
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                styles.cancelButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                styles.allowButton,
                                pressed && styles.buttonPressed,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleAllow}
                            disabled={loading}
                        >
                            <Text style={styles.allowButtonText}>
                                {loading ? 'Allowing...' : 'Allow Overlay'}
                            </Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 12,
    },
    explanation: {
        fontSize: 15,
        color: '#333',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 12,
    },
    note: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
        fontStyle: 'italic',
        marginBottom: 24,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    allowButton: {
        backgroundColor: '#007AFF',
    },
    allowButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
