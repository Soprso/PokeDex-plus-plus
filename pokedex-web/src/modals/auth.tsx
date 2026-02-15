import { Ionicons } from '@/components/native/Icons';
import { useThemedAlert } from '@/hooks/use-themed-alert';
import { useSignIn } from '@clerk/clerk-react';
import { useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

import authBg from '@/assets/images/auth_background.png';

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    darkMode: boolean;
}

export default function AuthModal({ visible, onClose, darkMode }: AuthModalProps) {
    const [loading, setLoading] = useState(false);
    const { signIn } = useSignIn();
    const { showAlert, AlertModal } = useThemedAlert();

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            await signIn!.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/profile',
            });
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            showAlert('Error', 'Google sign in failed', undefined, 'logo-google', '#FF3B30');
            setLoading(false);
        }
    };

    const handleFacebookAuth = async () => {
        setLoading(true);
        try {
            await signIn!.authenticateWithRedirect({
                strategy: 'oauth_facebook',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/profile',
            });
        } catch (err: any) {
            console.error('Facebook Auth Error:', err);
            showAlert('Error', 'Facebook sign in failed', undefined, 'logo-facebook', '#FF3B30');
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    {/* Close Button */}
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
                    </Pressable>

                    {/* Background Image */}
                    <Image
                        source={{ uri: authBg }}
                        style={[styles.backgroundImage, { borderRadius: 24 }]}
                    />

                    {/* Decorative Pokeball */}
                    <Image
                        source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                        style={styles.accentImage}
                        resizeMode="contain"
                    />

                    <View style={styles.headerSection}>
                        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
                            Welcome, Trainer
                        </Text>
                        <Text style={[styles.headerSubtitle, darkMode && styles.headerSubtitleDark]}>
                            Choose a provider to continue your adventure and track your Pokédex progress.
                        </Text>
                    </View>

                    <View style={styles.buttonSection}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.oauthButton,
                                styles.googleButton,
                                pressed && styles.buttonPressed,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleGoogleAuth}
                            disabled={loading}
                        >
                            <Image
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png' }}
                                style={styles.buttonIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.oauthButtonText}>Continue with Google</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.oauthButton,
                                styles.facebookButton,
                                pressed && styles.buttonPressed,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleFacebookAuth}
                            disabled={loading}
                        >
                            <Ionicons name="logo-facebook" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={[styles.oauthButtonText, { color: '#fff' }]}>Continue with Facebook</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            <AlertModal />
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 28,
        paddingTop: 40,
        paddingHorizontal: 32,
        paddingBottom: 48,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    modalContentDark: {
        backgroundColor: '#1E1E1E',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 20,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.03,
        top: 0,
        left: 0,
    },
    accentImage: {
        position: 'absolute',
        top: -40,
        alignSelf: 'center',
        width: 80,
        height: 80,
        zIndex: 15,
    },
    headerSection: {
        marginTop: 40,
        marginBottom: 32,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerTitleDark: {
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    headerSubtitleDark: {
        color: '#aaa',
    },
    buttonSection: {
        gap: 12,
    },
    oauthButton: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    buttonIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    googleButton: {
        backgroundColor: '#fff',
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        borderColor: '#1877F2',
    },
    oauthButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
