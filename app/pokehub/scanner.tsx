import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScannerScreen() {
    const [loading, setLoading] = useState(false);

    const handleUploadScreenshot = async () => {
        setLoading(true);
        try {
            // Request media library permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant photo library access to upload screenshots.'
                );
                setLoading(false);
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                // Navigate to scan result with image URI
                router.push({
                    pathname: '/pokehub/scan-result',
                    params: { imageUri },
                });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.content}>
                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Ionicons name="information-circle-outline" size={48} color="#007AFF" />
                    <Text style={styles.instructionsTitle}>How to Scan</Text>
                    <Text style={styles.instructionsText}>
                        1. Open Pokémon GO{'\n'}
                        2. Appraise a Pokémon{'\n'}
                        3. Take a screenshot{'\n'}
                        4. Upload it here
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            styles.uploadButton,
                            pressed && styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleUploadScreenshot}
                        disabled={loading}
                    >
                        <Ionicons name="camera" size={24} color="#fff" />
                        <Text style={styles.uploadButtonText}>
                            {loading ? 'Opening...' : 'Upload Screenshot'}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            styles.cancelButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleCancel}
                        disabled={loading}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    instructionsContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    instructionsTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginTop: 16,
        marginBottom: 16,
    },
    instructionsText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        lineHeight: 28,
    },
    buttonsContainer: {
        gap: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 12,
    },
    uploadButton: {
        backgroundColor: '#007AFF',
    },
    uploadButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    cancelButton: {
        backgroundColor: '#333',
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
