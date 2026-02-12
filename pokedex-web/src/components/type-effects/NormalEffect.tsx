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
const PARTICLE_COUNT = 15;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * HERO_HEIGHT,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 3000,
    duration: 20000 + Math.random() * 15000,
}));

function NormalParticle({ particle }: { particle: typeof particles[0] }) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: particle.duration,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        translateY.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(20, {
                    duration: particle.duration,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: particle.x }, { translateY: particle.y + translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={particle.size * 2} height={particle.size * 2}>
                <Circle cx={particle.size} cy={particle.size} r={particle.size} fill="#A8A77A" opacity={0.2} />
            </Svg>
        </Animated.View>
    );
}

export default function NormalEffect() {
    return (
        <>
            {particles.map((particle) => (
                <NormalParticle key={particle.id} particle={particle} />
            ))}
        </>
    );
}
