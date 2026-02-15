import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ThemedButtonProps {
    label?: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    colorScheme?: 'light' | 'dark';
    disabled?: boolean;
    isLoading?: boolean;
    children?: React.ReactNode;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    leftIcon,
    rightIcon,
    style,
    textStyle,
    colorScheme = 'light',
    disabled = false,
    isLoading = false,
    children
}) => {
    const isDark = colorScheme === 'dark';

    const getBackgroundColor = () => {
        if (disabled) return isDark ? '#333' : '#e5e5e5';
        switch (variant) {
            case 'primary': return '#6366f1';
            case 'secondary': return isDark ? '#333' : '#f3f4f6';
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return '#6366f1';
        }
    };

    const getTextColor = () => {
        if (disabled) return isDark ? '#666' : '#999';
        switch (variant) {
            case 'primary': return '#fff';
            case 'secondary': return isDark ? '#fff' : '#1f2937';
            case 'outline': return isDark ? '#fff' : '#6366f1';
            case 'ghost': return isDark ? '#aaa' : '#6b7280';
            default: return '#fff';
        }
    };

    const getBorderColor = () => {
        if (variant === 'outline') return isDark ? '#444' : '#e5e7eb';
        return 'transparent';
    };

    const getPadding = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 6, paddingHorizontal: 12 };
            case 'md': return { paddingVertical: 10, paddingHorizontal: 16 };
            default: return { paddingVertical: 10, paddingHorizontal: 16 };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm': return 12;
            case 'md': return 14;
            default: return 14;
        }
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || isLoading}
            style={({ pressed }) => [
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                    opacity: pressed ? 0.8 : 1,
                    ...getPadding(),
                },
                style
            ]}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
                <View style={styles.contentContainer}>
                    {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                    {icon && <View style={styles.icon}>{icon}</View>}
                    {label && (
                        <Text style={[
                            styles.text,
                            {
                                color: getTextColor(),
                                fontSize: getFontSize(),
                            },
                            textStyle
                        ]}>
                            {label}
                        </Text>
                    )}
                    {children}
                    {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    icon: {
        marginRight: 0,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    }
});
