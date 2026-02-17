import { StyleSheet, View } from 'react-native';
import Svg, { Defs, FeGaussianBlur, FeMerge, FeMergeNode, Filter, Path, Rect } from 'react-native-svg';

export const NeonFrame = ({ children, color = '#00f2ff' }: { children?: React.ReactNode; color?: string }) => {
    const uniqueId = (color || '#00f2ff').replace('#', '');

    return (
        <View style={{ flex: 1 }}>
            {children}
            <View style={[StyleSheet.absoluteFill, { zIndex: 99 }]} pointerEvents="none">
                {/* Neon Tubes - SVG implementation */}
                <Svg width="100%" height="100%">
                    <Defs>
                        {/* Glow Filter */}
                        <Filter id={`neonGlow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
                            <FeGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                            <FeMerge>
                                <FeMergeNode in="blur" />
                                <FeMergeNode in="SourceGraphic" />
                            </FeMerge>
                        </Filter>
                    </Defs>

                    {/* Outer Glow Path (Transparent Soft Light) */}
                    <Rect
                        x="1%" y="1%"
                        width="98%" height="98%"
                        rx="16" ry="16"
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeOpacity="0.2"
                        style={{
                            animation: `neonPulse_${uniqueId} 2s infinite ease-in-out`
                        } as any}
                    />

                    {/* Mid Glow Path */}
                    <Rect
                        x="2%" y="2%"
                        width="96%" height="96%"
                        rx="15" ry="15"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeOpacity="0.5"
                    />

                    {/* Core White Tube */}
                    <Rect
                        x="3%" y="3%"
                        width="94%" height="94%"
                        rx="14" ry="14"
                        fill="none"
                        stroke="#FFF"
                        strokeWidth="1.5"
                        style={{
                            animation: `neonFlicker_${uniqueId} 4s infinite linear`
                        } as any}
                    />
                </Svg>

                {/* Tech Corners */}
                <TechCorner style={{ top: 0, left: 0 }} color={color} />
                <TechCorner style={{ top: 0, right: 0, transform: [{ rotate: '90deg' }] }} color={color} />
                <TechCorner style={{ bottom: 0, right: 0, transform: [{ rotate: '180deg' }] }} color={color} />
                <TechCorner style={{ bottom: 0, left: 0, transform: [{ rotate: '270deg' }] }} color={color} />

                {/* Animation Styles */}
                <style>
                    {`
                    @keyframes neonPulse_${uniqueId} {
                        0%, 100% { stroke-width: 6; opacity: 0.2; }
                        50% { stroke-width: 10; opacity: 0.4; }
                    }
                    @keyframes neonFlicker_${uniqueId} {
                        0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
                        20%, 24%, 55% { opacity: 0.2; }
                    }
                    `}
                </style>
            </View>
        </View>
    );
};

const TechCorner = ({ style, color }: { style: any; color: string }) => (
    <View style={[styles.cornerContainer, style]}>
        <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            {/* Outer Bracket */}
            <Path
                d="M2 12 V2 H12"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="square"
            />
            {/* Inner Hex-tech Accent */}
            <Path
                d="M6 6 L10 6 L14 10 L14 14"
                stroke={color}
                strokeWidth="1"
                opacity="0.6"
            />
            {/* Corner Dot */}
            <Rect x="2" y="2" width="4" height="4" fill={color} />
        </Svg>
    </View>
);

const styles = StyleSheet.create({
    cornerContainer: {
        position: 'absolute',
        width: 32,
        height: 32,
    }
});
