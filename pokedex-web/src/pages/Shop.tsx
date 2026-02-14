import { Ionicons } from '@/components/native/Icons';
import { ShopItemCard } from '@/components/ShopItemCard';
import { SHOP_ITEMS, type ShopItem } from '@/constants/shopItems';
import { type DailyInteraction, type EconomyData, type Inventory } from '@/types';
import { useUser } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigate } from 'react-router-dom';
// const InteractionIcon = require('@/assets/images/pokeball.png');
import coinIcon from '@/assets/images/dex-coin.png';
import { EconomyModal } from '@/components/home/modals/EconomyModal';
const CoinIcon = coinIcon;

import { useColorScheme } from '@/hooks/use-color-scheme';

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
    const [modals, setModals] = useState({
        economy: false,
        confirm: false,
        error: false,
        insufficient: false
    });
    const [pendingItem, setPendingItem] = useState<ShopItem | null>(null);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '' });

    const { width } = useWindowDimensions();
    // ... rest of the code for dimensions ...
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

    const handleBuyItem = (item: ShopItem) => {
        if (!user) {
            setModalConfig({
                title: 'Sign In Required',
                message: 'You must be signed in to purchase items. Please log in to your account.'
            });
            setModals(prev => ({ ...prev, error: true }));
            return;
        }

        if (item.currency !== 'usd' && balance < item.price) {
            setModalConfig({
                title: 'Insufficient Coins',
                message: `You need ${item.price - balance} more Dex Coins to buy this ${item.name}!`
            });
            setModals(prev => ({ ...prev, insufficient: true }));
            return;
        }

        setPendingItem(item);
        setModalConfig({
            title: 'Confirm Purchase',
            message: item.currency === 'usd'
                ? `Buy "${item.name}" for $${item.price.toFixed(2)}?`
                : `Would you like to buy "${item.name}" for ${item.price} Dex Coins?`
        });
        setModals(prev => ({ ...prev, confirm: true }));
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const finalizePurchase = async () => {
        if (!user || !pendingItem || isProcessing) return;
        setIsProcessing(true);

        try {
            // Read latest data from metadata to avoid stale state
            const currentMetadata = user.unsafeMetadata;
            const latestEconomy = (currentMetadata.economy as EconomyData) || { balance: 0, streak: 1 };
            const latestInventory = (currentMetadata.inventory as Inventory) || {};
            const item = pendingItem;

            if (item.currency !== 'usd' && latestEconomy.balance < item.price) {
                setModalConfig({
                    title: 'Insufficient Coins',
                    message: `Your balance updated. You need ${item.price - latestEconomy.balance} more Dex Coins.`
                });
                setModals(prev => ({ ...prev, insufficient: true, confirm: false }));
                return;
            }

            let newBalance = latestEconomy.balance;

            if (item.currency === 'usd') {
                // Add coins for real money purchase
                newBalance += (item.rewardAmount || 0);
            } else {
                // Deduct coins for clear standard purchase
                newBalance -= item.price;
            }

            // Don't add consumables to inventory if they are instant-use (like coins)
            // But we might want to track purchase history later. 
            // For now, let's just add to inventory to track "times purchased"
            const newCount = (latestInventory[item.id] || 0) + 1;
            const newInventory = { ...latestInventory, [item.id]: newCount };

            // Handle Buddy Interaction special logic
            let newInteraction = null;
            if (item.id === 'buddy_interaction') {
                const todayInteraction = (currentMetadata.todayInteraction as DailyInteraction) || { date: '', heartsGiven: 0, pokemonIds: [] };
                newInteraction = { ...todayInteraction, heartsGiven: Math.max(0, todayInteraction.heartsGiven - 1) };
            }

            // Perform Update
            const updates: any = {
                ...currentMetadata,
                economy: {
                    ...latestEconomy,
                    balance: newBalance,
                },
                inventory: newInventory,
            };

            if (newInteraction) {
                updates.todayInteraction = newInteraction;
            }

            await user.update({ unsafeMetadata: updates });

            // Success - state will sync via useEffect, but we can set local state for snappiness
            setBalance(newBalance);
            setInventory(newInventory);
            setModals(prev => ({ ...prev, confirm: false }));

        } catch (error) {
            console.error('Purchase failed', error);
            setModalConfig({
                title: 'Purchase Failed',
                message: 'Something went wrong during the transaction. Please try again.'
            });
            setModals(prev => ({ ...prev, error: true, confirm: false }));
        } finally {
            setIsProcessing(false);
            setPendingItem(null);
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
                    ListHeaderComponent={null}
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

            <EconomyModal
                visible={modals.confirm}
                onClose={() => setModals({ ...modals, confirm: false })}
                type="confirm"
                title={modalConfig.title}
                message={modalConfig.message}
                balance={balance}
                streak={streak}
                darkMode={isDark}
                onAction={finalizePurchase}
                actionLabel="Buy Now"
            />

            <EconomyModal
                visible={modals.error || modals.insufficient}
                onClose={() => setModals({ ...modals, error: false, insufficient: false })}
                type="error"
                title={modalConfig.title}
                message={modalConfig.message}
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
});
