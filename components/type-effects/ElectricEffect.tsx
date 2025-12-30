import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const STREAK_COUNT = 8;

const streaks = Array.from({ length: STREAK_COUNT }, (_, i) => ({
    id: i,
    x1: Math.random() * width,
    y1: Math.random() * HERO_HEIGHT,
    x2: Math.random() * width,
    y2: Math.random() * HERO_HEIGHT,
    delay: Math.random() * 3000,
}));

function ElectricStreak({ streak }: { streak: typeof streaks[0] }) {
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Frequent flashes
        opacity.value = withDelay(
            streak.delay,
            withRepeat(
                withSequence(
                    withTiming(0.4, { duration: 80 }),
                    withTiming(0.2, { duration: 100 }),
                    withTiming(0.5, { duration: 80 }),
                    withTiming(0, { duration: 150 }),
                    withTiming(0, { duration: 3000 })
                ),
                -1
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={width} height={HERO_HEIGHT}>
                <Line
                    x1={streak.x1}
                    y1={streak.y1}
                    x2={streak.x2}
                    y2={streak.y2}
                    stroke="#F7D02C"
                    strokeWidth={1.5}
                    opacity={0.8}
                />
            </Svg>
        </Animated.View>
    );
}

export default function ElectricEffect() {
    return (
        <>
            {streaks.map((streak) => (
                <ElectricStreak key={streak.id} streak={streak} />
            ))}
        </>
    );
}
