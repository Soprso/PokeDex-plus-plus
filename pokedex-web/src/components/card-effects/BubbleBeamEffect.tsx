import { type DimensionValue, Image, StyleSheet, View } from '@/components/native';
import { useMemo } from 'react';
import { GlowBorder } from './index';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/bubble-beam.jpg';

// Aqua and Blue shades for bubbles
const BUBBLE_COLORS = ['#00FFFF', '#E0FFFF', '#87CEEB', '#ADD8E6', 'rgba(255, 255, 255, 0.6)'];

const BubbleParticle = ({ delay, xPos, scale, duration, color }: { delay: number; xPos: DimensionValue; scale: number; duration: number; color: string }) => {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: -20,
                left: xPos as any,
                transform: `scale(${scale})`,
                opacity: 0,
                // Combine rise and wobble
                animation: `bubbleRise ${duration}ms linear infinite, bubbleWobble ${duration / 4}ms ease-in-out infinite`,
                animationDelay: `${delay}ms`,
            }}>
            <div style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                borderWidth: 0.4,
                borderColor: color,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 2px rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
            }}>
                <div style={{
                    width: '30%',
                    height: '30%',
                    borderRadius: 50,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    marginTop: '15%',
                    marginRight: '15%',
                }} />
            </div>
        </div>
    );
};

const BubbleParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 3000,
            xPos: `${Math.random() * 100}%` as DimensionValue,
            scale: 0.4 + Math.random() * 0.6,
            duration: 3000 + Math.random() * 2000,
            color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]} pointerEvents="none">
            <style>
                {`
                @keyframes bubbleRise {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    10% { opacity: 0.8; }
                    80% { opacity: 0.8; }
                    100% { transform: translateY(-400px) scale(1); opacity: 0; }
                }
                @keyframes bubbleWobble {
                    0%, 100% { margin-left: 0; }
                    50% { margin-left: 10px; }
                }
                `}
            </style>
            {particles.map((p) => (
                <BubbleParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const BubbleBeamEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Bubble Particles */}
            <BubbleParticles />

            {/* Glowing Border */}
            <GlowBorder color="#00FFFF" borderWidth={2} />
        </View>
    );
};

