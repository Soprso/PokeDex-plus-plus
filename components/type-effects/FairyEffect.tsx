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
import Svg, { Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const SPARKLE_COUNT = 12;

const sparkles = Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: HERO_HEIGHT + Math.random() * 50,
    size: 3 + Math.random() * 4,
    delay: Math.random() * 2500,
    duration: 9000 + Math.random() * 10000,
}));

function FairySparkle({ sparkle }: { sparkle: typeof sparkles[0] }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            sparkle.delay,
            withRepeat(
                withTiming(-HERO_HEIGHT - 100, {
                    duration: sparkle.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        opacity.value = withDelay(
            sparkle.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        rotate.value = withDelay(
            sparkle.delay,
            withRepeat(
                withTiming(360, {
                    duration: sparkle.duration / 2,
                    easing: Easing.linear,
                }),
                -1
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: sparkle.x },
            { translateY: sparkle.y + translateY.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    // 4-pointed star
    const starPoints = `${sparkle.size},0 ${sparkle.size * 0.6},${sparkle.size * 0.6} 0,${sparkle.size} ${sparkle.size * 0.6},${sparkle.size * 1.4} ${sparkle.size},${sparkle.size * 2} ${sparkle.size * 1.4},${sparkle.size * 1.4} ${sparkle.size * 2},${sparkle.size} ${sparkle.size * 1.4},${sparkle.size * 0.6}`;

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={sparkle.size * 2} height={sparkle.size * 2}>
                <Polygon points={starPoints} fill="#D685AD" opacity={0.6} />
            </Svg>
        </Animated.View>
    );
}

export default function FairyEffect() {
    return (
        <>
            {sparkles.map((sparkle) => (
                <FairySparkle key={sparkle.id} sparkle={sparkle} />
            ))}
        </>
    );
}
