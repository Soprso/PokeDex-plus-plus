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
import { GlowBorder } from './GlowBorder';

const BACKGROUND_IMAGE = require('@/assets/card-effects/frenzy-plant.jpg');

// Green shades for leaves
const LEAF_COLORS = ['#4CAF50', '#2E7D32', '#66BB6A', '#81C784', '#1B5E20'];

const LeafParticle = ({ delay, xPos, scale, duration, color }: { delay: number; xPos: DimensionValue; scale: number; duration: number; color: string }) => {
    const translateY = useSharedValue(-20);
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Fall down
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(400, { duration: duration, easing: Easing.linear }),
                -1,
                false
            )
        );

        // Swaying motion (side to side)
        translateX.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(15, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
                    withTiming(-15, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );

        // Rotation (spiraling leaf)
        rotate.value = withDelay(
            delay,
            withRepeat(
                withTiming(360, { duration: duration * 0.8, easing: Easing.linear }),
                -1,
                false
            )
        );

        // Fade in/out
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: duration * 0.1 }),
                    withTiming(1, { duration: duration * 0.8 }),
                    withTiming(0, { duration: duration * 0.1 })
                ),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale },
            { rotate: `${rotate.value}deg` }
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.View style={[styles.particle, { left: xPos }, style]}>
            <Ionicons name="leaf" size={12} color={color} />
        </Animated.View>
    );
};

const LeafParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 3000,
            xPos: `${Math.random() * 100}%` as DimensionValue,
            scale: 0.5 + Math.random() * 0.5,
            duration: 4000 + Math.random() * 2000, // Slower fall for leaves
            color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]} pointerEvents="none">
            {particles.map((p) => (
                <LeafParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const FrenzyPlantEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Leaf Particles */}
            <LeafParticles />

            {/* Glowing Border */}
            <GlowBorder color="#4CAF50" borderWidth={2} />
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        top: -20,
    },
});
