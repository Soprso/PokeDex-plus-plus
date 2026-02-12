import type { CSSProperties } from 'react';
import React, { forwardRef } from 'react';
import { StyleSheet } from './StyleSheet';

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'style'> {
    source?: { uri: string } | string; // Handle RN source object or string
    style?: CSSProperties | (CSSProperties | undefined)[] | undefined;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(({ source, style, resizeMode = 'cover', src, ...props }, ref) => {
    const flattenedStyle = StyleSheet.flatten(style);

    const imageSrc = typeof source === 'object' && source !== null ? (source as any).uri : source || src;
    const objectFit = resizeMode === 'stretch' ? 'fill' : resizeMode;

    return (
        <img
            ref={ref}
            src={imageSrc}
            style={{ objectFit: objectFit as any, ...(flattenedStyle as CSSProperties) }}
            {...props}
        />
    );
});

Image.displayName = 'Image';
