// Shim for react-native-svg to wrap components with proper style handling
import { forwardRef } from 'react';
import { StyleSheet } from 'react-native';

const createComponent = (Tag: string) => {
    return forwardRef(({ style, ...props }: any, ref) => {
        const flattenedStyle = StyleSheet.flatten(style);
        return <Tag ref={ref} style={flattenedStyle} {...props} />;
    });
};

export const Svg = createComponent('svg');
export const Circle = createComponent('circle');
export const ClipPath = createComponent('clipPath');
export const Defs = createComponent('defs');
export const Ellipse = createComponent('ellipse');
export const G = createComponent('g');
export const Image = createComponent('image');
export const Line = createComponent('line');
export const LinearGradient = createComponent('linearGradient');
export const Mask = createComponent('mask');
export const Path = createComponent('path');
export const Pattern = createComponent('pattern');
export const Polygon = createComponent('polygon');
export const Polyline = createComponent('polyline');
export const RadialGradient = createComponent('radialGradient');
export const Rect = createComponent('rect');
export const Stop = createComponent('stop');
export const Symbol = createComponent('symbol');
export const Text = createComponent('text');
export const TextPath = createComponent('textPath');
export const TSpan = createComponent('tspan');
export const Use = createComponent('use');

export default Svg;
