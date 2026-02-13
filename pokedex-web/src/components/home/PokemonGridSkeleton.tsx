import React from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SkeletonCard } from './SkeletonCard';

interface PokemonGridSkeletonProps {
    darkMode?: boolean;
}

export const PokemonGridSkeleton: React.FC<PokemonGridSkeletonProps> = ({ darkMode }) => {
    const { width } = useWindowDimensions();
    // Match logic from PokemonGrid.tsx
    const numColumns = width > 768 ? 4 : 2;
    const cardGap = 8;
    const listPadding = 16;
    const cardWidth = (width - (listPadding * 2) - ((numColumns - 1) * cardGap)) / numColumns;

    // Generate 12 skeleton items
    const data = Array.from({ length: 12 }, (_, i) => i);

    const renderItem = () => (
        <SkeletonCard width={cardWidth} darkMode={darkMode} />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => `skeleton-${item}`}
                numColumns={numColumns}
                key={`skeleton-${numColumns}`} // Force re-render on column change
                contentContainerStyle={[styles.listContent, { padding: listPadding }]}
                columnWrapperStyle={{ gap: cardGap }}
                removeClippedSubviews={Platform.OS === 'android'}
                scrollEnabled={false} // Disable scroll while loading if you prefer
                style={{ flex: 1 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Ensure background exists
        width: '100%',
    },
    listContent: {
        paddingBottom: 100,
        flexGrow: 1,
    },
});
