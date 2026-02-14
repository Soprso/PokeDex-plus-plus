import { StyleSheet, View } from '@/components/native';
import React from 'react';

interface ShineOverlayProps {
    color?: string; // Overrides base color if provided
    duration?: number;
    diagonal?: boolean;
    type?: 'gold' | 'platinum' | 'default';
}

export const ShineOverlay: React.FC<ShineOverlayProps> = ({
    color,
    duration = 3000,
    diagonal = true,
    type = 'default'
}) => {
    // Define rich color palettes
    const palettes = {
        gold: {
            primary: 'rgba(255, 215, 0, 0.4)',
            secondary: 'rgba(255, 255, 255, 0.6)',
            gradient: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.1) 20%, rgba(255,255,255,0.6) 50%, rgba(255,215,0,0.1) 80%, transparent)'
        },
        platinum: {
            primary: 'rgba(229, 228, 226, 0.4)',
            secondary: 'rgba(255, 255, 255, 0.7)',
            gradient: 'linear-gradient(90deg, transparent, rgba(229,228,226,0.1) 20%, rgba(255,255,255,0.7) 50%, rgba(229,228,226,0.1) 80%, transparent)'
        },
        default: {
            primary: color || 'rgba(255, 255, 255, 0.3)',
            secondary: 'rgba(255, 255, 255, 0.4)',
            gradient: `linear-gradient(90deg, transparent, ${color || 'rgba(255,255,255,0.1)'}, transparent)`
        }
    };

    const activePalette = palettes[type] || palettes.default;

    return (
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12, zIndex: 2 }]} pointerEvents="none">
            <style>
                {`
                @keyframes mainShinePass {
                    0% { transform: translateX(-150%) ${diagonal ? 'rotate(45deg)' : 'rotate(0deg)'}; }
                    40%, 100% { transform: translateX(250%) ${diagonal ? 'rotate(45deg)' : 'rotate(0deg)'}; }
                }
                @keyframes glintPass {
                    0% { transform: translateX(-200%) ${diagonal ? 'rotate(45deg)' : 'rotate(0deg)'}; }
                    30%, 100% { transform: translateX(300%) ${diagonal ? 'rotate(45deg)' : 'rotate(0deg)'}; }
                }
                `}
            </style>

            {/* Layer 1: Broad Metallic Sweep */}
            <div
                style={{
                    position: 'absolute',
                    top: diagonal ? '-50%' : 0,
                    left: diagonal ? '-50%' : 0,
                    width: diagonal ? '300%' : '200%',
                    height: diagonal ? '200%' : '100%',
                    animation: `mainShinePass ${duration}ms ease-in-out infinite`,
                    background: activePalette.gradient,
                    opacity: 0.8
                }}
            />

            {/* Layer 2: Fast High-Intensity Glint (The "Exclusive" Sparkle) */}
            <div
                style={{
                    position: 'absolute',
                    top: diagonal ? '-50%' : 0,
                    left: diagonal ? '-50%' : 0,
                    width: diagonal ? '300%' : '200%',
                    height: diagonal ? '200%' : '100%',
                    animation: `glintPass ${duration}ms ease-in-out infinite`,
                    animationDelay: '150ms',
                    background: `linear-gradient(90deg, transparent, transparent 45%, ${activePalette.secondary} 50%, transparent 55%, transparent)`,
                    opacity: 0.9,
                    filter: 'blur(2px)'
                }}
            />
        </View>
    );
};
