import { Ionicons } from '@/components/native/Icons';
import { SHOP_ITEMS, type ShopItem } from '@/constants/shopItems';
import type { Inventory } from '@/types';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface CardStyleModalProps {
    visible: boolean;
    onClose: () => void;
    nickname: string;
    onNicknameChange: (text: string) => void;
    onSaveNickname: () => void;
    pokemonName: string;
    pokemonId: number;
    darkMode: boolean;
    inventory: Inventory;
    unlockedEffects: string[];
    unlockedFrames: string[];
    activeEffect: string;
    activeFrame: string;
    onApplyStyle: (type: 'effect' | 'frame', itemId: string) => void;
    onGoToShop: () => void;
}

type TabType = 'nickname' | 'effects' | 'frames';

export function CardStyleModal({
    visible,
    onClose,
    nickname,
    onNicknameChange,
    onSaveNickname,
    pokemonName,
    pokemonId,
    darkMode,
    inventory,
    unlockedEffects,
    unlockedFrames,
    activeEffect,
    activeFrame,
    onApplyStyle,
    onGoToShop
}: CardStyleModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('nickname');

    const effects = SHOP_ITEMS.filter(item => item.type === 'effect');
    const frames = SHOP_ITEMS.filter(item => item.type === 'frame');

    const renderItem = (item: ShopItem, type: 'effect' | 'frame') => {
        const isUnlocked = type === 'effect'
            ? unlockedEffects.includes(item.id)
            : unlockedFrames.includes(item.id);
        const isActive = type === 'effect'
            ? activeEffect === item.id
            : activeFrame === item.id;
        const count = inventory[item.id] || 0;
        const canUnlock = count > 0;

        return (
            <Pressable
                key={item.id}
                style={[
                    styles.itemCard,
                    darkMode && styles.itemCardDark,
                    isActive && styles.itemCardActive
                ]}
                onPress={() => {
                    if (isUnlocked || item.price === 0) {
                        onApplyStyle(type, item.id);
                    } else if (canUnlock) {
                        onApplyStyle(type, item.id); // Trigger unlock logic in parent
                    } else {
                        onGoToShop();
                        onClose();
                    }
                }}
            >
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, darkMode && styles.textDark]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    {isActive && <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />}
                </View>

                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.itemFooter}>
                    {isUnlocked || item.price === 0 ? (
                        <View style={styles.unlockedBadge}>
                            <Text style={styles.unlockedText}>Permanent</Text>
                        </View>
                    ) : (
                        <View style={[styles.countBadge, !canUnlock && styles.emptyBadge]}>
                            <Text style={styles.countText}>
                                {canUnlock ? `${count} Available` : 'Need to Buy'}
                            </Text>
                        </View>
                    )}
                </View>
            </Pressable>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>
                            Customize {pokemonName}
                        </Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={darkMode ? '#fff' : '#333'} />
                        </Pressable>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabBar}>
                        {(['nickname', 'effects', 'frames'] as const).map((tab) => (
                            <Pressable
                                key={tab}
                                style={[
                                    styles.tab,
                                    activeTab === tab && styles.tabActive
                                ]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    activeTab === tab && styles.tabTextActive,
                                    darkMode && activeTab !== tab && styles.tabTextDark
                                ]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {activeTab === 'nickname' && (
                                <View style={styles.tabContent}>
                                    <View style={styles.inputContainer}>
                                        <Text style={[styles.label, darkMode && styles.textDark]}>Pokemon Nickname</Text>
                                        <TextInput
                                            style={[styles.input, darkMode && styles.inputDark]}
                                            value={nickname}
                                            onChangeText={onNicknameChange}
                                            placeholder={`Enter nickname for ${pokemonName}`}
                                            placeholderTextColor={darkMode ? '#999' : '#666'}
                                            autoFocus
                                        />
                                    </View>
                                    <Pressable style={styles.saveButton} onPress={onSaveNickname}>
                                        <Text style={styles.saveButtonText}>Save Nickname</Text>
                                    </Pressable>
                                </View>
                            )}

                            {activeTab === 'effects' && (
                                <View style={styles.itemsGrid}>
                                    <Pressable
                                        style={[
                                            styles.itemCard,
                                            darkMode && styles.itemCardDark,
                                            activeEffect === 'none' && styles.itemCardActive
                                        ]}
                                        onPress={() => onApplyStyle('effect', 'default')}
                                    >
                                        <Text style={[styles.itemName, darkMode && styles.textDark]}>None</Text>
                                        <Text style={styles.itemDescription}>Remove all card effects.</Text>
                                    </Pressable>
                                    {effects.map(effect => renderItem(effect, 'effect'))}
                                </View>
                            )}

                            {activeTab === 'frames' && (
                                <View style={styles.itemsGrid}>
                                    <Pressable
                                        style={[
                                            styles.itemCard,
                                            darkMode && styles.itemCardDark,
                                            activeFrame === 'none' && styles.itemCardActive
                                        ]}
                                        onPress={() => onApplyStyle('frame', 'default')}
                                    >
                                        <Text style={[styles.itemName, darkMode && styles.textDark]}>None</Text>
                                        <Text style={styles.itemDescription}>Remove the card frame.</Text>
                                    </Pressable>
                                    {frames.map(frame => renderItem(frame, 'frame'))}
                                </View>
                            )}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        width: '100%',
        maxWidth: 600,
        height: '80%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalContentDark: {
        backgroundColor: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    modalTitleDark: {
        color: '#fff',
    },
    closeButton: {
        padding: 4,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        paddingVertical: 16,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#6366f1',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    tabTextDark: {
        color: '#999',
    },
    tabTextActive: {
        color: '#6366f1',
    },
    scrollContent: {
        padding: 24,
    },
    tabContent: {
        gap: 24,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginLeft: 4,
    },
    textDark: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#eee',
    },
    inputDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    itemsGrid: {
        gap: 12,
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#f0f0f0',
        gap: 4,
    },
    itemCardDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
    },
    itemCardActive: {
        borderColor: '#6366f1',
        backgroundColor: '#f5f7ff',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    itemDescription: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
    itemFooter: {
        marginTop: 8,
        flexDirection: 'row',
    },
    unlockedBadge: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    unlockedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
    },
    countBadge: {
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    emptyBadge: {
        backgroundColor: '#fff1f2',
    },
    countText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0284c7',
    },
});
