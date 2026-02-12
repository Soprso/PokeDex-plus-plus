import { Ionicons } from '@/components/native/Icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'buddy-desc';

interface SortModalProps {
    visible: boolean;
    onClose: () => void;
    sortOption: SortOption;
    onSortSelect: (option: SortOption) => void;
    darkMode: boolean;
}

export function SortModal({ visible, onClose, sortOption, onSortSelect, darkMode }: SortModalProps) {
    // We can use ThemedModal or custom layout if we want to match exact styling.
    // Matching exact styling for now to be safe.

    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    <View style={styles.header}>
                        <Ionicons name="swap-vertical" size={22} color="#333" style={styles.headerIcon} />
                        <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Sort Pokémon</Text>
                    </View>
                    <View style={styles.sortOptions}>
                        <SortOptionButton
                            label="Pokédex Number ↑"
                            icon="arrow-up"
                            active={sortOption === 'id-asc'}
                            onPress={() => onSortSelect('id-asc')}
                            darkMode={darkMode}
                        />
                        <SortOptionButton
                            label="Pokédex Number ↓"
                            icon="arrow-down"
                            active={sortOption === 'id-desc'}
                            onPress={() => onSortSelect('id-desc')}
                            darkMode={darkMode}
                        />
                        <SortOptionButton
                            label="Name A → Z"
                            icon="text"
                            active={sortOption === 'name-asc'}
                            onPress={() => onSortSelect('name-asc')}
                            darkMode={darkMode}
                        />
                        <SortOptionButton
                            label="Name Z → A"
                            icon="text"
                            active={sortOption === 'name-desc'}
                            onPress={() => onSortSelect('name-desc')}
                            darkMode={darkMode}
                        />
                        <SortOptionButton
                            label="Buddy Level"
                            icon="heart"
                            active={sortOption === 'buddy-desc'}
                            onPress={() => onSortSelect('buddy-desc')}
                            darkMode={darkMode}
                        />
                    </View>
                    <Pressable
                        style={({ pressed }) => [
                            styles.modalClose,
                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                        ]}
                        onPress={onClose}
                    >
                        <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

function SortOptionButton({ label, icon, active, onPress, darkMode }: any) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.sortOption,
                active && styles.sortOptionActive,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
            ]}
            onPress={onPress}
        >
            <Ionicons name={icon} size={22} color={active ? '#2196F3' : '#666'} />
            <Text style={[styles.sortOptionText, active && styles.sortOptionTextActive]}>
                {label}
            </Text>
        </Pressable>
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
        maxHeight: '50%',
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
    sortOptions: {
        gap: 12,
        marginBottom: 24,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        gap: 12,
    },
    sortOptionActive: {
        backgroundColor: '#e3f2fd',
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    sortOptionText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    sortOptionTextActive: {
        color: '#2196F3',
        fontWeight: '700',
    },
    modalClose: {
        backgroundColor: '#f5f5f5',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
});
