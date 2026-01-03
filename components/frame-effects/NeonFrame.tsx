import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

export const NeonFrame = () => {
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: pulse.value,
        shadowOpacity: pulse.value * 0.5 + 0.3
    }));

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="none">
            <Animated.View style={[styles.border, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    border: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 4,
        borderColor: '#00FF00', // Neon Green
        borderRadius: 24,
        shadowColor: '#00FF00',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        elevation: 8,
        backgroundColor: 'transparent'
    }
});
