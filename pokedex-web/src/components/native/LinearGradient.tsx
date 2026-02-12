import React from 'react';
import { View, type ViewProps } from './View';

interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
    colors,
    start = { x: 0.5, y: 0 },
    end = { x: 0.5, y: 1 },
    locations,
    style,
    children,
    ...props
}) => {
    const gradientString = `linear-gradient(${180 * Math.atan2(end.y - start.y, end.x - start.x) / Math.PI + 90}deg, ${colors.map((color, index) => {
        const location = locations && locations[index] ? ` ${locations[index] * 100}%` : '';
        return `${color}${location}`;
    }).join(', ')})`;

    return (
        <View
            style={[
                style,
                {
                    backgroundImage: gradientString,
                },
            ] as any}
            {...props}
        >
            {children}
        </View>
    );
};
