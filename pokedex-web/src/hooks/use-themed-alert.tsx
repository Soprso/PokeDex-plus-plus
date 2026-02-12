import { ThemedModal } from '@/components/themed-modal';
import { useCallback, useState } from 'react';

interface AlertAction {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface AlertConfig {
    visible: boolean;
    title: string;
    message?: string;
    actions?: AlertAction[];
    icon?: string;
    iconColor?: string;
}

export function useThemedAlert() {
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        visible: false,
        title: '',
    });

    const showAlert = useCallback((
        title: string,
        message?: string,
        actions?: AlertAction[],
        icon?: string,
        iconColor?: string
    ) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            actions: actions || [{ text: 'OK', style: 'default' }],
            icon,
            iconColor,
        });
    }, []);

    const closeAlert = useCallback(() => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    }, []);

    const AlertModal = useCallback(() => (
        <ThemedModal
            visible={alertConfig.visible}
            title={alertConfig.title}
            description={alertConfig.message}
            actions={alertConfig.actions}
            onDismiss={closeAlert}
            icon={alertConfig.icon}
            iconColor={alertConfig.iconColor}
        />
    ), [alertConfig, closeAlert]);

    return {
        showAlert,
        closeAlert,
        AlertModal,
    };
}
