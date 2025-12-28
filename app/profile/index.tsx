import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthModal from '../modals/auth';

export default function ProfileScreen() {
    const { isSignedIn, signOut, isLoaded } = useAuth();
    const { user } = useUser();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [darkMode] = useState(false); // TODO: Get from settings context if needed

    // Show loading skeleton while auth status is being determined
    if (!isLoaded) {
        return (
            <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={darkMode ? '#fff' : '#000'} />
                    </Pressable>
                    <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Profile</Text>
                    <View style={styles.backButton} />
                </View>

                {/* Skeleton Loading */}
                <View style={styles.loadingContainer}>
                    <View style={styles.skeletonAvatar} />
                    <View style={[styles.skeletonText, styles.skeletonTextLarge]} />
                    <View style={[styles.skeletonText, styles.skeletonTextSmall]} />
                    <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
                </View>
            </SafeAreaView>
        );
    }

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

    if (!isSignedIn) {
        // Signed-out state
        return (
            <>
                <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={darkMode ? '#fff' : '#000'} />
                        </Pressable>
                        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Profile</Text>
                        <View style={styles.backButton} />
                    </View>

                    <View style={styles.signedOutContainer}>
                        <Ionicons name="person-circle-outline" size={100} color={darkMode ? '#666' : '#ccc'} />
                        <Text style={[styles.signedOutTitle, darkMode && styles.signedOutTitleDark]}>
                            Sign in to continue
                        </Text>
                        <Text style={[styles.signedOutSubtitle, darkMode && styles.signedOutSubtitleDark]}>
                            Access your saved Pokémon, nicknames, and preferences
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.signInButton,
                                pressed && styles.signInButtonPressed,
                            ]}
                            onPress={() => setAuthModalOpen(true)}
                        >
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>

                <AuthModal
                    visible={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    darkMode={darkMode}
                />
            </>
        );
    }

    // Signed-in state
    const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Trainer';

    return (
        <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={darkMode ? '#fff' : '#000'} />
                </Pressable>
                <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Profile</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle" size={80} color="#007AFF" />
                    </View>
                    <Text style={[styles.welcomeText, darkMode && styles.welcomeTextDark]}>
                        Welcome, {displayName}!
                    </Text>
                    {user?.emailAddresses[0]?.emailAddress && (
                        <Text style={[styles.emailText, darkMode && styles.emailTextDark]}>
                            {user.emailAddresses[0].emailAddress}
                        </Text>
                    )}
                </View>

                {/* Placeholder Sections */}
                <View style={styles.section}>
                    <View style={[styles.sectionHeader, darkMode && styles.sectionHeaderDark]}>
                        <Ionicons name="star" size={20} color={darkMode ? '#ffd700' : '#f39c12'} />
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
                            Saved Pokémon
                        </Text>
                    </View>
                    <View style={[styles.placeholderBox, darkMode && styles.placeholderBoxDark]}>
                        <Text style={[styles.placeholderText, darkMode && styles.placeholderTextDark]}>
                            Your saved Pokémon will appear here
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={[styles.sectionHeader, darkMode && styles.sectionHeaderDark]}>
                        <Ionicons name="pricetag" size={20} color={darkMode ? '#4da6ff' : '#007AFF'} />
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
                            Nicknames
                        </Text>
                    </View>
                    <View style={[styles.placeholderBox, darkMode && styles.placeholderBoxDark]}>
                        <Text style={[styles.placeholderText, darkMode && styles.placeholderTextDark]}>
                            Your nicknamed Pokémon will appear here
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={[styles.sectionHeader, darkMode && styles.sectionHeaderDark]}>
                        <Ionicons name="flash" size={20} color={darkMode ? '#ff6b6b' : '#e74c3c'} />
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
                            Battle Preferences
                        </Text>
                    </View>
                    <View style={[styles.placeholderBox, darkMode && styles.placeholderBoxDark]}>
                        <Text style={[styles.placeholderText, darkMode && styles.placeholderTextDark]}>
                            Your battle preferences will appear here
                        </Text>
                    </View>
                </View>

                {/* Sign Out Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.signOutButton,
                        pressed && styles.signOutButtonPressed,
                    ]}
                    onPress={handleSignOut}
                >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </Pressable>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    headerTitleDark: {
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    signedOutContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    signedOutTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 24,
        marginBottom: 12,
    },
    signedOutTitleDark: {
        color: '#fff',
    },
    signedOutSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    signedOutSubtitleDark: {
        color: '#999',
    },
    signInButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    signInButtonPressed: {
        opacity: 0.7,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    welcomeSection: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    welcomeTextDark: {
        color: '#fff',
    },
    emailText: {
        fontSize: 14,
        color: '#666',
    },
    emailTextDark: {
        color: '#999',
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeaderDark: {
        opacity: 0.9,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    sectionTitleDark: {
        color: '#fff',
    },
    placeholderBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    placeholderBoxDark: {
        backgroundColor: '#1a1a1a',
    },
    placeholderText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    placeholderTextDark: {
        color: '#666',
    },
    signOutButton: {
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    signOutButtonPressed: {
        opacity: 0.7,
    },
    signOutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    bottomSpacer: {
        height: 40,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    skeletonAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e0e0',
        marginBottom: 24,
    },
    skeletonText: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 12,
    },
    skeletonTextLarge: {
        width: 200,
        height: 24,
    },
    skeletonTextSmall: {
        width: 150,
        height: 16,
    },
    spinner: {
        marginTop: 24,
    },
});
