import { Ionicons } from '@expo/vector-icons';
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

const BACKGROUND_IMAGE = require('@/assets/card-effects/extra-love.jpg');

const HeartParticle = ({ delay, xPos, scale }: { delay: number; xPos: DimensionValue; scale: number }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withDelay(
                delay,
                withTiming(-200, { duration: 3000, easing: Easing.out(Easing.quad) })
            ),
            -1,
            false
        );

        opacity.value = withRepeat(
            withDelay(
                delay,
                withSequence(
                    withTiming(1, { duration: 500 }),
                    withTiming(0, { duration: 2500 })
                )
            ),
            -1,
            false
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { scale }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.particle, { left: xPos }, style]}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
        </Animated.View>
    );
};

const HeartParticles = () => {
    // Generate static random config
    const particles = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 2000,
            xPos: `${10 + Math.random() * 80}%` as DimensionValue, // 10% to 90%
            scale: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
        }));
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((p) => (
                <HeartParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const ExtraLoveEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />
            {/* Overlay to dim it slightly if needed, or blend */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 105, 180, 0.1)' }]} />

            {/* Thick Pink Glow */}
            <GlowBorder color="#FF69B4" borderWidth={4} cornerRadius={16} />

            {/* Particles */}
            <HeartParticles />
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        bottom: 0,
    },
});
