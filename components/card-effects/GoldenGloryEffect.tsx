import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { DimensionValue, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { ShineOverlay } from './index';

const BACKGROUND_IMAGE = require('@/assets/card-effects/golden-glory.jpg');

const CONFETTI_COLORS = ['#FFD700', '#C0C0C0', '#FF6B6B', '#4ECDC4', '#A8E6CF']; // Gold, Silver, Red, Teal, Mint

const ConfettiParticle = ({ delay, xPos, scale, duration, color }: { delay: number; xPos: DimensionValue; scale: number; duration: number; color: string }) => {
    const translateY = useSharedValue(-20);
    const rotateZ = useSharedValue(0);

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


        rotateZ.value = withDelay(
            delay,
            withRepeat(
                withTiming(360, { duration: duration, easing: Easing.linear }),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale },
            { rotateZ: `${rotateZ.value}deg` }
        ],
    }));

    return (
        <Animated.View style={[styles.particle, { left: xPos, backgroundColor: color }, style]} />
    );
};

const ConfettiParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 3000,
            xPos: `${Math.random() * 100}%` as DimensionValue,
            scale: 0.6 + Math.random() * 0.4,
            duration: 3000 + Math.random() * 2000,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]} pointerEvents="none">
            {particles.map((p) => (
                <ConfettiParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

const CornerDecoration = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
    const getContainerStyle = () => {
        switch (position) {
            // Position at 0 to prevent clipping (overflow: hidden on parent)
            case 'top-left': return { top: 0, left: 0 };
            case 'top-right': return { top: 0, right: 0 };
            case 'bottom-right': return { bottom: 0, right: 0 };
            case 'bottom-left': return { bottom: 0, left: 0 };
        }
    };

    return (
        <View style={[styles.cornerGemContainer, getContainerStyle()]}>
            {/* Rotated Diamond Background */}
            <View style={styles.cornerGem} />
            {/* Center Detail */}
            <View style={styles.cornerGemCenter}>
                <Ionicons name="diamond" size={8} color="#FFF" />
            </View>
        </View>
    );
};

export const GoldenGloryEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Confetti Particles */}
            <ConfettiParticles />

            {/* Golden Frame Design */}
            {/* Outer Border */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        borderWidth: 3,
                        borderColor: '#DAA520', // Consistent Dark Gold
                        borderRadius: 12,
                        zIndex: 10
                    }
                ]}
                pointerEvents="none"
            >
                {/* Inner Border with spacing */}
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            margin: 3, // Spacing between borders
                            borderWidth: 1.5,
                            borderColor: '#FFD700', // Consistent Bright Gold
                            borderRadius: 8
                        }
                    ]}
                />
            </View>

            {/* Corner Decorations - Overlay on Frame */}
            <View style={[StyleSheet.absoluteFill, { zIndex: 15 }]} pointerEvents="none">
                <CornerDecoration position="top-left" />
                <CornerDecoration position="top-right" />
                <CornerDecoration position="bottom-left" />
                <CornerDecoration position="bottom-right" />
            </View>

            {/* Shine Animation - Topmost */}
            <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]} pointerEvents="none">
                <ShineOverlay color="rgba(255, 223, 0, 0.3)" duration={2500} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        top: -20,
        width: 6,
        height: 6,
        borderRadius: 2,
    },
    cornerGemContainer: {
        position: 'absolute',
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    cornerGem: {
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: '#DAA520', // Dark Gold base
        transform: [{ rotate: '45deg' }],
        borderWidth: 1,
        borderColor: '#FFD700', // Bright Gold edge
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    cornerGemCenter: {
        zIndex: 21,
        // Ensure icon is centered
    }
});
