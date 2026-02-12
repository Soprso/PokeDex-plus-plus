import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onHide?: () => void;
}

export function ToastNotification({ visible, message, type = 'success', duration = 3000, onHide }: ToastProps) {
    const [opacity] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            // Fade in
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                }).start(() => {
                    onHide?.();
                });
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide, opacity]);

    if (!visible) return null;

    const backgroundColor = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3',
    }[type];

    return (
        <Animated.View style={[styles.container, { opacity, backgroundColor }]}>
            <Pressable onPress={onHide} style={styles.content}>
                <Text style={styles.message}>{message}</Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        zIndex: 10000,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    content: {
        alignItems: 'center',
    },
    message: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 20,
    },
});
