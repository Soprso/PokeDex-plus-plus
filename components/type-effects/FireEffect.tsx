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
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const PARTICLE_COUNT = 15;
const HERO_HEIGHT = 450; // Approximate hero section height

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: HERO_HEIGHT + Math.random() * 50,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 2000,
    duration: 6000 + Math.random() * 4000,
}));

function FireParticle({ particle }: { particle: typeof particles[0] }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Upward drift
        translateY.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(-HERO_HEIGHT - 100, {
                    duration: particle.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        // Flicker opacity
        opacity.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(0.3 + Math.random() * 0.2, {
                    duration: 800 + Math.random() * 1200,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        // Gentle scale pulse
        scale.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(1.3, {
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: particle.x },
            { translateY: particle.y + translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    // Fire flake shape - resembles a flame with pointed tips
    const fireFlakePath = `
        M ${particle.size} 0
        C ${particle.size * 0.6} ${particle.size * 0.3}, ${particle.size * 0.3} ${particle.size * 0.6}, 0 ${particle.size}
        C ${particle.size * 0.3} ${particle.size * 1.4}, ${particle.size * 0.6} ${particle.size * 1.7}, ${particle.size} ${particle.size * 2}
        C ${particle.size * 1.4} ${particle.size * 1.7}, ${particle.size * 1.7} ${particle.size * 1.4}, ${particle.size * 2} ${particle.size}
        C ${particle.size * 1.7} ${particle.size * 0.6}, ${particle.size * 1.4} ${particle.size * 0.3}, ${particle.size} 0
        Z
    `;

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={particle.size * 2} height={particle.size * 2}>
                <Path
                    d={fireFlakePath}
                    fill="#EE8130"
                    opacity={0.7}
                />
            </Svg>
        </Animated.View>
    );
}

export default function FireEffect() {
    return (
        <>
            {particles.map((particle) => (
                <FireParticle key={particle.id} particle={particle} />
            ))}
        </>
    );
}
