import { useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
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

const { width, height } = Dimensions.get('window');

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    darkMode: boolean;
}

export default function AuthModal({ visible, onClose, darkMode }: AuthModalProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    const { signIn, setActive: setActiveSignIn } = useSignIn();
    const { signUp, setActive: setActiveSignUp } = useSignUp();
    const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: 'oauth_facebook' });

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
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
                    Alert.alert('Error', 'Sign in incomplete. Please try again.');
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
                    Alert.alert('Error', 'Sign up incomplete. Please try again.');
                }
            }
        } catch (err: any) {
            Alert.alert('Error', err.errors?.[0]?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!code) {
            Alert.alert('Error', 'Please enter the verification code');
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
                Alert.alert('Error', 'Verification failed. Please try again.');
            }
        } catch (err: any) {
            Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const { createdSessionId, setActive } = await startGoogleOAuth();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                resetForm();
                onClose();
            }
        } catch (err: any) {
            // User cancelled or error occurred
            if (err.code !== 'user_cancelled') {
                Alert.alert('Error', 'Google sign in failed');
            }
        } finally {
            setLoading(false);
        }
    };

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
                Alert.alert('Error', 'Facebook sign in failed');
            }
        } finally {
            setLoading(false);
        }
    };

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
                        <Ionicons name="close" size={28} color={darkMode ? '#fff' : '#000'} />
                    </Pressable>

                    {/* Peaceful Background - Subtle Atmosphere */}
                    <Image
                        source={require('../../assets/images/auth_background.png')}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    />

                    {/* Minimal Pokéball Accent */}
                    <Image
                        source={require('../../assets/images/pokeball_accent.png')}
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
                                    <Ionicons name="logo-google" size={20} color="#fff" />
                                    <Text style={styles.oauthButtonText}>Continue with Google</Text>
                                </Pressable>

                                {/* Facebook OAuth Button */}
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
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingHorizontal: 28,
        paddingBottom: 48,
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    modalContentDark: {
        backgroundColor: '#1a1a1a',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
        zIndex: 10,
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.08,
        top: 0,
        left: 0,
    },
    accentImage: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 60,
        height: 60,
        opacity: 0.1,
    },
    headerSection: {
        marginTop: 16,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    headerTitleDark: {
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '400',
    },
    headerSubtitleDark: {
        color: '#999',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 24,
        textAlign: 'center',
    },
    titleDark: {
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    labelDark: {
        color: '#ddd',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
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
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    emailButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    toggleMode: {
        marginTop: 16,
        alignItems: 'center',
    },
    toggleModeText: {
        color: '#007AFF',
        fontSize: 14,
    },
    toggleModeTextDark: {
        color: '#4da6ff',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
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
        marginHorizontal: 12,
        color: '#999',
        fontSize: 14,
    },
    dividerTextDark: {
        color: '#666',
    },
    verificationText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    verificationTextDark: {
        color: '#999',
    },
    oauthButton: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    googleButton: {
        backgroundColor: '#4285F4',
    },
    facebookButton: {
        backgroundColor: '#1877F2',
    },
    oauthButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
