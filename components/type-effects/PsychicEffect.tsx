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

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const PARTICLE_COUNT = 15;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: width / 2 + (Math.random() - 0.5) * width * 0.8,
    y: HERO_HEIGHT / 2 + (Math.random() - 0.5) * HERO_HEIGHT * 0.8,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 2000,
    duration: 10000 + Math.random() * 8000,
    radius: 30 + Math.random() * 50,
}));

function PsychicOrb({ particle }: { particle: typeof particles[0] }) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const angle = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(1.5, {
                    duration: particle.duration,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        opacity.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: particle.duration / 2,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        angle.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(360, {
                    duration: particle.duration * 3,
                    easing: Easing.linear,
                }),
                -1
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const angleRad = (angle.value * Math.PI) / 180;
        const x = particle.x + Math.cos(angleRad) * particle.radius;
        const y = particle.y + Math.sin(angleRad) * particle.radius;

        return {
            transform: [{ translateX: x }, { translateY: y }, { scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={particle.size * 2} height={particle.size * 2}>
                <Circle
                    cx={particle.size}
                    cy={particle.size}
                    r={particle.size}
                    fill="#F95587"
                    opacity={0.5}
                />
            </Svg>
        </Animated.View>
    );
}

export default function PsychicEffect() {
    return (
        <>
            {particles.map((particle) => (
                <PsychicOrb key={particle.id} particle={particle} />
            ))}
        </>
    );
}
