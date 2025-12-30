import PokemonDetailView, { type PokemonDisplayData } from '@/components/pokemon/PokemonDetailView';
import { getPokemonById, type ScannedPokemon } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PokemonDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [pokemon, setPokemon] = useState<ScannedPokemon | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPokemon();
    }, [id]);

    const loadPokemon = async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const data = await getPokemonById(id);
        setPokemon(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading Pokémon...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!pokemon) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Pokémon Not Found</Text>
                    <View style={styles.backButton} />
                </View>

                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>Pokémon Not Found</Text>
                    <Text style={styles.emptyText}>
                        This Pokémon may have been deleted or does not exist.
                    </Text>
                    <Pressable style={styles.backToListButton} onPress={() => router.push('/pokehub/my-pokemon')}>
                        <Text style={styles.backToListText}>Back to My Pokémon</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Convert ScannedPokemon to PokemonDisplayData
    // Convert ScannedPokemon to PokemonDisplayData
    const displayData: PokemonDisplayData = {
        name: pokemon.name,
        cp: pokemon.cp,
        hp: pokemon.hp,
        level: pokemon.level,
        iv: pokemon.iv && typeof pokemon.iv === 'object' ? pokemon.iv : null,
        imageUri: pokemon.imageUri || '',
        scannedAt: pokemon.scannedAt,
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Scanned Pokémon</Text>
                    <View style={styles.backButton} />
                </View>

                {/* Shared Pokemon Detail View */}
                <PokemonDetailView data={displayData} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
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
        fontWeight: '700',
        color: '#000',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    backToListButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backToListText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
