import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React from 'react';
import { Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ComingSoon() {
    const handleRateApp = () => {
        // Replace with your actual Play Store URL when published
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.yourapp.pokedex';
        Linking.openURL(playStoreUrl).catch(err => console.error('Error opening Play Store:', err));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'PokeHub',
                    headerStyle: {
                        backgroundColor: '#E3350D',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />

            <LinearGradient
                colors={['#E3350D', '#FF6B6B', '#FFE66D']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Pokéball Icon */}
                    <View style={styles.pokeballContainer}>
                        <View style={styles.pokeball}>
                            <View style={styles.pokeballTop} />
                            <View style={styles.pokeballMiddle}>
                                <View style={styles.pokeballButton} />
                            </View>
                            <View style={styles.pokeballBottom} />
                        </View>
                    </View>

                    {/* Coming Soon Text */}
                    <Text style={styles.title}>Coming Soon!</Text>
                    <Text style={styles.subtitle}>
                        PokeHub is under development
                    </Text>
                    <Text style={styles.description}>
                        We're working hard to bring you an amazing social experience for Pokémon trainers.
                        Stay tuned for updates!
                    </Text>

                    {/* Features Preview */}
                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>👥</Text>
                            <Text style={styles.featureText}>Connect with Trainers</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>💬</Text>
                            <Text style={styles.featureText}>Share Your Collection</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>🏆</Text>
                            <Text style={styles.featureText}>Join Tournaments</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Rate App Section */}
                    <View style={styles.rateSection}>
                        <Text style={styles.rateTitle}>Enjoying the app?</Text>
                        <Text style={styles.rateSubtitle}>
                            Help us grow by rating on the Play Store!
                        </Text>
                        <TouchableOpacity
                            style={styles.rateButton}
                            onPress={handleRateApp}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#FFD700', '#FFA500']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.rateButtonGradient}
                            >
                                <Text style={styles.rateButtonIcon}>⭐</Text>
                                <Text style={styles.rateButtonText}>Rate on Play Store</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3350D',
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    // Pokéball Animation
    pokeballContainer: {
        marginBottom: 40,
    },
    pokeball: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#000',
    },
    pokeballTop: {
        height: '45%',
        backgroundColor: '#fff',
    },
    pokeballMiddle: {
        height: '10%',
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pokeballButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#000',
    },
    pokeballBottom: {
        height: '45%',
        backgroundColor: '#E3350D',
    },
    // Text Styles
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
        opacity: 0.9,
    },
    description: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        opacity: 0.85,
        maxWidth: width * 0.8,
    },
    // Features
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 40,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    // Divider
    divider: {
        width: '80%',
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: 32,
    },
    // Rate Section
    rateSection: {
        alignItems: 'center',
        width: '100%',
    },
    rateTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    rateSubtitle: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
        opacity: 0.9,
    },
    rateButton: {
        width: '80%',
        maxWidth: 300,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    rateButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    rateButtonIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    rateButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
});
