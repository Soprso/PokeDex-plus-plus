import { forwardRef } from 'react';
import { Image, type ImageProps } from './Image';
import { StyleSheet } from './StyleSheet';
import { View, type ViewProps } from './View';

export interface ImageBackgroundProps extends ViewProps {
    imageStyle?: ImageProps['style'];
    source: ImageProps['source'];
    resizeMode?: ImageProps['resizeMode'];
}

export const ImageBackground = forwardRef<HTMLDivElement, ImageBackgroundProps>(({ style, imageStyle, source, resizeMode, children, ...props }, ref) => {
    return (
        <View ref={ref} style={style} {...props}>
            <Image
                source={source}
                resizeMode={resizeMode}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                    },
                    imageStyle
                ] as any}
            />
            {children}
        </View>
    );
});

ImageBackground.displayName = 'ImageBackground';
