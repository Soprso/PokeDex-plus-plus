import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface NicknameModalProps {
    visible: boolean;
    onClose: () => void;
    nickname: string;
    onNicknameChange: (text: string) => void;
    onSave: () => void;
    pokemonName: string;
    darkMode: boolean;
}

export function NicknameModal({ visible, onClose, nickname, onNicknameChange, onSave, pokemonName, darkMode }: NicknameModalProps) {
    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                    <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                        <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Nickname for {pokemonName}</Text>

                        <TextInput
                            style={[styles.input, darkMode && styles.inputDark]}
                            value={nickname}
                            onChangeText={onNicknameChange}
                            placeholder={`Enter nickname for ${pokemonName}`}
                            placeholderTextColor={darkMode ? '#999' : '#666'}
                            autoFocus
                        />

                        <View style={styles.actions}>
                            <Pressable
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.saveButton]}
                                onPress={onSave}
                            >
                                <Text style={styles.saveText}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
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
    keyboardView: {
        width: '100%',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 20,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    modalContentDark: {
        backgroundColor: '#222',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        color: '#333',
    },
    modalTitleDark: {
        color: '#fff',
    },
    input: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 20,
        color: '#333',
    },
    inputDark: {
        backgroundColor: '#333',
        color: '#fff',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    cancelText: {
        fontWeight: '600',
        color: '#666',
    },
    saveText: {
        fontWeight: '600',
        color: '#fff',
    },
});
