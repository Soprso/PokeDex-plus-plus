import { type DimensionValue, Image, StyleSheet, View } from '@/components/native';
import { Ionicons } from '@/components/native/Icons';
import { useMemo } from 'react';
import { GlowBorder } from './index';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/icy-wind.jpg';

const IceParticle = ({ delay, xPos, scale, duration }: { delay: number; xPos: DimensionValue; scale: number; duration: number }) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: -20,
                left: xPos as any,
                transform: `scale(${scale})`,
                opacity: 0,
                animation: `iceFall ${duration}ms linear infinite`,
                animationDelay: `${delay}ms`,
                color: '#A5F2F3',
            }}>
            <Ionicons name="snow" size={14} color="#A5F2F3" />
        </div>
    );
};

const IceParticles = () => {
    // Generate static random config
    const particles = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 3000,
            xPos: `${Math.random() * 100}%` as DimensionValue,
            scale: 0.5 + Math.random() * 0.8, // 0.5 to 1.3
            duration: 3000 + Math.random() * 2000, // 3s to 5s fall time
        }));
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <style>
                {`
                @keyframes iceFall {
                    0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    80% { opacity: 0.8; }
                    100% { transform: translateY(300px) scale(1) rotate(360deg); opacity: 0; }
                }
                `}
            </style>
            {particles.map((p) => (
                <IceParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const IcyWindEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Overlay */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(165, 242, 243, 0.2)' } as any]} />

            {/* Glowing Border - Ice Blue */}
            <GlowBorder color="#A5F2F3" borderWidth={3} cornerRadius={16} />

            {/* Falling Ice Particles */}
            <IceParticles />
        </View>
    );
};

