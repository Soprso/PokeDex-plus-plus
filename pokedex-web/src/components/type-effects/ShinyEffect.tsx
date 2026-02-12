import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const PARTICLE_COUNT = 12;
const HERO_HEIGHT = 450; // Approximate hero section height
const HERO_CENTER_X = width / 2;
const HERO_CENTER_Y = HERO_HEIGHT / 2;

// Generate sparkle particles around the Pokemon image area
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const radius = 80 + Math.random() * 60; // Distance from center
    return {
        id: i,
        x: HERO_CENTER_X + Math.cos(angle) * radius,
        y: HERO_CENTER_Y + Math.sin(angle) * radius,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 3000,
        duration: 1500 + Math.random() * 1000,
    };
});

function ShinySparkle({ particle }: { particle: typeof particles[0] }) {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        // Sparkle appears, grows, then fades out
        opacity.value = withDelay(
            particle.delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: particle.duration * 0.3, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: particle.duration * 0.4 }),
                    withTiming(0, { duration: particle.duration * 0.3, easing: Easing.in(Easing.ease) })
                ),
                -1
            )
        );

        // Scale pulse
        scale.value = withDelay(
            particle.delay,
            withRepeat(
                withSequence(
                    withTiming(1.2, { duration: particle.duration * 0.3, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: particle.duration * 0.4 }),
                    withTiming(0, { duration: particle.duration * 0.3 })
                ),
                -1
            )
        );

        // Gentle rotation
        rotate.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(360, {
                    duration: particle.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: particle.x },
            { translateY: particle.y },
            { scale: scale.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    // 4-pointed star sparkle
    const starPath = `
        M ${particle.size} 0
        L ${particle.size * 1.15} ${particle.size * 0.85}
        L ${particle.size * 2} ${particle.size}
        L ${particle.size * 1.15} ${particle.size * 1.15}
        L ${particle.size} ${particle.size * 2}
        L ${particle.size * 0.85} ${particle.size * 1.15}
        L 0 ${particle.size}
        L ${particle.size * 0.85} ${particle.size * 0.85}
        Z
    `;

    // Random sparkle colors (gold, white, light blue for shiny effect)
    const colors = ['#FFD700', '#FFFFFF', '#87CEEB', '#FFA500'];
    const color = colors[particle.id % colors.length];

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={particle.size * 2} height={particle.size * 2}>
                <Path d={starPath} fill={color} opacity={0.9} />
            </Svg>
        </Animated.View>
    );
}

export default function ShinyEffect() {
    return (
        <>
            {particles.map((particle) => (
                <ShinySparkle key={particle.id} particle={particle} />
            ))}
        </>
    );
}
