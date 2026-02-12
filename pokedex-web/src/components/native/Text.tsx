import type { CSSProperties } from 'react';
import React, { forwardRef } from 'react';
import { StyleSheet } from './StyleSheet';

export interface TextProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'style'> {
    style?: CSSProperties | (CSSProperties | undefined)[] | undefined;
    numberOfLines?: number;
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(({ style, numberOfLines, ...props }, ref) => {
    const flattenedStyle = StyleSheet.flatten(style) as CSSProperties;
    const lineClampStyle: CSSProperties = numberOfLines ? {
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    } : {};

    return (
        <span
            ref={ref}
            style={{
                display: 'block',
                margin: 0,
                ...lineClampStyle,
                ...(flattenedStyle as CSSProperties)
            }}
            {...props}
        />
    );
});

Text.displayName = 'Text';
