export type DimensionValue = number | string;
export type OpaqueColorValue = symbol & { __TYPE__: 'Color' };
export type ViewStyle = React.CSSProperties & {
    elevation?: number;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
};
export type TextStyle = React.CSSProperties & {
    fontSize?: number;
    fontWeight?: string | number;
};
export type ImageStyle = React.CSSProperties & {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
};
export type StyleProp<T> = T | Array<T | undefined> | undefined;

// Helper to convert React Native transform arrays to CSS strings
function convertTransforms(style: any): any {
    if (!style || typeof style !== 'object') return style;

    if (Array.isArray(style.transform)) {
        const transforms = style.transform.map((t: any) => {
            const key = Object.keys(t)[0];
            const value = t[key];

            if (key === 'rotate') {
                return `rotate(${value})`;
            } else if (key === 'scale') {
                return `scale(${value})`;
            } else if (key === 'scaleX') {
                return `scaleX(${value})`;
            } else if (key === 'scaleY') {
                return `scaleY(${value})`;
            } else if (key === 'translateX') {
                return `translateX(${value}px)`;
            } else if (key === 'translateY') {
                return `translateY(${value}px)`;
            } else if (key === 'skewX') {
                return `skewX(${value})`;
            } else if (key === 'skewY') {
                return `skewY(${value})`;
            }
            return '';
        }).filter(Boolean).join(' ');

        return { ...style, transform: transforms };
    }

    return style;
}

// Rename to avoid conflict with global StyleSheet
export const NativeStyleSheet = {
    create: <T extends Record<string, any>>(styles: T) => styles,
    flatten: <T>(style: StyleProp<T>): T => {
        if (!style) return undefined as unknown as T;
        if (!Array.isArray(style)) {
            // Handle transform array conversion for single objects
            return convertTransforms(style) as T;
        }

        const result: any = {};
        for (const item of style) {
            if (item) {
                const flattened = Array.isArray(item) ? NativeStyleSheet.flatten(item) : item;
                Object.assign(result, flattened);
            }
        }
        // Convert transform arrays to CSS strings after merging
        return convertTransforms(result);
    },
    absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    } as ViewStyle,
    absoluteFillObject: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    } as ViewStyle,
    hairlineWidth: 1,
};

export const StyleSheet = NativeStyleSheet;
