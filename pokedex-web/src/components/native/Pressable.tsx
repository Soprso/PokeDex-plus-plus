import React, { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { StyleSheet } from './StyleSheet';

export interface PressableProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'children'> {
    style?: CSSProperties | (CSSProperties | undefined)[] | ((state: { pressed: boolean }) => CSSProperties | (CSSProperties | undefined)[] | undefined) | undefined;
    onPress?: () => void;
    activeOpacity?: number;
    children?: ReactNode | ((state: { pressed: boolean; hovered: boolean; focused: boolean }) => ReactNode);
}

export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(({ style, onPress, onClick, children, ...props }, ref) => {
    const [pressed, setPressed] = React.useState(false);

    const resolveStyle = (s: any) => {
        if (typeof s === 'function') return s({ pressed });
        return s;
    };

    // Resolve recursively first (or just map top level) then flatten
    // Since flatten handles arrays, we just need to resolve functions.
    // If style is array, map it. If style is func, call it.
    let resolvedStyle = style;
    if (typeof style === 'function') {
        resolvedStyle = style({ pressed });
    } else if (Array.isArray(style)) {
        resolvedStyle = style.map(resolveStyle);
    }

    const flattenedStyle = StyleSheet.flatten(resolvedStyle) as CSSProperties;

    return (
        <button
            ref={ref}
            onClick={onPress || onClick}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'inherit',
                display: 'flex', // RN Touchable usually wraps views which are flex
                flexDirection: 'column',
                ...(flattenedStyle as CSSProperties)
            }}
            {...props}
        >
            {typeof children === 'function' ? children({ pressed, hovered: false, focused: false }) : children}
        </button>
    );
});

Pressable.displayName = 'Pressable';

export const TouchableOpacity = forwardRef<HTMLButtonElement, PressableProps>(({ activeOpacity = 0.2, style, ...props }, ref) => {
    return (
        <Pressable
            ref={ref}
            style={({ pressed }) => [
                { opacity: pressed ? activeOpacity : 1, transition: 'opacity 0.2s' },
                ...(Array.isArray(style) ? style : [style])
            ] as any[]}
            {...props}
        />
    )
});

TouchableOpacity.displayName = 'TouchableOpacity';
