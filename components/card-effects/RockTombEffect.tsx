import React, { useEffect, useMemo } from 'react';
import { DimensionValue, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const BACKGROUND_IMAGE = require('@/assets/card-effects/rock-tomb.jpg');

const SAND_COLORS = ['#D2B48C', '#F4A460', '#C2B280', '#DAA520'];

interface SandParticleProps {
    delay: number;
    yPos: DimensionValue;
    size: number;
    duration: number;
    color: string;
}

const SandParticle = ({ delay, yPos, size, duration, color }: SandParticleProps) => {
    const translateX = useSharedValue(-10);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(
            delay,
            withRepeat(
                withTiming(120, { duration: duration, easing: Easing.linear }), // Move from -10% to 120% (across screen)
                -1,
                false
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: duration * 0.1 }),
                    withDelay(duration * 0.8, withTiming(0, { duration: duration * 0.1 }))
                ),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: withTiming(translateX.value, { duration: 0 }) }, // Use translateX.value directly mapped to % or px? 
            // Reanimated handles numbers as units, usually px. Percentage strings need parsing or different handling.
            // Let's use percentage string in style if supported, or mapped value.
            // Actually, for simple flow, let's just use absolute positioning and left property for simplicity or interpolate.
            // But translateX is better for performance.
            // Let's assume the parent width is around 100-200px. 
            // Let's just animate 'left' property if we want exact % control easily, or use a large enough translateX value.
        ],
        // Let's try direct style mapping for left/transform
    }));

    // Better Approach for continuous flow:
    // Animate from left: -10% to left: 110%
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: duration, easing: Easing.linear }),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            left: `${progress.value * 120 - 10}%`, // -10% to 110%
            opacity: 1, // Keep visible
        };
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                { top: yPos, width: size, height: size, backgroundColor: color },
                animatedStyle
            ]}
        />
    );
};

const SandStorm = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 5000,
            yPos: `${Math.random() * 100}%` as DimensionValue,
            size: 1 + Math.random() * 0.3, // 1-3px (Dust like)
            duration: 3000 + Math.random() * 2000, // 3-5s
            color: SAND_COLORS[Math.floor(Math.random() * SAND_COLORS.length)],
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]} pointerEvents="none">
            {particles.map((p) => (
                <SandParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const RockTombEffect = () => {
    // Border Pulse Animation
    const borderOpacity = useSharedValue(0.6);

    useEffect(() => {
        borderOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0.6, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const borderStyle = useAnimatedStyle(() => ({
        opacity: borderOpacity.value,
        borderColor: '#8B4513', // SaddleBrown
    }));

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Darker Overlay to make particles pop */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />

            {/* Sand Particles */}
            <SandStorm />

            {/* Rock Animated Border */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    styles.border,
                    borderStyle
                ]}
                pointerEvents="none"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        borderRadius: 1, // Slightly rounded squares
    },
    border: {
        borderWidth: 4,
        borderRadius: 12,
        zIndex: 10,
    },
});
