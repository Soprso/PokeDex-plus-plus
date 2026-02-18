import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { ShineOverlay } from '../card-effects/ShineOverlay';

/**
 * DiamondFrame Component
 * Features a silver/platinum polished glow border and Diamond ornaments at the four corners.
 * Includes a shine effect running across the card.
 */
export const DiamondFrame = ({ children }: { children?: React.ReactNode }) => {
    return (
        <View style={{ flex: 1 }}>
            {children}
            <View style={[StyleSheet.absoluteFill, { zIndex: 99 }]} pointerEvents="none">
                {/* Main Platinum/Silver Border */}
                <View style={styles.borderContainer}>
                    <View style={styles.mainBorder} />
                    <View style={styles.innerBevel} />
                </View>

                {/* Diamond Corner Ornaments */}
                <DiamondCorner style={{ top: -4, left: -4 }} />
                <DiamondCorner style={{ top: -4, right: -4, transform: [{ rotate: '90deg' }] }} />
                <DiamondCorner style={{ bottom: -4, right: -4, transform: [{ rotate: '180deg' }] }} />
                <DiamondCorner style={{ bottom: -4, left: -4, transform: [{ rotate: '270deg' }] }} />

                {/* Dynamic Shine Animation */}
                <ShineOverlay color="rgba(255, 255, 255, 0.6)" duration={2500} />
            </View>
        </View>
    );
};

const DiamondCorner = ({ style }: { style: any }) => (
    <View style={[styles.cornerContainer, style]}>
        <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="platinum-grad" x1="0" y1="0" x2="48" y2="48">
                    <Stop offset="0" stopColor="#E5E4E2" stopOpacity="1" />
                    <Stop offset="0.5" stopColor="#A9A9A9" stopOpacity="1" />
                    <Stop offset="1" stopColor="#E5E4E2" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="diamond-facet" x1="12" y1="12" x2="36" y2="36">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <Stop offset="0.5" stopColor="#E0FFFF" stopOpacity="0.8" />
                    <Stop offset="1" stopColor="#B0E0E6" stopOpacity="0.6" />
                </LinearGradient>
            </Defs>

            <G transform="translate(2, 2)">
                {/* Platinum Setting */}
                <Path
                    d="M0 40 L0 10 L10 0 L40 0 L15 15 L15 40 Z"
                    fill="url(#platinum-grad)"
                    stroke="#707070"
                    strokeWidth="0.5"
                />

                {/* The Diamond Gem */}
                <G transform="translate(5, 5)">
                    {/* Main diamond outline */}
                    <Path
                        d="M15 0 L30 15 L15 30 L0 15 Z"
                        fill="url(#diamond-facet)"
                        stroke="#00BFFF"
                        strokeWidth="0.5"
                    />

                    {/* Internal Facets for 3D effect */}
                    <Path
                        d="M15 0 L15 30 M0 15 L30 15"
                        stroke="#FFFFFF"
                        strokeWidth="0.5"
                        opacity="0.8"
                    />
                    <Rect
                        x="10"
                        y="10"
                        width="10"
                        height="10"
                        transform="rotate(45 15 15)"
                        stroke="#FFFFFF"
                        strokeWidth="0.5"
                        opacity="0.6"
                    />
                </G>
            </G>
        </Svg>
    </View>
);

const PLATINUM_COLOR = '#E5E4E2';
const DARK_PLATINUM = '#A9A9A9';

const styles = StyleSheet.create({
    borderContainer: {
        ...StyleSheet.absoluteFillObject,
        padding: 2,
    },
    mainBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 4,
        borderColor: DARK_PLATINUM,
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    innerBevel: {
        ...StyleSheet.absoluteFillObject,
        margin: 1,
        borderWidth: 1.5,
        borderColor: PLATINUM_COLOR,
        borderRadius: 15,
        opacity: 0.9,
        borderTopColor: '#FFF',
        borderLeftColor: '#FFF',
        borderBottomColor: '#707070',
        borderRightColor: '#707070',
    },
    cornerContainer: {
        position: 'absolute',
        width: 48,
        height: 48,
        zIndex: 10,
    },
});
