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

// Helper to convert React Native styles to CSS-compatible values
function convertNativeStyles(style: any): any {
    if (!style || typeof style !== 'object') return style;

    const newStyle = { ...style };

    // Handle shorthands
    if (newStyle.paddingHorizontal !== undefined) {
        newStyle.paddingLeft = newStyle.paddingHorizontal;
        newStyle.paddingRight = newStyle.paddingHorizontal;
        delete newStyle.paddingHorizontal;
    }
    if (newStyle.paddingVertical !== undefined) {
        newStyle.paddingTop = newStyle.paddingVertical;
        newStyle.paddingBottom = newStyle.paddingVertical;
        delete newStyle.paddingVertical;
    }
    if (newStyle.marginHorizontal !== undefined) {
        newStyle.marginLeft = newStyle.marginHorizontal;
        newStyle.marginRight = newStyle.marginHorizontal;
        delete newStyle.marginHorizontal;
    }
    if (newStyle.marginVertical !== undefined) {
        newStyle.marginTop = newStyle.marginVertical;
        newStyle.marginBottom = newStyle.marginVertical;
        delete newStyle.marginVertical;
    }

    // Handle shadows
    if (newStyle.shadowColor || newStyle.shadowOffset || newStyle.shadowRadius) {
        const color = newStyle.shadowColor || 'rgba(0,0,0,0.5)';
        const offset = newStyle.shadowOffset || { width: 0, height: 0 };
        const radius = newStyle.shadowRadius || 0;
        // Simple conversion to box-shadow - opacity not easily handled for all color formats without complex parser

        // Simple conversion to box-shadow
        newStyle.boxShadow = `${offset.width}px ${offset.height}px ${radius}px ${color}`;

        delete newStyle.shadowColor;
        delete newStyle.shadowOffset;
        delete newStyle.shadowOpacity;
        delete newStyle.shadowRadius;
        delete newStyle.elevation;
    }

    // Handle lineHeight: React Native numbers are pixels, CSS numbers are multipliers
    if (typeof newStyle.lineHeight === 'number') {
        newStyle.lineHeight = `${newStyle.lineHeight}px`;
    }

    // Handle transforms
    if (Array.isArray(newStyle.transform)) {
        const transforms = newStyle.transform.map((t: any) => {
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

        newStyle.transform = transforms;
    }

    return newStyle;
}

// Rename to avoid conflict with global StyleSheet
export const NativeStyleSheet = {
    create: <T extends Record<string, any>>(styles: T) => styles,
    flatten: <T>(style: StyleProp<T>): T => {
        if (!style) return undefined as unknown as T;
        if (!Array.isArray(style)) {
            // Handle transform array conversion for single objects
            return convertNativeStyles(style) as T;
        }

        const result: any = {};
        for (const item of style) {
            if (item) {
                const flattened = Array.isArray(item) ? NativeStyleSheet.flatten(item) : item;
                Object.assign(result, flattened);
            }
        }
        // Convert transform arrays to CSS strings after merging
        return convertNativeStyles(result);
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
