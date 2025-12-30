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

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const PARTICLE_COUNT = 18;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: -50,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 2800,
    duration: 18000 + Math.random() * 12000,
}));

function RockParticle({ particle }: { particle: typeof particles[0] }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(HERO_HEIGHT + 50, {
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
                    duration: 6000,
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
                <Circle
                    cx={particle.size}
                    cy={particle.size}
                    r={particle.size}
                    fill="#B6A136"
                    opacity={0.3}
                />
            </Svg>
        </Animated.View>
    );
}

export default function RockEffect() {
    return (
        <>
            {particles.map((particle) => (
                <RockParticle key={particle.id} particle={particle} />
            ))}
        </>
    );
}
