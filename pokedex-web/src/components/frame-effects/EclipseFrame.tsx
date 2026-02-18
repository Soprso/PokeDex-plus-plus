import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * EclipseFrame — Dark sun/moon eclipse at top, glowing corona ring with rays fading to darkness
 */
export const EclipseFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes corona-pulse {
                    0%,100% { opacity:.6; filter:blur(2px); }
                    50%     { opacity:1;  filter:blur(3px); }
                }
                @keyframes ray-rotate {
                    from { transform:rotate(0deg); }
                    to   { transform:rotate(360deg); }
                }
                @keyframes eclipse-border {
                    0%,100% { box-shadow:0 0 10px 3px #FF6600, inset 0 0 6px #1A0030; opacity:.5; }
                    50%     { box-shadow:0 0 20px 6px #FF8C00, inset 0 0 10px #2D0050; opacity:.8; }
                }
                @keyframes eclipse-particle {
                    0%   { transform:translateY(0) scale(1); opacity:.8; }
                    100% { transform:translateY(30px) scale(.3); opacity:0; }
                }
                .corona-pulse   { animation:corona-pulse 2.5s ease-in-out infinite; }
                .ray-rotate     { animation:ray-rotate 12s linear infinite; }
                .eclipse-border { animation:eclipse-border 3s ease-in-out infinite; }
                .ep-1 { animation:eclipse-particle 2.0s ease-out infinite 0.0s; }
                .ep-2 { animation:eclipse-particle 2.8s ease-out infinite 0.7s; }
                .ep-3 { animation:eclipse-particle 1.8s ease-out infinite 1.4s; }
            `}</style>

            {/* Eclipse border */}
            <div className="eclipse-border" style={{
                position: 'absolute', inset: 0,
                borderWidth: 3, borderStyle: 'solid', borderColor: '#FF6600',
                borderRadius: 16, pointerEvents: 'none',
            } as any} />
            <div style={{
                position: 'absolute', inset: 2,
                borderWidth: 1, borderStyle: 'solid',
                borderColor: 'rgba(255,140,0,0.3)',
                borderRadius: 14, pointerEvents: 'none',
            } as any} />

            {/* Eclipse at top */}
            <View style={styles.eclipseTop}>
                <svg width="100%" height="90" viewBox="0 0 320 90" preserveAspectRatio="xMidYMax meet"
                    style={{ display: 'block', overflow: 'visible' }}>
                    <defs>
                        <radialGradient id="corona-g" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                            <stop offset="55%" stopColor="#FF8C00" stopOpacity="0.7" />
                            <stop offset="75%" stopColor="#FF4500" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#1A0030" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="dark-moon" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#0A0010" stopOpacity="1" />
                            <stop offset="100%" stopColor="#1A0030" stopOpacity="1" />
                        </radialGradient>
                        <filter id="corona-blur"><feGaussianBlur stdDeviation="4" /></filter>
                        <filter id="ray-blur"><feGaussianBlur stdDeviation="1.5" /></filter>
                        <mask id="eclipse-mask">
                            <rect width="320" height="90" fill="white" />
                            <circle cx="160" cy="44" r="28" fill="black" />
                        </mask>
                    </defs>

                    {/* Dark background gradient */}
                    <path d="M0 90 Q160 20 320 90Z" fill="#0A0010" opacity="0.7" />

                    {/* Corona glow */}
                    <circle cx="160" cy="44" r="48" fill="url(#corona-g)" className="corona-pulse" filter="url(#corona-blur)" />

                    {/* Rotating rays */}
                    <g className="ray-rotate" style={{ transformOrigin: '160px 44px' } as any}>
                        {Array.from({ length: 12 }, (_, i) => {
                            const angle = (i * 30) * Math.PI / 180;
                            const x1 = 160 + Math.cos(angle) * 32;
                            const y1 = 44 + Math.sin(angle) * 32;
                            const x2 = 160 + Math.cos(angle) * 58;
                            const y2 = 44 + Math.sin(angle) * 58;
                            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="#FF8C00" strokeWidth={i % 3 === 0 ? 2 : 1} opacity={i % 3 === 0 ? 0.8 : 0.4}
                                filter="url(#ray-blur)" />;
                        })}
                    </g>

                    {/* Corona ring */}
                    <circle cx="160" cy="44" r="30" fill="none" stroke="#FF6600" strokeWidth="3"
                        opacity="0.9" mask="url(#eclipse-mask)" className="corona-pulse" />

                    {/* Dark moon disc */}
                    <circle cx="160" cy="44" r="28" fill="url(#dark-moon)" />
                    {/* Moon surface detail */}
                    <circle cx="152" cy="38" r="4" fill="#0F0020" opacity="0.6" />
                    <circle cx="168" cy="50" r="3" fill="#0F0020" opacity="0.5" />
                    <circle cx="158" cy="52" r="2" fill="#0F0020" opacity="0.4" />

                    {/* Falling eclipse particles */}
                    <circle cx="120" cy="70" r="2.5" fill="#FF6600" className="ep-1" opacity="0.8" />
                    <circle cx="160" cy="75" r="2" fill="#FF8C00" className="ep-2" opacity="0.7" />
                    <circle cx="200" cy="68" r="3" fill="#FF4500" className="ep-3" opacity="0.8" />
                </svg>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
    eclipseTop: {
        position: 'absolute', top: -82, left: -4, right: -4, height: 90,
        overflow: 'visible' as any, zIndex: 200,
    },
});
