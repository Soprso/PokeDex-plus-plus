import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface ShineOverlayProps {
    color?: string; // e.g. 'rgba(255, 215, 0, 0.4)'
    duration?: number;
    diagonal?: boolean;
}

export const ShineOverlay: React.FC<ShineOverlayProps> = ({ color = 'rgba(255, 255, 255, 0.3)', duration = 3000, diagonal = false }) => {
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
        transform: [
            { translateX: `${translateX.value}%` },
            { rotate: diagonal ? '45deg' : '0deg' }
        ],
    }));

    return (
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12, zIndex: 2 }]} pointerEvents="none">
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        width: diagonal ? '200%' : '100%',
                        height: diagonal ? '200%' : '100%',
                        left: diagonal ? '-50%' : 0,
                        top: diagonal ? '-50%' : 0,
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
                        transform: [{ skewX: diagonal ? '0deg' : '-20deg' }] // Remove skew if rotated, let rotation handle angle
                    }}
                />
            </Animated.View>
        </View>
    );
};
