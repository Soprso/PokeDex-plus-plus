import type { CSSProperties } from 'react';
import React, { forwardRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from './StyleSheet';

export interface LayoutChangeEvent {
    nativeEvent: {
        layout: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
}

export interface ViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
    style?: StyleProp<ViewStyle>;
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
    onLayout?: (event: LayoutChangeEvent) => void;
}

export const View = forwardRef<HTMLDivElement, ViewProps>(({ style, pointerEvents, onLayout, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);

    React.useEffect(() => {
        if (onLayout && internalRef.current) {
            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { x, y, width, height } = entry.contentRect;
                    onLayout({
                        nativeEvent: {
                            layout: { x, y, width, height }
                        }
                    });
                }
            });
            observer.observe(internalRef.current);
            return () => observer.disconnect();
        }
    }, [onLayout]);

    // Flatten styles using StyleSheet.flatten handles nested arrays and null/undefined
    const flattenedStyle = StyleSheet.flatten(style) as CSSProperties;

    const pointerEventsStyle = pointerEvents === 'none' ? 'none' : 'auto';

    return (
        <div
            ref={internalRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative', // Vital for absolute positioning of children
                boxSizing: 'border-box', // Vital for RN layout model
                borderStyle: 'solid', // Vital for borders to show up
                borderWidth: 0, // Reset default browser border width
                minHeight: 0, // Flexbox fix
                minWidth: 0, // Flexbox fix
                pointerEvents: pointerEvents ? pointerEventsStyle : undefined,
                ...flattenedStyle
            }}
            {...props}
        />
    );
});

View.displayName = 'View';
