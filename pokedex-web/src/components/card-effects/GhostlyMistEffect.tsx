import { ImageBackground, StyleSheet, View } from '@/components/native';
import { GlowBorder } from './GlowBorder';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/ghostly-mist.jpg';

const SmokeParticle = ({ delay }: { delay: number }) => {
    // Random starting position
    const left = `${Math.random() * 80 + 10}%`;
    const bottom = `${Math.random() * 20}%`;
    const duration = 4000;

    return (
        <div
            style={{
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(200, 200, 230, 0.3)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                left: left,
                bottom: bottom,
                opacity: 0,
                transform: 'scale(0.5) translateX(0)',
                animation: `smokeRise ${duration}ms linear infinite`,
                animationDelay: `${delay}ms`,
            }}
        />
    );
};

export const GhostlyMistEffect = () => {
    // Create multiple particles
    const particles = Array.from({ length: 8 }).map((_, i) => (
        <SmokeParticle key={i} delay={i * 500} />
    ));

    return (
        <View style={StyleSheet.absoluteFill}>
            <style>
                {`
                @keyframes smokeRise {
                    0% { transform: translateY(0) scale(0.5) translateX(0); opacity: 0; }
                    20% { opacity: 0.6; }
                    50% { transform: translateY(-75px) scale(1.5) translateX(20px); }
                    100% { transform: translateY(-150px) scale(2) translateX(-20px); opacity: 0; }
                }
                `}
            </style>
            {/* Background Image */}
            <ImageBackground
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Smoke Overlay */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {particles}
            </View>

            {/* Thick Purple Glow Border */}
            <GlowBorder color="#8A2BE2" borderWidth={4} />
        </View>
    );
};

