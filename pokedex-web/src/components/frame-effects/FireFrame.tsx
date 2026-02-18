import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * FireFrame — "Card on Fire"
 *
 * Realistic multi-layer flames burst OUTSIDE the card's top edge using
 * pure CSS animations + inline SVG (no react-native-svg needed).
 * The card border glows ember-orange. Floating embers drift upward.
 */
export const FireFrame = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.root}>
        {children}

        {/* Overlay: pointer-events off so card interactions still work */}
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">

            {/* ─── CSS keyframes ─── */}
            <style>{`
                /* Organic flicker for each flame column */
                @keyframes ff-flicker-a {
                    0%,100%{ transform:scaleX(1)   scaleY(1)    skewX(0deg)  translateY(0px);   opacity:.95; }
                    20%    { transform:scaleX(.93)  scaleY(1.08) skewX(-2deg) translateY(-3px);  opacity:1;   }
                    45%    { transform:scaleX(1.06) scaleY(.94)  skewX(1deg)  translateY(-1px);  opacity:.88; }
                    70%    { transform:scaleX(.97)  scaleY(1.12) skewX(-1deg) translateY(-5px);  opacity:1;   }
                }
                @keyframes ff-flicker-b {
                    0%,100%{ transform:scaleX(1.02) scaleY(.92)  skewX(2deg)  translateY(-2px);  opacity:.85; }
                    30%    { transform:scaleX(.94)  scaleY(1.14) skewX(-3deg) translateY(-6px);  opacity:1;   }
                    60%    { transform:scaleX(1.05) scaleY(1)    skewX(1deg)  translateY(-3px);  opacity:.9;  }
                }
                @keyframes ff-flicker-c {
                    0%,100%{ transform:scaleX(.97)  scaleY(1.1)  skewX(-2deg) translateY(-4px);  opacity:1;   }
                    35%    { transform:scaleX(1.04) scaleY(.88)  skewX(3deg)  translateY(-1px);  opacity:.8;  }
                    65%    { transform:scaleX(.95)  scaleY(1.18) skewX(-1deg) translateY(-7px);  opacity:1;   }
                }
                /* Embers float up and fade */
                @keyframes ff-ember {
                    0%  { transform:translateY(0)   translateX(0)   scale(1);   opacity:.9; }
                    40% { transform:translateY(-18px) translateX(3px)  scale(.7);  opacity:.7; }
                    100%{ transform:translateY(-42px) translateX(-4px) scale(.25); opacity:0;  }
                }
                /* Border pulse */
                @keyframes ff-border-pulse {
                    0%,100%{ opacity:.45; }
                    50%    { opacity:.75; }
                }

                .ff-layer-a { transform-origin:bottom center; animation:ff-flicker-a 1.5s ease-in-out infinite; }
                .ff-layer-b { transform-origin:bottom center; animation:ff-flicker-b 1.1s ease-in-out infinite; }
                .ff-layer-c { transform-origin:bottom center; animation:ff-flicker-c  .9s ease-in-out infinite; }

                .ff-e1 { animation:ff-ember 2.4s ease-out infinite 0.0s; }
                .ff-e2 { animation:ff-ember 1.9s ease-out infinite 0.5s; }
                .ff-e3 { animation:ff-ember 2.7s ease-out infinite 0.9s; }
                .ff-e4 { animation:ff-ember 1.7s ease-out infinite 1.3s; }
                .ff-e5 { animation:ff-ember 2.1s ease-out infinite 0.3s; }
                .ff-e6 { animation:ff-ember 2.5s ease-out infinite 1.7s; }

                .ff-border-glow { animation:ff-border-pulse 2.2s ease-in-out infinite; }
            `}</style>

            {/* ─── Ember-orange glowing border (bottom glow only, subtle) ─── */}
            {/* Using a plain div so className CSS animation works */}
            <div
                className="ff-border-glow"
                style={{
                    position: 'absolute', inset: 0,
                    borderWidth: 7, borderStyle: 'solid',
                    borderColor: '#FF4500',
                    borderRadius: 16,
                    opacity: 0.4,
                    pointerEvents: 'none',
                } as any}
            />
            <View style={styles.borderMain} />


            {/* ─── Flames — positioned ABOVE the card top edge ─── */}
            <View style={styles.flameWrap}>
                <svg
                    width="100%"
                    height="100"
                    viewBox="0 0 320 100"
                    preserveAspectRatio="none"
                    style={{ display: 'block', overflow: 'visible' }}
                >
                    <defs>
                        {/* Base layer: dark crimson → deep orange */}
                        <linearGradient id="ff-g-base" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#7A0000" stopOpacity="1" />
                            <stop offset="35%" stopColor="#CC1100" stopOpacity="1" />
                            <stop offset="70%" stopColor="#FF4400" stopOpacity=".9" />
                            <stop offset="100%" stopColor="#FF7700" stopOpacity=".5" />
                        </linearGradient>
                        {/* Mid layer: orange → amber */}
                        <linearGradient id="ff-g-mid" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#FF3300" stopOpacity="1" />
                            <stop offset="50%" stopColor="#FF7700" stopOpacity="1" />
                            <stop offset="85%" stopColor="#FFBB00" stopOpacity=".85" />
                            <stop offset="100%" stopColor="#FFE066" stopOpacity=".35" />
                        </linearGradient>
                        {/* Tip layer: amber → white-hot */}
                        <linearGradient id="ff-g-tip" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#FF9900" stopOpacity=".9" />
                            <stop offset="55%" stopColor="#FFE033" stopOpacity=".85" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity=".25" />
                        </linearGradient>
                        {/* Soft glow behind flames */}
                        <filter id="ff-glow" x="-15%" y="-15%" width="130%" height="130%">
                            <feGaussianBlur stdDeviation="4" />
                        </filter>
                    </defs>

                    {/* Glow halo */}
                    <ellipse cx="160" cy="98" rx="155" ry="16"
                        fill="#FF4400" opacity="0.3" filter="url(#ff-glow)"
                        className="ff-border-glow" />

                    {/* ══ BASE LAYER — wide, low, dark ══ */}
                    <g className="ff-layer-a">
                        {/* Far-left */}
                        <path d="M0 100 C8 100,14 82,18 64 C21 50,17 34,24 22 C29 12,38 14,40 26 C43 40,37 58,42 72 C46 84,56 94,64 100Z" fill="url(#ff-g-base)" />
                        {/* Centre-left */}
                        <path d="M60 100 C68 98,74 78,78 60 C82 44,76 26,86 12 C93 2,104 4,106 18 C109 34,101 54,106 68 C111 82,122 92,128 100Z" fill="url(#ff-g-base)" />
                        {/* Centre (tallest) */}
                        <path d="M124 100 C132 98,136 76,140 56 C144 38,138 16,150 2 C156 -6,170 -4,172 10 C175 28,166 50,170 66 C174 80,186 92,192 100Z" fill="url(#ff-g-base)" />
                        {/* Centre-right */}
                        <path d="M190 100 C198 98,204 80,208 62 C212 46,206 28,214 14 C220 4,232 6,234 20 C237 36,229 56,234 70 C238 82,250 92,256 100Z" fill="url(#ff-g-base)" />
                        {/* Far-right */}
                        <path d="M254 100 C262 98,268 80,272 62 C276 48,270 32,278 20 C284 10,294 12,296 24 C299 38,292 56,296 70 C300 82,310 92,320 100Z" fill="url(#ff-g-base)" />
                        {/* Base fill */}
                        <rect x="0" y="88" width="320" height="12" fill="#7A0000" opacity=".95" />
                    </g>

                    {/* ══ MID LAYER — narrower, taller, orange/amber ══ */}
                    <g className="ff-layer-b">
                        <path d="M10 100 C16 98,20 80,24 64 C27 50,22 34,30 20 C35 10,45 12,46 24 C49 38,43 56,48 70 C52 82,60 92,66 100Z" fill="url(#ff-g-mid)" opacity=".92" />
                        <path d="M84 100 C90 98,94 76,98 58 C102 42,96 24,106 10 C112 0,124 2,126 16 C129 32,121 52,126 66 C130 78,142 90,146 100Z" fill="url(#ff-g-mid)" opacity=".92" />
                        <path d="M144 100 C150 98,154 74,158 54 C162 36,156 14,168 0 C174 -8,188 -6,190 10 C193 28,183 50,188 66 C192 80,204 92,208 100Z" fill="url(#ff-g-mid)" opacity=".96" />
                        <path d="M206 100 C212 98,216 78,220 60 C224 44,218 26,228 12 C234 2,246 4,248 18 C251 34,243 54,248 68 C252 80,264 92,268 100Z" fill="url(#ff-g-mid)" opacity=".92" />
                    </g>

                    {/* ══ TIP LAYER — thin, tallest, yellow/white-hot ══ */}
                    <g className="ff-layer-c">
                        <path d="M24 100 C28 96,30 78,32 62 C34 48,30 32,37 18 C41 8,50 10,51 22 C53 36,48 54,52 68 C55 80,62 92,64 100Z" fill="url(#ff-g-tip)" opacity=".82" />
                        <path d="M106 100 C110 96,112 76,114 58 C116 42,112 24,120 10 C125 0,136 2,137 16 C139 30,133 50,137 64 C140 76,148 90,150 100Z" fill="url(#ff-g-tip)" opacity=".86" />
                        <path d="M162 100 C166 96,168 72,170 52 C172 34,167 12,178 -2 C183 -10,196 -8,197 8 C199 26,191 48,195 64 C198 78,206 90,210 100Z" fill="url(#ff-g-tip)" opacity=".9" />
                        <path d="M224 100 C228 96,230 78,232 60 C234 44,229 26,237 12 C242 2,252 4,253 18 C255 32,249 52,253 66 C256 78,264 90,266 100Z" fill="url(#ff-g-tip)" opacity=".82" />
                    </g>

                    {/* ══ Floating embers ══ */}
                    <circle cx="55" cy="78" r="2.8" fill="#FF8800" className="ff-e1" />
                    <circle cx="110" cy="65" r="2.2" fill="#FFCC00" className="ff-e2" />
                    <circle cx="162" cy="55" r="3.2" fill="#FF5500" className="ff-e3" />
                    <circle cx="215" cy="70" r="2.0" fill="#FFAA00" className="ff-e4" />
                    <circle cx="258" cy="75" r="2.6" fill="#FF3300" className="ff-e5" />
                    <circle cx="88" cy="60" r="1.8" fill="#FFE033" className="ff-e6" />
                </svg>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    overlay: {
        zIndex: 99,
        // @ts-ignore — overflow:visible needed so flames show above card
        overflow: 'visible',
    },
    borderGlow: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 7,
        borderColor: '#FF4500',
        borderRadius: 16,
        opacity: 0.4,
    },
    borderMain: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 3,
        borderColor: '#FF6600',
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    flameWrap: {
        position: 'absolute',
        top: -92,       // flames sit ABOVE the card top edge
        left: -6,
        right: -6,
        height: 100,
        // @ts-ignore
        overflow: 'visible',
        zIndex: 200,
    },
});
