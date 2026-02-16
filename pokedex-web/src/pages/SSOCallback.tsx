import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SSOCallback() {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.title}>Setting up your profile</Text>
                <Text style={styles.subtitle}>Please wait while we prepare your adventure...</Text>
            </View>
            <View style={{ display: 'none' }}>
                <AuthenticateWithRedirectCallback />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
});
