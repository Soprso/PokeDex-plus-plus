import type { CSSProperties } from 'react';
import React, { forwardRef } from 'react';
import { StyleSheet } from './StyleSheet';

export interface ScrollViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
    contentContainerStyle?: CSSProperties | (CSSProperties | undefined)[] | undefined;
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    style?: CSSProperties | (CSSProperties | undefined)[] | undefined;
}

export const ScrollView = forwardRef<HTMLDivElement, ScrollViewProps>(
    ({ contentContainerStyle, horizontal, style, children, ...props }, ref) => {
        const flattenedStyle = StyleSheet.flatten(style) as CSSProperties;
        const flattenedContentStyle = StyleSheet.flatten(contentContainerStyle) as CSSProperties;

        return (
            <div
                ref={ref}
                style={{
                    display: 'flex',
                    flexDirection: horizontal ? 'row' : 'column',
                    overflowX: horizontal ? 'auto' : 'hidden',
                    overflowY: horizontal ? 'hidden' : 'auto',
                    ...(flattenedStyle as CSSProperties),
                }}
                {...props}
            >
                <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', flexGrow: 1, ...(flattenedContentStyle as CSSProperties) }}>
                    {children}
                </div>
            </div>
        );
    }
);

ScrollView.displayName = 'ScrollView';
