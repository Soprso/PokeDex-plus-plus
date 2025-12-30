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
const FOG_COUNT = 8;

const fogs = Array.from({ length: FOG_COUNT }, (_, i) => ({
    id: i,
    x: -200,
    y: Math.random() * HERO_HEIGHT,
    width: 100 + Math.random() * 150,
    height: 40 + Math.random() * 40,
    delay: Math.random() * 3000,
    duration: 25000 + Math.random() * 15000,
}));

function GhostFog({ fog }: { fog: typeof fogs[0] }) {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(
            fog.delay,
            withRepeat(
                withTiming(width + 200, {
                    duration: fog.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        opacity.value = withDelay(
            fog.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: 8000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: fog.x + translateX.value }, { translateY: fog.y }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={fog.width} height={fog.height}>
                <Ellipse
                    cx={fog.width / 2}
                    cy={fog.height / 2}
                    rx={fog.width / 2}
                    ry={fog.height / 2}
                    fill="#705898"
                    opacity={0.2}
                />
            </Svg>
        </Animated.View>
    );
}

export default function GhostEffect() {
    return (
        <>
            {fogs.map((fog) => (
                <GhostFog key={fog.id} fog={fog} />
            ))}
        </>
    );
}
