import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
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

const SmokeParticle = ({ delay }: { delay: number }) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);

    useEffect(() => {
        translateY.value = withRepeat(
            withDelay(
                delay,
                withTiming(-150, { duration: 4000, easing: Easing.linear })
            ),
            -1,
            false
        );

        translateX.value = withRepeat(
            withDelay(
                delay,
                withSequence(
                    withTiming(20, { duration: 2000, easing: Easing.sin }),
                    withTiming(-20, { duration: 2000, easing: Easing.sin })
                )
            ),
            -1,
            false
        );

        opacity.value = withRepeat(
            withDelay(
                delay,
                withSequence(
                    withTiming(0.6, { duration: 1000 }),
                    withTiming(0, { duration: 3000 })
                )
            ),
            -1,
            false
        );

        scale.value = withRepeat(
            withDelay(
                delay,
                withTiming(2, { duration: 4000 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scale.value }
        ],
        opacity: opacity.value,
    }));

    // Random starting position
    const left = `${Math.random() * 80 + 10}%`;
    const bottom = `${Math.random() * 20}%`;

    return (
        <Animated.View
            style={[
                styles.particle,
                { left: left as any, bottom: bottom as any },
                animatedStyle,
            ]}
        />
    );
};

export const GhostlyMistEffect = () => {
    // Create multiple particles
    const particles = Array.from({ length: 8 }).map((_, i) => (
        <SmokeParticle key={i} delay={i * 500} />
    ));

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <ImageBackground
                source={require('@/assets/card-effects/ghostly-mist.jpg')}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Smoke Overlay */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {particles}
            </View>

            {/* Thick Purple Glow Border */}
            <GlowBorder color="#8A2BE2" borderWidth={4} />
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(200, 200, 230, 0.3)', // Whitish-purple smoke
        shadowColor: '#fff',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
});
