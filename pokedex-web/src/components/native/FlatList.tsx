import React from 'react';
import { ScrollView } from './ScrollView';
import { View } from './View';

export interface FlatListProps<T> {
    data: T[];
    renderItem: (info: { item: T; index: number }) => React.ReactNode;
    keyExtractor: (item: T, index: number) => string;
    ListHeaderComponent?: React.ReactNode;
    ListFooterComponent?: React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    contentContainerStyle?: any;
    style?: any;
    numColumns?: number;
    horizontal?: boolean;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    columnWrapperStyle?: any;
    onEndReached?: (info: { distanceFromEnd: number }) => void;
    onEndReachedThreshold?: number;
    removeClippedSubviews?: boolean; // Add for compatibility
    initialNumToRender?: number; // Add for compatibility
    maxToRenderPerBatch?: number; // Add for compatibility
    windowSize?: number; // Add for compatibility
    refreshing?: boolean; // Add for compatibility
    onRefresh?: () => void; // Add for compatibility
}

export function FlatList<T>({
    data,
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    contentContainerStyle,
    style,
    numColumns = 1,
    horizontal,
    columnWrapperStyle,
    onEndReached,
    onEndReachedThreshold,
    ...props
}: FlatListProps<T>) {

    // ScrollView handles style flattening
    if (!data || data.length === 0) {
        return (
            <ScrollView contentContainerStyle={contentContainerStyle} style={style} horizontal={horizontal} {...props}>
                {ListHeaderComponent}
                {ListEmptyComponent}
                {ListFooterComponent}
            </ScrollView>
        );
    }

    const renderContent = () => {
        if (numColumns > 1 && !horizontal) {
            const rows = [];
            for (let i = 0; i < data.length; i += numColumns) {
                const rowItems = data.slice(i, i + numColumns);
                rows.push(
                    <View key={`row-${i}`} style={[{ flexDirection: 'row' }, columnWrapperStyle]}>
                        {rowItems.map((item, index) => (
                            <React.Fragment key={keyExtractor(item, i + index)}>
                                {renderItem({ item, index: i + index })}
                            </React.Fragment>
                        ))}
                    </View>
                );
            }
            return rows;
        }

        return data.map((item, index) => (
            <React.Fragment key={keyExtractor(item, index)}>
                {renderItem({ item, index })}
            </React.Fragment>
        ));
    };


    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const threshold = (onEndReachedThreshold || 0.5) * clientHeight;

        // Check if we are near the bottom
        if (scrollHeight - scrollTop - clientHeight <= threshold) {
            onEndReached?.({ distanceFromEnd: scrollHeight - scrollTop - clientHeight });
        }

        // Pass through original onScroll if it exists
        (props as any).onScroll?.(e);
    };

    return (
        <ScrollView
            contentContainerStyle={contentContainerStyle}
            style={style}
            horizontal={horizontal}
            {...props}
            onScroll={handleScroll}
        >
            {ListHeaderComponent}
            {renderContent()}
            {ListFooterComponent}
        </ScrollView>
    );
}
