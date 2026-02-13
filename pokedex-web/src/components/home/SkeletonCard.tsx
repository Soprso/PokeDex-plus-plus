import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonCardProps {
    width: number;
    darkMode?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ width, darkMode }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <View style={[styles.card, { width }, darkMode && styles.cardDark]}>
            <View style={styles.pulseContainer}>
                {/* Content */}
                <Animated.View style={[styles.content, { opacity }]}>
                    {/* ID Placeholder */}
                    <View style={[styles.skeletonText, { width: 40, alignSelf: 'flex-start' }, darkMode && styles.skeletonDark]} />

                    {/* Image Circle Placeholder */}
                    <View style={[styles.skeletonCircle, darkMode && styles.skeletonDark]} />

                    {/* Name Placeholder */}
                    <View style={[styles.skeletonText, { width: 100, height: 20, marginBottom: 8 }, darkMode && styles.skeletonDark]} />

                    {/* Types Placeholder */}
                    <View style={styles.typesRow}>
                        <View style={[styles.skeletonPill, darkMode && styles.skeletonDark]} />
                        <View style={[styles.skeletonPill, darkMode && styles.skeletonDark]} />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 8,
        minHeight: 220,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    cardDark: {
        backgroundColor: '#2a2a2a',
    },
    pulseContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    skeletonText: {
        height: 14,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 12,
    },
    skeletonCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    skeletonPill: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
    },
    skeletonDark: {
        backgroundColor: '#404040',
    },
    typesRow: {
        flexDirection: 'row',
        gap: 8,
    },
});
