import { StyleSheet, View } from '@/components/native';

export const NeonFrame = ({ children }: { children?: React.ReactNode }) => {
    return (
        <View style={{ flex: 1 }}>
            {children}
            <View style={[StyleSheet.absoluteFill, { zIndex: 99 }]} pointerEvents="none">
                {/* Outer Glowing Border */}
                <View style={styles.outerBorder}>
                    <style>
                        {`
                        @keyframes neonPulse {
                            0% { box-shadow: 0 0 5px #39FF14, inset 0 0 5px #39FF14; opacity: 1; border-width: 2px; }
                            50% { box-shadow: 0 0 20px #39FF14, inset 0 0 10px #39FF14; opacity: 0.8; border-width: 3px; }
                            100% { box-shadow: 0 0 5px #39FF14, inset 0 0 5px #39FF14; opacity: 1; border-width: 2px; }
                        }
                        `}
                    </style>
                </View>

                {/* Corner Accents */}
                <Corner style={{ top: -2, left: -2 }} />
                <Corner style={{ top: -2, right: -2, transform: [{ rotate: '90deg' }] }} />
                <Corner style={{ bottom: -2, right: -2, transform: [{ rotate: '180deg' }] }} />
                <Corner style={{ bottom: -2, left: -2, transform: [{ rotate: '270deg' }] }} />
            </View>
        </View>
    );
};

const Corner = ({ style }: { style: any }) => (
    <View style={[styles.cornerContainer as any, style]}>
        <View style={styles.cornerLineH as any} />
        <View style={styles.cornerLineV as any} />
    </View>
);

const NEON_GREEN = '#39FF14';

const styles = StyleSheet.create({
    outerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderRadius: 16,
        margin: 0,
        borderColor: '#39FF14',
        backgroundColor: 'transparent',
        animation: 'neonPulse 1.6s infinite ease-in-out',
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
        backgroundColor: NEON_GREEN,
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5
    },
    cornerLineV: {
        position: 'absolute',
        top: 0, left: 0,
        width: 2, height: 16,
        backgroundColor: NEON_GREEN,
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5
    }
});
