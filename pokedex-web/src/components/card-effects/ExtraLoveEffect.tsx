import { type DimensionValue, Image, StyleSheet, View } from '@/components/native';
import { Ionicons } from '@/components/native/Icons';
import { useMemo } from 'react';
import { GlowBorder } from './index';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/extra-love.jpg';

const HeartParticle = ({ delay, xPos, scale }: { delay: number; xPos: DimensionValue; scale: number }) => {
    // const animationDelay = `-${delay}ms`; // Negative delay to start immediately if needed or just use delay

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 0,
                left: xPos as any,
                transform: `scale(${scale})`,
                animation: `floatUp 3000ms ease-out infinite`,
                animationDelay: `${delay}ms`,
                opacity: 0,
            }}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
        </div>
    );
};

const HeartParticles = () => {
    // Generate static random config
    const particles = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 2000,
            xPos: `${10 + Math.random() * 80}%` as DimensionValue, // 10% to 90%
            scale: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
        }));
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <style>
                {`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    10% { opacity: 1; }
                    80% { opacity: 0; }
                    100% { transform: translateY(-200px) scale(1); opacity: 0; }
                }
                `}
            </style>
            {particles.map((p) => (
                <HeartParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const ExtraLoveEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />
            {/* Overlay */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 105, 180, 0.1)' } as any]} />

            {/* Thick Pink Glow */}
            <GlowBorder color="#FF69B4" borderWidth={4} cornerRadius={16} />

            {/* Particles */}
            <HeartParticles />
        </View>
    );
};

