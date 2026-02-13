import { Ionicons } from '@/components/native/Icons';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onHide?: () => void;
}

export function ToastNotification({ visible, message, type = 'success', duration = 1500, onHide }: ToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (visible) {
            // Animate In
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: Platform.OS !== 'web',
                    friction: 8,
                }),
            ]).start();

            // Auto hide
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            // Ensure hidden state if props change rapidly
            opacity.setValue(0);
            translateY.setValue(20);
        }
    }, [visible, duration]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(translateY, {
                toValue: 20,
                duration: 250,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start(() => {
            onHide?.();
        });
    };

    if (!visible) return null;

    const config = {
        success: { backgroundColor: '#10B981', icon: 'checkmark-circle' }, // Emerald Green
        error: { backgroundColor: '#EF4444', icon: 'alert-circle' }, // Red
        info: { backgroundColor: '#3B82F6', icon: 'information-circle' }, // Blue
    }[type];

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }]
                }
            ]}
        >
            <View style={[styles.card, { backgroundColor: config.backgroundColor }]}>
                <Ionicons name={config.icon as any} size={20} color="#fff" style={styles.icon} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50, // Pill shape
        minWidth: 200,
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
});
