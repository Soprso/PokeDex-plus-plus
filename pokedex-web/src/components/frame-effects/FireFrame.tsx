import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * FireFrame Component
 * Realistic fire effect: flames burst OUTSIDE the card from the top edge,
 * like the card has caught fire. Uses pure CSS/HTML for organic flame shapes.
 */
export const FireFrame = ({ children }: { children?: React.ReactNode }) => {
    return (
        <View style={{ flex: 1 }}>
            {children}
            <View style={[StyleSheet.absoluteFill, { zIndex: 99, overflow: 'visible' }]} pointerEvents="none">
                <style>{`
                    @keyframes flame1 {
                        0%   { transform: scaleX(1)   scaleY(1)   translateY(0px)  rotate(-1deg); opacity: 0.95; }
                        25%  { transform: scaleX(0.95) scaleY(1.1) translateY(-4px) rotate(1deg);  opacity: 1;    }
                        50%  { transform: scaleX(1.05) scaleY(0.95) translateY(-2px) rotate(-2deg); opacity: 0.9; }
                        75%  { transform: scaleX(0.98) scaleY(1.08) translateY(-5px) rotate(2deg);  opacity: 1;   }
                        100% { transform: scaleX(1)   scaleY(1)   translateY(0px)  rotate(-1deg); opacity: 0.95; }
                    }
                    @keyframes flame2 {
                        0%   { transform: scaleX(1.02) scaleY(0.9)  translateY(-2px) rotate(2deg);  opacity: 0.85; }
                        33%  { transform: scaleX(0.96) scaleY(1.15) translateY(-6px) rotate(-3deg); opacity: 1;    }
                        66%  { transform: scaleX(1.04) scaleY(1)    translateY(-3px) rotate(1deg);  opacity: 0.9;  }
                        100% { transform: scaleX(1.02) scaleY(0.9)  translateY(-2px) rotate(2deg);  opacity: 0.85; }
                    }
                    @keyframes flame3 {
                        0%   { transform: scaleX(0.98) scaleY(1.12) translateY(-4px) rotate(-2deg); opacity: 1;    }
                        40%  { transform: scaleX(1.03) scaleY(0.88) translateY(-1px) rotate(3deg);  opacity: 0.8;  }
                        70%  { transform: scaleX(0.95) scaleY(1.2)  translateY(-7px) rotate(-1deg); opacity: 1;    }
                        100% { transform: scaleX(0.98) scaleY(1.12) translateY(-4px) rotate(-2deg); opacity: 1;    }
                    }
                    @keyframes flameGlow {
                        0%, 100% { opacity: 0.5; }
                        50%       { opacity: 0.8; }
                    }
                    @keyframes ember {
                        0%   { transform: translateY(0px)  translateX(0px)  scale(1);   opacity: 1;   }
                        50%  { transform: translateY(-20px) translateX(4px)  scale(0.7); opacity: 0.8; }
                        100% { transform: translateY(-40px) translateX(-2px) scale(0.3); opacity: 0;   }
                    }
                    .fire-flame-base   { transform-origin: bottom center; animation: flame1 1.4s ease-in-out infinite; }
                    .fire-flame-mid    { transform-origin: bottom center; animation: flame2 1.1s ease-in-out infinite; }
                    .fire-flame-tip    { transform-origin: bottom center; animation: flame3 0.9s ease-in-out infinite; }
                    .fire-glow         { animation: flameGlow 2s ease-in-out infinite; }
                    .ember-1 { animation: ember 2.2s ease-out infinite 0.0s; }
                    .ember-2 { animation: ember 1.8s ease-out infinite 0.4s; }
                    .ember-3 { animation: ember 2.5s ease-out infinite 0.8s; }
                    .ember-4 { animation: ember 1.6s ease-out infinite 1.2s; }
                    .ember-5 { animation: ember 2.0s ease-out infinite 0.6s; }
                `}</style>

                {/* ── Glowing ember border (bottom glow only, subtle) ── */}
                <View style={styles.borderGlow} className="fire-glow" />
                <View style={styles.mainBorder} />

                {/* ── Flames container — sits ABOVE the card ── */}
                <View style={styles.flamesOuter}>
                    {/* SVG flames rendered as inline HTML for full CSS animation support */}
                    <svg
                        width="100%"
                        height="90"
                        viewBox="0 0 300 90"
                        preserveAspectRatio="none"
                        style={{ display: 'block', overflow: 'visible' }}
                    >
                        <defs>
                            {/* Deep base: dark red → orange */}
                            <linearGradient id="ff-base" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#8B0000" stopOpacity="1" />
                                <stop offset="40%" stopColor="#FF2200" stopOpacity="1" />
                                <stop offset="75%" stopColor="#FF6600" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#FF9900" stopOpacity="0.6" />
                            </linearGradient>
                            {/* Mid layer: orange → yellow */}
                            <linearGradient id="ff-mid" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#FF4400" stopOpacity="1" />
                                <stop offset="50%" stopColor="#FF8800" stopOpacity="1" />
                                <stop offset="85%" stopColor="#FFCC00" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#FFEE88" stopOpacity="0.4" />
                            </linearGradient>
                            {/* Tip: yellow → white-hot */}
                            <linearGradient id="ff-tip" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.9" />
                                <stop offset="60%" stopColor="#FFEE44" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
                            </linearGradient>
                            {/* Soft glow blur filter */}
                            <filter id="ff-blur" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" />
                            </filter>
                            <filter id="ff-blur-sm" x="-10%" y="-10%" width="120%" height="120%">
                                <feGaussianBlur stdDeviation="1.5" />
                            </filter>
                        </defs>

                        {/* ── Glow halo behind flames ── */}
                        <ellipse cx="150" cy="88" rx="140" ry="18" fill="#FF4400" opacity="0.35" filter="url(#ff-blur)" className="fire-glow" />

                        {/* ══ BASE LAYER — wide, low, dark red/orange ══ */}
                        <g className="fire-flame-base">
                            {/* Left base flame */}
                            <path
                                d="M 0 90
                                   C 10 90, 15 75, 20 60
                                   C 22 50, 18 38, 25 28
                                   C 30 20, 38 22, 40 30
                                   C 43 40, 38 55, 42 65
                                   C 46 75, 55 80, 60 90 Z"
                                fill="url(#ff-base)"
                            />
                            {/* Center-left base flame */}
                            <path
                                d="M 55 90
                                   C 62 88, 68 72, 72 58
                                   C 75 46, 70 30, 78 18
                                   C 84 8,  94 10, 96 22
                                   C 99 36, 92 52, 96 64
                                   C 100 76, 110 84, 115 90 Z"
                                fill="url(#ff-base)"
                            />
                            {/* Center base flame (tallest) */}
                            <path
                                d="M 110 90
                                   C 118 88, 122 70, 126 52
                                   C 129 38, 124 20, 134 8
                                   C 140 0,  152 2,  154 14
                                   C 157 28, 150 46, 154 60
                                   C 158 72, 168 82, 172 90 Z"
                                fill="url(#ff-base)"
                            />
                            {/* Center-right base flame */}
                            <path
                                d="M 168 90
                                   C 175 88, 180 74, 184 60
                                   C 188 46, 183 30, 190 18
                                   C 196 8,  206 10, 208 22
                                   C 211 36, 204 52, 208 64
                                   C 212 76, 222 84, 228 90 Z"
                                fill="url(#ff-base)"
                            />
                            {/* Right base flame */}
                            <path
                                d="M 224 90
                                   C 232 88, 238 74, 242 60
                                   C 245 48, 240 36, 248 26
                                   C 254 18, 262 20, 264 30
                                   C 267 42, 260 56, 264 66
                                   C 268 76, 278 84, 300 90 Z"
                                fill="url(#ff-base)"
                            />
                            {/* Fill gaps at base */}
                            <rect x="0" y="82" width="300" height="8" fill="#8B0000" opacity="0.9" />
                        </g>

                        {/* ══ MID LAYER — narrower, taller, orange/yellow ══ */}
                        <g className="fire-flame-mid">
                            <path
                                d="M 8 90
                                   C 14 88, 18 76, 22 62
                                   C 25 50, 21 36, 28 24
                                   C 33 14, 42 16, 44 26
                                   C 47 38, 41 54, 46 66
                                   C 50 78, 58 86, 62 90 Z"
                                fill="url(#ff-mid)"
                                opacity="0.9"
                            />
                            <path
                                d="M 80 90
                                   C 86 88, 90 72, 94 56
                                   C 97 42, 92 26, 100 14
                                   C 106 4,  116 6,  118 18
                                   C 121 32, 114 50, 118 62
                                   C 122 74, 132 84, 136 90 Z"
                                fill="url(#ff-mid)"
                                opacity="0.9"
                            />
                            <path
                                d="M 132 90
                                   C 138 88, 142 70, 146 52
                                   C 149 36, 144 16, 154 4
                                   C 160 -4, 172 -2, 174 12
                                   C 177 28, 168 48, 172 62
                                   C 176 74, 186 84, 190 90 Z"
                                fill="url(#ff-mid)"
                                opacity="0.95"
                            />
                            <path
                                d="M 188 90
                                   C 194 88, 198 74, 202 58
                                   C 206 44, 200 28, 208 16
                                   C 214 6,  224 8,  226 20
                                   C 229 34, 222 52, 226 64
                                   C 230 76, 240 86, 244 90 Z"
                                fill="url(#ff-mid)"
                                opacity="0.9"
                            />
                        </g>

                        {/* ══ TIP LAYER — thin, tall, yellow/white-hot ══ */}
                        <g className="fire-flame-tip">
                            <path
                                d="M 22 90
                                   C 26 86, 28 74, 30 60
                                   C 32 48, 28 34, 34 22
                                   C 38 12, 46 14, 47 24
                                   C 49 36, 44 52, 48 64
                                   C 51 76, 56 86, 58 90 Z"
                                fill="url(#ff-tip)"
                                opacity="0.8"
                            />
                            <path
                                d="M 100 90
                                   C 104 86, 106 70, 108 54
                                   C 110 40, 106 24, 114 12
                                   C 119 2,  128 4,  129 16
                                   C 131 30, 125 48, 129 62
                                   C 132 74, 138 84, 140 90 Z"
                                fill="url(#ff-tip)"
                                opacity="0.85"
                            />
                            <path
                                d="M 148 90
                                   C 152 86, 154 68, 156 50
                                   C 158 34, 153 14, 162 2
                                   C 167 -6, 178 -4, 179 10
                                   C 181 26, 174 46, 178 60
                                   C 181 72, 188 84, 190 90 Z"
                                fill="url(#ff-tip)"
                                opacity="0.9"
                            />
                            <path
                                d="M 208 90
                                   C 212 86, 214 72, 216 56
                                   C 218 42, 213 26, 220 14
                                   C 225 4,  234 6,  235 18
                                   C 237 32, 231 50, 235 62
                                   C 238 74, 244 84, 246 90 Z"
                                fill="url(#ff-tip)"
                                opacity="0.8"
                            />
                        </g>

                        {/* ══ Floating embers ══ */}
                        <circle cx="60" cy="70" r="2.5" fill="#FF8800" className="ember-1" />
                        <circle cx="120" cy="60" r="2" fill="#FFCC00" className="ember-2" />
                        <circle cx="155" cy="50" r="3" fill="#FF6600" className="ember-3" />
                        <circle cx="200" cy="65" r="2" fill="#FFAA00" className="ember-4" />
                        <circle cx="240" cy="72" r="2.5" fill="#FF4400" className="ember-5" />
                    </svg>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    borderGlow: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 8,
        borderColor: '#FF4500',
        borderRadius: 16,
        opacity: 0.35,
    },
    mainBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 3,
        borderColor: '#FF6600',
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    flamesOuter: {
        position: 'absolute',
        top: -82,       // flames sit ABOVE the card top edge
        left: -4,
        right: -4,
        height: 90,
        overflow: 'visible',
        // @ts-ignore
        zIndex: 200,
    },
});
