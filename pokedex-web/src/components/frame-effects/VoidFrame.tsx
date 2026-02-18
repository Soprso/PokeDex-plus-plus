import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * VoidFrame — Swirling dark purple/black vortex, glitch distortion, floating dark particles
 */
export const VoidFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes void-spin {
                    from { transform:rotate(0deg); }
                    to   { transform:rotate(360deg); }
                }
                @keyframes void-pulse {
                    0%,100% { opacity:.4; box-shadow:0 0 8px 3px #6A0DAD, inset 0 0 6px #3D0070; }
                    50%     { opacity:.8; box-shadow:0 0 18px 6px #9B30FF, inset 0 0 12px #6A0DAD; }
                }
                @keyframes glitch {
                    0%,100% { transform:translateX(0) skewX(0deg); opacity:1; }
                    10%     { transform:translateX(-3px) skewX(-2deg); opacity:.8; }
                    20%     { transform:translateX(3px) skewX(2deg); opacity:.9; }
                    30%     { transform:translateX(0) skewX(0deg); opacity:1; }
                    85%     { transform:translateX(0) skewX(0deg); opacity:1; }
                    87%     { transform:translateX(-4px) skewX(-3deg); opacity:.7; }
                    89%     { transform:translateX(4px) skewX(3deg); opacity:.9; }
                    91%     { transform:translateX(0); opacity:1; }
                }
                @keyframes void-particle {
                    0%   { transform:translateY(0) translateX(0) scale(1); opacity:.8; }
                    50%  { transform:translateY(-12px) translateX(5px) scale(.6); opacity:.5; }
                    100% { transform:translateY(-28px) translateX(-3px) scale(.2); opacity:0; }
                }
                @keyframes vortex-ring {
                    from { transform:rotate(0deg) scale(1); opacity:.6; }
                    to   { transform:rotate(-360deg) scale(1.05); opacity:.4; }
                }
                .void-pulse   { animation:void-pulse 2.5s ease-in-out infinite; }
                .void-spin    { animation:void-spin 8s linear infinite; }
                .vortex-ring  { animation:vortex-ring 6s linear infinite; }
                .glitch       { animation:glitch 4s ease-in-out infinite; }
                .vp-1 { animation:void-particle 2.8s ease-out infinite 0.0s; }
                .vp-2 { animation:void-particle 2.2s ease-out infinite 0.6s; }
                .vp-3 { animation:void-particle 3.1s ease-out infinite 1.2s; }
                .vp-4 { animation:void-particle 2.5s ease-out infinite 1.8s; }
                .vp-5 { animation:void-particle 2.0s ease-out infinite 0.9s; }
            `}</style>

            {/* Glitch wrapper */}
            <div className="glitch" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' } as any}>
                {/* Void border */}
                <div className="void-pulse" style={{
                    position: 'absolute', inset: 0,
                    borderWidth: 3, borderStyle: 'solid',
                    borderColor: '#7B2FBE',
                    borderRadius: 16,
                    pointerEvents: 'none',
                } as any} />
                <div style={{
                    position: 'absolute', inset: 2,
                    borderWidth: 1, borderStyle: 'solid',
                    borderColor: 'rgba(155,48,255,0.4)',
                    borderRadius: 14,
                    pointerEvents: 'none',
                } as any} />
            </div>

            {/* Vortex swirl — top */}
            <View style={styles.vortexTop}>
                <svg width="100%" height="80" viewBox="0 0 320 80" preserveAspectRatio="none"
                    style={{ display: 'block', overflow: 'visible' }}>
                    <defs>
                        <radialGradient id="void-rg" cx="50%" cy="100%" r="60%">
                            <stop offset="0%" stopColor="#1A0030" stopOpacity="0.95" />
                            <stop offset="40%" stopColor="#4B0082" stopOpacity="0.7" />
                            <stop offset="80%" stopColor="#7B2FBE" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#9B30FF" stopOpacity="0" />
                        </radialGradient>
                        <filter id="void-blur"><feGaussianBlur stdDeviation="3" /></filter>
                    </defs>

                    {/* Background glow */}
                    <ellipse cx="160" cy="78" rx="150" ry="20" fill="#4B0082" opacity="0.5" filter="url(#void-blur)" className="void-pulse" />

                    {/* Vortex rings */}
                    <g className="vortex-ring" style={{ transformOrigin: '160px 78px' } as any}>
                        <ellipse cx="160" cy="78" rx="120" ry="12" fill="none" stroke="#7B2FBE" strokeWidth="1.5" opacity="0.6" />
                        <ellipse cx="160" cy="78" rx="90" ry="9" fill="none" stroke="#9B30FF" strokeWidth="1" opacity="0.5" />
                    </g>
                    <g className="void-spin" style={{ transformOrigin: '160px 78px' } as any}>
                        <ellipse cx="160" cy="78" rx="60" ry="6" fill="none" stroke="#BF5FFF" strokeWidth="0.8" opacity="0.7" />
                    </g>

                    {/* Dark matter fill */}
                    <path d="M0 80 Q80 40 160 30 Q240 40 320 80Z" fill="url(#void-rg)" />

                    {/* Void particles */}
                    <circle cx="60" cy="60" r="3" fill="#9B30FF" className="vp-1" />
                    <circle cx="110" cy="50" r="2" fill="#BF5FFF" className="vp-2" />
                    <circle cx="160" cy="42" r="3.5" fill="#7B2FBE" className="vp-3" />
                    <circle cx="210" cy="52" r="2.2" fill="#9B30FF" className="vp-4" />
                    <circle cx="260" cy="58" r="2.8" fill="#6A0DAD" className="vp-5" />
                </svg>
            </View>

            {/* Corner void ornaments */}
            {[
                { top: -2, left: -2 },
                { top: -2, right: -2 },
                { bottom: -2, right: -2 },
                { bottom: -2, left: -2 },
            ].map((pos, i) => (
                <div key={i} className="void-spin" style={{
                    position: 'absolute', width: 24, height: 24,
                    ...pos,
                    transformOrigin: '12px 12px',
                    animationDuration: `${6 + i * 1.5}s`,
                } as any}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="#7B2FBE" strokeWidth="1.5" strokeDasharray="4 3" />
                        <circle cx="12" cy="12" r="5" fill="#1A0030" stroke="#9B30FF" strokeWidth="1" />
                        <circle cx="12" cy="12" r="2" fill="#BF5FFF" />
                    </svg>
                </div>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
    vortexTop: {
        position: 'absolute', top: -72, left: -4, right: -4, height: 80,
        overflow: 'visible' as any, zIndex: 200,
    },
});
