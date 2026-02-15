import { Ionicons } from '@/components/native/Icons';
import { useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

import bestBuddyBadge from '@/assets/images/best-buddy.png';
import buddySystemImg from '@/assets/images/buddy-system.png';
import dexCoinImg from '@/assets/images/dex-coin.png';

interface WelcomeModalProps {
    visible: boolean;
    onClose: () => void;
    darkMode: boolean;
}

interface SlideDetail {
    label: string;
    value: string;
    icon: string;
    showBadge?: boolean;
}

interface Slide {
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string;
    image?: any;
    details?: SlideDetail[];
}

export function WelcomeModal({ visible, onClose, darkMode }: WelcomeModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides: Slide[] = [
        {
            title: "Welcome Trainer!",
            subtitle: "Your Journey Begins",
            description: "Master the Pokédex++ and build the ultimate collection! Discover a world where and your Pokémon grow together.",
            icon: "star",
            color: "#FFD700",
            image: buddySystemImg
        },
        {
            title: "Buddy System",
            subtitle: "Bond & Grow",
            description: "Interact with your Pokémon to earn friendship hearts. Each tier unlocks unique visual enhancements and special badges:",
            details: [
                { label: "Good Buddy (1 Heart)", value: "Friendship begins with your Pokémon.", icon: "heart-outline" },
                { label: "Great Buddy (4 Hearts)", value: "Unlocks the Blue Neon Glow effect.", icon: "heart-half" },
                { label: "Ultra Buddy (11 Hearts)", value: "Unlocks the Platinum Shine effect.", icon: "heart" },
                { label: "Best Buddy (21 Hearts)", value: "Golden Shine + Best Buddy Badge.", icon: "ribbon", showBadge: true }
            ],
            icon: "heart",
            color: "#ef4444",
            // image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soothe-bell.png" // Removed to give space
        },
        {
            title: "Master the Controls",
            subtitle: "Interactive collection",
            description: "Long-press on a heart to see buddy progress. Tap any Pokémon to see deep stats, types, and hidden abilities.",
            icon: "finger-print",
            color: "#4facfe",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png"
        },
        {
            title: "Visit the PokéShop",
            subtitle: "Style & Customization",
            description: "Personalize your frames and unlock mythical card effects (Neon, Golden Glory, Bubble Beam) with Dex Coins!",
            icon: "cart",
            color: "#00f2fe",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nugget.png"
        },
        {
            title: "Trainer Rewards",
            subtitle: "Daily Incentives",
            description: "Sign in daily for Dex Coins & progress your streak. Consecutive visits earn you massive 350+ coin bonuses!",
            icon: "gift",
            color: "#f093fb",
            image: dexCoinImg
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onClose();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const slide = slides[currentSlide];

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
                    {/* Background Glow */}
                    <View style={[styles.bgGlow, { backgroundColor: slide.color }]} />

                    {/* Close Button */}
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
                    </Pressable>

                    {/* Image Section - Only show if no details or explicitly allowed */}
                    {slide.image && !slide.details && (
                        <View style={styles.imageSection}>
                            <Image
                                source={typeof slide.image === 'string' ? { uri: slide.image } : slide.image}
                                style={styles.heroImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    {/* Content Section */}
                    <View style={styles.contentSection}>
                        <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
                            <Ionicons name={slide.icon as any} size={32} color={slide.color} />
                        </View>

                        <Text style={[styles.title, darkMode && styles.textWhite]}>{slide.title}</Text>
                        <Text style={[styles.subtitle, { color: slide.color }]}>{slide.subtitle}</Text>
                        <Text style={[styles.description, darkMode && styles.textGray]}>{slide.description}</Text>

                        {slide.details && (
                            <View style={styles.detailsContainer}>
                                {slide.details.map((detail, idx) => (
                                    <View key={idx} style={[styles.detailRow, darkMode && styles.detailRowDark]}>
                                        <View style={[styles.detailIcon, { backgroundColor: slide.color + '15' }]}>
                                            <Ionicons name={detail.icon as any} size={16} color={slide.color} />
                                        </View>
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={[styles.detailLabel, darkMode && styles.textWhite]}>{detail.label}</Text>
                                                {detail.showBadge && (
                                                    <Image
                                                        source={typeof bestBuddyBadge === 'string' ? { uri: bestBuddyBadge } : bestBuddyBadge}
                                                        style={styles.badgeImage}
                                                    />
                                                )}
                                            </View>
                                            <Text style={[styles.detailValue, darkMode && styles.textGray]}>{detail.value}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentSlide && styles.dotActive,
                                    index === currentSlide && { backgroundColor: slide.color }
                                ]}
                            />
                        ))}
                    </View>

                    {/* Navigation Buttons */}
                    <View style={styles.footer}>
                        {currentSlide > 0 ? (
                            <Pressable style={styles.navButton} onPress={prevSlide}>
                                <Text style={[styles.navButtonText, darkMode && styles.textGray]}>Previous</Text>
                            </Pressable>
                        ) : <View style={styles.navButton} />}

                        <Pressable
                            style={[styles.actionButton, { backgroundColor: slide.color }]}
                            onPress={nextSlide}
                        >
                            <Text style={styles.actionButtonText}>
                                {currentSlide === slides.length - 1 ? "Let's Go!" : "Continue"}
                            </Text>
                            <Ionicons
                                name={currentSlide === slides.length - 1 ? "rocket" : "arrow-forward"}
                                size={18}
                                color="#fff"
                                style={{ marginLeft: 8 }}
                            />
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
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '90%',
        maxWidth: 400,
        height: 600,
        borderRadius: 32,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalContentDark: {
        backgroundColor: '#1a1a1a',
    },
    bgGlow: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.1,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    imageSection: {
        height: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    contentSection: {
        padding: 30,
        paddingTop: 40,
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    textWhite: {
        color: '#fff',
    },
    textGray: {
        color: '#aaa',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#eee',
    },
    dotActive: {
        width: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    navButton: {
        padding: 12,
        width: 100,
    },
    navButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    detailsContainer: {
        width: '100%',
        marginTop: 24,
        gap: 12,
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        gap: 12,
    },
    detailRowDark: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    detailIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    detailValue: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    badgeImage: {
        width: 16,
        height: 16,
    },
});
