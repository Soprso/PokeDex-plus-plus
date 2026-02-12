import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 450; // Approximate hero section height
const BLOB_COUNT = 16;

const blobs = Array.from({ length: BLOB_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: HERO_HEIGHT + Math.random() * 50,
    width: 15 + Math.random() * 25,
    height: 10 + Math.random() * 15,
    delay: Math.random() * 2800,
    duration: 18000 + Math.random() * 12000,
}));

function PoisonBlob({ blob }: { blob: typeof blobs[0] }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        translateY.value = withDelay(
            blob.delay,
            withRepeat(
                withTiming(-HERO_HEIGHT - 100, {
                    duration: blob.duration,
                    easing: Easing.linear,
                }),
                -1
            )
        );

        opacity.value = withDelay(
            blob.delay,
            withRepeat(
                withTiming(0.25, {
                    duration: 5000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        scale.value = withDelay(
            blob.delay,
            withRepeat(
                withTiming(1.3, {
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: blob.x },
            { translateY: blob.y + translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Svg width={blob.width} height={blob.height}>
                <Ellipse
                    cx={blob.width / 2}
                    cy={blob.height / 2}
                    rx={blob.width / 2}
                    ry={blob.height / 2}
                    fill="#A040A0"
                    opacity={0.3}
                />
            </Svg>
        </Animated.View>
    );
}

export default function PoisonEffect() {
    return (
        <>
            {blobs.map((blob) => (
                <PoisonBlob key={blob.id} blob={blob} />
            ))}
        </>
    );
}
