import { StyleSheet, View } from '@/components/native';
import type { PropsWithChildren, ReactElement } from 'react';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={{ flex: 1, backgroundColor } as any}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
          ] as any}>
          {headerImage}
        </View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
    position: 'relative', // Changed for web
  } as any,
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  } as any,
});
