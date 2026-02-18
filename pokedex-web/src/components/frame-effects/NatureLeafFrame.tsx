import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * NatureLeafFrame — Animated leaves/vines along border, flowers blooming at corners
 */
export const NatureLeafFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes nature-glow {
                    0%,100% { box-shadow:0 0 8px 2px #228B22, inset 0 0 5px #006400; opacity:.5; }
                    50%     { box-shadow:0 0 16px 5px #32CD32, inset 0 0 8px #228B22; opacity:.8; }
                }
                @keyframes leaf-sway {
                    0%,100% { transform:rotate(-8deg) translateY(0); }
                    50%     { transform:rotate(8deg) translateY(-3px); }
                }
                @keyframes leaf-fall {
                    0%   { transform:translateY(-10px) rotate(0deg) translateX(0); opacity:1; }
                    100% { transform:translateY(40px) rotate(180deg) translateX(8px); opacity:0; }
                }
                @keyframes flower-bloom {
                    0%   { transform:scale(0) rotate(0deg); opacity:0; }
                    40%  { transform:scale(1.1) rotate(180deg); opacity:1; }
                    70%  { transform:scale(1) rotate(360deg); opacity:1; }
                    100% { transform:scale(0) rotate(540deg); opacity:0; }
                }
                @keyframes vine-grow {
                    0%   { stroke-dashoffset:200; opacity:.4; }
                    50%  { stroke-dashoffset:0;   opacity:.9; }
                    100% { stroke-dashoffset:-200; opacity:.4; }
                }
                .nature-glow  { animation:nature-glow 3s ease-in-out infinite; }
                .leaf-sway    { transform-origin:bottom center; animation:leaf-sway 2.5s ease-in-out infinite; }
                .lf-1 { animation:leaf-fall 3.0s ease-in infinite 0.0s; }
                .lf-2 { animation:leaf-fall 2.5s ease-in infinite 0.8s; }
                .lf-3 { animation:leaf-fall 3.5s ease-in infinite 1.6s; }
                .lf-4 { animation:leaf-fall 2.8s ease-in infinite 2.4s; }
                .fb-1 { animation:flower-bloom 4s ease-in-out infinite 0.0s; transform-origin:center; }
                .fb-2 { animation:flower-bloom 4s ease-in-out infinite 1.0s; transform-origin:center; }
                .fb-3 { animation:flower-bloom 4s ease-in-out infinite 2.0s; transform-origin:center; }
                .fb-4 { animation:flower-bloom 4s ease-in-out infinite 3.0s; transform-origin:center; }
                .vine { stroke-dasharray:200; animation:vine-grow 4s ease-in-out infinite; }
            `}</style>

            {/* Nature border */}
            <div className="nature-glow" style={{
                position: 'absolute', inset: 0,
                borderWidth: 3, borderStyle: 'solid', borderColor: '#228B22',
                borderRadius: 16, pointerEvents: 'none',
            } as any} />
            <div style={{
                position: 'absolute', inset: 2,
                borderWidth: 1, borderStyle: 'solid',
                borderColor: 'rgba(50,205,50,0.35)',
                borderRadius: 14, pointerEvents: 'none',
            } as any} />

            {/* Vines along sides */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' } as any}
                viewBox="0 0 320 420" preserveAspectRatio="none">
                <defs>
                    <filter id="leaf-blur"><feGaussianBlur stdDeviation="0.5" /></filter>
                </defs>
                {/* Left vine */}
                <path d="M4 20 Q-4 80 4 140 Q12 200 4 260 Q-4 320 4 380"
                    fill="none" stroke="#228B22" strokeWidth="2" className="vine" opacity="0.7" />
                {/* Right vine */}
                <path d="M316 20 Q324 80 316 140 Q308 200 316 260 Q324 320 316 380"
                    fill="none" stroke="#228B22" strokeWidth="2" className="vine" opacity="0.7"
                    style={{ animationDelay: '2s' } as any} />
                {/* Left leaf clusters */}
                {[60, 140, 220, 300].map((y, i) => (
                    <g key={i} className="leaf-sway" style={{ transformOrigin: `4px ${y}px`, animationDelay: `${i * 0.6}s` } as any}>
                        <ellipse cx="-8" cy={y} rx="10" ry="6" fill="#32CD32" opacity="0.85" transform={`rotate(${-30 + i * 15} 4 ${y})`} />
                        <line x1="4" y1={y} x2="-8" y2={y} stroke="#228B22" strokeWidth="1" />
                    </g>
                ))}
                {/* Right leaf clusters */}
                {[80, 160, 240, 320].map((y, i) => (
                    <g key={i} className="leaf-sway" style={{ transformOrigin: `316px ${y}px`, animationDelay: `${i * 0.6 + 0.3}s` } as any}>
                        <ellipse cx="328" cy={y} rx="10" ry="6" fill="#228B22" opacity="0.85" transform={`rotate(${30 - i * 15} 316 ${y})`} />
                        <line x1="316" y1={y} x2="328" y2={y} stroke="#1A6B1A" strokeWidth="1" />
                    </g>
                ))}
            </svg>

            {/* Falling leaves */}
            {[
                { left: 30, top: 10, cls: 'lf-1', color: '#32CD32' },
                { left: 100, top: 5, cls: 'lf-2', color: '#228B22' },
                { left: 200, top: 8, cls: 'lf-3', color: '#7CFC00' },
                { left: 270, top: 12, cls: 'lf-4', color: '#32CD32' },
            ].map((l, i) => (
                <div key={i} className={l.cls} style={{
                    position: 'absolute', left: l.left, top: l.top, width: 12, height: 12,
                } as any}>
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <ellipse cx="6" cy="6" rx="5" ry="3" fill={l.color} opacity="0.9" transform="rotate(-30 6 6)" />
                        <line x1="6" y1="3" x2="6" y2="9" stroke="#1A6B1A" strokeWidth="0.8" />
                    </svg>
                </div>
            ))}

            {/* Corner flowers */}
            {[
                { top: -6, left: -6, cls: 'fb-1' },
                { top: -6, right: -6, cls: 'fb-2' },
                { bottom: -6, right: -6, cls: 'fb-3' },
                { bottom: -6, left: -6, cls: 'fb-4' },
            ].map((pos, i) => (
                <div key={i} className={pos.cls} style={{
                    position: 'absolute', width: 22, height: 22, ...pos,
                } as any}>
                    <svg width="22" height="22" viewBox="0 0 22 22">
                        {/* Petals */}
                        {[0, 60, 120, 180, 240, 300].map((angle, j) => (
                            <ellipse key={j} cx={11 + Math.cos(angle * Math.PI / 180) * 5} cy={11 + Math.sin(angle * Math.PI / 180) * 5}
                                rx="3.5" ry="2" fill={j % 2 === 0 ? '#FFB6C1' : '#FF69B4'} opacity="0.9"
                                transform={`rotate(${angle} ${11 + Math.cos(angle * Math.PI / 180) * 5} ${11 + Math.sin(angle * Math.PI / 180) * 5})`} />
                        ))}
                        {/* Centre */}
                        <circle cx="11" cy="11" r="3.5" fill="#FFD700" />
                        <circle cx="11" cy="11" r="1.5" fill="#FF8C00" />
                    </svg>
                </div>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
});
