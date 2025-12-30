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
const WISP_COUNT = 12;

const wisps = Array.from({ length: WISP_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * HERO_HEIGHT,
    width: 20 + Math.random() * 40,
    height: 15 + Math.random() * 25,
    delay: Math.random() * 2800,
    duration: 9000 + Math.random() * 10000,
}));

function DarkWisp({ wisp }: { wisp: typeof wisps[0] }) {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        opacity.value = withDelay(
            wisp.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: wisp.duration,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        scale.value = withDelay(
            wisp.delay,
            withRepeat(
                withTiming(1.2, {
                    duration: wisp.duration / 2,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: wisp.x }, { translateY: wisp.y }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={wisp.width} height={wisp.height}>
                <Ellipse
                    cx={wisp.width / 2}
                    cy={wisp.height / 2}
                    rx={wisp.width / 2}
                    ry={wisp.height / 2}
                    fill="#705746"
                    opacity={0.3}
                />
            </Svg>
        </Animated.View>
    );
}

export default function DarkEffect() {
    return (
        <>
            {wisps.map((wisp) => (
                <DarkWisp key={wisp.id} wisp={wisp} />
            ))}
        </>
    );
}
