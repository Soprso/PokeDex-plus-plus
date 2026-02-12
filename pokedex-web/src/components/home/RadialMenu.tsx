import menuBallImage from '@/assets/images/menuball2.png';
import { Ionicons } from '@/components/native/Icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const MENU_ITEMS = [
    { id: 'profile', icon: 'person' as const, label: 'Profile', color: '#FF6B6B', angle: 180 },
    { id: 'filter', icon: 'filter' as const, label: 'Filter', color: '#4CAF50', angle: 144 },
    { id: 'pokehub', icon: 'planet' as const, label: 'PokéHub', color: '#FF9800', angle: 108 },
    { id: 'shop', icon: 'cart' as const, label: 'Shop', color: '#F59E0B', angle: 72 },
    { id: 'sort', icon: 'swap-vertical' as const, label: 'Sort', color: '#2196F3', angle: 36 },
    { id: 'settings', icon: 'settings' as const, label: 'Settings', color: '#9C27B0', angle: 0 },
];

interface RadialMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    onItemPress: (id: string) => void;
}

export function RadialMenu({ isOpen, onToggle, onItemPress }: RadialMenuProps) {
    const radius = 140;

    return (
        <View style={styles.container} pointerEvents="box-none">
            <View style={styles.centeredContainer}>
                {/* Menu Items */}
                {MENU_ITEMS.map((item) => {
                    const angleRad = (item.angle * Math.PI) / 180;
                    const x = Math.cos(angleRad) * radius;
                    const y = -Math.sin(angleRad) * radius;

                    return (
                        <View
                            key={item.id}
                            style={[
                                styles.itemContainer,
                                {
                                    transform: [
                                        { translateX: isOpen ? x : 0 },
                                        { translateY: isOpen ? y : 0 },
                                        { scale: isOpen ? 1 : 0.3 }
                                    ],
                                    opacity: isOpen ? 1 : 0,
                                    pointerEvents: isOpen ? 'auto' : 'none',
                                },
                            ]}
                        >
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    { backgroundColor: item.color },
                                    pressed && { transform: [{ scale: 0.95 }] },
                                ]}
                                onPress={() => onItemPress(item.id)}
                            >
                                <Ionicons name={item.icon} size={28} color="#fff" />
                                <View style={styles.labelContainer}>
                                    <Text style={styles.labelText}>{item.label}</Text>
                                </View>
                            </Pressable>
                        </View>
                    );
                })}

                {/* FAB */}
                <View style={[styles.fabContainer, { transform: [{ rotate: isOpen ? '45deg' : '0deg' }] }]}>
                    <Pressable onPress={onToggle} style={styles.fab}>
                        <Image source={{ uri: menuBallImage }} style={styles.fabImage} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    centeredContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        height: 64,
    },
    itemContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    } as any,
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    labelContainer: {
        position: 'absolute',
        bottom: -24,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        minWidth: 70,
        alignItems: 'center',
    },
    labelText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    fabContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'transparent',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        transition: 'transform 0.3s ease',
    } as any,
    fab: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        overflow: 'hidden',
    },
    fabImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
});
