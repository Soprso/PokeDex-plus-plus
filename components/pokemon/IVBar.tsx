import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface IVBarProps {
    value: number; // 0-15
    label: string;
    showValue?: boolean;
}

export default function IVBar({ value, label, showValue = true }: IVBarProps) {
    // Determine color based on value
    const getColor = (val: number) => {
        if (val >= 13) return '#4CAF50'; // Green: 13-15
        if (val >= 6) return '#FF9800'; // Yellow/Orange: 6-12 (Using Orange for better contrast)
        return '#FF3B30'; // Red: 0-5
    };

    const color = getColor(value);
    const percentage = (value / 15) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {showValue && <Text style={styles.value}>{value} / 15</Text>}
            </View>
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: color
                        }
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 12,
        fontWeight: '700',
        color: '#333',
    },
    barBackground: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
});
