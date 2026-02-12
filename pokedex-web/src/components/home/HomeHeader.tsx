import dexCoinImage from '@/assets/images/dex-coin.png';
import logoImage from '@/assets/images/pokedex.png'; // Updated logo
import { Ionicons } from '@/components/native/Icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Props
interface HomeHeaderProps {
    balance: number;
    onBuddyHelpPress: () => void;
    onWalletPress: () => void;
    darkMode: boolean;
}

export function HomeHeader({ balance, onBuddyHelpPress, onWalletPress, darkMode }: HomeHeaderProps) {
    return (
        <View style={styles.headerContainer}>
            {/* Wallet / Coin Display */}
            <Pressable
                style={[styles.coinWallet, darkMode && styles.coinWalletDark]}
                onPress={onWalletPress}
            >
                <Image source={{ uri: dexCoinImage }} style={styles.coinWalletIcon} />
                <Text style={[styles.coinWalletText, darkMode && styles.coinWalletTextDark]}>
                    {balance.toLocaleString()}
                </Text>
            </Pressable>

            {/* Main Logo */}
            <Image source={{ uri: logoImage }} style={styles.logoImage} resizeMode="contain" />

            {/* Buddy Help Button */}
            <Pressable
                style={[styles.buddyHelpButton, darkMode && styles.buddyHelpButtonDark]}
                onPress={onBuddyHelpPress}
            >
                <Ionicons name="help-circle" size={20} color={darkMode ? '#fff' : '#333'} />
                <Text style={[styles.buddyHelpText, darkMode && styles.buddyHelpTextDark]}>
                    Help
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centers the logo
        position: 'relative',
        width: '100%',
        paddingTop: 10,
        zIndex: 10,
    },
    logoImage: {
        width: 180, // Adjusted from width * 0.5 to be more predictable
        height: 60,
        marginTop: 10,
        marginBottom: 10,
    },
    coinWallet: {
        position: 'absolute',
        left: 16,
        top: 20, // Aligned with logo center roughly
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#eee',
        cursor: 'pointer', // Web specific
    },
    coinWalletDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    coinWalletIcon: {
        width: 18,
        height: 18,
        marginRight: 6,
    },
    coinWalletText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    coinWalletTextDark: {
        color: '#FFD700',
    },
    buddyHelpButton: {
        position: 'absolute',
        right: 16,
        top: 20,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        cursor: 'pointer',
    },
    buddyHelpButtonDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    buddyHelpText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 6,
    },
    buddyHelpTextDark: {
        color: '#fff',
    },
});
