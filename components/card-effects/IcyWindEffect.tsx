import { Ionicons } from '@/components/native/Icons';
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

import BACKGROUND_IMAGE from '@/assets/card-effects/icy-wind.jpg';

const IceParticle = ({ delay, xPos, scale, duration }: { delay: number; xPos: DimensionValue; scale: number; duration: number }) => {
    const translateY = useSharedValue(-20);
    const opacity = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withDelay(
                delay,
                withTiming(300, { duration: duration, easing: Easing.linear }) // Fall down
            ),
            -1,
            false
        );

        opacity.value = withRepeat(
            withDelay(
                delay,
                withSequence(
                    withTiming(1, { duration: 500 }),
                    withTiming(0.8, { duration: duration - 1000 }),
                    withTiming(0, { duration: 500 })
                )
            ),
            -1,
            false
        );

        rotate.value = withRepeat(
            withDelay(
                delay,
                withTiming(360, { duration: duration, easing: Easing.linear })
            ),
            -1,
            false
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
            <Ionicons name="snow" size={14} color="#A5F2F3" />
        </Animated.View>
    );
};

const IceParticles = () => {
    // Generate static random config
    const particles = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 3000,
            xPos: `${Math.random() * 100}%` as DimensionValue,
            scale: 0.5 + Math.random() * 0.8, // 0.5 to 1.3
            duration: 3000 + Math.random() * 2000, // 3s to 5s fall time
        }));
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((p) => (
                <IceParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const IcyWindEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Overlay to blend */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(165, 242, 243, 0.2)' }]} />

            {/* Glowing Border - Ice Blue */}
            <GlowBorder color="#A5F2F3" borderWidth={3} cornerRadius={16} />

            {/* Falling Ice Particles */}
            <IceParticles />
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        top: -20, // Start slightly above
    },
});
