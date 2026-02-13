import { Ionicons } from '@/components/native/Icons';
import { ShopItemCard } from '@/components/ShopItemCard';
import { SHOP_ITEMS, type ShopItem } from '@/constants/shopItems';
import { type DailyInteraction, type EconomyData, type Inventory } from '@/types';
import { useUser } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, useColorScheme, useWindowDimensions, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigate } from 'react-router-dom';
// const InteractionIcon = require('@/assets/images/pokeball.png');
import coinIcon from '@/assets/images/dex-coin.png';
import { EconomyModal } from '@/components/home/modals/EconomyModal';
const CoinIcon = coinIcon;

type TabType = 'effects' | 'frames' | 'items';

export default function ShopScreen() {
    const navigate = useNavigate();
    const { user } = useUser();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [inventory, setInventory] = useState<Inventory>({});
    const [activeTab, setActiveTab] = useState<TabType>('effects');
    const [viewableItems, setViewableItems] = useState<Set<string>>(new Set());
    const [balance, setBalance] = useState(0);
    const [streak, setStreak] = useState(1);
    const [modals, setModals] = useState({ economy: false });

    const { width } = useWindowDimensions();
    const numColumns = width > 768 ? 4 : 2;
    const cardGap = 8;
    const listPadding = 16;
    const cardWidth = (width - (listPadding * 2) - ((numColumns - 1) * cardGap)) / numColumns;

    // Load initial data
    useEffect(() => {
        if (user) {
            const economy = (user.unsafeMetadata.economy as EconomyData) || { balance: 0, streak: 1 };
            const userInventory = (user.unsafeMetadata.inventory as Inventory) || {};
            setBalance(economy.balance || 0);
            setStreak(economy.streak || 1);
            setInventory(userInventory);
        }
    }, [user?.id, user?.unsafeMetadata]);

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

            {/* Header */}
            <View style={[styles.header, isDark && styles.headerDark]}>
                <Pressable onPress={() => navigate(-1)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#333"} />
                </Pressable>

                <View style={styles.titleContainer} pointerEvents="none">
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.title, isDark && styles.textDark]}>Shop</Text>
                        <Ionicons name="cart" size={20} color={isDark ? "#fff" : "#333"} style={{ marginLeft: 8 }} />
                    </View>
                </View>

                <Pressable
                    style={[styles.balanceContainer, isDark && styles.balanceContainerDark]}
                    onPress={() => setModals({ ...modals, economy: true })}
                >
                    <Image source={typeof CoinIcon === 'string' ? { uri: CoinIcon } : CoinIcon} style={styles.coinIcon} />
                    <Text style={[styles.balanceText, isDark && styles.balanceTextDark]}>
                        {balance.toLocaleString()}
                    </Text>
                </Pressable>
            </View>

            {/* Tabs */}
            <View style={styles.tabScrollContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabList}
                    style={styles.tabScroll}
                >
                    {(['effects', 'frames', 'items'] as const).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <Pressable
                                key={tab}
                                style={[
                                    styles.tabChip,
                                    isDark && styles.tabChipDark,
                                    isActive && styles.tabChipActive
                                ]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[
                                    styles.tabChipText,
                                    isDark && styles.tabChipTextDark,
                                    isActive && styles.tabChipTextActive
                                ]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* List */}
            <View style={styles.contentWrapper}>
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    key={numColumns}
                    columnWrapperStyle={{ gap: cardGap }}
                    contentContainerStyle={[styles.scrollContent, { padding: listPadding }]}
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
                                    <Image source={typeof CoinIcon === 'string' ? { uri: CoinIcon } : CoinIcon} style={styles.coinIconSmall} />
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
                            cardWidth={cardWidth}
                        />
                    )}
                />
            </View>

            {/* Modals */}
            <EconomyModal
                visible={modals.economy}
                onClose={() => setModals({ ...modals, economy: false })}
                type="info"
                title="Your Wallet"
                message="Manage your coins and view transactions."
                balance={balance}
                streak={streak}
                darkMode={isDark}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    containerDark: { backgroundColor: '#121212' },
    contentWrapper: {
        flex: 1,
        width: '100%',
        alignSelf: 'center',
    },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', zIndex: 10, justifyContent: 'space-between' },
    headerDark: { backgroundColor: '#121212', borderBottomColor: 'rgba(255,255,255,0.05)' },
    backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.03)', zIndex: 20 },
    titleContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', letterSpacing: -0.5 },
    textDark: { color: '#fff' },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        height: 50,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#eee',
    },
    balanceContainerDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    coinIcon: {
        width: 22,
        height: 22,
        marginRight: 8,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    balanceTextDark: {
        color: '#FFD700',
    },

    tabScrollContainer: {
        width: '100%',
        paddingVertical: 15,
        backgroundColor: 'transparent',
    },
    tabScroll: {
        maxHeight: 60,
        width: '100%',
    },
    tabList: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        gap: 20,
    },
    tabChip: {
        height: 50,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabChipDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
    },
    tabChipActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    tabChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    tabChipTextDark: {
        color: '#aaa',
    },
    tabChipTextActive: {
        color: '#fff',
    },

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
