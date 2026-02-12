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
const PARTICLE_COUNT = 18;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: -50,
    y: Math.random() * HERO_HEIGHT,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 2500,
    duration: 10000 + Math.random() * 10000,
}));

function GroundParticle({ particle }: { particle: typeof particles[0] }) {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(width + 50, {
                    duration: particle.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        opacity.value = withDelay(
            particle.delay,
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
        transform: [{ translateX: particle.x + translateX.value }, { translateY: particle.y }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={particle.size * 2} height={particle.size * 2}>
                <Circle
                    cx={particle.size}
                    cy={particle.size}
                    r={particle.size}
                    fill="#E2BF65"
                    opacity={0.3}
                />
            </Svg>
        </Animated.View>
    );
}

export default function GroundEffect() {
    return (
        <>
            {particles.map((particle) => (
                <GroundParticle key={particle.id} particle={particle} />
            ))}
        </>
    );
}
