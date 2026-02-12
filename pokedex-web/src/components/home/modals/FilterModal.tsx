import { Ionicons } from '@/components/native/Icons';
import type { PokemonType } from '@/constants/pokemonTypes';
import { POKEMON_TYPES, TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemonTypes';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    selectedTypes: PokemonType[];
    onToggleType: (type: PokemonType) => void;
    onClear: () => void;
    onApply: () => void;
    darkMode: boolean;
}

export function FilterModal({ visible, onClose, selectedTypes, onToggleType, onClear, onApply, darkMode }: FilterModalProps) {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    <View style={styles.header}>
                        <Ionicons name="filter" size={22} color="#333" style={styles.headerIcon} />
                        <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Filter by Type</Text>
                    </View>
                    <ScrollView style={styles.filterScroll}>
                        <View style={[styles.typeGrid, isDesktop && styles.typeGridDesktop]}>
                            {POKEMON_TYPES.map((type) => (
                                <Pressable
                                    key={type}
                                    style={({ pressed }) => [
                                        styles.typeFilterButton,
                                        isDesktop && styles.typeFilterButtonDesktop,
                                        { backgroundColor: TYPE_COLORS[type] },
                                        selectedTypes.includes(type) && styles.typeFilterButtonActive,
                                        pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
                                    ]}
                                    onPress={() => onToggleType(type)}
                                >
                                    <Image source={TYPE_ICONS[type]} style={styles.typeIcon} />
                                    <Text style={styles.typeFilterText}>{type}</Text>
                                    {selectedTypes.includes(type) && (
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.typeCheckmark} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                    <View style={styles.filterActions}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.filterClearButton,
                                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={onClear}
                        >
                            <Text style={styles.filterClearText}>Clear All</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.filterApplyButton,
                                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={onApply}
                        >
                            <Text style={styles.filterApplyText}>Apply</Text>
                        </Pressable>
                    </View>
                    <Pressable
                        style={({ pressed }) => [
                            styles.modalClose,
                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                        ]}
                        onPress={onClose}
                    >
                        <Text style={styles.modalCloseText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '65%',
    },
    modalContentDark: {
        backgroundColor: '#222',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    headerIcon: {
        marginTop: 2,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
    modalTitleDark: {
        color: '#fff',
    },
    filterScroll: {
        flex: 1,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        paddingBottom: 20,
    },
    typeGridDesktop: {
        flexDirection: 'row', // Or column based if needed, staying simpler for now
    },
    typeFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: '45%',
        gap: 8,
    },
    typeFilterButtonDesktop: {
        minWidth: '30%',
    },
    typeFilterButtonActive: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    typeIcon: {
        width: 24,
        height: 24,
    },
    typeFilterText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'capitalize',
        flex: 1,
    },
    typeCheckmark: {
        marginLeft: 4,
    },
    filterActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        marginTop: 12,
    },
    filterClearButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    filterClearText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    filterApplyButton: {
        flex: 2,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        alignItems: 'center',
    },
    filterApplyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    modalClose: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
});
