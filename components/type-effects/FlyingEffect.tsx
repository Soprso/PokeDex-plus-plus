import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const STREAK_COUNT = 12;

const streaks = Array.from({ length: STREAK_COUNT }, (_, i) => ({
    id: i,
    x: -100,
    y: Math.random() * HERO_HEIGHT,
    width: 40 + Math.random() * 60,
    height: 3 + Math.random() * 2,
    delay: Math.random() * 2500,
    duration: 18000 + Math.random() * 10000,
}));

function FlyingStreak({ streak }: { streak: typeof streaks[0] }) {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(
            streak.delay,
            withRepeat(
                withTiming(width + 100, {
                    duration: streak.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        opacity.value = withDelay(
            streak.delay,
            withRepeat(
                withTiming(0.25 + Math.random() * 0.25, {
                    duration: 5000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: streak.x + translateX.value }, { translateY: streak.y }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={streak.width} height={streak.height * 2}>
                <Ellipse
                    cx={streak.width / 2}
                    cy={streak.height}
                    rx={streak.width / 2}
                    ry={streak.height}
                    fill="#A98FF3"
                    opacity={0.4}
                />
            </Svg>
        </Animated.View>
    );
}

export default function FlyingEffect() {
    return (
        <>
            {streaks.map((streak) => (
                <FlyingStreak key={streak.id} streak={streak} />
            ))}
        </>
    );
}
