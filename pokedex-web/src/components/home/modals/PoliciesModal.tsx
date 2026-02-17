import { Ionicons } from '@/components/native/Icons';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface PoliciesModalProps {
    visible: boolean;
    onClose: () => void;
    darkMode: boolean;
}

interface PolicyPage {
    id: string;
    title: string;
    icon: string;
    color: string;
    content: string | React.ReactNode;
}

export function PoliciesModal({ visible, onClose, darkMode }: PoliciesModalProps) {
    const [currentPage, setCurrentPage] = useState(0);

    const pages: PolicyPage[] = [
        {
            id: 'privacy',
            title: 'Privacy Policy',
            icon: 'finger-print',
            color: '#10b981', // Emerald 500
            content: `
Privacy Policy for PokéDex++

Effective Date: 2024-01-01

1. **Introduction**
Welcome to PokéDex++. We value your privacy and are committed to protecting your personal data.

2. **Data We Collect**
**Account Information:** When you sign up via Clerk (Google/Email), we store your email and basic profile info.
**Usage Data:** We track your in-app progress, such as Pokemon caught, hearts given, and items unlocked.
**Cookies:** We use local storage to save your settings (theme, sound preferences).

3. **How We Use Your Data**
to provide and maintain our Service;
to notify you about changes to our Service;
to allow you to participate in interactive features;
to provide customer support;
to monitor the usage of our Service.

4. **Data Security**
The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.

5. **Contact Us**
If you have any questions about this Privacy Policy, please contact us via the Contact page.
            `
        },
        {
            id: 'contact',
            title: 'Contact Us',
            icon: 'mail',
            color: '#3b82f6', // Blue 500
            content: `
**Get in Touch**

We'd love to hear from you! Whether you have a question, feedback, or need support, our team is here to help.

**Email Support:**
support@pokedexplusplus.com
            `
        },
        {
            id: 'about',
            title: 'About Us',
            icon: 'planet',
            color: '#8b5cf6', // Violet 500
            content: `
        **About PokéDex++**

        PokéDex++ is a fan-made digital Pokédex designed for Pokémon trainers and collectors worldwide.

Built from a passion for the Pokémon universe, PokéDex++ aims to provide a fast, beautiful, and immersive experience for exploring Pokémon, tracking stats, and collecting digital cards.

**The Vision**

        The goal of PokéDex++ is to create a modern Pokédex experience that feels interactive, engaging, and enjoyable to use.

It focuses on:

    - clean design
        - smooth performance
            - useful features for fans
                - and continuous improvement

New features, enhancements, and regions will continue to be added over time.

**Developer**

        PokéDex++ is independently designed and developed by a solo developer.

This project was created as a passion project to combine development, design, and love for Pokémon into a single experience for the community.

**Data & Credits**

        Pokémon data is provided by PokéAPI:

    https://pokeapi.co

Pokémon names, images, and related content are © Nintendo, Game Freak, and The Pokémon Company.

        PokéDex++ is a fan-made project and is not affiliated with or endorsed by Nintendo, Game Freak, or The Pokémon Company.
            `
        },
        {
            id: 'refund',
            title: 'Refund Policy',
            icon: 'cart',
            color: '#f59e0b', // Amber 500
            content: `
            **Refund & Cancellation Policy**

                Last updated: Feb 17, 2026

Thank you for using PokéDex++.

This policy explains our refund and cancellation terms for purchases made on https://pokedexplus.shop.

**1. Digital Goods**

        PokéDex++ offers digital goods such as Dex Coins, card frames, skins, and visual effects.

All purchases of digital goods are considered final and non-refundable, as these items are delivered instantly and cannot be returned.

These items:

    - have no real-world monetary value
        - are non-transferable
            - are intended for entertainment purposes only

                **2. Exceptions for Technical Issues**

                    If you were successfully charged but did not receive your purchased items due to a technical error, please contact us within 48 hours of the transaction.

                        Email: contact@pokedexplus.shop

    Include:

    - Transaction ID
        - Payment method
            - Description of the issue

We will investigate the issue.

If verified, we may:

    - credit the missing items to your account, or
        - issue a refund to your original payment method

Refund processing may take 5–7 business days, depending on your payment provider.

**3. Cancellations**

        Since digital goods are delivered instantly, orders cannot be cancelled once completed.

**4. Fraud and Abuse**

        We reserve the right to refuse refunds if we detect fraud, abuse, or violation of our Terms and Conditions.

**5. Contact**

        If you have questions, contact:

contact@pokedexplus.shop
        `
        },
        {
            id: 'terms',
            title: 'Terms & Conditions',
            icon: 'document-text',
            color: '#64748b', // Slate 500
            content: `
**Terms and Conditions**

        Last updated: Feb 17, 2026

Welcome to PokéDex++. By accessing or using our website (https://pokedexplus.shop), you agree to these Terms and Conditions.

**1. Acceptance of Terms**

        By accessing and using PokéDex++, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the website.

**2. Use of Service**

        PokéDex++ is provided for personal, non-commercial use.

You agree not to:

    - misuse the service
        - attempt to access restricted areas
            - disrupt or interfere with the website
                - use automated systems to abuse the platform

                    **3. Virtual Items and Currency**

                        PokéDex++ may offer virtual items such as DexCode, cards, skins, and collectibles.

These virtual items:

    - have no real-world monetary value
        - cannot be exchanged for real currency
            - are non-transferable
        - are provided for entertainment purposes only

All purchases are final unless otherwise stated in our Refund Policy.

**4. Intellectual Property**

        PokéDex++ is a fan-made project.

Pokémon and related names, characters, and assets are trademarks of Nintendo, Game Freak, and The Pokémon Company.

We do not claim ownership of these trademarks.

All original code, design, and original assets of PokéDex++ are the property of the site owner.

**5. Limitation of Liability**

        PokéDex++ is provided "as is".

We are not liable for:

        - loss of data
            - loss of virtual items
                - service interruptions
                    - or any damages arising from use of the website

Use the service at your own risk.

**6. Account and Access**

        We reserve the right to suspend or terminate access to users who violate these Terms.

**7. Changes to Terms**

        We may update these Terms at any time.

Changes will be posted on this page.

Continued use of the site means you accept the updated Terms.

**8. Contact**

        For questions, contact:

contact@pokedexplus.shop
        `
        }
    ];

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        } else {
            onClose();
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const page = pages[currentPage];

    // Simple parser for inline bold text
    const parseFormattedText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <Text key={index} style={{ fontWeight: 'bold', color: darkMode ? '#fff' : '#1a1a1a' }}>
                        {part.slice(2, -2)}
                    </Text>
                );
            }
            return part; // Return exact string, parent Text will apply base style
        });
    };

    const renderContent = (text: string) => {
        return text.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return <View key={index} style={{ height: 10 }} />;

            // Headings: Starts with "1." or similar, OR is fully wrapped in **
            const isHeading = /^\d+\./.test(trimmed) || (trimmed.startsWith('**') && trimmed.endsWith('**'));

            if (isHeading) {
                return (
                    <Text key={index} style={[styles.contentHeading, darkMode && styles.textWhite]}>
                        {parseFormattedText(trimmed)}
                    </Text>
                );
            } else if (trimmed.startsWith('- ')) {
                // List item
                return (
                    <View key={index} style={styles.listItem}>
                        <View style={[styles.bullet, { backgroundColor: page.color }]} />
                        <Text style={[styles.contentText, darkMode && styles.textGray, { flex: 1 }]}>
                            {parseFormattedText(trimmed.substring(2))}
                        </Text>
                    </View>
                );
            } else {
                // Paragraph
                return (
                    <Text key={index} style={[styles.contentText, darkMode && styles.textGray]}>
                        {parseFormattedText(trimmed)}
                    </Text>
                );
            }
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    {/* Header with Icon */}
                    <View style={[styles.header, { backgroundColor: page.color }]}>
                        <View style={styles.headerIconContainer}>
                            <Ionicons name={page.icon} size={40} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>{page.title}</Text>
                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Content Scroll */}
                    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                        {typeof page.content === 'string' ? renderContent(page.content) : page.content}
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {/* Pagination & Footer */}
                    <View style={[styles.footer, darkMode && styles.footerDark]}>
                        <View style={styles.paginationContainer}>
                            {pages.map((_, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => setCurrentPage(idx)}
                                    style={[
                                        styles.dot,
                                        idx === currentPage && { backgroundColor: page.color, width: 24 }
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.navigationButtons}>
                            <Pressable
                                style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
                                onPress={prevPage}
                                disabled={currentPage === 0}
                            >
                                <Ionicons name="arrow-back" size={24} color={currentPage === 0 ? '#ccc' : (darkMode ? '#fff' : '#333')} />
                            </Pressable>

                            <Text style={[styles.pageIndicator, darkMode && styles.textGray]}>
                                {currentPage + 1} / {pages.length}
                            </Text>

                            <Pressable
                                style={[styles.navButton, { backgroundColor: page.color, borderColor: page.color }]}
                                onPress={nextPage}
                            >
                                <Ionicons
                                    name={currentPage === pages.length - 1 ? "checkmark" : "arrow-forward"}
                                    size={24}
                                    color="#fff"
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '90%',
        maxWidth: 500,
        height: '80%',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalContentDark: {
        backgroundColor: '#1e1e1e',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    headerIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    contentHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        marginTop: 16,
    },
    contentText: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 24,
        marginBottom: 8,
    },
    textWhite: {
        color: '#fff',
    },
    textGray: {
        color: '#9ca3af',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingLeft: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 9,
        marginRight: 10,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    footerDark: {
        backgroundColor: '#1e1e1e',
        borderTopColor: '#333',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e5e7eb',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    pageIndicator: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
});
