import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { ShineOverlay } from '../card-effects/ShineOverlay';

export const GoldFrame = ({ children }: { children?: React.ReactNode }) => {
    return (
        <View style={{ flex: 1 }}>
            {children}
            <View style={[StyleSheet.absoluteFill, { zIndex: 99 }]} pointerEvents="none">
                {/* Main Metallic Border */}
                <View style={styles.borderContainer}>
                    <View style={styles.mainBorder} />
                    <View style={styles.innerBevel} />
                </View>

                {/* Ornate Corner Ornaments */}
                <OrnateCorner style={{ top: -2, left: -2 }} />
                <OrnateCorner style={{ top: -2, right: -2, transform: [{ rotate: '90deg' }] }} />
                <OrnateCorner style={{ bottom: -2, right: -2, transform: [{ rotate: '180deg' }] }} />
                <OrnateCorner style={{ bottom: -2, left: -2, transform: [{ rotate: '270deg' }] }} />

                {/* Dynamic Shine Animation */}
                <ShineOverlay color="rgba(255, 255, 255, 0.4)" duration={3000} />
            </View>
        </View>
    );
};

const OrnateCorner = ({ style }: { style: any }) => (
    <View style={[styles.cornerContainer, style]}>
        <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="gold-grad" x1="0" y1="0" x2="48" y2="48">
                    <Stop offset="0" stopColor="#FFD700" stopOpacity="1" />
                    <Stop offset="0.5" stopColor="#FDB931" stopOpacity="1" />
                    <Stop offset="1" stopColor="#B8860B" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="gold-highlight" x1="0" y1="0" x2="10" y2="10">
                    <Stop offset="0" stopColor="#FFF" stopOpacity="0.8" />
                    <Stop offset="1" stopColor="#FFD700" stopOpacity="0" />
                </LinearGradient>
            </Defs>

            {/* The Main Filigree Path (Victorian Style) */}
            <G transform="translate(2, 2)">
                {/* Thick Shadow Path */}
                <Path
                    d="M0 40 Q0 0 40 0 L42 2 Q4 4 2 42 Z"
                    fill="#3d2b00"
                    opacity="0.3"
                />

                {/* Main Gold Scrollwork */}
                <Path
                    d="M0 35 C 0 10, 10 0, 35 0 C 38 0, 40 2, 40 5 C 40 8, 38 10, 35 10 C 20 10, 10 20, 10 35 C 10 38, 8 40, 5 40 C 2 40, 0 38, 0 35"
                    fill="url(#gold-grad)"
                    stroke="#8B4513"
                    strokeWidth="0.5"
                />

                {/* Ornate Leaf Detail 1 */}
                <Path
                    d="M12 12 C 12 5, 20 0, 25 0 C 20 5, 18 10, 15 15 C 10 18, 5 20, 0 25 C 5 20, 12 12, 12 12"
                    fill="#FDB931"
                    stroke="#3d2b00"
                    strokeWidth="0.2"
                />

                {/* Ornate Leaf Detail 2 */}
                <Path
                    d="M4 18 C 8 12, 12 8, 18 4"
                    stroke="#FFF"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.6"
                />

                {/* Center Gem/Medallion */}
                <G transform="translate(0, 0)">
                    <Path
                        d="M0 12 L12 0 L24 12 L12 24 Z"
                        fill="url(#gold-grad)"
                        stroke="#8B4513"
                        strokeWidth="1"
                    />
                    <Path
                        d="M4 12 L12 4 L20 12 L12 20 Z"
                        fill="#FDB931"
                        stroke="#FFF"
                        strokeWidth="0.5"
                        opacity="0.8"
                    />
                </G>
            </G>
        </Svg>
    </View>
);

const GOLD_COLOR = '#FFD700'; // Gold
const DARK_GOLD = '#B8860B'; // DarkGoldenRod

const styles = StyleSheet.create({
    borderContainer: {
        ...StyleSheet.absoluteFillObject,
        padding: 2,
    },
    mainBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 4,
        borderColor: DARK_GOLD,
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    innerBevel: {
        ...StyleSheet.absoluteFillObject,
        margin: 1,
        borderWidth: 1.5,
        borderColor: GOLD_COLOR,
        borderRadius: 15,
        opacity: 0.9,
        borderTopColor: '#FFF',
        borderLeftColor: '#FFF',
        borderBottomColor: '#8B4513',
        borderRightColor: '#8B4513',
    },
    cornerContainer: {
        position: 'absolute',
        width: 48,
        height: 48,
        zIndex: 10,
    },
});
