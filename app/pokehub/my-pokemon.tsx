import { deletePokemon, getMyPokemon, type ScannedPokemon } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyPokemonScreen() {
    const [pokemon, setPokemon] = useState<ScannedPokemon[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPokemon = async () => {
        setLoading(true);
        const list = await getMyPokemon();
        setPokemon(list);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadPokemon();
        }, [])
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Pokémon?', `Remove ${name} from your list?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deletePokemon(id);
                    await loadPokemon();
                },
            },
        ]);
    };

    const renderPokemon = ({ item }: { item: ScannedPokemon }) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/pokehub/pokemon/${item.id}`)}
        >
            {/* Image */}
            {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.thumbnail} resizeMode="cover" />
            ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                    <Ionicons name="image-outline" size={32} color="#ccc" />
                </View>
            )}

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.stats}>
                    <Text style={styles.stat}>CP: {item.cp ?? '—'}</Text>
                    <Text style={styles.stat}>IV: {item.iv ?? '—'}%</Text>
                </View>
                <Text style={styles.date}>
                    {new Date(item.scannedAt).toLocaleDateString()}
                </Text>
            </View>

            {/* Delete Button */}
            <Pressable
                style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
                onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id, item.name);
                }}
            >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </Pressable>
        </Pressable>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Pokémon Scanned Yet</Text>
            <Text style={styles.emptyText}>
                Scan Pokémon from Pokémon GO to save them here
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text style={styles.headerTitle}>My Pokémon</Text>
                <View style={styles.backButton} />
            </View>

            {/* List */}
            <FlatList
                data={pokemon}
                renderItem={renderPokemon}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmpty : null}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
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
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardPressed: {
        opacity: 0.7,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    thumbnailPlaceholder: {
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    stats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    stat: {
        fontSize: 14,
        color: '#666',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    deleteButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonPressed: {
        opacity: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
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
    },
});
