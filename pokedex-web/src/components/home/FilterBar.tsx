import { Ionicons } from '@/components/native/Icons';
import { REGIONS } from '@/constants/regions';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    selectedRegionIndex: number;
    onRegionSelect: (index: number) => void;
    onClearAll: () => void;
    darkMode: boolean;
}

export function FilterBar({ searchQuery, onSearchChange, selectedRegionIndex, onRegionSelect, onClearAll, darkMode }: FilterBarProps) {
    const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);

    React.useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearchQuery !== searchQuery) {
                onSearchChange(localSearchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearchQuery, onSearchChange, searchQuery]);

    return (
        <View style={styles.container}>
            <View style={styles.contentWrapper}>
                <View style={styles.searchRow}>
                    <View style={[styles.searchContainer, darkMode && styles.searchContainerDark]}>
                        <Ionicons name="search" size={18} color={darkMode ? '#aaa' : '#666'} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, darkMode && styles.searchInputDark]}
                            placeholder="Search Pokémon..."
                            placeholderTextColor={darkMode ? '#aaa' : '#999'}
                            value={localSearchQuery}
                            onChangeText={setLocalSearchQuery}
                        />
                        {localSearchQuery.length > 0 && (
                            <Pressable onPress={() => { setLocalSearchQuery(''); onSearchChange(''); }} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={16} color={darkMode ? '#aaa' : '#ccc'} />
                            </Pressable>
                        )}
                    </View>

                    <Pressable
                        style={[styles.clearAllButton, darkMode && styles.clearAllButtonDark]}
                        onPress={onClearAll}
                    >
                        <Text style={[styles.clearAllText, darkMode && styles.clearAllTextDark]}>Clear</Text>
                    </Pressable>
                </View>

                <View style={styles.regionList}>
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
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    searchContainerDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        height: '100%',
        outlineStyle: 'none',
    } as any,
    searchInputDark: {
        color: '#fff',
    },
    clearButton: {
        padding: 2,
    },
    clearAllButton: {
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 12,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    clearAllButtonDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
    },
    clearAllText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    clearAllTextDark: {
        color: '#aaa',
    },
    regionList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    regionChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
    },
    regionChipDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
    },
    regionChipActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    regionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    regionTextDark: {
        color: '#aaa',
    },
    regionTextActive: {
        color: '#fff',
    },
});
