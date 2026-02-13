import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const PARTICLE_COUNT = 15;

interface ParticleProps {
    id: number;
    delay: number;
    duration: number;
    size: number;
    left: string;
    top: string;
}

const particles: ParticleProps[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    // Positioning sparkles within 20-80% of the image area
    const left = 20 + Math.random() * 60;
    const top = 20 + Math.random() * 60;

    return {
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        size: 8 + Math.random() * 12,
        delay: Math.random() * 2000,
        duration: 1500 + Math.random() * 1000,
    };
});

function ShinySparkle({ particle }: { particle: ParticleProps }) {
    const anim = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createAnim = () => {
            return Animated.sequence([
                Animated.delay(particle.delay),
                Animated.loop(
                    Animated.parallel([
                        Animated.sequence([
                            Animated.timing(anim, {
                                toValue: 1,
                                duration: particle.duration * 0.4,
                                useNativeDriver: false,
                                easing: Easing.out(Easing.ease),
                            }),
                            Animated.timing(anim, {
                                toValue: 0,
                                duration: particle.duration * 0.6,
                                useNativeDriver: false,
                                easing: Easing.in(Easing.ease),
                            }),
                        ]),
                        Animated.timing(rotate, {
                            toValue: 1,
                            duration: particle.duration,
                            useNativeDriver: false,
                            easing: Easing.linear,
                        })
                    ])
                )
            ]);
        };

        const animation = createAnim();
        animation.start();

        return () => animation.stop();
    }, []);

    const rotation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const starPath = `
        M ${particle.size / 2} 0
        L ${particle.size * 0.6} ${particle.size * 0.4}
        L ${particle.size} ${particle.size / 2}
        L ${particle.size * 0.6} ${particle.size * 0.6}
        L ${particle.size / 2} ${particle.size}
        L ${particle.size * 0.4} ${particle.size * 0.6}
        L 0 ${particle.size / 2}
        L ${particle.size * 0.4} ${particle.size * 0.4}
        Z
    `;

    const colors = ['#FFD700', '#FFFFFF', '#87CEEB', '#FFA500'];
    const color = colors[particle.id % colors.length];

    return (
        <Animated.View
            style={[
                styles.sparkle,
                {
                    left: particle.left,
                    top: particle.top,
                    opacity: anim,
                    transform: [
                        { scale: anim },
                        { rotate: rotation }
                    ],
                }
            ]}
        >
            <Svg width={particle.size} height={particle.size}>
                <Path d={starPath} fill={color} />
            </Svg>
        </Animated.View>
    );
}

export default function ShinyEffect() {
    return (
        <View style={StyleSheet.absoluteFill}>
            {particles.map((particle) => (
                <ShinySparkle key={particle.id} particle={particle} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    sparkle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
