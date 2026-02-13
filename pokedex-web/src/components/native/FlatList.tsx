import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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

export const FlatList = forwardRef(<T extends any>(
    {
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
    }: FlatListProps<T>,
    ref: React.Ref<any>
) => {
    const scrollViewRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        scrollToIndex: ({ index, animated }: { index: number; animated?: boolean }) => {
            const node = scrollViewRef.current;
            if (node) {
                const itemWidth = node.clientWidth; // Simple assumption for a carousel
                node.scrollTo({
                    left: index * itemWidth,
                    behavior: animated ? 'smooth' : 'auto'
                });
            }
        },
        scrollToOffset: ({ offset, animated }: { offset: number; animated?: boolean }) => {
            scrollViewRef.current?.scrollTo({
                left: offset,
                behavior: animated ? 'smooth' : 'auto'
            });
        },
        getScrollableNode: () => scrollViewRef.current,
    }));

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
        const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientHeight, clientWidth } = e.currentTarget;

        // Normalize event for React Native compatibility
        const normalizedEvent = {
            nativeEvent: {
                contentOffset: {
                    x: scrollLeft,
                    y: scrollTop
                },
                contentSize: {
                    width: scrollWidth,
                    height: scrollHeight
                },
                layoutMeasurement: {
                    width: clientWidth,
                    height: clientHeight
                }
            },
            currentTarget: e.currentTarget,
            target: e.target
        };

        const threshold = (onEndReachedThreshold || 0.5) * (horizontal ? clientWidth : clientHeight);
        const scrollPos = horizontal ? scrollLeft : scrollTop;
        const dimension = horizontal ? clientWidth : clientHeight;
        const totalSize = horizontal ? scrollWidth : scrollHeight;

        if (totalSize - scrollPos - dimension <= threshold) {
            onEndReached?.({ distanceFromEnd: totalSize - scrollPos - dimension });
        }

        // Pass through normalized event
        (props as any).onScroll?.(normalizedEvent);
    };

    return (
        <ScrollView
            ref={scrollViewRef}
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
});
