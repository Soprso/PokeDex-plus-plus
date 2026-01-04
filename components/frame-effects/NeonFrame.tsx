import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

export const NeonFrame = () => {
    const glowOpacity = useSharedValue(0.3);
    const borderColor = useSharedValue('#39FF14'); // Neon Green

    useEffect(() => {
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }), // Faster pulse up
                withTiming(0.2, { duration: 800 }) // Deep fade out
            ),
            -1, // Infinite repeat
            true // Reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            borderColor: borderColor.value,
            shadowOpacity: glowOpacity.value,
            shadowRadius: glowOpacity.value * 15 + 5, // Increased radius
            borderWidth: 2 + (glowOpacity.value * 1), // Subtle width pulse
        };
    });

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="none">
            {/* Outer Glowing Border */}
            <Animated.View style={[styles.outerBorder, animatedStyle]} />

            {/* Corner Accents */}
            <Corner style={{ top: -2, left: -2 }} />
            <Corner style={{ top: -2, right: -2, transform: [{ rotate: '90deg' }] }} />
            <Corner style={{ bottom: -2, right: -2, transform: [{ rotate: '180deg' }] }} />
            <Corner style={{ bottom: -2, left: -2, transform: [{ rotate: '270deg' }] }} />
        </View>
    );
};

const Corner = ({ style }: { style: any }) => (
    <View style={[styles.cornerContainer, style]}>
        <View style={styles.cornerLineH} />
        <View style={styles.cornerLineV} />
    </View>
);

const NEON_GREEN = '#39FF14';

const styles = StyleSheet.create({
    outerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderRadius: 16,
        margin: 0,
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10, // For Android
        backgroundColor: 'transparent'
    },
    cornerContainer: {
        position: 'absolute',
        width: 16,
        height: 16,
    },
    cornerLineH: {
        position: 'absolute',
        top: 0, left: 0,
        width: 16, height: 2,
        backgroundColor: NEON_GREEN,
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5
    },
    cornerLineV: {
        position: 'absolute',
        top: 0, left: 0,
        width: 2, height: 16,
        backgroundColor: NEON_GREEN,
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5
    }
});
