import React, { forwardRef, useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { StyleSheet } from './StyleSheet';

export interface ModalProps {
    visible?: boolean;
    transparent?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    onRequestClose?: () => void;
    onDismiss?: () => void;
    children?: React.ReactNode;
    style?: CSSProperties | (CSSProperties | undefined)[] | undefined;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(({
    visible,
    transparent,
    animationType: _animationType = 'none',
    onRequestClose: _onRequestClose,
    onDismiss: _onDismiss,
    children,
    style
}, ref) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!visible || !mounted) return null;

    const flattenedStyle = StyleSheet.flatten(style) as CSSProperties;

    const modalContent = (
        <div
            ref={ref}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: transparent ? 'transparent' : 'white',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                ...flattenedStyle
            }}
        >
            {children}
        </div >
    );

    return createPortal(modalContent, document.body);
});


