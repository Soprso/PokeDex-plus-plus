import { type StyleProp, StyleSheet, View, type ViewStyle } from '@/components/native';
import React from 'react';

interface GlowBorderProps {
    color: string;
    borderWidth: number;
    cornerRadius?: number;
    style?: StyleProp<ViewStyle>;
}

export const GlowBorder: React.FC<GlowBorderProps> = ({ color, borderWidth, cornerRadius = 12, style }) => {
    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                {
                    borderWidth: borderWidth,
                    borderColor: color,
                    borderRadius: cornerRadius,
                    zIndex: 1,
                    // CSS animation equivalent:
                    animation: 'pulse 3s infinite',
                } as any,
                style,
            ] as any}
            pointerEvents="none">
            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
                `}
            </style>
        </View>
    );
};
