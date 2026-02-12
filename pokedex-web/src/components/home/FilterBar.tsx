import { Ionicons } from '@/components/native/Icons';
import { REGIONS } from '@/constants/regions';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    selectedRegionIndex: number;
    onRegionSelect: (index: number) => void;
    darkMode: boolean;
}

export function FilterBar({ searchQuery, onSearchChange, selectedRegionIndex, onRegionSelect, darkMode }: FilterBarProps) {
    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={[styles.searchContainer, darkMode && styles.searchContainerDark]}>
                <Ionicons name="search" size={20} color={darkMode ? '#aaa' : '#666'} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, darkMode && styles.searchInputDark]}
                    placeholder="Search Pokémon, ID, or Nickname..."
                    placeholderTextColor={darkMode ? '#aaa' : '#999'}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => onSearchChange('')} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={18} color={darkMode ? '#aaa' : '#ccc'} />
                    </Pressable>
                )}
            </View>

            {/* Region Selector */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.regionList}
                style={styles.regionScroll}
            >
                {REGIONS.map((region, index) => (
                    <Pressable
                        key={region.name}
                        style={[
                            styles.regionChip,
                            darkMode && styles.regionChipDark,
                            selectedRegionIndex === index && styles.regionChipActive
                        ]}
                        onPress={() => onRegionSelect(index)}
                    >
                        <Text style={[
                            styles.regionText,
                            darkMode && styles.regionTextDark,
                            selectedRegionIndex === index && styles.regionTextActive
                        ]}>
                            {region.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 12,
    },
    searchContainerDark: {
        backgroundColor: '#333',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
        outlineStyle: 'none', // Remove web outline
    } as any, // outlineStyle is web only
    searchInputDark: {
        color: '#fff',
    },
    clearButton: {
        padding: 4,
    },
    regionScroll: {
        flexGrow: 0,
    },
    regionList: {
        gap: 8,
        paddingRight: 16,
    },
    regionChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    regionChipDark: {
        backgroundColor: '#333',
    },
    regionChipActive: {
        backgroundColor: '#6366f1', // Indigo
    },
    regionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    regionTextDark: {
        color: '#ccc',
    },
    regionTextActive: {
        color: '#fff',
    },
});
