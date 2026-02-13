import { Ionicons } from '@/components/native/Icons';
import { REGIONS } from '@/constants/regions';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

    // Sync local state with prop (for external changes like "Clear All")
    React.useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    // Debounce the search change
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
                {/* Search Row */}
                <View style={styles.searchRow}>
                    {/* Search Input */}
                    <View style={[styles.searchContainer, darkMode && styles.searchContainerDark]}>
                        <Ionicons name="search" size={20} color={darkMode ? '#aaa' : '#666'} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, darkMode && styles.searchInputDark]}
                            placeholder="Search Pokémon, ID, or Nickname..."
                            placeholderTextColor={darkMode ? '#aaa' : '#999'}
                            value={localSearchQuery}
                            onChangeText={setLocalSearchQuery}
                        />
                        {localSearchQuery.length > 0 && (
                            <Pressable onPress={() => {
                                setLocalSearchQuery('');
                                onSearchChange('');
                            }} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={18} color={darkMode ? '#aaa' : '#ccc'} />
                            </Pressable>
                        )}
                    </View>

                    {/* Clear All Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.clearAllButton,
                            darkMode && styles.clearAllButtonDark,
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={onClearAll}
                    >
                        <Ionicons name="refresh" size={18} color={darkMode ? '#fff' : '#333'} style={styles.clearAllIcon} />
                        <Text style={[styles.clearAllText, darkMode && styles.clearAllTextDark]}>Clear All</Text>
                    </Pressable>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingBottom: 20,
        paddingTop: 15,
        marginBottom: 10,
        backgroundColor: 'transparent',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 1000, // Aligns both search and regions
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12, // Gap between search and clear all
    },
    searchContainer: {
        flex: 1, // Take remaining space
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12, // Matches region buttons
        paddingHorizontal: 24, // Matches region buttons horizontal padding
        height: 50, // Taller, premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, // Softer shadow
        shadowRadius: 8,
        elevation: 4,
        width: '100%', // Take full width of wrapper
    },
    clearAllButton: {
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    clearAllButtonDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
    },
    clearAllIcon: {
        marginRight: 8,
    },
    clearAllText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    clearAllTextDark: {
        color: '#fff',
    },
    searchContainerDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        height: '100%',
        outlineStyle: 'none',
    } as any,
    searchInputDark: {
        color: '#fff',
    },
    clearButton: {
        padding: 4,
        opacity: 0.6,
    },
    regionScroll: {
        maxHeight: 60,
        width: '100%', // Full width
    },
    regionList: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        gap: 20, // More space between chips
    },
    regionChip: {
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
    regionChipDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
    },
    regionChipActive: {
        backgroundColor: '#6366f1', // Primary brand color
        borderColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    regionText: {
        fontSize: 14,
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
