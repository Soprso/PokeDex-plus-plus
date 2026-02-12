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


    return (
        <ScrollView contentContainerStyle={contentContainerStyle} style={style} horizontal={horizontal} {...props}>
            {ListHeaderComponent}
            {renderContent()}
            {ListFooterComponent}
        </ScrollView>
    );
}
