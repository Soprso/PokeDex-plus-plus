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
const PARTICLE_COUNT = 12;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: -50 + Math.random() * (width + 100),
    y: Math.random() * HERO_HEIGHT,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 3000,
    duration: 8000 + Math.random() * 5000,
    angle: Math.random() * 30 + 30, // 30-60 degrees
}));

function GrassParticle({ particle }: { particle: typeof particles[0] }) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const distance = width + 200;
        const angleRad = (particle.angle * Math.PI) / 180;
        const dx = distance * Math.cos(angleRad);
        const dy = -distance * Math.sin(angleRad);

        // Diagonal drift
        translateX.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(dx, {
                    duration: particle.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        translateY.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(dy, {
                    duration: particle.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        // Subtle rotation
        rotate.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(360, {
                    duration: particle.duration * 2,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        // Opacity
        opacity.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(0.2 + Math.random() * 0.15, {
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: particle.x + translateX.value },
            { translateY: particle.y + translateY.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={particle.size * 2} height={particle.size * 2}>
                <Circle
                    cx={particle.size}
                    cy={particle.size}
                    r={particle.size}
                    fill="#7AC74C"
                    opacity={0.5}
                />
            </Svg>
        </Animated.View>
    );
}

export default function GrassEffect() {
    return (
        <>
            {particles.map((particle) => (
                <GrassParticle key={particle.id} particle={particle} />
            ))}
        </>
    );
}
