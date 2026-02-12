import { SafeAreaView } from '@/components/native';
import { Ionicons } from '@/components/native/Icons';
import OverlayPermissionModal from '@/modals/overlay-permission';
import { getOverlayPermission } from '@/services/storage';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigate } from 'react-router-dom';

export default function PokéHubScreen() {
    const navigate = useNavigate();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(8)).current;
    const [overlayModalVisible, setOverlayModalVisible] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleScannerPress = async () => {
        const hasPermission = await getOverlayPermission();
        if (!hasPermission) {
            setOverlayModalVisible(true);
        } else {
            navigate('/pokehub/scanner');
        }
    };

    const handleOverlayAllow = () => {
        setOverlayModalVisible(false);
        navigate('/pokehub/scanner');
    };

    const handleMyPokemonPress = () => {
        navigate('/pokehub/my-pokemon');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Animated.View
                style={[
                    styles.animatedContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY }],
                    },
                ]}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* SECTION 1 - Raids (Simple Text, No Card) */}
                    <View style={styles.raidsSection}>
                        <Text style={styles.raidsTitle}>Raids & Dynamax Battles</Text>
                    </View>

                    {/* SECTION 2 - My Pokémon */}
                    <ActionCard
                        icon="star"
                        iconColor="#4CAF50"
                        title="My Pokémon"
                        height={130}
                        onPress={handleMyPokemonPress}
                    />

                    {/* SECTION 3 - Name Generator */}
                    <ActionCard
                        icon="sparkles"
                        iconColor="#9C27B0"
                        title="Name Generator"
                        height={85}
                        onPress={() => { }}
                    />

                    {/* Bottom spacer for FAB */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Scanner FAB - Bottom Center */}
                <View style={styles.fabContainer}>
                    <Text style={styles.fabHelper}>Scan or upload screenshot</Text>
                    <ScannerFAB onPress={handleScannerPress} />
                </View>
            </Animated.View>

            {/* Overlay Permission Modal */}
            <OverlayPermissionModal
                visible={overlayModalVisible}
                onClose={() => setOverlayModalVisible(false)}
                onAllow={handleOverlayAllow}
            />
        </SafeAreaView>
    );
}

// Action Card Component with Press Animation
function ActionCard({
    icon,
    iconColor,
    title,
    height,
    onPress,
}: {
    icon: any; // Allow any icon name for now
    iconColor: string;
    title: string;
    height: number;
    onPress: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.timing(scaleAnim, {
            toValue: 0.97,
            duration: 120,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={styles.cardWrapper}
        >
            <Animated.View style={[styles.card, { height, transform: [{ scale: scaleAnim }] }]}>
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                    <Ionicons name={icon} size={32} color={iconColor} />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </Animated.View>
        </Pressable>
    );
}

// Scanner FAB Component with Press Animation
function ScannerFAB({ onPress }: { onPress: () => void }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.timing(scaleAnim, {
            toValue: 0.97,
            duration: 120,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
                <Ionicons name="camera" size={28} color="#fff" />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    animatedContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    raidsSection: {
        paddingVertical: 16,
        paddingHorizontal: 4,
        marginBottom: 16,
    },
    raidsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    cardWrapper: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    bottomSpacer: {
        height: 100,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    fabHelper: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
        fontWeight: '400',
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});
