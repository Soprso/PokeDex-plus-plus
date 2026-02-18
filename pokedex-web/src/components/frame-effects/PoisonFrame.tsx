import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * PoisonFrame — Dripping toxic green slime from top, purple/green glowing border, toxic bubbles
 */
export const PoisonFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes poison-pulse {
                    0%,100% { opacity:.45; box-shadow:0 0 8px 3px #39FF14, inset 0 0 6px #7B2FBE; }
                    50%     { opacity:.8;  box-shadow:0 0 16px 5px #39FF14, inset 0 0 10px #9B30FF; }
                }
                @keyframes drip {
                    0%   { transform:scaleY(0) translateY(0); opacity:1; }
                    60%  { transform:scaleY(1) translateY(0);  opacity:1; }
                    85%  { transform:scaleY(1) translateY(8px); opacity:.8; }
                    100% { transform:scaleY(0) translateY(16px); opacity:0; }
                }
                @keyframes toxic-bubble {
                    0%   { transform:translateY(0) scale(1); opacity:.9; }
                    70%  { transform:translateY(-50px) scale(1.1); opacity:.5; }
                    100% { transform:translateY(-70px) scale(.4); opacity:0; }
                }
                @keyframes slime-wobble {
                    0%,100% { transform:scaleX(1); }
                    50%     { transform:scaleX(1.04); }
                }
                .poison-pulse  { animation:poison-pulse 2.8s ease-in-out infinite; }
                .slime-wobble  { animation:slime-wobble 2s ease-in-out infinite; }
                .drip-1 { animation:drip 2.4s ease-in cubic-bezier(.4,0,.6,1) infinite 0.0s; transform-origin:top center; }
                .drip-2 { animation:drip 2.8s ease-in cubic-bezier(.4,0,.6,1) infinite 0.5s; transform-origin:top center; }
                .drip-3 { animation:drip 2.1s ease-in cubic-bezier(.4,0,.6,1) infinite 1.0s; transform-origin:top center; }
                .drip-4 { animation:drip 3.0s ease-in cubic-bezier(.4,0,.6,1) infinite 1.5s; transform-origin:top center; }
                .drip-5 { animation:drip 2.6s ease-in cubic-bezier(.4,0,.6,1) infinite 0.8s; transform-origin:top center; }
                .tb-1 { animation:toxic-bubble 3.0s ease-out infinite 0.0s; }
                .tb-2 { animation:toxic-bubble 2.5s ease-out infinite 0.8s; }
                .tb-3 { animation:toxic-bubble 3.5s ease-out infinite 1.6s; }
                .tb-4 { animation:toxic-bubble 2.8s ease-out infinite 2.2s; }
            `}</style>

            {/* Poison border */}
            <div className="poison-pulse" style={{
                position: 'absolute', inset: 0,
                borderWidth: 3, borderStyle: 'solid',
                borderColor: '#39FF14',
                borderRadius: 16,
                pointerEvents: 'none',
            } as any} />
            <div style={{
                position: 'absolute', inset: 2,
                borderWidth: 1, borderStyle: 'solid',
                borderColor: 'rgba(57,255,20,0.3)',
                borderRadius: 14,
                pointerEvents: 'none',
            } as any} />

            {/* Slime drips from top */}
            <View style={styles.dripsTop}>
                <svg width="100%" height="70" viewBox="0 0 320 70" preserveAspectRatio="none"
                    style={{ display: 'block', overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="slime-g" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1A5C00" stopOpacity="1" />
                            <stop offset="50%" stopColor="#39FF14" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#7FFF00" stopOpacity="0.6" />
                        </linearGradient>
                        <filter id="slime-blur"><feGaussianBlur stdDeviation="1.5" /></filter>
                    </defs>

                    {/* Slime base layer */}
                    <rect x="0" y="0" width="320" height="12" fill="#1A5C00" opacity="0.95" className="slime-wobble" />
                    <path d="M0 8 Q160 16 320 8 L320 12 L0 12Z" fill="#39FF14" opacity="0.5" />

                    {/* Glow */}
                    <rect x="0" y="10" width="320" height="4" fill="#39FF14" opacity="0.4" filter="url(#slime-blur)" />

                    {/* Drip 1 */}
                    <g className="drip-1">
                        <ellipse cx="40" cy="12" rx="6" ry="4" fill="#39FF14" opacity="0.9" />
                        <path d="M34 14 Q40 40 40 55 Q40 65 44 65 Q48 65 46 55 Q46 40 46 14Z" fill="url(#slime-g)" />
                        <ellipse cx="42" cy="65" rx="5" ry="6" fill="#39FF14" opacity="0.85" />
                    </g>
                    {/* Drip 2 */}
                    <g className="drip-2">
                        <ellipse cx="90" cy="12" rx="5" ry="3.5" fill="#39FF14" opacity="0.9" />
                        <path d="M85 14 Q90 35 90 48 Q90 58 93 58 Q96 58 95 48 Q95 35 95 14Z" fill="url(#slime-g)" />
                        <ellipse cx="91" cy="58" rx="4" ry="5" fill="#39FF14" opacity="0.8" />
                    </g>
                    {/* Drip 3 — centre, longest */}
                    <g className="drip-3">
                        <ellipse cx="160" cy="12" rx="7" ry="5" fill="#39FF14" opacity="0.95" />
                        <path d="M153 14 Q160 45 160 62 Q160 70 165 70 Q170 70 167 62 Q167 45 167 14Z" fill="url(#slime-g)" />
                        <ellipse cx="163" cy="70" rx="6" ry="7" fill="#7FFF00" opacity="0.85" />
                    </g>
                    {/* Drip 4 */}
                    <g className="drip-4">
                        <ellipse cx="230" cy="12" rx="5" ry="3.5" fill="#39FF14" opacity="0.9" />
                        <path d="M225 14 Q230 38 230 52 Q230 60 233 60 Q236 60 235 52 Q235 38 235 14Z" fill="url(#slime-g)" />
                        <ellipse cx="231" cy="60" rx="4.5" ry="5.5" fill="#39FF14" opacity="0.8" />
                    </g>
                    {/* Drip 5 */}
                    <g className="drip-5">
                        <ellipse cx="285" cy="12" rx="6" ry="4" fill="#39FF14" opacity="0.9" />
                        <path d="M279 14 Q285 42 285 56 Q285 64 288 64 Q291 64 290 56 Q290 42 290 14Z" fill="url(#slime-g)" />
                        <ellipse cx="286" cy="64" rx="5" ry="6" fill="#39FF14" opacity="0.85" />
                    </g>

                    {/* Toxic bubbles */}
                    <g className="tb-1"><circle cx="60" cy="50" r="4" fill="none" stroke="#39FF14" strokeWidth="1.2" opacity="0.8" /><circle cx="59" cy="48" r="1" fill="#7FFF00" opacity="0.6" /></g>
                    <g className="tb-2"><circle cx="140" cy="45" r="3" fill="none" stroke="#7FFF00" strokeWidth="1" opacity="0.7" /><circle cx="139" cy="43" r="0.8" fill="#FFFFFF" opacity="0.5" /></g>
                    <g className="tb-3"><circle cx="200" cy="52" r="5" fill="none" stroke="#39FF14" strokeWidth="1.2" opacity="0.75" /><circle cx="199" cy="50" r="1.2" fill="#7FFF00" opacity="0.6" /></g>
                    <g className="tb-4"><circle cx="260" cy="48" r="3.5" fill="none" stroke="#39FF14" strokeWidth="1" opacity="0.8" /><circle cx="259" cy="46" r="0.9" fill="#FFFFFF" opacity="0.5" /></g>
                </svg>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
    dripsTop: {
        position: 'absolute', top: -12, left: -4, right: -4, height: 70,
        overflow: 'visible' as any, zIndex: 200,
    },
});
