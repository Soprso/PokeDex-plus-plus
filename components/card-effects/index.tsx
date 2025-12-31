import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

// Animated wrapper for LinearGradient explicitly for Reanimated usage if needed, 
// but wrapping it in an Animated.View is standard.
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface GlowBorderProps {
    color: string;
    borderWidth: number;
    cornerRadius?: number;
}

export const GlowBorder: React.FC<GlowBorderProps> = ({ color, borderWidth, cornerRadius = 12 }) => {
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0.5, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        borderColor: color,
    }));

    // We render an absolute overlay that provides the glowing border
    // This sits on top of the card content but under the click handler if properly positioned
    // Actually best to be a sibling or wrapper. Being absolute inside the card works well.
    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                {
                    borderWidth: borderWidth,
                    borderColor: color,
                    borderRadius: cornerRadius,
                    zIndex: 1, // Ensure it's visible on top of card content
                },
                animatedStyle,
            ]}
            pointerEvents="none"
        />
    );
};

interface ShineOverlayProps {
    color?: string; // e.g. 'rgba(255, 215, 0, 0.4)'
    duration?: number;
}

export const ShineOverlay: React.FC<ShineOverlayProps> = ({ color = 'rgba(255, 255, 255, 0.3)', duration = 3000 }) => {
    const translateX = useSharedValue(-100);

    useEffect(() => {
        translateX.value = withRepeat(
            withDelay(
                1000,
                withTiming(200, { duration: duration, easing: Easing.linear })
            ),
            -1, // Infinite
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: `${translateX.value}%` }],
    }));

    return (
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12, zIndex: 2 }]} pointerEvents="none">
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        width: '100%', // Full width of container
                        height: '100%',
                    },
                    animatedStyle
                ]}
            >
                <LinearGradient
                    colors={['transparent', color, 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{
                        width: '50%', // The beam width
                        height: '100%',
                        transform: [{ skewX: '-20deg' }]
                    }}
                />
            </Animated.View>
        </View>
    );
};
export * from './ExtraLoveEffect';
