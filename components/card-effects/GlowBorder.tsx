import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

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
