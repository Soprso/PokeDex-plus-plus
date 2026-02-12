import { useEffect } from 'react';
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

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const WAVE_COUNT = 6;

const waves = Array.from({ length: WAVE_COUNT }, (_, i) => ({
    id: i,
    x: width / 2,
    y: HERO_HEIGHT / 2,
    delay: i * 3000,
    duration: 18000,
}));

function FightingWave({ wave }: { wave: typeof waves[0] }) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(
            wave.delay,
            withRepeat(
                withTiming(3, {
                    duration: wave.duration,
                    easing: Easing.out(Easing.ease),
                }),
                -1
            )
        );

        opacity.value = withDelay(
            wave.delay,
            withRepeat(
                withTiming(0, {
                    duration: wave.duration,
                    easing: Easing.out(Easing.ease),
                }),
                -1
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: wave.x }, { translateY: wave.y }, { scale: scale.value }],
        opacity: 0.25 - opacity.value * 0.25,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={200} height={200}>
                <Circle cx={100} cy={100} r={100} fill="none" stroke="#C22E28" strokeWidth={2} opacity={0.4} />
            </Svg>
        </Animated.View>
    );
}

export default function FightingEffect() {
    return (
        <>
            {waves.map((wave) => (
                <FightingWave key={wave.id} wave={wave} />
            ))}
        </>
    );
}
