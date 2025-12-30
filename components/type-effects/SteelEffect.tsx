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
import Svg, { Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const GLINT_COUNT = 15;

const glints = Array.from({ length: GLINT_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * HERO_HEIGHT,
    length: 10 + Math.random() * 20,
    angle: Math.random() * 180 - 90,
    delay: Math.random() * 2500,
    duration: 8000 + Math.random() * 8000,
}));

function SteelGlint({ glint }: { glint: typeof glints[0] }) {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        opacity.value = withDelay(
            glint.delay,
            withRepeat(
                withTiming(0.35, {
                    duration: glint.duration,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        scale.value = withDelay(
            glint.delay,
            withRepeat(
                withTiming(1.5, {
                    duration: glint.duration / 2,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: glint.x },
            { translateY: glint.y },
            { rotate: `${glint.angle}deg` },
            { scaleX: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={glint.length} height={2}>
                <Line x1={0} y1={1} x2={glint.length} y2={1} stroke="#B7B7CE" strokeWidth={1.5} opacity={0.6} />
            </Svg>
        </Animated.View>
    );
}

export default function SteelEffect() {
    return (
        <>
            {glints.map((glint) => (
                <SteelGlint key={glint.id} glint={glint} />
            ))}
        </>
    );
}
