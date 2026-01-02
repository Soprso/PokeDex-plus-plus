import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const { width } = Dimensions.get('window');

interface ModalAction {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface ThemedModalProps {
    visible: boolean;
    title: string;
    description?: string;
    actions?: ModalAction[];
    onDismiss?: () => void;
    children?: React.ReactNode;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

export function ThemedModal({
    visible,
    title,
    description,
    actions = [],
    onDismiss,
    children,
    icon,
    iconColor,
}: ThemedModalProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <TouchableWithoutFeedback onPress={onDismiss}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            entering={ZoomIn.duration(300).springify()}
                            style={[styles.contentContainer, { backgroundColor }]}
                        >
                            <ThemedView style={styles.content}>
                                {icon && (
                                    <View style={[styles.iconContainer, { backgroundColor: iconColor ? `${iconColor}20` : `${tintColor}20` }]}>
                                        <Ionicons name={icon} size={32} color={iconColor || tintColor} />
                                    </View>
                                )}

                                <ThemedText type="title" style={styles.title}>{title}</ThemedText>

                                {description && (
                                    <ThemedText style={styles.description}>{description}</ThemedText>
                                )}

                                {children}

                                <View style={[styles.actions, actions.length > 2 && styles.actionsVertical]}>
                                    {actions.map((action, index) => {
                                        const isCancel = action.style === 'cancel';
                                        const isDestructive = action.style === 'destructive';

                                        return (
                                            <Pressable
                                                key={index}
                                                style={({ pressed }) => [
                                                    styles.button,
                                                    actions.length <= 2 && styles.buttonFlex,
                                                    isCancel && styles.buttonCancel,
                                                    isDestructive && { backgroundColor: '#FF6B6B20' },
                                                    !isCancel && !isDestructive && { backgroundColor: tintColor },
                                                    pressed && { opacity: 0.8 },
                                                ]}
                                                onPress={() => {
                                                    action.onPress?.();
                                                    if (!action.onPress && onDismiss) onDismiss(); // Default close behavior
                                                }}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.buttonText,
                                                        isCancel && { color: textColor, opacity: 0.7 },
                                                        isDestructive && { color: '#FF6B6B' },
                                                        !isCancel && !isDestructive && { color: '#FFF' },
                                                    ]}
                                                >
                                                    {action.text}
                                                </ThemedText>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </ThemedView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    contentContainer: {
        width: Math.min(width - 48, 360),
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        marginBottom: 8,
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    actionsVertical: {
        flexDirection: 'column',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonFlex: {
        flex: 1,
    },
    buttonCancel: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(150, 150, 150, 0.3)',
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});
