import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CyberBubble = ({ delay, color }: { delay: number; color: string }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withRepeat(
            withDelay(
                delay,
                withSequence(
                    withTiming(1.3, { duration: 2000, easing: Easing.out(Easing.ease) }),
                    withTiming(0, { duration: 1500 }) // Fade back down
                )
            ),
            -1,
            false
        );

        opacity.value = withRepeat(
            withDelay(
                delay,
                withSequence(
                    withTiming(0.4, { duration: 1000 }), // Subtle max opacity
                    withTiming(0.4, { duration: 1000 }), // Hold
                    withTiming(0, { duration: 1500 })
                )
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    // Random Position entirely (Top & Left)
    // Use state or constant? Constant is fine since component remounts or useMemo.
    // Actually inside component body is fine for random on mount.
    const left = `${Math.random() * 90}%`;
    const top = `${Math.random() * 90}%`;

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    backgroundColor: color,
                    left: left as any,
                    top: top as any,
                },
                animatedStyle,
            ]}
        />
    );
};

const NeonBorder = () => {
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 3000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const animatedProps = useAnimatedProps(() => {
        if (layout.width === 0) return { strokeDasharray: [0, 0], strokeDashoffset: 0 } as any;

        const perimeter = 2 * (layout.width + layout.height);
        const segmentLength = perimeter * 0.25;
        const gapLength = perimeter - segmentLength;

        const dashArray = [segmentLength, gapLength];
        const offset = -1 * progress.value * perimeter;

        return {
            strokeDasharray: dashArray,
            strokeDashoffset: offset,
        } as any;
    });

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={(e) => setLayout(e.nativeEvent.layout)}
            pointerEvents="none"
        >
            {layout.width > 0 && (
                <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill}>
                    <Defs>
                        <LinearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#00FFFF" stopOpacity="1" />
                            <Stop offset="1" stopColor="#FF69B4" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>

                    {/* Glow Layer */}
                    <AnimatedRect
                        x="2"
                        y="2"
                        width={layout.width - 4}
                        height={layout.height - 4}
                        rx="12"
                        ry="12"
                        stroke="url(#neonGrad)"
                        strokeWidth="6"
                        strokeOpacity="0.5"
                        fill="none"
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                    />

                    {/* Core Layer */}
                    <AnimatedRect
                        x="2"
                        y="2"
                        width={layout.width - 4}
                        height={layout.height - 4}
                        rx="12"
                        ry="12"
                        stroke="#00FFFF"
                        strokeWidth="2"
                        fill="none"
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                    />
                </Svg>
            )}
        </View>
    );
};

export const NeonCyberEffect = () => {
    const bubbles = Array.from({ length: 8 }).map((_, i) => ( // Increased count slightly
        <CyberBubble
            key={i}
            delay={i * 600}
            color={i % 2 === 0 ? '#00FFFF' : '#FF69B4'}
        />
    ));

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <ImageBackground
                source={require('@/assets/card-effects/neon-cyber.jpg')}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />
            {/* Cyber Grid Tint */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 5, 20, 0.4)' }]} />

            {/* Bubbles Layer */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {bubbles}
            </View>

            {/* Seamless Running Border */}
            <NeonBorder />
        </View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        position: 'absolute',
        width: 20, // Increased size
        height: 20,
        borderRadius: 10,
        // Removed heavy shadow for subtlety
    }
});
