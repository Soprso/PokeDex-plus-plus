import pokeballAccent from '@/assets/images/pokeball_accent.png';
import { Ionicons } from '@/components/native/Icons';
import { ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

interface ComingSoonModalProps {
    visible: boolean;
    onClose: () => void;
    featureName: string;
    darkMode?: boolean;
}

export function ComingSoonModal({ visible, onClose, featureName, darkMode = false }: ComingSoonModalProps) {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Backdrop Fade In */}
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={StyleSheet.absoluteFillObject}
                >
                    <Pressable style={styles.backdrop} onPress={onClose} />
                </Animated.View>

                {/* Modal Content - Zoom In */}
                <Animated.View
                    entering={ZoomIn.duration(400).springify()}
                    style={[styles.content, darkMode && styles.contentDark]}
                >
                    {/* Header Image Area */}
                    <View style={styles.imageHeader}>
                        <ImageBackground
                            source={{ uri: pokeballAccent }}
                            style={styles.headerBg}
                            imageStyle={{ opacity: 0.1, tintColor: '#FF9800' }}
                        >
                            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="construct" size={32} color="#FF9800" />
                                </View>
                            </Animated.View>
                        </ImageBackground>
                    </View>

                    <View style={styles.body}>
                        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                            <Text style={[styles.title, darkMode && styles.titleDark]}>
                                Coming Soon!
                            </Text>
                            <Text style={[styles.description, darkMode && styles.descriptionDark]}>
                                The <Text style={{ fontWeight: '700', color: '#FF9800' }}>{featureName}</Text> module is currently under development. Stay tuned for exciting updates!
                            </Text>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.buttonContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                                ]}
                                onPress={onClose}
                            >
                                <Text style={styles.primaryButtonText}>Got It!</Text>
                            </Pressable>
                        </Animated.View>
                    </View>

                    {/* Corner Close Button */}
                    <Pressable
                        onPress={onClose}
                        style={styles.closeIcon}
                    >
                        <Ionicons name="close" size={24} color={darkMode ? "#94a3b8" : "#64748b"} />
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    content: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    contentDark: {
        backgroundColor: '#1a1f2e',
    },
    imageHeader: {
        height: 100,
        backgroundColor: '#FFF8E1',
    },
    headerBg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#FF9800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    body: {
        padding: 20,
        paddingTop: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    titleDark: {
        color: '#f1f5f9',
    },
    description: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 20,
    },
    descriptionDark: {
        color: '#94a3b8',
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 16,
        zIndex: 10,
    },
});
