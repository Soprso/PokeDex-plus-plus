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
const BUBBLE_COUNT = 20;

const bubbles = Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: HERO_HEIGHT + Math.random() * 50,
    size: 3 + Math.random() * 6,
    delay: Math.random() * 2000,
    duration: 8000 + Math.random() * 6000,
    wobbleAmount: 20 + Math.random() * 35,
}));

function WaterBubble({ bubble }: { bubble: typeof bubbles[0] }) {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Upward drift
        translateY.value = withDelay(
            bubble.delay,
            withRepeat(
                withTiming(-HERO_HEIGHT - 100, {
                    duration: bubble.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        // Horizontal wobble
        translateX.value = withDelay(
            bubble.delay,
            withRepeat(
                withTiming(bubble.wobbleAmount, {
                    duration: 3000 + Math.random() * 2000,
                    easing: Easing.inOut(Easing.sin),
                }),
                -1,
                true
            )
        );

        // Fade in/out
        opacity.value = withDelay(
            bubble.delay,
            withRepeat(
                withTiming(0.25 + Math.random() * 0.15, {
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        // Gentle scale pulse
        scale.value = withDelay(
            bubble.delay,
            withRepeat(
                withTiming(1.2, {
                    duration: 2500,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: bubble.x + translateX.value },
            { translateY: bubble.y + translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={bubble.size * 2} height={bubble.size * 2}>
                <Circle
                    cx={bubble.size}
                    cy={bubble.size}
                    r={bubble.size}
                    fill="#6390F0"
                    opacity={0.8}
                />
            </Svg>
        </Animated.View>
    );
}

export default function WaterEffect() {
    return (
        <>
            {bubbles.map((bubble) => (
                <WaterBubble key={bubble.id} bubble={bubble} />
            ))}
        </>
    );
}
