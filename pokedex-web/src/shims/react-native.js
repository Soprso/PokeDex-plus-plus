import * as ReactNativeWeb from 'react-native-web';
import { FlatList, Image, ScrollView, Text, View } from '../components/native';

// Re-export everything from react-native-web
export * from 'react-native-web';

// Override with our custom components
export { FlatList, Image, ScrollView, Text, View };
export default ReactNativeWeb;

// Override Animated to use our custom components that properly handle style arrays
export const Animated = {
    ...ReactNativeWeb.Animated,
    View: ReactNativeWeb.Animated.createAnimatedComponent(View),
    Text: ReactNativeWeb.Animated.createAnimatedComponent(Text),
    Image: ReactNativeWeb.Animated.createAnimatedComponent(Image),
    ScrollView: ReactNativeWeb.Animated.createAnimatedComponent(ScrollView),
    FlatList: ReactNativeWeb.Animated.createAnimatedComponent(FlatList),
};


export const TurboModuleRegistry = {
    get: (name) => null,
    getEnforcing: (name) => null,
};
