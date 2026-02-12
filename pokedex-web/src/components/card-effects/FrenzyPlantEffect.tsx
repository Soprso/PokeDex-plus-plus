import { type DimensionValue, Image, StyleSheet, View } from '@/components/native';
import { Ionicons } from '@/components/native/Icons';
import { useMemo } from 'react';
import { GlowBorder } from './index';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/frenzy-plant.jpg';

// Green shades for leaves
const LEAF_COLORS = ['#4CAF50', '#2E7D32', '#66BB6A', '#81C784', '#1B5E20'];

const LeafParticle = ({ delay, xPos, scale, duration, color }: { delay: number; xPos: DimensionValue; scale: number; duration: number; color: string }) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: -20,
                left: xPos as any,
                transform: `scale(${scale})`,
                opacity: 0,
                // Fall + Sway + Rotate
                animation: `leafFall ${duration}ms linear infinite, leafSway ${duration / 2}ms ease-in-out infinite`,
                animationDelay: `${delay}ms`,
                color: color,
            }}>
            <Ionicons name="leaf" size={12} color={color} />
        </div>
    );
};

const LeafParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 3000,
            xPos: `${Math.random() * 100}%` as DimensionValue,
            scale: 0.5 + Math.random() * 0.5,
            duration: 4000 + Math.random() * 2000, // Slower fall for leaves
            color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]} pointerEvents="none">
            <style>
                {`
                @keyframes leafFall {
                    0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(400px) scale(1) rotate(360deg); opacity: 0; }
                }
                @keyframes leafSway {
                    0%, 100% { margin-left: 0; }
                    50% { margin-left: 15px; }
                }
                `}
            </style>
            {particles.map((p) => (
                <LeafParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const FrenzyPlantEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Leaf Particles */}
            <LeafParticles />

            {/* Glowing Border */}
            <GlowBorder color="#4CAF50" borderWidth={2} />
        </View>
    );
};

