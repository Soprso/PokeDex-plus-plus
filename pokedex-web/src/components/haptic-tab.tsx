import { Pressable } from '@/components/native';

export function HapticTab(props: any) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev: any) => {
        // Haptics removed for web
        props.onPressIn?.(ev);
      }}
    />
  );
}
