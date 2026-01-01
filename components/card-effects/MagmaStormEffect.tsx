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
import { GlowBorder } from './index';

const BACKGROUND_IMAGE = require('@/assets/card-effects/magma-storm.jpg');

const FireFlake = ({ delay, xPos, scale, duration }: { delay: number; xPos: DimensionValue; scale: number; duration: number }) => {
    const translateY = useSharedValue(20); // Start slightly below visual area if bottom is 0
    const opacity = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        // Rise up
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-400, { duration: duration, easing: Easing.linear }),
                -1,
                false
            )
        );

        // Fade in/out
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 200 }), // Fast fade to full opacity
                    withTiming(0.6, { duration: duration - 500 }),
                    withTiming(0, { duration: 300 })
                ),
                -1,
                false
            )
        );

        // Rotate
        rotate.value = withDelay(
            delay,
            withRepeat(
                withTiming(360, { duration: duration * 0.8, easing: Easing.linear }),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale },
            { rotate: `${rotate.value}deg` }
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.particle, { left: xPos }, style]}>
            {/* Thinner, flake-like shape using a custom View */}
            <View style={{ width: 3, height: 7, backgroundColor: '#FFD700', borderRadius: 1 }} />
        </Animated.View>
    );
};

const FireParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 1500,
            xPos: `${5 + Math.random() * 90}%` as DimensionValue,
            scale: 0.4 + Math.random() * 0.5,
            duration: 2000 + Math.random() * 1500,
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
            {particles.map((p) => (
                <FireFlake key={p.id} {...p} />
            ))}
        </View>
    );
};

export const MagmaStormEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Red/Orange Tint - Subtle */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 69, 0, 0.15)' }]} />

            {/* Rising Fire Particles */}
            <FireParticles />

            {/* Red Glowing Animated Border */}
            <GlowBorder color="#FF4500" borderWidth={3} cornerRadius={16} />
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        bottom: -10, // Start just below the bottom edge
    },
});
