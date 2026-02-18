import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * ElectricFrame — Lightning bolts arcing around the border, spark bursts at corners
 */
export const ElectricFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes elec-arc {
                    0%,100% { opacity:0; }
                    5%,10%  { opacity:1; }
                    15%     { opacity:0; }
                    60%,65% { opacity:.8; }
                    70%     { opacity:0; }
                }
                @keyframes elec-glow {
                    0%,100% { opacity:.4; box-shadow:0 0 6px 2px #FFE000, inset 0 0 4px #FFE000; }
                    50%     { opacity:.8; box-shadow:0 0 14px 4px #FFE000, inset 0 0 8px #FFE000; }
                }
                @keyframes spark {
                    0%   { transform:scale(0) rotate(0deg);   opacity:1; }
                    60%  { transform:scale(1.4) rotate(180deg); opacity:.6; }
                    100% { transform:scale(0) rotate(360deg); opacity:0; }
                }
                @keyframes elec-flicker {
                    0%,100% { opacity:.9; }
                    30%     { opacity:.3; }
                    60%     { opacity:1; }
                    80%     { opacity:.5; }
                }
                .elec-glow    { animation:elec-glow 1.8s ease-in-out infinite; }
                .elec-arc-1   { animation:elec-arc 2.4s ease-in-out infinite 0.0s; }
                .elec-arc-2   { animation:elec-arc 2.4s ease-in-out infinite 0.8s; }
                .elec-arc-3   { animation:elec-arc 2.4s ease-in-out infinite 1.6s; }
                .spark-1 { animation:spark 1.2s ease-out infinite 0.0s; }
                .spark-2 { animation:spark 1.5s ease-out infinite 0.4s; }
                .spark-3 { animation:spark 1.0s ease-out infinite 0.9s; }
                .spark-4 { animation:spark 1.3s ease-out infinite 1.3s; }
                .elec-flicker { animation:elec-flicker 0.15s steps(1) infinite; }
            `}</style>

            {/* Electric glowing border */}
            <div className="elec-glow" style={{
                position: 'absolute', inset: 0,
                borderWidth: 3, borderStyle: 'solid',
                borderColor: '#FFE000',
                borderRadius: 16,
                pointerEvents: 'none',
            } as any} />
            <div style={{
                position: 'absolute', inset: 2,
                borderWidth: 1, borderStyle: 'solid',
                borderColor: 'rgba(255,255,180,0.5)',
                borderRadius: 14,
                pointerEvents: 'none',
            } as any} />

            {/* Lightning arcs — top */}
            <View style={styles.arcsTop}>
                <svg width="100%" height="50" viewBox="0 0 320 50" preserveAspectRatio="none"
                    style={{ display: 'block', overflow: 'visible' }}>
                    <defs>
                        <filter id="elec-blur"><feGaussianBlur stdDeviation="1.5" /></filter>
                    </defs>
                    {/* Glow base */}
                    <rect x="0" y="44" width="320" height="6" fill="#FFE000" opacity="0.3" filter="url(#elec-blur)" />

                    {/* Arc 1 */}
                    <g className="elec-arc-1">
                        <polyline points="40,48 36,30 44,20 38,10 46,2" stroke="#FFFFFF" strokeWidth="2" fill="none" filter="url(#elec-blur)" />
                        <polyline points="40,48 36,30 44,20 38,10 46,2" stroke="#FFE000" strokeWidth="1.2" fill="none" />
                    </g>
                    {/* Arc 2 */}
                    <g className="elec-arc-2">
                        <polyline points="120,48 114,28 124,16 116,6 126,0" stroke="#FFFFFF" strokeWidth="2" fill="none" filter="url(#elec-blur)" />
                        <polyline points="120,48 114,28 124,16 116,6 126,0" stroke="#FFE000" strokeWidth="1.2" fill="none" />
                        <polyline points="120,48 126,32 118,22 124,12 118,4" stroke="#AAFF00" strokeWidth="0.8" fill="none" />
                    </g>
                    {/* Arc 3 — centre */}
                    <g className="elec-arc-3">
                        <polyline points="160,48 152,24 164,12 156,2 168,0" stroke="#FFFFFF" strokeWidth="2.5" fill="none" filter="url(#elec-blur)" />
                        <polyline points="160,48 152,24 164,12 156,2 168,0" stroke="#FFE000" strokeWidth="1.5" fill="none" />
                    </g>
                    {/* Arc 4 */}
                    <g className="elec-arc-1" style={{ animationDelay: '1.2s' } as any}>
                        <polyline points="220,48 214,26 224,14 216,4 228,0" stroke="#FFFFFF" strokeWidth="2" fill="none" filter="url(#elec-blur)" />
                        <polyline points="220,48 214,26 224,14 216,4 228,0" stroke="#FFE000" strokeWidth="1.2" fill="none" />
                    </g>
                    {/* Arc 5 */}
                    <g className="elec-arc-2" style={{ animationDelay: '0.4s' } as any}>
                        <polyline points="290,48 284,28 294,16 286,6 296,2" stroke="#FFFFFF" strokeWidth="2" fill="none" filter="url(#elec-blur)" />
                        <polyline points="290,48 284,28 294,16 286,6 296,2" stroke="#FFE000" strokeWidth="1.2" fill="none" />
                    </g>

                    {/* Spark particles */}
                    <g className="spark-1" style={{ transformOrigin: '60px 40px' } as any}>
                        <line x1="56" y1="40" x2="64" y2="40" stroke="#FFE000" strokeWidth="1.5" />
                        <line x1="60" y1="36" x2="60" y2="44" stroke="#FFE000" strokeWidth="1.5" />
                    </g>
                    <g className="spark-2" style={{ transformOrigin: '160px 44px' } as any}>
                        <line x1="156" y1="44" x2="164" y2="44" stroke="#FFFFFF" strokeWidth="2" />
                        <line x1="160" y1="40" x2="160" y2="48" stroke="#FFFFFF" strokeWidth="2" />
                    </g>
                    <g className="spark-3" style={{ transformOrigin: '250px 42px' } as any}>
                        <line x1="246" y1="42" x2="254" y2="42" stroke="#FFE000" strokeWidth="1.5" />
                        <line x1="250" y1="38" x2="250" y2="46" stroke="#FFE000" strokeWidth="1.5" />
                    </g>
                </svg>
            </View>

            {/* Corner spark bursts */}
            {[
                { top: -8, left: -8 },
                { top: -8, right: -8 },
                { bottom: -8, right: -8 },
                { bottom: -8, left: -8 },
            ].map((pos, i) => (
                <div key={i} className={`spark-${(i % 4) + 1}`} style={{
                    position: 'absolute', width: 20, height: 20,
                    ...pos,
                    transformOrigin: '10px 10px',
                } as any}>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <line x1="10" y1="2" x2="10" y2="18" stroke="#FFE000" strokeWidth="1.5" />
                        <line x1="2" y1="10" x2="18" y2="10" stroke="#FFE000" strokeWidth="1.5" />
                        <line x1="4" y1="4" x2="16" y2="16" stroke="#FFFFFF" strokeWidth="1" />
                        <line x1="16" y1="4" x2="4" y2="16" stroke="#FFFFFF" strokeWidth="1" />
                        <circle cx="10" cy="10" r="2.5" fill="#FFE000" />
                    </svg>
                </div>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
    arcsTop: {
        position: 'absolute', top: -44, left: -4, right: -4, height: 50,
        overflow: 'visible' as any, zIndex: 200,
    },
});
