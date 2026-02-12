import { type DimensionValue, Image, StyleSheet, View } from '@/components/native';
import { useMemo } from 'react';
import { GlowBorder } from './index';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/magma-storm.jpg';

const FireFlake = ({ delay, xPos, scale, duration }: { delay: number; xPos: DimensionValue; scale: number; duration: number }) => {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: -10,
                left: xPos as any,
                transform: `scale(${scale})`,
                opacity: 0,
                animation: `fireRise ${duration}ms linear infinite`,
                animationDelay: `${delay}ms`,
            }}>
            <div style={{ width: 3, height: 7, backgroundColor: '#FFD700', borderRadius: 1 }} />
        </div>
    );
};

const FireParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 1500,
            xPos: `${5 + Math.random() * 90}%` as DimensionValue,
            scale: 0.4 + Math.random() * 0.5,
            duration: 2000 + Math.random() * 1500,
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
            <style>
                {`
                @keyframes fireRise {
                    0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 0.6; }
                    100% { transform: translateY(-400px) scale(1) rotate(360deg); opacity: 0; }
                }
                `}
            </style>
            {particles.map((p) => (
                <FireFlake key={p.id} {...p} />
            ))}
        </View>
    );
};

export const MagmaStormEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Red/Orange Tint */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 69, 0, 0.15)' } as any]} />

            {/* Rising Fire Particles */}
            <FireParticles />

            {/* Red Glowing Animated Border */}
            <GlowBorder color="#FF4500" borderWidth={3} cornerRadius={16} />
        </View>
    );
};

