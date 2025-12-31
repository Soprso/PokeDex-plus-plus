import { ExtraLoveEffect, GlowBorder, ShineOverlay } from '@/components/card-effects';
import { TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemonTypes';
import { SHOP_ITEMS, ShopItem, ShopItemCategory } from '@/constants/shopItems';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyInteraction, EconomyData, Inventory } from '../index'; // Import from index

const InteractionIcon = require('@/assets/images/pokeball.png'); // Reuse generic or add specific
const CoinIcon = require('@/assets/images/dex-coin.png');

export default function ShopScreen() {
    const router = useRouter();
    const { user } = useUser();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark'; // Simple dark mode for now, ideally pass settings

    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState<Inventory>({});
    const [selectedCategory, setSelectedCategory] = useState<ShopItemCategory | 'all'>('all');

    // Load initial data
    useEffect(() => {
        if (user) {
            const economy = (user.unsafeMetadata.economy as EconomyData) || { balance: 0 };
            const userInventory = (user.unsafeMetadata.inventory as Inventory) || {};
            setBalance(economy.balance || 0);
            setInventory(userInventory);
        }
    }, [user]);

    const handleBuyItem = async (item: ShopItem) => {
        if (!user) {
            Alert.alert('Sign In Required', 'You must be signed in to purchase items.');
            return;
        }
        if (balance < item.price) {
            Alert.alert('Insufficient Funds', 'You need more Dex Coins to buy this!');
            return;
        }

        // Optimistic Update
        const newBalance = balance - item.price;
        const newCount = (inventory[item.id] || 0) + 1;
        const newInventory = { ...inventory, [item.id]: newCount };

        setBalance(newBalance);
        setInventory(newInventory);

        // Save to Clerk
        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    economy: {
                        ...(user.unsafeMetadata.economy as EconomyData),
                        balance: newBalance,
                    },
                    inventory: newInventory,
                },
            });
            Alert.alert('Purchase Successful!', `You bought ${item.name}.`);
        } catch (error) {
            console.error('Purchase failed', error);
            Alert.alert('Error', 'Transaction failed. Please try again.');
            // Rollback (omitted for brevity, ideally would reload)
        }
    };

    const handleBuyInteraction = async () => {
        if (!user) return;
        const price = 200;

        if (balance < price) {
            Alert.alert('Insufficient Funds', 'You need 200 Dex Coins!');
            return;
        }

        // Logic: Decrement heartsGiven in todayInteraction
        const todayInteraction = (user.unsafeMetadata.todayInteraction as DailyInteraction) || { date: '', heartsGiven: 0, pokemonIds: [] };
        // Check if heartsGiven > 0 to be useful? Or creates "Negative" debt?
        // User wants "1 more buy". So simply decrementing heartsGiven by 1 allows 1 more.
        // Or if it's 3, make it 2.

        if (todayInteraction.heartsGiven <= 0) {
            Alert.alert('Full Energy', 'You haven\'t used your daily interactions yet!');
            return;
        }

        const newBalance = balance - price;
        const newInteraction = { ...todayInteraction, heartsGiven: todayInteraction.heartsGiven - 1 };

        setBalance(newBalance);

        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    economy: {
                        ...(user.unsafeMetadata.economy as EconomyData),
                        balance: newBalance,
                    },
                    todayInteraction: newInteraction, // Decrement count
                },
            });
            Alert.alert('Energy Restored!', 'You can interact with one more buddy today!');
        } catch (error) {
            Alert.alert('Error', 'Transaction failed.');
        }
    };

    const filteredItems = SHOP_ITEMS.filter(i => selectedCategory === 'all' || i.category === selectedCategory);

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, isDark && styles.headerDark]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#333"} />
                </Pressable>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.title, isDark && styles.textDark]}>Shop</Text>
                    <Ionicons name="cart" size={20} color={isDark ? "#fff" : "#333"} style={{ marginLeft: 8 }} />
                </View>
                <View style={styles.balanceContainer}>
                    <Image source={CoinIcon} style={styles.coinIcon} />
                    <Text style={[styles.balanceText, isDark && styles.textDark]}>{balance}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Categories - Tab Style */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                    <View style={styles.categories}>
                        {(['all', 'normal', 'legendary', 'mythical'] as const).map(cat => (
                            <Pressable
                                key={cat}
                                style={[
                                    styles.categoryTab,
                                    selectedCategory === cat && styles.categoryTabActive,
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === cat && styles.categoryTextActive,
                                    isDark && selectedCategory !== cat && styles.textDark
                                ]}>
                                    {cat.toUpperCase()}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>

                {/* Buy Interaction Special */}
                <View style={[styles.specialOffer, isDark && styles.specialOfferDark]}>
                    <View style={styles.specialInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={[styles.specialTitle, isDark && styles.textDark]}>Buddy Interaction +1</Text>
                            <Ionicons name="heart" size={18} color="#e11d48" style={{ marginLeft: 6 }} />
                        </View>
                        <Text style={styles.specialSub}>Get +1 Buddy Interaction for today.</Text>
                    </View>
                    <Pressable style={styles.buyButtonSmall} onPress={handleBuyInteraction}>
                        <Text style={styles.buyButtonText}>200</Text>
                        <Image source={CoinIcon} style={styles.coinIconSmall} />
                    </Pressable>
                </View>

                {/* Items Grid */}
                <View style={styles.grid}>
                    {filteredItems.map(item => {
                        const count = inventory[item.id] || 0;
                        return (
                            <View key={item.id} style={[styles.itemCard, isDark && styles.itemCardDark]}>
                                {/* Full Card Background */}
                                <View style={[styles.cardBackground, { backgroundColor: item.id === 'extra_love' ? 'transparent' : TYPE_COLORS['electric'] }]}>
                                    {/* Effect Backgrounds */}
                                    {item.id === 'extra_love' && <ExtraLoveEffect />}

                                    {/* Pokemon Preview Card Content */}
                                    {count > 0 && <View style={[styles.ownedBadge, { top: 12, right: 12 }]}><Text style={styles.ownedText}>x{count}</Text></View>}
                                    <Text style={styles.cardId}>#025</Text>
                                    <Image
                                        source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
                                        style={styles.previewImage}
                                    />
                                    <Text style={styles.cardName}>Pikachu</Text>
                                    <View style={styles.cardTypeContainer}>
                                        <Image source={TYPE_ICONS['electric']} style={styles.cardTypeIcon} />
                                    </View>

                                    {/* Overlay Effect Preview */}
                                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                                        {item.id === 'effect_neon_cyber' && <GlowBorder color="#00FFFF" borderWidth={2} />}
                                        {item.id === 'effect_golden_glory' && <ShineOverlay color="rgba(255, 215, 0, 0.6)" duration={2000} />}
                                        {item.id === 'effect_ghostly_mist' && <GlowBorder color="#E0E0E0" borderWidth={3} />}

                                        {!['extra_love', 'effect_neon_cyber', 'effect_golden_glory', 'effect_ghostly_mist'].includes(item.id) && (
                                            <View style={styles.effectIconOverlay}>
                                                <Ionicons name="sparkles" size={24} color={item.category === 'mythical' ? '#FFD700' : '#fff'} />
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Info Overlay */}
                                <View style={[styles.itemInfoOverlay, isDark && styles.itemInfoOverlayDark]}>
                                    <Text style={[styles.itemName, isDark && styles.textDark]}>{item.name}</Text>
                                    <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                                    <Pressable style={styles.buyButton} onPress={() => handleBuyItem(item)}>
                                        <Text style={styles.buyButtonText}>{item.price}</Text>
                                        <Image source={CoinIcon} style={styles.coinIconSmall} />
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    containerDark: { backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2, justifyContent: 'space-between' },
    headerDark: { backgroundColor: '#1e1e1e', borderBottomColor: '#333' },
    backButton: { padding: 8 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    textDark: { color: '#fff' },
    balanceContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 20 },
    coinIcon: { width: 20, height: 20, marginRight: 6 },
    balanceText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

    scrollContent: { padding: 16 },
    categoriesScroll: { marginBottom: 20 },
    categories: { flexDirection: 'row', gap: 20, paddingHorizontal: 4 },
    categoryTab: { paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    categoryTabActive: { borderBottomColor: '#3b82f6' },
    categoryText: { fontSize: 14, fontWeight: '600', color: '#999' },
    categoryTextActive: { color: '#333' },

    specialOffer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 1 },
    specialOfferDark: { backgroundColor: '#1e1e1e' },
    specialInfo: { flex: 1 },
    specialTitle: { fontSize: 16, fontWeight: 'bold' },
    specialSub: { fontSize: 12, color: '#999' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    itemCard: { width: '48%', height: 260, borderRadius: 16, overflow: 'hidden', marginBottom: 12, elevation: 3, position: 'relative' },
    itemCardDark: { backgroundColor: '#1e1e1e' },
    cardBackground: { flex: 1, alignItems: 'center', paddingTop: 0 },
    cardId: {
        fontSize: 10,
        color: '#fff',
        opacity: 0.8,
        alignSelf: 'flex-start',
        marginTop: 16,
        marginLeft: 8,
    },
    cardName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        textTransform: 'capitalize',
        marginTop: 4,
    },
    cardTypeContainer: { flexDirection: 'row', gap: 4, marginTop: 4 },
    cardTypeBadge: { display: 'none' }, // Removed
    cardTypeIcon: { width: 14, height: 14, resizeMode: 'contain' },
    previewImage: {
        width: '80%',
        height: undefined,
        aspectRatio: 1,
        marginVertical: 4,
    },
    effectIconOverlay: { position: 'absolute', top: 12, right: 12, opacity: 0.8 },

    itemInfoOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        padding: 12,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
    },
    itemInfoOverlayDark: { backgroundColor: 'rgba(30, 30, 30, 0.6)' },
    itemName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, color: '#333' },
    itemDesc: { fontSize: 11, color: '#666', marginBottom: 8, height: 28 },
    buyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
    buyButtonText: { fontWeight: 'bold', marginRight: 4, fontSize: 12, color: '#333' },
    buyButtonSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 8, borderRadius: 20 },
    coinIconSmall: { width: 14, height: 14 },
    ownedBadge: { position: 'absolute', top: -10, right: 0, backgroundColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    ownedText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
