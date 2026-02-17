import { ExtraLoveEffect } from '@/components/card-effects/ExtraLoveEffect';
import { Ionicons } from '@/components/native/Icons';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface NewUserBonusModalProps {
    visible: boolean;
    onClose: () => void;
    darkMode: boolean;
}

export function NewUserBonusModal({ visible, onClose, darkMode }: NewUserBonusModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    {/* Background Decorative Element */}
                    <View style={styles.bgGlow} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.giftIconContainer}>
                            <Ionicons name="gift" size={32} color="#fff" />
                        </View>
                        <Text style={[styles.title, darkMode && styles.textWhite]}>Welcome Gift! 🎁</Text>
                        <Text style={styles.subtitle}>A Special Reward for Joining Us</Text>
                    </View>

                    {/* Preview Section */}
                    <View style={styles.previewSection}>
                        <View style={styles.cardPreview}>
                            {/* Representative Card Background */}
                            <View style={[styles.mockCard, darkMode && styles.mockCardDark]}>
                                <ExtraLoveEffect />
                                <View style={styles.mockCardContent}>
                                    <View style={styles.mockAvatar} />
                                    <View style={styles.mockLine} />
                                    <View style={[styles.mockLine, { width: '60%' }]} />
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.rewardName, darkMode && styles.textWhite]}>Extra Love Effect</Text>
                        <Text style={[styles.rewardDesc, darkMode && styles.textGray]}>Pink glow and floating hearts background.</Text>
                    </View>

                    {/* Instructions Section */}
                    <View style={[styles.instructionsContainer, darkMode && styles.instructionsContainerDark]}>
                        <Text style={[styles.instructionTitle, darkMode && styles.textWhite]}>How to use it:</Text>
                        <View style={styles.instructionItem}>
                            <View style={styles.stepNumber}><Text style={styles.stepText}>1</Text></View>
                            <Text style={[styles.stepDescription, darkMode && styles.textGray]}>Long-press any Pokémon in your collection</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <View style={styles.stepNumber}><Text style={styles.stepText}>2</Text></View>
                            <Text style={[styles.stepDescription, darkMode && styles.textGray]}>Tap on <Text style={{ fontWeight: '700' }}>'Nickname & Styles'</Text></Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <View style={styles.stepNumber}><Text style={styles.stepText}>3</Text></View>
                            <Text style={[styles.stepDescription, darkMode && styles.textGray]}>Select <Text style={{ fontWeight: '700' }}>'Extra Love'</Text> to apply!</Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Pressable
                            style={styles.claimButton}
                            onPress={onClose}
                        >
                            <Text style={styles.claimButtonText}>Claim & Start</Text>
                            <Ionicons name="rocket" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: 400,
        borderRadius: 32,
        overflow: 'hidden',
        position: 'relative',
    },
    modalContentDark: {
        backgroundColor: '#1a1a1a',
    },
    bgGlow: {
        position: 'absolute',
        top: -50,
        left: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#FF69B4',
        opacity: 0.1,
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    giftIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 22,
        backgroundColor: '#FF69B4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#FF69B4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF69B4',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    previewSection: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 24,
    },
    cardPreview: {
        width: 140,
        height: 180,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    mockCard: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    mockCardDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
    },
    mockCardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'flex-end',
        gap: 6,
        opacity: 0.5,
    },
    mockAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        marginBottom: 4,
    },
    mockLine: {
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        width: '100%',
    },
    rewardName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    rewardDesc: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
    },
    instructionsContainer: {
        backgroundColor: '#f8fafc',
        padding: 20,
        marginHorizontal: 24,
        borderRadius: 20,
        gap: 12,
    },
    instructionsContainerDark: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    instructionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF69B4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },
    stepDescription: {
        fontSize: 13,
        color: '#444',
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    claimButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF69B4',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 20,
        shadowColor: '#FF69B4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    claimButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    textWhite: {
        color: '#fff',
    },
    textGray: {
        color: '#aaa',
    },
});
