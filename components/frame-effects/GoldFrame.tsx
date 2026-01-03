import React from 'react';
import { StyleSheet, View } from 'react-native';

export const GoldFrame = () => {
    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="none">
            {/* Outer Gold Border */}
            <View style={styles.outerBorder} />

            {/* Inner Gold Border */}
            <View style={styles.innerBorder} />

            {/* Corner Ornaments */}
            <Corner style={{ top: -2, left: -2 }} />
            <Corner style={{ top: -2, right: -2, transform: [{ rotate: '90deg' }] }} />
            <Corner style={{ bottom: -2, right: -2, transform: [{ rotate: '180deg' }] }} />
            <Corner style={{ bottom: -2, left: -2, transform: [{ rotate: '270deg' }] }} />
        </View>
    );
};

const Corner = ({ style }: { style: any }) => (
    <View style={[styles.cornerContainer, style]}>
        {/* Main Outer Fancy Corner */}
        <View style={styles.cornerMain} />
        {/* Inner Detail */}
        <View style={styles.cornerInner} />
        {/* Decorative Gem/Dot */}
        <View style={styles.cornerGem} />
        {/* Accents */}
        <View style={styles.cornerAccentH} />
        <View style={styles.cornerAccentV} />
    </View>
);

const GOLD_COLOR = '#FFD700'; // Gold
const DARK_GOLD = '#B8860B'; // DarkGoldenRod
const LIGHT_GOLD = '#FDB931'; // Light Gold

const styles = StyleSheet.create({
    outerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: GOLD_COLOR,
        borderRadius: 12,
        margin: 1,
    },
    innerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: DARK_GOLD,
        borderRadius: 10,
        margin: 5,
        opacity: 0.6
    },
    cornerContainer: {
        position: 'absolute',
        width: 28,
        height: 28,
    },
    cornerMain: {
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: GOLD_COLOR,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
    },
    cornerInner: {
        position: 'absolute',
        top: 5, left: 5,
        width: '70%', height: '70%',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: LIGHT_GOLD,
        borderTopLeftRadius: 4,
    },
    cornerGem: {
        position: 'absolute',
        top: 0, left: 0,
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: GOLD_COLOR,
        borderWidth: 1,
        borderColor: '#FFF',
        transform: [{ translateX: -2 }, { translateY: -2 }], // Center on corner
        zIndex: 10
    },
    cornerAccentH: {
        position: 'absolute',
        top: 10, right: 0,
        width: 8, height: 2,
        backgroundColor: GOLD_COLOR,
        borderRadius: 1
    },
    cornerAccentV: {
        position: 'absolute',
        bottom: 0, left: 10,
        width: 2, height: 8,
        backgroundColor: GOLD_COLOR,
        borderRadius: 1
    }
});
