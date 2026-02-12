export const Dimensions = {
    get: (_dim: 'window' | 'screen') => {
        if (typeof window === 'undefined') {
            return { width: 0, height: 0, scale: 1, fontScale: 1 };
        }
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scale: window.devicePixelRatio || 1,
            fontScale: 1,
        };
    },
    addEventListener: (_type: string, handler: any) => {
        const listener = () => {
            handler({
                window: Dimensions.get('window'),
                screen: Dimensions.get('screen'),
            });
        };
        window.addEventListener('resize', listener);
        return {
            remove: () => window.removeEventListener('resize', listener),
        };
    },
};
