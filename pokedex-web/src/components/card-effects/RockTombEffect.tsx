import { type DimensionValue, Image, StyleSheet, View } from '@/components/native';
import { useMemo } from 'react';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/rock-tomb.jpg';

const SAND_COLORS = ['#D2B48C', '#F4A460', '#C2B280', '#DAA520'];

interface SandParticleProps {
    delay: number;
    yPos: DimensionValue;
    size: number;
    duration: number;
    color: string;
}

const SandParticle = ({ delay, yPos, size, duration, color }: SandParticleProps) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: yPos as any,
                width: size,
                height: size,
                backgroundColor: color,
                opacity: 0,
                // Sand drift (diagonal or horizontal)
                animation: `sandDrift ${duration}ms linear infinite`,
                animationDelay: `${delay}ms`,
                borderRadius: '1px'
            }}
        />
    );
};

const SandStorm = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 5000,
            yPos: `${Math.random() * 100}%` as DimensionValue,
            size: 1 + Math.random() * 0.3, // 1-3px (Dust like)
            duration: 3000 + Math.random() * 2000, // 3-5s
            color: SAND_COLORS[Math.floor(Math.random() * SAND_COLORS.length)],
        }));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]} pointerEvents="none">
            <style>
                {`
                @keyframes sandDrift {
                    0% { margin-left: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0; }
                    100% { margin-left: 110%; opacity: 0; }
                }
                `}
            </style>
            {particles.map((p) => (
                <SandParticle key={p.id} {...p} />
            ))}
        </View>
    );
};

export const RockTombEffect = ({ showBorder = true }: { showBorder?: boolean }) => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Darker Overlay to make particles pop */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.1)' } as any]} />

            {/* Sand Particles */}
            <SandStorm />

            {/* Rock Animated Border */}
            {showBorder && (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.border,
                        { borderColor: '#8B4513', animation: 'borderPulse 3s infinite' } as any
                    ]}
                    pointerEvents="none"
                >
                    <style>
                        {`
                        @keyframes borderPulse {
                            0% { opacity: 0.6; }
                            50% { opacity: 1; }
                            100% { opacity: 0.6; }
                        }
                        `}
                    </style>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        borderRadius: 1, // Slightly rounded squares
    } as any,
    border: {
        borderWidth: 4,
        borderRadius: 12,
        zIndex: 10,
    } as any,
});
