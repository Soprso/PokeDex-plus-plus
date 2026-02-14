import { StyleSheet, View } from '@/components/native';

export const GoldFrame = ({ children }: { children?: React.ReactNode }) => {
    return (
        <View style={{ flex: 1 }}>
            {children}
            <View style={[StyleSheet.absoluteFill, { zIndex: 99 }]} pointerEvents="none">
                {/* Outer Gold Border */}
                <View style={styles.outerBorder} />

                {/* Inner Gold Border */}
                <View style={styles.innerBorder} />

                {/* Corner Ornaments */}
                <Corner style={{ top: -3, left: -3 }} />
                <Corner style={{ top: -3, right: -3, transform: [{ rotate: '90deg' }] }} />
                <Corner style={{ bottom: -3, right: -3, transform: [{ rotate: '180deg' }] }} />
                <Corner style={{ bottom: -3, left: -3, transform: [{ rotate: '270deg' }] }} />
            </View>
        </View>
    );
};

const Corner = ({ style }: { style: any }) => (
    <View style={[styles.cornerContainer, style]}>
        {/* Outer Filigree Curve */}
        <View style={styles.cornerOuterCurve as any} />

        {/* Inner Detail Line */}
        <View style={styles.cornerInnerCurve as any} />

        {/* Central Gem/Diamond */}
        <View style={styles.centerGemContainer as any}>
            <View style={styles.centerGem as any} />
        </View>

        {/* End Finials (Dots) */}
        <View style={styles.finialRight as any} />
        <View style={styles.finialBottom as any} />
    </View>
);

const GOLD_COLOR = '#FFD700'; // Gold
const DARK_GOLD = '#B8860B'; // DarkGoldenRod

const styles = StyleSheet.create({
    outerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: GOLD_COLOR,
        borderRadius: 12,
        margin: 2,
    },
    innerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: DARK_GOLD,
        borderRadius: 10,
        margin: 6,
        opacity: 0.5
    },
    cornerContainer: {
        position: 'absolute',
        width: 32,
        height: 32,
    },
    cornerOuterCurve: {
        position: 'absolute',
        top: 0, left: 0,
        width: 32, height: 32,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: GOLD_COLOR,
        borderTopLeftRadius: 12, // Reduced for tighter curve
        borderTopRightRadius: 0,
        zIndex: 2,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
    },
    cornerInnerCurve: {
        position: 'absolute',
        top: 6, left: 6,
        width: 26, height: 26,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: DARK_GOLD,
        borderTopLeftRadius: 6,
        zIndex: 1
    },
    centerGemContainer: {
        position: 'absolute',
        top: 0, left: 0,
        width: 12, height: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    centerGem: {
        width: 6, height: 6,
        backgroundColor: GOLD_COLOR,
        transform: [{ rotate: '45deg' }],
        borderWidth: 1,
        borderColor: '#FFF',
    },
    finialRight: {
        position: 'absolute',
        top: -1,
        right: 0,
        width: 6, height: 6,
        borderRadius: 3,
        backgroundColor: GOLD_COLOR,
        borderWidth: 1,
        borderColor: DARK_GOLD,
        zIndex: 3
    },
    finialBottom: {
        position: 'absolute',
        bottom: 0,
        left: -1,
        width: 6, height: 6,
        borderRadius: 3,
        backgroundColor: GOLD_COLOR,
        borderWidth: 1,
        borderColor: DARK_GOLD,
        zIndex: 3
    }
});
