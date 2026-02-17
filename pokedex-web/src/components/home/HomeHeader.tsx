import dexCoinImage from '@/assets/images/dex-coin.png';
import logoImage from '@/assets/images/pokedex.png'; // Updated logo
import { Ionicons } from '@/components/native/Icons';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

// Props
interface HomeHeaderProps {
    balance: number;
    onBuddyHelpPress: () => void;
    onPoliciesPress: () => void;
    onWalletPress: () => void;
    darkMode: boolean;
}

export function HomeHeader({ balance, onBuddyHelpPress, onPoliciesPress, onWalletPress, darkMode }: HomeHeaderProps) {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    return (
        <View style={styles.headerContainer}>
            {/* Left Section: Wallet */}
            <View style={styles.leftSection}>
                <Pressable
                    style={[
                        styles.coinWallet,
                        darkMode && styles.coinWalletDark,
                        isMobile && styles.coinWalletMobile
                    ]}
                    onPress={onWalletPress}
                >
                    <Image source={{ uri: dexCoinImage }} style={styles.coinWalletIcon} />
                    <Text style={[styles.coinWalletText, darkMode && styles.coinWalletTextDark]}>
                        {balance.toLocaleString()}
                    </Text>
                </Pressable>
            </View>

            {/* Center Section: Logo */}
            <View style={styles.centerSection}>
                <Image
                    source={{ uri: logoImage }}
                    style={[styles.logoImage, isMobile && styles.logoImageMobile]}
                    resizeMode="contain"
                />
            </View>

            {/* Right Section: Actions */}
            <View style={styles.rightSection}>
                {/* Legal / Policies Button */}
                <Pressable
                    style={[
                        styles.actionButton,
                        darkMode && styles.actionButtonDark,
                        isMobile && styles.actionButtonMobile
                    ]}
                    onPress={onPoliciesPress}
                >
                    <Ionicons
                        name={isMobile ? "shield-checkmark" : "document-text"}
                        size={isMobile ? 22 : 24}
                        color={darkMode ? '#fff' : '#333'}
                    />
                    {!isMobile && (
                        <Text style={[styles.actionText, darkMode && styles.actionTextDark]}>
                            Legal
                        </Text>
                    )}
                </Pressable>

                {/* Buddy Help Button */}
                <Pressable
                    style={[
                        styles.actionButton,
                        darkMode && styles.actionButtonDark,
                        isMobile && styles.actionButtonMobile
                    ]}
                    onPress={onBuddyHelpPress}
                >
                    <Ionicons
                        name={isMobile ? "help-buoy" : "help-circle"}
                        size={isMobile ? 22 : 24}
                        color={darkMode ? '#fff' : '#333'}
                    />
                    {!isMobile && (
                        <Text style={[styles.actionText, darkMode && styles.actionTextDark]}>
                            Help
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 16,
        zIndex: 10,
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    logoImage: {
        width: 180,
        height: 60,
    },
    logoImageMobile: {
        width: 120,
        height: 48,
    },
    coinWallet: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#eee',
        cursor: 'pointer',
    },
    coinWalletMobile: {
        paddingHorizontal: 10,
        height: 44,
    },
    coinWalletDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    coinWalletIcon: {
        width: 20,
        height: 20,
        marginRight: 6,
    },
    coinWalletText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    coinWalletTextDark: {
        color: '#FFD700',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        cursor: 'pointer',
    },
    actionButtonMobile: {
        paddingHorizontal: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    actionButtonDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    actionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    actionTextDark: {
        color: '#fff',
    },
});
