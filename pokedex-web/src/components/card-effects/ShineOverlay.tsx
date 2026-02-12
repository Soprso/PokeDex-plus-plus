import { StyleSheet, View } from '@/components/native';
import React from 'react';

interface ShineOverlayProps {
    color?: string; // e.g. 'rgba(255, 215, 0, 0.4)'
    duration?: number;
    diagonal?: boolean;
}

export const ShineOverlay: React.FC<ShineOverlayProps> = ({ color = 'rgba(255, 255, 255, 0.3)', duration = 3000, diagonal = false }) => {
    return (
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12, zIndex: 2 }]} pointerEvents="none">
            <style>
                {`
                @keyframes shinePass {
                    0% { transform: translateX(-100%) ${diagonal ? 'rotate(45deg)' : 'rotate(0deg)'}; }
                    50% { transform: translateX(200%) ${diagonal ? 'rotate(45deg)' : 'rotate(0deg)'}; }
                    100% { transform: translateX(200%) ${diagonal ? 'rotate(45deg)' : 'rotate(0deg)'}; }
                }
                `}
            </style>
            <div
                style={{
                    position: 'absolute',
                    top: diagonal ? '-50%' : 0,
                    left: diagonal ? '-50%' : 0,
                    width: diagonal ? '200%' : '100%',
                    height: diagonal ? '200%' : '100%',
                    animation: `shinePass ${duration}ms linear infinite`,
                    animationDelay: '1s'
                }}>
                <div style={{
                    width: '50%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    transform: diagonal ? 'skewX(0deg)' : 'skewX(-20deg)',
                }} />
            </div>
        </View>
    );
};
