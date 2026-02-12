import { createContext, useContext } from 'react';
import { SafeAreaView as RNSafeAreaView, View } from 'react-native';

const InsetsContext = createContext({ top: 0, bottom: 0, left: 0, right: 0 });
const MetricsContext = createContext(null);

export const SafeAreaProvider = ({ children, initialMetrics }) => {
    const insets = initialMetrics?.insets || { top: 0, bottom: 0, left: 0, right: 0 };

    return (
        <InsetsContext.Provider value={insets}>
            <MetricsContext.Provider value={initialMetrics}>
                <View style={{ flex: 1 }}>{children}</View>
            </MetricsContext.Provider>
        </InsetsContext.Provider>
    );
};

export const SafeAreaView = ({ children, style, edges, ...props }) => {
    // On web, SafeAreaView from react-native-web usually does a good job, 
    // or we can just use a View if we don't care about notches on desktop/mobile web in this context.
    // RNSafeAreaView from react-native-web maps to a div with env(safe-area-inset-*) styles.
    return <RNSafeAreaView style={style} {...props}>{children}</RNSafeAreaView>;
};

// Aliases for compatibility
export const RNCSafeAreaProvider = SafeAreaProvider;
export const RNCSafeAreaView = SafeAreaView; // This fixes the specific error where RNCSafeAreaView was trying to apply array styles to a raw div maybe?

export const useSafeAreaInsets = () => {
    return useContext(InsetsContext);
};

export const useSafeAreaFrame = () => {
    return { x: 0, y: 0, width: 0, height: 0 };
};

export const initialWindowMetrics = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export const withSafeAreaInsets = (Component) => (props) => (
    <InsetsContext.Consumer>
        {(insets) => <Component {...props} insets={insets} />}
    </InsetsContext.Consumer>
);
