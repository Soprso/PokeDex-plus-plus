import { Ionicons } from '@/components/native/Icons';
import { useThemedAlert } from '@/hooks/use-themed-alert';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import authBg from '@/assets/images/auth_background.png';

// Simple OAuth shim since useOAuth is not directly in clerk-react the same way as clerk-expo 
// or maybe it is? Checking docs... usage is complex. 
// For now, I'll comment out OAuth or just leave imports if they work, but standard clerk-react uses useClerk() to get client.
// Actually, let's keep it simple and just use useSignIn/useSignUp for now. 
// If useOAuth is needed, we'll need to look up the clerk-react specific hook or use the client directly.
// But wait, the original code used useOAuth.
// Let's assume for now we might need to remove OAuth buttons or replace with a TODO if I'm not sure.
// However, the requested change is just porting.
// I will try to use `useSignIn` and `useSignUp` which I know exist.
// For OAuth, I will comment it out to avoid build errors if useOAuth doesn't exist in clerk-react.
// Actually, `useClerk` can start OAuth.


interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    darkMode: boolean;
}

export default function AuthModal({ visible, onClose, darkMode }: AuthModalProps) {
    const { width, height } = Dimensions.get('window');
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    const { signIn, setActive: setActiveSignIn } = useSignIn();
    const { signUp, setActive: setActiveSignUp } = useSignUp();
    // const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
    // const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: 'oauth_facebook' });
    const { showAlert, AlertModal } = useThemedAlert();

    const handleEmailAuth = async () => {
        if (!email || !password) {
            showAlert('Error', 'Please enter email and password', undefined, 'warning', '#FF9800');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'signin') {
                // Sign In
                const result = await signIn!.create({
                    identifier: email,
                    password,
                });

                if (result.status === 'complete') {
                    await setActiveSignIn!({ session: result.createdSessionId });
                    resetForm();
                    onClose();
                } else {
                    showAlert('Error', 'Sign in incomplete. Please try again.', undefined, 'alert-circle', '#FF3B30');
                }
            } else {
                // Sign Up
                const result = await signUp!.create({
                    emailAddress: email,
                    password,
                });

                if (result.status === 'complete') {
                    await setActiveSignUp!({ session: result.createdSessionId });
                    resetForm();
                    onClose();
                } else if (result.status === 'missing_requirements') {
                    // Email verification required
                    await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
                    setPendingVerification(true);
                } else {
                    showAlert('Error', 'Sign up incomplete. Please try again.', undefined, 'alert-circle', '#FF3B30');
                }
            }
        } catch (err: any) {
            showAlert('Error', err.errors?.[0]?.message || 'Authentication failed', undefined, 'alert-circle', '#FF3B30');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!code) {
            showAlert('Error', 'Please enter the verification code', undefined, 'key', '#FF9800');
            return;
        }

        setLoading(true);
        try {
            const result = await signUp!.attemptEmailAddressVerification({
                code,
            });

            if (result.status === 'complete') {
                await setActiveSignUp!({ session: result.createdSessionId });
                resetForm();
                onClose();
            } else {
                showAlert('Error', 'Verification failed. Please try again.', undefined, 'alert-circle', '#FF3B30');
            }
        } catch (err: any) {
            showAlert('Error', err.errors?.[0]?.message || 'Verification failed', undefined, 'alert-circle', '#FF3B30');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            await signIn!.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/profile', // Redirect back to profile after login
            });
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            showAlert('Error', 'Google sign in failed', undefined, 'logo-google', '#FF3B30');
            setLoading(false);
        }
    };

    /*
    const handleFacebookAuth = async () => {
        setLoading(true);
        try {
            const { createdSessionId, setActive } = await startFacebookOAuth();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                resetForm();
                onClose();
            }
        } catch (err: any) {
            // User cancelled or error occurred
            if (err.code !== 'user_cancelled') {
                showAlert('Error', 'Facebook sign in failed', undefined, 'logo-facebook', '#FF3B30');
            }
        } finally {
            setLoading(false);
        }
    };
    */

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setCode('');
        setMode('signin');
        setPendingVerification(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            presentationStyle="overFullScreen"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    {/* Close Button */}
                    <Pressable style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
                    </Pressable>

                    {/* Peaceful Background - Subtle Atmosphere */}
                    <Image
                        source={{ uri: authBg }}
                        style={[styles.backgroundImage, { borderRadius: 24 }]} // Match container radius
                    />

                    {/* Decorative Elements - Floating Pokeball */}
                    <Image
                        source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                        style={styles.accentImage}
                        resizeMode="contain"
                    />

                    {!pendingVerification && (
                        <View style={styles.headerSection}>
                            <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
                                Welcome, Trainer
                            </Text>
                            <Text style={[styles.headerSubtitle, darkMode && styles.headerSubtitleDark]}>
                                {mode === 'signin'
                                    ? 'Sign in to continue your Pokédex journey'
                                    : 'Create your profile to begin your adventure'}
                            </Text>
                        </View>
                    )}

                    {pendingVerification && (
                        <Text style={[styles.title, darkMode && styles.titleDark]}>
                            Verify Email
                        </Text>
                    )}

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {pendingVerification ? (
                            // Verification Code Input
                            <>
                                <Text style={[styles.verificationText, darkMode && styles.verificationTextDark]}>
                                    We've sent a verification code to {email}
                                </Text>

                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, darkMode && styles.labelDark]}>Verification Code</Text>
                                    <TextInput
                                        style={[styles.input, darkMode && styles.inputDark]}
                                        placeholder="Enter 6-digit code"
                                        placeholderTextColor={darkMode ? '#999' : '#666'}
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!loading}
                                    />
                                </View>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.emailButton,
                                        pressed && styles.buttonPressed,
                                        loading && styles.buttonDisabled,
                                    ]}
                                    onPress={handleVerifyEmail}
                                    disabled={loading}
                                >
                                    <Text style={styles.emailButtonText}>
                                        {loading ? 'Verifying...' : 'Verify Email'}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.toggleMode}
                                    onPress={() => setPendingVerification(false)}
                                    disabled={loading}
                                >
                                    <Text style={[styles.toggleModeText, darkMode && styles.toggleModeTextDark]}>
                                        Back to sign up
                                    </Text>
                                </Pressable>
                            </>
                        ) : (
                            // Email/Password Form
                            <>
                                {/* Email Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, darkMode && styles.labelDark]}>Email</Text>
                                    <TextInput
                                        style={[styles.input, darkMode && styles.inputDark]}
                                        placeholder="your@email.com"
                                        placeholderTextColor={darkMode ? '#999' : '#666'}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        editable={!loading}
                                    />
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, darkMode && styles.labelDark]}>Password</Text>
                                    <TextInput
                                        style={[styles.input, darkMode && styles.inputDark]}
                                        placeholder="••••••••"
                                        placeholderTextColor={darkMode ? '#999' : '#666'}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        editable={!loading}
                                    />
                                </View>

                                {/* Email Auth Button */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.emailButton,
                                        pressed && styles.buttonPressed,
                                        loading && styles.buttonDisabled,
                                    ]}
                                    onPress={handleEmailAuth}
                                    disabled={loading}
                                >
                                    <Text style={styles.emailButtonText}>
                                        {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                                    </Text>
                                </Pressable>

                                {/* Toggle Mode */}
                                <Pressable
                                    style={styles.toggleMode}
                                    onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                                    disabled={loading}
                                >
                                    <Text style={[styles.toggleModeText, darkMode && styles.toggleModeTextDark]}>
                                        {mode === 'signin'
                                            ? "Don't have an account? Sign Up"
                                            : 'Already have an account? Sign In'}
                                    </Text>
                                </Pressable>

                                {/* Divider */}
                                <View style={styles.divider}>
                                    <View style={[styles.dividerLine, darkMode && styles.dividerLineDark]} />
                                    <Text style={[styles.dividerText, darkMode && styles.dividerTextDark]}>OR</Text>
                                    <View style={[styles.dividerLine, darkMode && styles.dividerLineDark]} />
                                </View>

                                {/* Google OAuth Button */}

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
                                        style={{ width: 20, height: 20, marginRight: 10 }}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.oauthButtonText}>Continue with Google</Text>
                                </Pressable>

                                {/* Facebook OAuth Button */}

                                {/* Facebook OAuth Button */}
                                {/*
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
                                    <Ionicons name="logo-facebook" size={20} color="#fff" />
                                    <Text style={styles.oauthButtonText}>Continue with Facebook</Text>
                                </Pressable>
                                */}
                            </>
                        )}
                    </ScrollView>
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        paddingTop: 40, // Increased
        paddingHorizontal: 36, // Increased
        paddingBottom: 56, // Increased
        width: '90%',
        maxWidth: 440, // Slightly wider
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    modalContentDark: {
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
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
        opacity: 0.05,
        top: 0,
        left: 0,
        borderRadius: 24,
    },
    accentImage: {
        position: 'absolute',
        top: -35,
        alignSelf: 'center',
        width: 90, // Larger
        height: 90,
        zIndex: 15,
    },
    headerSection: {
        marginTop: 48, // More space
        marginBottom: 36,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28, // Larger
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    headerTitleDark: {
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '400',
    },
    headerSubtitleDark: {
        color: '#aaa',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 24,
        textAlign: 'center',
        marginTop: 20,
    },
    titleDark: {
        color: '#fff',
    },
    scrollView: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 24, // Increased spacing
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 10, // More space between label and input
        marginLeft: 4,
    },
    labelDark: {
        color: '#ccc',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
        color: '#fff',
    },
    emailButton: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 18, // Taller button
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    emailButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    toggleMode: {
        marginTop: 24,
        marginBottom: 12,
        alignItems: 'center',
        padding: 8,
    },
    toggleModeText: {
        color: '#007AFF',
        fontSize: 15,
        fontWeight: '500',
    },
    toggleModeTextDark: {
        color: '#66b3ff',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28, // More space around divider
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerLineDark: {
        backgroundColor: '#444',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    dividerTextDark: {
        color: '#666',
    },
    verificationText: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        marginTop: 10,
    },
    verificationTextDark: {
        color: '#bbb',
    },
    oauthButton: {
        borderRadius: 16,
        padding: 18, // Taller button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    googleButton: {
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        borderColor: '#1877F2',
    },
    oauthButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
});
