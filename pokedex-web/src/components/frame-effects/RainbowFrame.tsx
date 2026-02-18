import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * RainbowFrame — Prismatic rainbow shimmer cycling all colors, golden star particles (Mythical)
 */
export const RainbowFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
            <style>{`
                @keyframes rb-border {
                    0%   { border-color:#FF0000; box-shadow:0 0 14px 5px #FF0000; }
                    16%  { border-color:#FF7700; box-shadow:0 0 14px 5px #FF7700; }
                    33%  { border-color:#FFE000; box-shadow:0 0 14px 5px #FFE000; }
                    50%  { border-color:#00FF44; box-shadow:0 0 14px 5px #00FF44; }
                    66%  { border-color:#00BFFF; box-shadow:0 0 14px 5px #00BFFF; }
                    83%  { border-color:#8800FF; box-shadow:0 0 14px 5px #8800FF; }
                    100% { border-color:#FF0000; box-shadow:0 0 14px 5px #FF0000; }
                }
                @keyframes rb-shine {
                    0%   { transform:translateX(-120%) skewX(-20deg); }
                    100% { transform:translateX(400%) skewX(-20deg); }
                }
                @keyframes star-orbit {
                    from { transform:rotate(0deg) translateX(var(--r)) rotate(0deg); }
                    to   { transform:rotate(360deg) translateX(var(--r)) rotate(-360deg); }
                }
                @keyframes star-twinkle {
                    0%,100% { opacity:1; transform:scale(1); }
                    50%     { opacity:.3; transform:scale(.5); }
                }
                .rb-border { animation:rb-border 3s linear infinite; }
                .rb-shine  { animation:rb-shine 2.5s ease-in-out infinite; }
                .st { animation:star-twinkle 1.5s ease-in-out infinite; }
                .so1 { animation:star-orbit 4.0s linear infinite 0.0s; --r:80px; }
                .so2 { animation:star-orbit 5.0s linear infinite 0.6s; --r:90px; }
                .so3 { animation:star-orbit 3.5s linear infinite 1.2s; --r:75px; }
                .so4 { animation:star-orbit 6.0s linear infinite 1.8s; --r:95px; }
                .so5 { animation:star-orbit 4.5s linear infinite 2.4s; --r:85px; }
                .so6 { animation:star-orbit 3.8s linear infinite 0.9s; --r:70px; }
            `}</style>

            <div className="rb-border" style={{
                position: 'absolute', inset: 0,
                borderWidth: 4, borderStyle: 'solid', borderColor: '#FF0000',
                borderRadius: 16, pointerEvents: 'none',
            } as any} />
            <div style={{
                position: 'absolute', inset: 3,
                borderWidth: 1, borderStyle: 'solid',
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 13, overflow: 'hidden', pointerEvents: 'none',
            } as any}>
                <div className="rb-shine" style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, width: '35%',
                    background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)',
                } as any} />
            </div>

            {/* Orbiting stars */}
            {[
                { cls: 'so1', color: '#FFD700', delay: '0s' },
                { cls: 'so2', color: '#FF00CC', delay: '0.6s' },
                { cls: 'so3', color: '#00BFFF', delay: '1.2s' },
                { cls: 'so4', color: '#FFE000', delay: '1.8s' },
                { cls: 'so5', color: '#00FF44', delay: '2.4s' },
                { cls: 'so6', color: '#FF7700', delay: '0.9s' },
            ].map((s, i) => (
                <div key={i} className={s.cls} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    marginTop: -7, marginLeft: -7, width: 14, height: 14,
                    animationDelay: s.delay,
                } as any}>
                    <svg width="14" height="14" viewBox="0 0 14 14" className="st" style={{ animationDelay: s.delay } as any}>
                        <polygon points="7,1 8.5,5.5 13,5.5 9.5,8.5 11,13 7,10 3,13 4.5,8.5 1,5.5 5.5,5.5"
                            fill={s.color} stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
                    </svg>
                </div>
            ))}

            {/* Rainbow strips top & bottom */}
            <View style={styles.stripTop}>
                <svg width="100%" height="6" viewBox="0 0 320 6" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="rb-g" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FF0000" />
                            <stop offset="16.6%" stopColor="#FF7700" />
                            <stop offset="33.3%" stopColor="#FFE000" />
                            <stop offset="50%" stopColor="#00FF44" />
                            <stop offset="66.6%" stopColor="#00BFFF" />
                            <stop offset="83.3%" stopColor="#8800FF" />
                            <stop offset="100%" stopColor="#FF00CC" />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="320" height="6" fill="url(#rb-g)" opacity="0.8" rx="2" />
                </svg>
            </View>
            <View style={styles.stripBottom}>
                <svg width="100%" height="6" viewBox="0 0 320 6" preserveAspectRatio="none">
                    <rect x="0" y="0" width="320" height="6" fill="url(#rb-g)" opacity="0.8" rx="2" />
                </svg>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { zIndex: 99, overflow: 'visible' as any },
    stripTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 6 },
    stripBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6 },
});
