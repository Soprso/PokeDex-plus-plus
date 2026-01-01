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

const BACKGROUND_IMAGE = require('@/assets/card-effects/bubble-beam.jpg');

// Aqua and Blue shades for bubbles
const BUBBLE_COLORS = ['#00FFFF', '#E0FFFF', '#87CEEB', '#ADD8E6', 'rgba(255, 255, 255, 0.6)'];

const BubbleParticle = ({ delay, xPos, scale, duration, color }: { delay: number; xPos: DimensionValue; scale: number; duration: number; color: string }) => {
    const translateY = useSharedValue(20); // Start slightly below bottom? OR map to container height. 
    // Wait, particles usually absolute positioned. Let's assume bottom 0 start or similar.
    // For rising bubbles, we often want them to start at bottom and go up.
    // Let's use top relative positioning or bottom. 
    // In React Native absolute, 'top: 100%' is below the view.

    // Let's use a similar approach to MagmaStorm but reverse direction or just explicit Y values.
    // Magma starts at bottom and goes up.

    const yVal = useSharedValue(400); // Start below
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Rise up
        yVal.value = withDelay(
            delay,
            withRepeat(
                withTiming(-50, { duration: duration, easing: Easing.linear }), // Go above top
                -1,
                false
            )
        );

        // Wobble (sine waveish)
        translateX.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(10, { duration: duration / 4, easing: Easing.inOut(Easing.sin) }),
                    withTiming(-10, { duration: duration / 4, easing: Easing.inOut(Easing.sin) }),
                    withTiming(10, { duration: duration / 4, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: duration / 4, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                false
            )
        );

        // Fade in/out
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: duration * 0.2 }),
                    withTiming(0.8, { duration: duration * 0.6 }),
                    withTiming(0, { duration: duration * 0.2 })
                ),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: yVal.value },
            { translateX: translateX.value },
            { scale }
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.View style={[styles.particle, { left: xPos, borderColor: color, width: styles.particle.width * scale, height: styles.particle.height * scale, borderRadius: (styles.particle.width * scale) / 2 }, style]}>
            <View style={styles.bubbleShine} />
        </Animated.View>
    );
};

const BubbleParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 3000,
            xPos: `${Math.random() * 100}%` as DimensionValue,
            scale: 0.4 + Math.random() * 0.6,
            duration: 3000 + Math.random() * 2000,
            color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]} pointerEvents="none">
            {particles.map((p) => (
                <BubbleParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const BubbleBeamEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Bubble Particles */}
            <BubbleParticles />

            {/* Glowing Border */}
            <GlowBorder color="#00FFFF" borderWidth={2} />
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        top: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassy fill
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2, // Subtle glow
        shadowRadius: 2,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    bubbleShine: {
        width: '30%',
        height: '30%',
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginTop: '15%',
        marginRight: '15%',
    }
});
