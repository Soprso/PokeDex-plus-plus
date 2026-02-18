import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * IceFrostFrame — Crystalline ice shards from corners, cracked-glass border, cold blue shimmer
 */
export const IceFrostFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes ice-shimmer {
                    0%,100% { opacity:.35; }
                    50%      { opacity:.65; }
                }
                @keyframes ice-shard-grow {
                    0%   { transform:scaleY(0.7) translateY(4px); opacity:.6; }
                    50%  { transform:scaleY(1.05) translateY(-2px); opacity:1; }
                    100% { transform:scaleY(0.7) translateY(4px); opacity:.6; }
                }
                @keyframes frost-drift {
                    0%,100% { transform:translateX(0) translateY(0); opacity:.5; }
                    50%     { transform:translateX(2px) translateY(-3px); opacity:.8; }
                }
                .ice-shimmer   { animation:ice-shimmer 3s ease-in-out infinite; }
                .ice-shard     { transform-origin:bottom center; animation:ice-shard-grow 2.5s ease-in-out infinite; }
                .frost-drift   { animation:frost-drift 4s ease-in-out infinite; }
            `}</style>

            {/* Cracked-glass border */}
            <div className="ice-shimmer" style={{
                position: 'absolute', inset: 0,
                borderWidth: 3, borderStyle: 'solid',
                borderColor: '#A8D8EA',
                borderRadius: 16,
                boxShadow: '0 0 8px 2px #7EC8E3, inset 0 0 6px 1px #B0E0FF',
                pointerEvents: 'none',
            } as any} />
            {/* Inner frost layer */}
            <div style={{
                position: 'absolute', inset: 2,
                borderWidth: 1, borderStyle: 'solid',
                borderColor: 'rgba(200,240,255,0.4)',
                borderRadius: 14,
                pointerEvents: 'none',
            } as any} />

            {/* Ice shards — top edge */}
            <View style={styles.shardsTop}>
                <svg width="100%" height="60" viewBox="0 0 320 60" preserveAspectRatio="none"
                    style={{ display: 'block', overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="ice-g" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                            <stop offset="40%" stopColor="#B0E8FF" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#5BB8D4" stopOpacity="0.6" />
                        </linearGradient>
                        <filter id="ice-blur"><feGaussianBlur stdDeviation="1" /></filter>
                    </defs>
                    {/* Glow base */}
                    <rect x="0" y="52" width="320" height="8" fill="#7EC8E3" opacity="0.4" filter="url(#ice-blur)" className="ice-shimmer" />
                    {/* Shard cluster — left */}
                    <g className="ice-shard" style={{ animationDelay: '0s' } as any}>
                        <polygon points="20,58 14,20 20,58" fill="url(#ice-g)" opacity="0.9" />
                        <polygon points="30,58 22,8  38,8  34,58" fill="url(#ice-g)" opacity="0.85" />
                        <polygon points="40,58 36,28 44,28 42,58" fill="url(#ice-g)" opacity="0.7" />
                    </g>
                    {/* Shard cluster — centre-left */}
                    <g className="ice-shard" style={{ animationDelay: '0.6s' } as any}>
                        <polygon points="90,58 84,14 96,14 92,58" fill="url(#ice-g)" opacity="0.9" />
                        <polygon points="100,58 96,30 104,30 102,58" fill="url(#ice-g)" opacity="0.7" />
                        <polygon points="108,58 104,22 112,22 110,58" fill="url(#ice-g)" opacity="0.8" />
                    </g>
                    {/* Shard cluster — centre */}
                    <g className="ice-shard" style={{ animationDelay: '1.2s' } as any}>
                        <polygon points="152,58 144,4  160,4  156,58" fill="url(#ice-g)" opacity="0.95" />
                        <polygon points="162,58 158,18 166,18 164,58" fill="url(#ice-g)" opacity="0.75" />
                        <polygon points="170,58 166,32 174,32 172,58" fill="url(#ice-g)" opacity="0.65" />
                    </g>
                    {/* Shard cluster — centre-right */}
                    <g className="ice-shard" style={{ animationDelay: '0.4s' } as any}>
                        <polygon points="218,58 212,16 224,16 220,58" fill="url(#ice-g)" opacity="0.88" />
                        <polygon points="228,58 224,28 232,28 230,58" fill="url(#ice-g)" opacity="0.72" />
                        <polygon points="236,58 232,20 240,20 238,58" fill="url(#ice-g)" opacity="0.8" />
                    </g>
                    {/* Shard cluster — right */}
                    <g className="ice-shard" style={{ animationDelay: '1s' } as any}>
                        <polygon points="280,58 274,10 286,10 282,58" fill="url(#ice-g)" opacity="0.9" />
                        <polygon points="290,58 286,26 294,26 292,58" fill="url(#ice-g)" opacity="0.7" />
                        <polygon points="298,58 294,18 302,18 300,58" fill="url(#ice-g)" opacity="0.8" />
                    </g>
                    {/* Frost particles */}
                    <circle cx="60" cy="40" r="2" fill="#D0F0FF" opacity="0.7" className="frost-drift" />
                    <circle cx="130" cy="35" r="1.5" fill="#FFFFFF" opacity="0.8" className="frost-drift" style={{ animationDelay: '1s' } as any} />
                    <circle cx="200" cy="42" r="2.2" fill="#B0E8FF" opacity="0.6" className="frost-drift" style={{ animationDelay: '2s' } as any} />
                    <circle cx="260" cy="38" r="1.8" fill="#D0F0FF" opacity="0.75" className="frost-drift" style={{ animationDelay: '0.5s' } as any} />
                </svg>
            </View>

            {/* Corner frost ornaments */}
            {[
                { top: -4, left: -4, rotate: '0deg' },
                { top: -4, right: -4, rotate: '90deg' },
                { bottom: -4, right: -4, rotate: '180deg' },
                { bottom: -4, left: -4, rotate: '270deg' },
            ].map((pos, i) => (
                <div key={i} className="frost-drift" style={{
                    position: 'absolute', width: 28, height: 28,
                    ...pos,
                    transform: `rotate(${pos.rotate})`,
                    animationDelay: `${i * 0.7}s`,
                } as any}>
                    <svg width="28" height="28" viewBox="0 0 28 28">
                        <polygon points="14,2 16,12 26,14 16,16 14,26 12,16 2,14 12,12" fill="#B0E8FF" opacity="0.9" />
                        <polygon points="14,6 15,12 20,14 15,16 14,22 13,16 8,14 13,12" fill="#FFFFFF" opacity="0.7" />
                    </svg>
                </div>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
    shardsTop: {
        position: 'absolute', top: -52, left: -4, right: -4, height: 60,
        overflow: 'visible' as any, zIndex: 200,
    },
});
