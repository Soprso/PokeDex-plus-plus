import * as ReactNativeWeb from 'react-native-web';
import { FlatList, Image, ScrollView, Text, View } from '../components/native';

// Re-export everything from react-native-web
export * from 'react-native-web';
export default ReactNativeWeb;

// Override Animated to use our custom components that properly handle style arrays
export const Animated = {
    ...ReactNativeWeb.Animated,
    View: View,
    Text: Text,
    Image: Image,
    ScrollView: ScrollView,
    FlatList: FlatList,
    // Keep the animation methods from react-native-web
    timing: ReactNativeWeb.Animated.timing,
    spring: ReactNativeWeb.Animated.spring,
    decay: ReactNativeWeb.Animated.decay,
    sequence: ReactNativeWeb.Animated.sequence,
    parallel: ReactNativeWeb.Animated.parallel,
    stagger: ReactNativeWeb.Animated.stagger,
    loop: ReactNativeWeb.Animated.loop,
    event: ReactNativeWeb.Animated.event,
    Value: ReactNativeWeb.Animated.Value,
    ValueXY: ReactNativeWeb.Animated.ValueXY,
    add: ReactNativeWeb.Animated.add,
    subtract: ReactNativeWeb.Animated.subtract,
    multiply: ReactNativeWeb.Animated.multiply,
    divide: ReactNativeWeb.Animated.divide,
    modulo: ReactNativeWeb.Animated.modulo,
    diffClamp: ReactNativeWeb.Animated.diffClamp,
};

export const TurboModuleRegistry = {
    get: (name) => null,
    getEnforcing: (name) => null,
};
