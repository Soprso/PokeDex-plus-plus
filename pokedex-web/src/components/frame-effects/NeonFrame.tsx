import { StyleSheet, View } from '@/components/native';

export const NeonFrame = ({ children, color = '#39FF14' }: { children?: React.ReactNode; color?: string }) => {
    const shadowColor = color;
    return (
        <View style={{ flex: 1 }}>
            {children}
            <View style={[StyleSheet.absoluteFill, { zIndex: 99 }]} pointerEvents="none">
                {/* Outer Glowing Border */}
                <View style={[styles.outerBorder, { borderColor: color }]}>
                    <style>
                        {`
                        @keyframes neonPulse_${color.replace('#', '')} {
                            0% { box-shadow: 0 0 5px ${color}, inset 0 0 5px ${color}; opacity: 1; border-width: 2px; }
                            50% { box-shadow: 0 0 20px ${color}, inset 0 0 10px ${color}; opacity: 0.8; border-width: 3px; }
                            100% { box-shadow: 0 0 5px ${color}, inset 0 0 5px ${color}; opacity: 1; border-width: 2px; }
                        }
                        `}
                    </style>
                </View>

                {/* Corner Accents */}
                <Corner style={{ top: -2, left: -2 }} color={color} shadowColor={shadowColor} />
                <Corner style={{ top: -2, right: -2, transform: [{ rotate: '90deg' }] }} color={color} shadowColor={shadowColor} />
                <Corner style={{ bottom: -2, right: -2, transform: [{ rotate: '180deg' }] }} color={color} shadowColor={shadowColor} />
                <Corner style={{ bottom: -2, left: -2, transform: [{ rotate: '270deg' }] }} color={color} shadowColor={shadowColor} />
            </View>
        </View>
    );
};

const Corner = ({ style, color, shadowColor }: { style: any; color: string; shadowColor: string }) => (
    <View style={[styles.cornerContainer as any, style]}>
        <View style={[styles.cornerLineH as any, { backgroundColor: color, shadowColor: shadowColor }]} />
        <View style={[styles.cornerLineV as any, { backgroundColor: color, shadowColor: shadowColor }]} />
    </View>
);

const styles = StyleSheet.create({
    outerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderRadius: 16,
        margin: 0,
        backgroundColor: 'transparent',
        // animation property is handled via class or inline style in web, 
        // but since we are using react-native-web + custom style tag:
    } as any,
    cornerContainer: {
        position: 'absolute',
        width: 16,
        height: 16,
    },
    cornerLineH: {
        position: 'absolute',
        top: 0, left: 0,
        width: 16, height: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5
    },
    cornerLineV: {
        position: 'absolute',
        top: 0, left: 0,
        width: 2, height: 16,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5
    }
});
