import { Ionicons } from '@/components/native/Icons';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    settings: {
        shinySprites: boolean;
        nicknames: boolean;
        darkMode: boolean;
        sound: boolean;
        vibration: boolean;
        cacheImages: boolean;
        gridLayout: boolean;
    };
    onUpdateSetting: (key: string, value: boolean) => void;
    // onDebugSetStreak?: (streak: number) => void;
}

export function SettingsModal({ visible, onClose, settings, onUpdateSetting /*, onDebugSetStreak */ }: SettingsModalProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, settings.darkMode && styles.modalContentDark]}>
                    <View style={styles.header}>
                        <Ionicons name="settings" size={24} color="#333" style={styles.headerIcon} />
                        <Text style={[styles.modalTitle, settings.darkMode && styles.modalTitleDark]}>Settings</Text>
                    </View>
                    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                        <SettingRow
                            label="Dark Mode"
                            value={settings.darkMode}
                            onValueChange={(val) => onUpdateSetting('darkMode', val)}
                            darkMode={settings.darkMode}
                        />
                        <SettingRow
                            label="Sound"
                            value={settings.sound}
                            onValueChange={(val) => onUpdateSetting('sound', val)}
                            darkMode={settings.darkMode}
                        />
                        <SettingRow
                            label="Vibration"
                            value={settings.vibration}
                            onValueChange={(val) => onUpdateSetting('vibration', val)}
                            darkMode={settings.darkMode}
                        />
                        <SettingRow
                            label="Show Shiny Sprites"
                            value={settings.shinySprites}
                            onValueChange={(val) => onUpdateSetting('shinySprites', val)}
                            darkMode={settings.darkMode}
                        />
                        <SettingRow
                            label="Enable Nicknames"
                            value={settings.nicknames}
                            onValueChange={(val) => onUpdateSetting('nicknames', val)}
                            darkMode={settings.darkMode}
                        />
                        <SettingRow
                            label="Cache Images"
                            value={settings.cacheImages}
                            onValueChange={(val) => onUpdateSetting('cacheImages', val)}
                            darkMode={settings.darkMode}
                        />
                        <SettingRow
                            label="Grid Layout"
                            value={settings.gridLayout}
                            onValueChange={(val) => onUpdateSetting('gridLayout', val)}
                            darkMode={settings.darkMode}
                        />
                        {/* 
                        {onDebugSetStreak && (
                            <View style={styles.debugSection}>
                                <Text style={[styles.debugTitle, settings.darkMode && styles.modalTitleDark]}>Debug Tools</Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.debugButton,
                                        pressed && { opacity: 0.8 }
                                    ]}
                                    onPress={() => {
                                        onDebugSetStreak(6);
                                        onClose();
                                    }}
                                >
                                    <Ionicons name="flash" size={18} color="#fff" />
                                    <Text style={styles.debugButtonText}>Simulate 6-Day Streak</Text>
                                </Pressable>
                            </View>
                        )}
                        */}
                    </ScrollView>
                    <Pressable
                        style={({ pressed }) => [
                            styles.modalClose,
                            pressed && { opacity: 0.7 }
                        ]}
                        onPress={onClose}
                    >
                        <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

function SettingRow({ label, value, onValueChange, darkMode }: { label: string, value: boolean, onValueChange: (v: boolean) => void, darkMode: boolean }) {
    return (
        <View style={[styles.row, darkMode && styles.rowDark]}>
            <Text style={[styles.label, darkMode && styles.labelDark]}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={value ? '#2196F3' : '#f4f3f4'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '60%',
    },
    modalContentDark: {
        backgroundColor: '#222',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    headerIcon: {
        marginTop: 2,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
    modalTitleDark: {
        color: '#fff',
    },
    scroll: {
        width: '100%',
        maxHeight: 350,
    },
    content: {
        paddingVertical: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
    },
    rowDark: {
        borderBottomColor: '#333',
    },
    label: {
        fontSize: 16,
        color: '#333',
    },
    labelDark: {
        color: '#fff',
    },
    modalClose: {
        backgroundColor: '#f5f5f5',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 16,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    debugSection: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        width: '100%',
    },
    debugTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    debugButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF6B6B',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    debugButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
