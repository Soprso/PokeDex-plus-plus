import { forwardRef, type CSSProperties } from 'react';
import { StyleSheet } from './StyleSheet';

export interface SafeAreaViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
    style?: CSSProperties | (CSSProperties | undefined)[] | undefined;
    edges?: string[]; // Ignore
}

export const SafeAreaView = forwardRef<HTMLDivElement, SafeAreaViewProps>(({ style, edges, ...props }, ref) => {
    const flattenedStyle = StyleSheet.flatten(style) as CSSProperties;

    return (
        <div
            ref={ref}
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
                ...(flattenedStyle as CSSProperties)
            }}
            {...props}
        />
    );
});

SafeAreaView.displayName = 'SafeAreaView';
