import { FlatList, Image, ScrollView, Text, View } from '@/components/native';

// Mock for react-native-reanimated on web
const Reanimated = {
    default: {
        createAnimatedComponent: (Component: any) => Component,
        Value: class Value { constructor(val: any) { this.val = val; } },
        event: () => { },
        addWhitelistedNativeProps: () => { },
        addWhitelistedUIProps: () => { },
        View,
        Text,
        Image,
        ScrollView,
        FlatList,
    },
    useSharedValue: (initialValue: any) => ({ value: initialValue }),
    useAnimatedStyle: (updater: () => any) => updater(),
    useAnimatedProps: (updater: () => any) => updater(),
    useDerivedValue: (updater: () => any) => ({ value: updater() }),
    useAnimatedGestureHandler: () => () => { },
    useAnimatedScrollHandler: () => () => { },
    useAnimatedReaction: () => { },
    runOnJS: (fn: Function) => fn,
    runOnUI: (fn: Function) => fn,
    createAnimatedComponent: (Component: any) => Component,
    withTiming: (toValue: any) => toValue,
    withSpring: (toValue: any) => toValue,
    withDecay: (toValue: any) => toValue,
    withDelay: (_: number, animation: any) => animation,
    withSequence: (...animations: any[]) => animations[animations.length - 1],
    withRepeat: (animation: any) => animation,
    cancelAnimation: () => { },
    measure: () => ({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 }),
    scrollTo: () => { },
    Easing: {
        linear: (t: number) => t,
        ease: (t: number) => t,
        quad: (t: number) => t,
        cubic: (t: number) => t,
        poly: (t: number) => t,
        sin: (t: number) => t,
        circle: (t: number) => t,
        exp: (t: number) => t,
        elastic: (t: number) => t,
        back: (t: number) => t,
        bounce: (t: number) => t,
        bezier: (t: number) => t,
        in: (t: number) => t,
        out: (t: number) => t,
        inOut: (t: number) => t,
    },
    Extrapolation: {
        EXTEND: 'extend',
        CLAMP: 'clamp',
        IDENTITY: 'identity',
    },
    // Helper for chained animations
    createMockAnimation: () => {
        const chain = {
            duration: () => chain,
            springify: () => chain,
            damping: () => chain,
            stiffness: () => chain,
            mass: () => chain,
            overshootClamping: () => chain,
            restDisplacementThreshold: () => chain,
            restSpeedThreshold: () => chain,
            delay: () => chain,
            randomDelay: () => chain,
            withCallback: () => chain,
        };
        return chain;
    },
    interpolate: (value: number, input: number[], output: number[]) => output[0],
    interpolateColor: (value: number, input: number[], output: number[]) => output[0],
};

// Apply the mock helper to animation objects
const mockAnim = Reanimated.createMockAnimation();
(Reanimated as any).FadeIn = mockAnim;
(Reanimated as any).FadeInUp = mockAnim;
(Reanimated as any).FadeInDown = mockAnim;
(Reanimated as any).FadeOut = mockAnim;
(Reanimated as any).Layout = mockAnim;
(Reanimated as any).ZoomIn = mockAnim;
(Reanimated as any).ZoomOut = mockAnim;
(Reanimated as any).SlideInUp = mockAnim;
(Reanimated as any).SlideInDown = mockAnim;
(Reanimated as any).SlideOutUp = mockAnim;
(Reanimated as any).SlideOutDown = mockAnim;
// Add these to top-level object too just in case
(Reanimated as any).View = View;
(Reanimated as any).Text = Text;
(Reanimated as any).Image = Image;
(Reanimated as any).ScrollView = ScrollView;
(Reanimated as any).FlatList = FlatList;

export default Reanimated;
export const useSharedValue = Reanimated.useSharedValue;
export const useAnimatedStyle = Reanimated.useAnimatedStyle;
export const useAnimatedProps = Reanimated.useAnimatedProps;
export const useDerivedValue = Reanimated.useDerivedValue;
export const useAnimatedGestureHandler = Reanimated.useAnimatedGestureHandler;
export const useAnimatedScrollHandler = Reanimated.useAnimatedScrollHandler;
export const useAnimatedReaction = Reanimated.useAnimatedReaction;
export const runOnJS = Reanimated.runOnJS;
export const runOnUI = Reanimated.runOnUI;
export const createAnimatedComponent = Reanimated.createAnimatedComponent;
export const withTiming = Reanimated.withTiming;
export const withSpring = Reanimated.withSpring;
export const withDecay = Reanimated.withDecay;
export const withDelay = Reanimated.withDelay;
export const withSequence = Reanimated.withSequence;
export const withRepeat = Reanimated.withRepeat;
export const cancelAnimation = Reanimated.cancelAnimation;
export const measure = Reanimated.measure;
export const scrollTo = Reanimated.scrollTo;
export const Easing = Reanimated.Easing;
export const Extrapolation = Reanimated.Extrapolation;
export const interpolate = Reanimated.interpolate;
export const interpolateColor = Reanimated.interpolateColor;
export const FadeIn = Reanimated.FadeIn;
export const FadeInUp = Reanimated.FadeInUp;
export const FadeInDown = Reanimated.FadeInDown;
export const FadeOut = Reanimated.FadeOut;
export const Layout = Reanimated.Layout;
export const ZoomIn = Reanimated.ZoomIn;
export const ZoomOut = Reanimated.ZoomOut;
export const SlideInUp = Reanimated.SlideInUp;
export const SlideInDown = Reanimated.SlideInDown;
export const SlideOutUp = Reanimated.SlideOutUp;
export const SlideOutDown = Reanimated.SlideOutDown;
