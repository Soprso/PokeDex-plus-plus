import { TEAM_LIST, TeamName, TEAMS } from '@/constants/teams';
import { getUserProfile, saveUserProfile, UserProfile } from '@/services/storage';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthModal from '../modals/auth';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { isSignedIn, signOut, isLoaded } = useAuth();
    const { user } = useUser();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [darkMode] = useState(false); // TODO: Get from settings context

    // Profile State
    const [loading, setLoading] = useState(true);
    const [trainerName, setTrainerName] = useState('');
    const [trainerId, setTrainerId] = useState('');
    const [trainerLevel, setTrainerLevel] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<TeamName | null>(null);
    const [streak, setStreak] = useState(0);
    const [saving, setSaving] = useState(false);

    // Load profile data
    useEffect(() => {
        async function loadProfile() {
            if (isLoaded && isSignedIn && user) {
                // Load Streak
                if (user.unsafeMetadata.economy) {
                    const economy = user.unsafeMetadata.economy as any;
                    setStreak(economy.streak || 0);
                }

                // 1. Try to load from Cloud (Clerk Metadata)
                const cloudProfile = user.unsafeMetadata?.trainerProfile as UserProfile | undefined;

                if (cloudProfile) {
                    console.log('[Profile] Found cloud profile');
                    setTrainerName(cloudProfile.trainerName || '');
                    setTrainerId(cloudProfile.trainerId || '');
                    setTrainerLevel(cloudProfile.trainerLevel || '');
                    setSelectedTeam(cloudProfile.team || null);
                } else {
                    // 2. Fallback: Check Local Storage (Migration)
                    console.log('[Profile] No cloud profile, checking local storage for migration...');
                    const localProfile = await getUserProfile(user.id);

                    if (localProfile) {
                        console.log('[Profile] Found local profile, migrating to cloud...');
                        setTrainerName(localProfile.trainerName || '');
                        setTrainerId(localProfile.trainerId || '');
                        setTrainerLevel(localProfile.trainerLevel || '');
                        setSelectedTeam(localProfile.team || null);
                        // We don't auto-save here to avoid "silent" updates, 
                        // but the next save will push to cloud.
                    } else {
                        // 3. New User or clean state
                        setTrainerName('');
                        setTrainerId('');
                        setTrainerLevel('');
                        setSelectedTeam(null);
                    }
                }
            }
            setLoading(false);
        }
        loadProfile();
    }, [isLoaded, isSignedIn, user?.id]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const profile: UserProfile = {
                trainerName,
                trainerId,
                trainerLevel,
                team: selectedTeam,
                updatedAt: Date.now(),
            };

            // Save to Clerk Cloud
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    trainerProfile: profile,
                },
            });

            // Optional: Keep local backup for now
            if (user.id) {
                await saveUserProfile(user.id, profile);
            }

            Alert.alert('Success', 'Profile saved to the cloud!');
        } catch (error: any) {
            console.error('Save error:', error);
            const msg = error.errors?.[0]?.message || error.message || 'Unknown error';
            Alert.alert('Error', 'Failed to save profile: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.back();
                    },
                },
            ]
        );
    };

    // Derived styles based on team
    const currentTeam = selectedTeam ? TEAMS[selectedTeam] : null;
    const accentColor = currentTeam ? currentTeam.color : (darkMode ? '#fff' : '#007AFF');
    const bgStyle = currentTeam ? { borderColor: accentColor, borderWidth: 2 } : {};

    // Loading state
    if (!isLoaded || loading) {
        return (
            <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        );
    }

    // Signed out state
    if (!isSignedIn) {
        return (
            <View style={{ flex: 1, backgroundColor: darkMode ? '#000' : '#fff' }}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* Blended Background Gradient */}
                <LinearGradient
                    colors={[
                        TEAMS.Mystic.color + '15', // Blue ~8%
                        TEAMS.Valor.color + '15',  // Red ~8%
                        TEAMS.Instinct.color + '15' // Yellow ~8%
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Triple Team Watermarks */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    {/* Mystic (Top Left) */}
                    <Image
                        source={TEAMS.Mystic.image}
                        style={[styles.multiWatermark, { top: -50, left: -50, tintColor: TEAMS.Mystic.color }]}
                        resizeMode="contain"
                    />
                    {/* Valor (Center Right) */}
                    <Image
                        source={TEAMS.Valor.image}
                        style={[styles.multiWatermark, { top: '30%', right: -80, tintColor: TEAMS.Valor.color }]}
                        resizeMode="contain"
                    />
                    {/* Instinct (Bottom Left) */}
                    <Image
                        source={TEAMS.Instinct.image}
                        style={[styles.multiWatermark, { bottom: -50, left: -20, tintColor: TEAMS.Instinct.color }]}
                        resizeMode="contain"
                    />
                </View>

                <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={darkMode ? '#fff' : '#000'} />
                        </Pressable>
                        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Profile</Text>
                        <View style={styles.backButton} />
                    </View>

                    <View style={styles.signedOutContainer}>
                        <View style={[styles.iconCircle, darkMode && styles.iconCircleDark]}>
                            <Ionicons name="person" size={60} color={darkMode ? '#fff' : '#555'} />
                        </View>
                        <Text style={[styles.signedOutTitle, darkMode && styles.signedOutTitleDark]}>
                            Welcome Trainer!
                        </Text>
                        <Text style={[styles.signedOutSubtitle, darkMode && styles.textDark]}>
                            Sign in to access your profile, save your team, and track your progress.
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.signInButton,
                                pressed && styles.signInButtonPressed,
                            ]}
                            onPress={() => setAuthModalOpen(true)}
                        >
                            <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
                <AuthModal
                    visible={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    darkMode={darkMode}
                />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: darkMode ? '#000' : '#fff' }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background Gradient */}
            {currentTeam && (
                <LinearGradient
                    colors={[currentTeam.color + '20', darkMode ? '#000' : '#fff']} // 20 hex = approx 12% opacity
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.6 }}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* Watermark Logo */}
            {currentTeam && (
                <Image
                    source={currentTeam.image}
                    style={[
                        styles.watermark,
                        { tintColor: currentTeam.color }
                    ]}
                    resizeMode="contain"
                />
            )}

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={accentColor} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: accentColor }]}>Trainer Profile</Text>
                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        style={({ pressed }) => [
                            styles.saveButton,
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color={accentColor} />
                        ) : (
                            <Text style={[styles.saveButtonText, { color: accentColor }]}>Save</Text>
                        )}
                    </Pressable>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>

                        {/* Header Card */}
                        <View style={[styles.trainerCard, darkMode && styles.trainerCardDark, bgStyle]}>
                            <View style={styles.avatarSection}>
                                {currentTeam ? (
                                    <Image source={currentTeam.image} style={styles.teamLogoLarge} resizeMode="contain" />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Ionicons name="person" size={40} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.trainerHeaderInfo}>
                                <Text style={[styles.trainerNameDisplay, { color: accentColor }]}>
                                    {trainerName || 'Trainer Name'}
                                </Text>
                                <Text style={[styles.trainerLevelDisplay, darkMode && styles.textDark]}>
                                    Level {trainerLevel || '00'}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Ionicons name="flame" size={16} color="#FF6B6B" style={{ marginRight: 4 }} />
                                    <Text style={[styles.trainerLevelDisplay, { fontSize: 14, fontWeight: '600' }, darkMode && styles.textDark]}>
                                        Streak: {streak} Days
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, darkMode && styles.textDark]}>Trainer Name</Text>
                                <TextInput
                                    style={[styles.input, darkMode && styles.inputDark]}
                                    placeholder="Enter Trainer Name"
                                    placeholderTextColor="#999"
                                    value={trainerName}
                                    onChangeText={setTrainerName}
                                    maxLength={20}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 2, marginRight: 12 }]}>
                                    <Text style={[styles.label, darkMode && styles.textDark]}>Trainer ID</Text>
                                    <TextInput
                                        style={[styles.input, darkMode && styles.inputDark]}
                                        placeholder="0000 0000 0000"
                                        placeholderTextColor="#999"
                                        value={trainerId}
                                        onChangeText={setTrainerId}
                                        keyboardType="numeric"
                                        maxLength={14}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, darkMode && styles.textDark]}>Level</Text>
                                    <TextInput
                                        style={[styles.input, darkMode && styles.inputDark, { textAlign: 'center' }]}
                                        placeholder="50"
                                        placeholderTextColor="#999"
                                        value={trainerLevel}
                                        onChangeText={setTrainerLevel}
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                            </View>

                            {/* Team Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, darkMode && styles.textDark]}>Team Alignment</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamSelector}>
                                    {TEAM_LIST.map((team) => (
                                        <Pressable
                                            key={team.id}
                                            style={[
                                                styles.teamOption,
                                                selectedTeam === team.id && styles.teamOptionSelected,
                                                selectedTeam === team.id && { borderColor: team.color, backgroundColor: team.color + '10' }
                                            ]}
                                            onPress={() => setSelectedTeam(team.id)}
                                        >
                                            <Image source={team.image} style={styles.teamOptionIcon} resizeMode="contain" />
                                            <Text style={[
                                                styles.teamOptionText,
                                                darkMode && styles.textDark,
                                                selectedTeam === team.id && { color: team.color, fontWeight: 'bold' }
                                            ]}>
                                                {team.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Account Info */}
                        <View style={styles.footerSection}>
                            <Text style={styles.accountInfoText}>
                                Account created on: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                            </Text>

                            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                                <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
                                <Text style={styles.signOutText}>Sign Out</Text>
                            </Pressable>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#fff', // Removed to let gradient show
    },
    containerDark: {
        // backgroundColor: '#000', // Removed
    },
    safeArea: {
        flex: 1,
    },
    watermark: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        right: -width * 0.4,
        bottom: -width * 0.2,
        opacity: 0.05,
        transform: [{ rotate: '-15deg' }],
    },
    multiWatermark: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        opacity: 0.06,
        transform: [{ rotate: '-10deg' }],
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    iconCircleDark: {
        backgroundColor: '#222',
    },
    signedOutSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)', // More subtle
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    headerTitleDark: {
        color: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    trainerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    trainerCardDark: {
        backgroundColor: 'rgba(26,26,26,0.8)',
    },
    avatarSection: {
        marginRight: 20,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamLogoLarge: {
        width: 80,
        height: 80,
    },
    trainerHeaderInfo: {
        flex: 1,
    },
    trainerNameDisplay: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    trainerLevelDisplay: {
        fontSize: 16,
        color: '#666',
    },
    textDark: {
        color: '#fff',
    },
    formSection: {
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    rowInputs: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(245,245,245,0.8)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputDark: {
        backgroundColor: 'rgba(42,42,42,0.8)',
        color: '#fff',
    },
    teamSelector: {
        flexDirection: 'row',
    },
    teamOption: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginRight: 12,
        width: 110,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    teamOptionSelected: {
        borderWidth: 2,
    },
    teamOptionIcon: {
        width: 50,
        height: 50,
        marginBottom: 8,
    },
    teamOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    footerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    accountInfoText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 24,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff0f0',
    },
    signOutText: {
        color: '#ff3b30',
        fontWeight: '600',
        marginLeft: 8,
    },
    signedOutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    signedOutTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 20,
        marginBottom: 20,
    },
    signedOutTitleDark: {
        color: '#fff',
    },
    signInButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    signInButtonPressed: {
        opacity: 0.8,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
