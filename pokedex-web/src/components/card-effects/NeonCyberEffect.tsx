import { ImageBackground, StyleSheet, View } from '@/components/native';
import { useState } from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/neon-cyber.jpg';

const CyberBubble = ({ delay, color }: { delay: number; color: string }) => {
    // Random Position entirely (Top & Left)
    const left = `${Math.random() * 90}%`;
    const top = `${Math.random() * 90}%`;

    return (
        <div
            style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: color,
                left: left as any,
                top: top as any,
                opacity: 0,
                transform: 'scale(0)',
                animation: `cyberBubble 3.5s infinite`,
                animationDelay: `${delay}ms`,
            }}>
        </div>
    );
};

const NeonBorder = () => {
    const [layout, setLayout] = useState({ width: 0, height: 0 });

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={(e) => setLayout(e.nativeEvent.layout)}
            pointerEvents="none"
        >
            {layout.width > 0 && (
                <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill as any}>
                    <Defs>
                        <LinearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#00FFFF" stopOpacity="1" />
                            <Stop offset="1" stopColor="#FF69B4" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <style>
                        {`
                        .neon-border-dash {
                            stroke-dasharray: ${2 * (layout.width + layout.height) * 0.25} ${2 * (layout.width + layout.height) * 0.75};
                            stroke-dashoffset: 0;
                            animation: neonRun 3s linear infinite;
                        }
                        @keyframes neonRun {
                            to {
                                stroke-dashoffset: -${2 * (layout.width + layout.height)};
                            }
                        }
                        `}
                    </style>

                    {/* Glow Layer */}
                    <Rect
                        x="2"
                        y="2"
                        width={layout.width - 4}
                        height={layout.height - 4}
                        rx="12"
                        ry="12"
                        stroke="url(#neonGrad)"
                        strokeWidth="6"
                        strokeOpacity="0.5"
                        fill="none"
                        strokeLinecap="round"
                        {...({ className: "neon-border-dash" } as any)}
                    />

                    {/* Core Layer */}
                    <Rect
                        x="2"
                        y="2"
                        width={layout.width - 4}
                        height={layout.height - 4}
                        rx="12"
                        ry="12"
                        stroke="#00FFFF"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        {...({ className: "neon-border-dash" } as any)}
                    />
                </Svg>
            )}
        </View>
    );
};

export const NeonCyberEffect = () => {
    const bubbles = Array.from({ length: 8 }).map((_, i) => ( // Increased count slightly
        <CyberBubble
            key={i}
            delay={i * 600}
            color={i % 2 === 0 ? '#00FFFF' : '#FF69B4'}
        />
    ));

    return (
        <View style={StyleSheet.absoluteFill}>
            <style>
                {`
                @keyframes cyberBubble {
                    0% { transform: scale(0); opacity: 0; }
                    20% { transform: scale(1.3); opacity: 0.4; }
                    50% { opacity: 0.4; }
                    100% { transform: scale(0); opacity: 0; }
                }
                `}
            </style>
            {/* Background Image */}
            <ImageBackground
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />
            {/* Cyber Grid Tint */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 5, 20, 0.4)' } as any]} />

            {/* Bubbles Layer */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {bubbles}
            </View>

            {/* Seamless Running Border */}
            <NeonBorder />
        </View>
    );
};
