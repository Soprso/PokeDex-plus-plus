
export const ActivityIndicator = ({ size = 'small', color = '#0000ff' }: { size?: 'small' | 'large' | number, color?: string }) => {
    const sizePx = size === 'large' ? 36 : 20;
    return (
        <div style={{
            display: 'inline-block',
            width: sizePx,
            height: sizePx,
            border: `3px solid rgba(0,0,0,0.1)`,
            borderLeftColor: color,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }}>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};
