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
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const STREAK_COUNT = 10;

const streaks = Array.from({ length: STREAK_COUNT }, (_, i) => ({
    id: i,
    startX: Math.random() * width,
    startY: Math.random() * height,
    length: 80 + Math.random() * 120,
    angle: Math.random() * 360,
    delay: Math.random() * 3000,
    duration: 20000 + Math.random() * 15000,
}));

function DragonStreak({ streak }: { streak: typeof streaks[0] }) {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(
            streak.delay,
            withRepeat(
                withTiming(1, {
                    duration: streak.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        opacity.value = withDelay(
            streak.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: 6000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const angleRad = (streak.angle * Math.PI) / 180;
        const x = streak.startX + Math.cos(angleRad) * streak.length * progress.value;
        const y = streak.startY + Math.sin(angleRad) * streak.length * progress.value;

        return {
            transform: [{ translateX: x }, { translateY: y }],
            opacity: opacity.value,
        };
    });

    const path = `M 0 0 Q ${streak.length / 2} ${-streak.length / 4} ${streak.length} 0`;

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={streak.length} height={streak.length / 2}>
                <Path d={path} stroke="#6F35FC" strokeWidth={2} fill="none" opacity={0.4} />
            </Svg>
        </Animated.View>
    );
}

export default function DragonEffect() {
    return (
        <>
            {streaks.map((streak) => (
                <DragonStreak key={streak.id} streak={streak} />
            ))}
        </>
    );
}
