import React, { forwardRef } from 'react';

export interface TouchableWithoutFeedbackProps {
    onPress?: () => void;
    onLongPress?: () => void;
    children?: React.ReactNode;
    style?: any;
}

export const TouchableWithoutFeedback = forwardRef<HTMLDivElement, TouchableWithoutFeedbackProps>(({ onPress, onLongPress, children, style, ...props }, ref) => {
    return (
        <div
            ref={ref}
            onClick={onPress}
            style={{
                display: 'contents',
                cursor: onPress ? 'pointer' : 'auto'
            }}
            {...props}
        >
            {children}
        </div>
    );
});

TouchableWithoutFeedback.displayName = 'TouchableWithoutFeedback';
