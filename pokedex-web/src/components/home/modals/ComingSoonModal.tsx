import { Ionicons } from '@/components/native/Icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ComingSoonModalProps {
    visible: boolean;
    onClose: () => void;
    featureName: string;
}

export function ComingSoonModal({ visible, onClose, featureName }: ComingSoonModalProps) {
    return (
        <Modal visible={visible} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Ionicons name="alert-circle" size={60} color="#FF9800" style={styles.icon} />
                    <Text style={styles.title}>Coming Soon!</Text>
                    <Text style={styles.message}>
                        The {featureName} feature is currently under development.
                    </Text>
                    <Text style={styles.subMessage}>
                        Stay tuned for updates!
                    </Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.closeButton,
                            pressed && { opacity: 0.7 }
                        ]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Got It</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#333',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 22,
    },
    subMessage: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
    },
    closeButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 10,
        minWidth: 120,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
