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

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const PARTICLE_COUNT = 18;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: -50,
    size: 4 + Math.random() * 4,
    delay: Math.random() * 2500,
    duration: 10000 + Math.random() * 10000,
}));

function IceParticle({ particle }: { particle: typeof particles[0] }) {
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);
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

        opacity.value = withDelay(
            particle.delay,
            withRepeat(
                withTiming(0.25 + Math.random() * 0.25, {
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
            { translateX: particle.x },
            { translateY: particle.y + translateY.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    // Detailed ice crystal with hexagonal center and branches
    const size = particle.size;
    const center = size;

    // Hexagonal core
    const hexPath = `
        M ${center} ${center - size * 0.4}
        L ${center + size * 0.35} ${center - size * 0.2}
        L ${center + size * 0.35} ${center + size * 0.2}
        L ${center} ${center + size * 0.4}
        L ${center - size * 0.35} ${center + size * 0.2}
        L ${center - size * 0.35} ${center - size * 0.2}
        Z
    `;

    // Six main branches with crystalline tips
    const branchPaths = `
        M ${center} ${center - size * 0.4} L ${center} ${center - size}
        M ${center} ${center - size * 0.7} L ${center - size * 0.15} ${center - size * 0.85}
        M ${center} ${center - size * 0.7} L ${center + size * 0.15} ${center - size * 0.85}
        
        M ${center + size * 0.35} ${center - size * 0.2} L ${center + size * 0.87} ${center - size * 0.5}
        M ${center + size * 0.6} ${center - size * 0.35} L ${center + size * 0.75} ${center - size * 0.15}
        M ${center + size * 0.6} ${center - size * 0.35} L ${center + size * 0.8} ${center - size * 0.55}
        
        M ${center + size * 0.35} ${center + size * 0.2} L ${center + size * 0.87} ${center + size * 0.5}
        M ${center + size * 0.6} ${center + size * 0.35} L ${center + size * 0.75} ${center + size * 0.15}
        M ${center + size * 0.6} ${center + size * 0.35} L ${center + size * 0.8} ${center + size * 0.55}
        
        M ${center} ${center + size * 0.4} L ${center} ${center + size}
        M ${center} ${center + size * 0.7} L ${center - size * 0.15} ${center + size * 0.85}
        M ${center} ${center + size * 0.7} L ${center + size * 0.15} ${center + size * 0.85}
        
        M ${center - size * 0.35} ${center + size * 0.2} L ${center - size * 0.87} ${center + size * 0.5}
        M ${center - size * 0.6} ${center + size * 0.35} L ${center - size * 0.75} ${center + size * 0.15}
        M ${center - size * 0.6} ${center + size * 0.35} L ${center - size * 0.8} ${center + size * 0.55}
        
        M ${center - size * 0.35} ${center - size * 0.2} L ${center - size * 0.87} ${center - size * 0.5}
        M ${center - size * 0.6} ${center - size * 0.35} L ${center - size * 0.75} ${center - size * 0.15}
        M ${center - size * 0.6} ${center - size * 0.35} L ${center - size * 0.8} ${center - size * 0.55}
    `;

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={particle.size * 2} height={particle.size * 2}>
                {/* Hexagonal core */}
                <Path d={hexPath} fill="#96D9D6" opacity={0.4} />
                {/* Crystal branches */}
                <Path d={branchPaths} stroke="#96D9D6" strokeWidth={0.6} opacity={0.7} />
            </Svg>
        </Animated.View>
    );
}

export default function IceEffect() {
    return (
        <>
            {particles.map((particle) => (
                <IceParticle key={particle.id} particle={particle} />
            ))}
        </>
    );
}
