import { Ionicons } from '@/components/native/Icons';
import { ShopItemCard } from '@/components/ShopItemCard';
import { SHOP_ITEMS, type ShopItem } from '@/constants/shopItems';
import { type EconomyData, type Inventory } from '@/types';
import { useUser } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigate } from 'react-router-dom';
// const InteractionIcon = require('@/assets/images/pokeball.png');
import coinIcon from '@/assets/images/dex-coin.png';
import { EconomyModal } from '@/components/home/modals/EconomyModal';
import { ToastNotification } from '@/components/home/ToastNotification';
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
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
        visible: false,
        message: '',
        type: 'success'
    });

    const { width } = useWindowDimensions();
    // ... rest of the code for dimensions ...
    const numColumns = width > 768 ? 4 : 2;
    const cardGap = 8;
    const listPadding = 16;
    const cardWidth = (width - (listPadding * 2) - ((numColumns - 1) * cardGap)) / numColumns;

    const [userCountry, setUserCountry] = useState('US');
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [isDetectingCurrency, setIsDetectingCurrency] = useState(true);

    const CURRENCY_MAP: Record<string, string> = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };

    const UPI_COUNTRIES = ['IN'];

    // Load initial data and Detect Global Context
    useEffect(() => {
        if (user) {
            const economy = (user.unsafeMetadata.economy as EconomyData) || { balance: 0, streak: 1 };
            const userInventory = (user.unsafeMetadata.inventory as Inventory) || {};
            setBalance(economy.balance || 0);
            setStreak(economy.streak || 1);
            setInventory(userInventory);
        }

        const detectGlobalContext = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();

                if (data.country) {
                    setUserCountry(data.country);
                }

                if (data.currency && CURRENCY_MAP[data.currency]) {
                    setSelectedCurrency(data.currency);
                } else if (data.country === 'IN') {
                    setSelectedCurrency('INR');
                } else {
                    // Fallback to Timezone heuristic for India if API fails specific details
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const isIndiaTz = tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('Asia/Mumbai');
                    setSelectedCurrency(isIndiaTz ? 'INR' : 'USD');
                }
            } catch (err) {
                console.warn('Location detection failed, defaulting to USD', err);
                setSelectedCurrency('USD');
            } finally {
                setIsDetectingCurrency(false);
            }
        };

        detectGlobalContext();
    }, [user?.id, user?.unsafeMetadata]);

    const handleBuyItem = (item: ShopItem) => {
        if (!user) {
            setModalConfig({
                title: 'Sign In Required',
                message: 'You must be signed in to purchase items. Please log in to your account.'
            });
            setModals(prev => ({ ...prev, error: true }));
            setToast({ visible: true, message: 'Please sign in to buy items', type: 'error' });
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

        const symbol = selectedCurrency === 'INR' ? '₹' : '$';
        const displayPrice = selectedCurrency === 'INR' && item.currency === 'usd'
            ? Math.round(item.price * 83)
            : item.price.toFixed(2);

        setPendingItem(item);
        setModalConfig({
            title: 'Confirm Purchase',
            message: item.currency === 'usd'
                ? `Buy "${item.name}" for ${symbol}${displayPrice}?`
                : `Would you like to buy "${item.name}" for ${item.price} Dex Coins?`
        });
        setModals(prev => ({ ...prev, confirm: true }));
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const finalizePurchase = async () => {
        if (!user || !pendingItem || isProcessing) return;

        const item = pendingItem;

        // USD Purchase via Razorpay
        if (item.currency === 'usd') {
            setIsProcessing(true);
            try {
                // 1. Create Order via Netlify Function
                const finalAmount = selectedCurrency === 'INR' ? Math.round(item.price * 83) : item.price;
                const orderResponse = await fetch('/.netlify/functions/create-order', {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: finalAmount,
                        currency: selectedCurrency === 'INR' ? 'INR' : 'USD'
                    })
                });

                if (!orderResponse.ok) {
                    throw new Error('Failed to create secure order');
                }

                const order = await orderResponse.json();

                const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
                if (!rzpKey) {
                    throw new Error('Razorpay Key is missing.');
                }

                // 2. Open Razorpay Checkout with Order ID
                const options = {
                    key: rzpKey,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'PokeDex Plus Plus',
                    description: `Purchase ${item.name}`,
                    image: coinIcon,
                    order_id: order.id, // THE SECURE ORDER ID FROM SERVER
                    handler: async function () {
                        // On success, update metadata
                        try {
                            const currentMetadata = user.unsafeMetadata;
                            const latestEconomy = (currentMetadata.economy as EconomyData) || { balance: 0, streak: 1 };
                            const latestInventory = (currentMetadata.inventory as Inventory) || {};

                            const newBalance = latestEconomy.balance + (item.rewardAmount || 0);
                            const newInventory = { ...latestInventory, [item.id]: (latestInventory[item.id] || 0) + 1 };

                            await user.update({
                                unsafeMetadata: {
                                    ...user.unsafeMetadata,
                                    economy: { ...latestEconomy, balance: newBalance },
                                    inventory: newInventory
                                }
                            });

                            setBalance(newBalance);
                            setInventory(newInventory);
                            setModals(prev => ({ ...prev, confirm: false }));
                            setToast({ visible: true, message: `Successfully purchased ${item.name}!`, type: 'success' });
                        } catch (err) {
                            console.error('Failed to update balance after payment', err);
                        } finally {
                            setIsProcessing(false);
                            setPendingItem(null);
                        }
                    },
                    prefill: {
                        name: user.fullName || '',
                        email: user.primaryEmailAddress?.emailAddress || '',
                    },
                    theme: { color: '#6366f1' },
                    modal: {
                        ondismiss: function () {
                            setIsProcessing(false);
                        }
                    },
                    method: {
                        netbanking: true,
                        card: true,
                        upi: UPI_COUNTRIES.includes(userCountry),
                        wallet: false,
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } catch (err: any) {
                console.error('Payment Error:', err);
                setModalConfig({ title: 'Payment Error', message: err.message || 'Something went wrong.' });
                setModals(m => ({ ...m, error: true, confirm: false }));
                setIsProcessing(false);
            }
            return;
        }

        // Standard Coin Purchase
        setIsProcessing(true);
        try {
            const currentMetadata = user.unsafeMetadata;
            const latestEconomy = (currentMetadata.economy as EconomyData) || { balance: 0, streak: 1 };
            const latestInventory = (currentMetadata.inventory as Inventory) || {};

            if (latestEconomy.balance < item.price) {
                setModalConfig({
                    title: 'Insufficient Coins',
                    message: `Your balance updated. You need ${item.price - latestEconomy.balance} more Dex Coins.`
                });
                setModals(prev => ({ ...prev, insufficient: true, confirm: false }));
                return;
            }

            const newBalance = latestEconomy.balance - item.price;
            const newInventory = { ...latestInventory, [item.id]: (latestInventory[item.id] || 0) + 1 };

            await user.update({
                unsafeMetadata: {
                    ...currentMetadata,
                    economy: { ...latestEconomy, balance: newBalance },
                    inventory: newInventory
                }
            });

            setBalance(newBalance);
            setInventory(newInventory);
            setModals(prev => ({ ...prev, confirm: false }));
            setToast({ visible: true, message: `Purchased ${item.name} for ${item.price} coins!`, type: 'success' });
        } catch (error) {
            console.error('Purchase failed', error);
            setModalConfig({
                title: 'Purchase Failed',
                message: 'Something went wrong during the transaction. Please try again.'
            });
            setModals(prev => ({ ...prev, error: true, confirm: false }));
            setToast({ visible: true, message: 'Transaction failed. Please try again.', type: 'error' });
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

    const currencySymbol = CURRENCY_MAP[selectedCurrency] || '$';

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            {/* ... header ... */}
            <View style={[styles.header, isDark && styles.headerDark]}>
                <Pressable onPress={() => navigate('/')} style={styles.backButton}>
                    <Ionicons name="home" size={24} color={isDark ? "#fff" : "#333"} />
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
                            selectedCurrency={selectedCurrency}
                            currencySymbol={currencySymbol}
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
                item={pendingItem}
                selectedCurrency={selectedCurrency}
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
            <ToastNotification
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, visible: false }))}
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
