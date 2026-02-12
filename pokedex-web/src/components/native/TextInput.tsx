import React, { forwardRef, type CSSProperties } from 'react';
import { StyleSheet } from './StyleSheet';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onChangeText' | 'style'> {
    style?: CSSProperties | (CSSProperties | undefined)[] | undefined;
    onChangeText?: (text: string) => void;
    multiline?: boolean;
    value?: string;
    placeholder?: string;
}

export const TextInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(({ style, onChangeText, multiline, ...props }, ref) => {
    const flattenedStyle = StyleSheet.flatten(style) as CSSProperties;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onChangeText) {
            onChangeText(e.target.value);
        }
    };

    if (multiline) {
        return (
            <textarea
                ref={ref as any}
                onChange={handleChange}
                style={{
                    border: '1px solid #ccc',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    resize: 'vertical',
                    ...(flattenedStyle as CSSProperties)
                }}
                {...(props as any)}
            />
        );
    }

    return (
        <input
            ref={ref as any}
            onChange={handleChange}
            style={{
                border: '1px solid #ccc',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                ...(flattenedStyle as CSSProperties)
            }}
            {...props}
        />
    );
});

TextInput.displayName = 'TextInput';
