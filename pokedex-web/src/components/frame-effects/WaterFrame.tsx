import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * WaterFrame — Animated water ripples, bubbles rising, waves crashing at bottom
 */
export const WaterFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes water-shimmer {
                    0%,100% { opacity:.4; box-shadow:0 0 8px 2px #00BFFF, inset 0 0 6px #006994; }
                    50%     { opacity:.75; box-shadow:0 0 16px 5px #00BFFF, inset 0 0 10px #00BFFF; }
                }
                @keyframes wave-shift {
                    0%   { transform:translateX(0); }
                    100% { transform:translateX(-50%); }
                }
                @keyframes bubble-rise {
                    0%   { transform:translateY(0) scale(1); opacity:.8; }
                    80%  { transform:translateY(-60px) scale(1.1); opacity:.5; }
                    100% { transform:translateY(-80px) scale(.5); opacity:0; }
                }
                @keyframes ripple {
                    0%   { transform:scale(0.5); opacity:.8; }
                    100% { transform:scale(2.5); opacity:0; }
                }
                .water-shimmer { animation:water-shimmer 3s ease-in-out infinite; }
                .wave-shift    { animation:wave-shift 4s linear infinite; }
                .wave-shift-r  { animation:wave-shift 6s linear infinite reverse; }
                .b1 { animation:bubble-rise 3.0s ease-out infinite 0.0s; }
                .b2 { animation:bubble-rise 2.5s ease-out infinite 0.7s; }
                .b3 { animation:bubble-rise 3.5s ease-out infinite 1.4s; }
                .b4 { animation:bubble-rise 2.8s ease-out infinite 2.0s; }
                .b5 { animation:bubble-rise 3.2s ease-out infinite 0.4s; }
                .b6 { animation:bubble-rise 2.2s ease-out infinite 1.8s; }
                .ripple-1 { animation:ripple 2s ease-out infinite 0.0s; }
                .ripple-2 { animation:ripple 2s ease-out infinite 0.8s; }
            `}</style>

            {/* Water border */}
            <div className="water-shimmer" style={{
                position: 'absolute', inset: 0,
                borderWidth: 3, borderStyle: 'solid',
                borderColor: '#00BFFF',
                borderRadius: 16,
                pointerEvents: 'none',
            } as any} />
            <div style={{
                position: 'absolute', inset: 2,
                borderWidth: 1, borderStyle: 'solid',
                borderColor: 'rgba(0,191,255,0.35)',
                borderRadius: 14,
                pointerEvents: 'none',
            } as any} />

            {/* Bubbles rising along sides */}
            {[
                { left: 6, bottom: 30, cls: 'b1', r: 4 },
                { left: 14, bottom: 60, cls: 'b2', r: 3 },
                { left: 8, bottom: 90, cls: 'b3', r: 5 },
                { right: 6, bottom: 40, cls: 'b4', r: 3.5 },
                { right: 12, bottom: 70, cls: 'b5', r: 4.5 },
                { right: 7, bottom: 100, cls: 'b6', r: 3 },
            ].map((b, i) => (
                <div key={i} className={b.cls} style={{
                    position: 'absolute',
                    left: 'left' in b ? b.left : undefined,
                    right: 'right' in b ? b.right : undefined,
                    bottom: b.bottom,
                    width: b.r * 2, height: b.r * 2,
                } as any}>
                    <svg width={b.r * 2} height={b.r * 2} viewBox={`0 0 ${b.r * 2} ${b.r * 2}`}>
                        <circle cx={b.r} cy={b.r} r={b.r - 0.5} fill="none" stroke="#00BFFF" strokeWidth="1" opacity="0.8" />
                        <circle cx={b.r * 0.7} cy={b.r * 0.7} r={b.r * 0.25} fill="#FFFFFF" opacity="0.6" />
                    </svg>
                </div>
            ))}

            {/* Wave at bottom */}
            <View style={styles.waveBottom}>
                <div style={{ width: '200%', height: '100%', display: 'flex' } as any}>
                    <svg width="50%" height="30" viewBox="0 0 320 30" preserveAspectRatio="none"
                        className="wave-shift" style={{ display: 'block', flexShrink: 0 }}>
                        <defs>
                            <linearGradient id="wave-g" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00BFFF" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="#006994" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                        <path d="M0 15 Q40 0 80 15 Q120 30 160 15 Q200 0 240 15 Q280 30 320 15 L320 30 L0 30Z" fill="url(#wave-g)" />
                    </svg>
                    <svg width="50%" height="30" viewBox="0 0 320 30" preserveAspectRatio="none"
                        className="wave-shift" style={{ display: 'block', flexShrink: 0 }}>
                        <path d="M0 15 Q40 0 80 15 Q120 30 160 15 Q200 0 240 15 Q280 30 320 15 L320 30 L0 30Z" fill="url(#wave-g)" />
                    </svg>
                </div>
            </View>

            {/* Ripple effects at bottom */}
            <View style={styles.rippleArea}>
                <svg width="100%" height="20" viewBox="0 0 320 20" preserveAspectRatio="none">
                    <ellipse cx="80" cy="10" rx="20" ry="5" fill="none" stroke="#00BFFF" strokeWidth="1" className="ripple-1" opacity="0.6" />
                    <ellipse cx="240" cy="10" rx="20" ry="5" fill="none" stroke="#00BFFF" strokeWidth="1" className="ripple-2" opacity="0.6" />
                </svg>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
    waveBottom: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
        overflow: 'hidden' as any,
        borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
    },
    rippleArea: {
        position: 'absolute', bottom: 4, left: 0, right: 0, height: 20,
        overflow: 'visible' as any,
    },
});
