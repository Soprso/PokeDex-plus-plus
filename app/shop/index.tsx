import { ShopItemCard } from '@/components/ShopItemCard';
import { SHOP_ITEMS, ShopItem } from '@/constants/shopItems';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, useColorScheme, View, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyInteraction, EconomyData, Inventory } from '../index';

const InteractionIcon = require('@/assets/images/pokeball.png');
const CoinIcon = require('@/assets/images/dex-coin.png');

type TabType = 'effects' | 'frames' | 'items';

export default function ShopScreen() {
    const router = useRouter();
    const { user } = useUser();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState<Inventory>({});
    const [activeTab, setActiveTab] = useState<TabType>('effects');
    const [viewableItems, setViewableItems] = useState<Set<string>>(new Set());

    // Load initial data
    useEffect(() => {
        if (user) {
            const economy = (user.unsafeMetadata.economy as EconomyData) || { balance: 0 };
            const userInventory = (user.unsafeMetadata.inventory as Inventory) || {};
            setBalance(economy.balance || 0);
            setInventory(userInventory);
        }
    }, [user?.id]);

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
        }
    };

    const handleBuyInteraction = async () => {
        if (!user) return;
        const price = 200;

        if (balance < price) {
            Alert.alert('Insufficient Funds', 'You need 200 Dex Coins!');
            return;
        }

        const todayInteraction = (user.unsafeMetadata.todayInteraction as DailyInteraction) || { date: '', heartsGiven: 0, pokemonIds: [] };

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
                    todayInteraction: newInteraction,
                },
            });
            Alert.alert('Energy Restored!', 'You can interact with one more buddy today!');
        } catch (error) {
            Alert.alert('Error', 'Transaction failed.');
        }
    };

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (activeTab === 'effects') return item.type === 'effect';
        if (activeTab === 'frames') return item.type === 'frame';
        return item.type === 'consumable'; // Items
    });

    // Viewability Config for Lazy Loading
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 0, // Instant
    }).current;

    const onViewableItemsChanged = useCallback(({ viewableItems: visibleItems }: { viewableItems: ViewToken[] }) => {
        const visibleIds = new Set(visibleItems.map(token => token.item.id as string));
        setViewableItems(visibleIds);
    }, []);

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, isDark && styles.headerDark]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#333"} />
                </Pressable>

                <View style={styles.titleContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.title, isDark && styles.textDark]}>Shop</Text>
                        <Ionicons name="cart" size={20} color={isDark ? "#fff" : "#333"} style={{ marginLeft: 8 }} />
                    </View>
                </View>

                <View style={styles.balanceContainer}>
                    <Image source={CoinIcon} style={styles.coinIcon} />
                    <Text style={styles.balanceText}>{balance}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, isDark && styles.tabContainerDark]}>
                {(['effects', 'frames', 'items'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <Pressable
                            key={tab}
                            style={[
                                styles.tab,
                                isActive && styles.tabActive,
                                isActive && isDark && { backgroundColor: '#333' }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                isActive && styles.tabTextActive,
                                isDark && !isActive && { color: '#aaa' },
                                isDark && isActive && { color: '#fff' }
                            ]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* List */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={styles.scrollContent}
                windowSize={5}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                removeClippedSubviews={true}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                ListHeaderComponent={
                    activeTab === 'items' ? (
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
                    ) : null
                }
                renderItem={({ item }) => (
                    <ShopItemCard
                        item={item}
                        count={inventory[item.id] || 0}
                        isDark={isDark}
                        onBuy={() => handleBuyItem(item)}
                        shouldPlay={viewableItems.has(item.id)}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    containerDark: { backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', zIndex: 10, justifyContent: 'space-between' },
    headerDark: { backgroundColor: '#121212', borderBottomColor: 'rgba(255,255,255,0.05)' },
    backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.03)', zIndex: 20 },
    titleContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' },
    title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', letterSpacing: -0.5 },
    textDark: { color: '#fff' },
    balanceContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9C4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FFD700', zIndex: 20 },
    coinIcon: { width: 18, height: 18, marginRight: 6 },
    balanceText: { fontSize: 16, fontWeight: '900', color: '#FFD700', textShadowColor: '#000', textShadowRadius: 1, textShadowOffset: { width: 1, height: 1 } },

    tabContainer: { flexDirection: 'row', margin: 16, padding: 4, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 16 },
    tabContainerDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    tabText: { fontWeight: '600', color: '#888', fontSize: 13 },
    tabTextActive: { color: '#1a1a1a', fontWeight: '700' },

    scrollContent: { padding: 16, paddingBottom: 40 },

    specialOffer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
    specialOfferDark: { backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.05)' },
    specialInfo: { flex: 1 },
    specialTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
    specialSub: { fontSize: 13, color: '#888', marginTop: 2 },
    buyButtonSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e0f2fe' },
    buyButtonText: { fontWeight: '700', marginRight: 6, fontSize: 13, color: '#0284c7' },
    coinIconSmall: { width: 14, height: 14 },
});
