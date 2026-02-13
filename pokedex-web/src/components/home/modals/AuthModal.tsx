import pikachuTrainer from '@/assets/images/pikachu_trainer.png';
import { Ionicons } from '@/components/native/Icons';
import { ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    onProfilePress: () => void;
    darkMode: boolean;
}

export function AuthModal({ visible, onClose, onProfilePress, darkMode }: AuthModalProps) {
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
                            source={{ uri: pikachuTrainer }}
                            style={styles.headerBg}
                            imageStyle={{ opacity: 0.15 }}
                        >
                            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="sparkles" size={32} color="#3b82f6" />
                                </View>
                            </Animated.View>
                        </ImageBackground>
                    </View>

                    <View style={styles.body}>
                        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                            <Text style={[styles.title, darkMode && styles.titleDark]}>
                                Authentication Required
                            </Text>
                            <Text style={[styles.description, darkMode && styles.descriptionDark]}>
                                Login or signup to unlock the full potential of your PokéDex. Start building bonds, training buddies, and tracking your journey!
                            </Text>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.buttonContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                                ]}
                                onPress={onProfilePress}
                            >
                                <Ionicons name="person-add" size={18} color="#fff" />
                                <Text style={styles.primaryButtonText}>Sign In / Join Now</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && { opacity: 0.7 }
                                ]}
                                onPress={onClose}
                            >
                                <Text style={[styles.secondaryButtonText, darkMode && styles.secondaryButtonTextDark]}>
                                    Maybe Later
                                </Text>
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
        maxWidth: 380,
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
        backgroundColor: '#f0f4ff',
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
        shadowColor: '#3b82f6',
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
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '600',
    },
    secondaryButtonTextDark: {
        color: '#94a3b8',
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
