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
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const DOT_COUNT = 18;

const dots = Array.from({ length: DOT_COUNT }, (_, i) => ({
    id: i,
    startX: Math.random() * width,
    startY: Math.random() * height,
    size: 3 + Math.random() * 4,
    delay: Math.random() * 2000,
    duration: 10000 + Math.random() * 8000,
    pathRadius: 20 + Math.random() * 30,
}));

function BugDot({ dot }: { dot: typeof dots[0] }) {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(
            dot.delay,
            withRepeat(
                withTiming(1, {
                    duration: dot.duration,
                    easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
                }),
                -1
            )
        );

        opacity.value = withDelay(
            dot.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const angle = progress.value * Math.PI * 4;
        const x = dot.startX + Math.sin(angle) * dot.pathRadius;
        const y = dot.startY + Math.cos(angle) * dot.pathRadius;

        return {
            transform: [{ translateX: x }, { translateY: y }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={dot.size * 2} height={dot.size * 2}>
                <Circle cx={dot.size} cy={dot.size} r={dot.size} fill="#A6B91A" opacity={0.5} />
            </Svg>
        </Animated.View>
    );
}

export default function BugEffect() {
    return (
        <>
            {dots.map((dot) => (
                <BugDot key={dot.id} dot={dot} />
            ))}
        </>
    );
}
