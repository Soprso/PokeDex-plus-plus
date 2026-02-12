// Fallback for using MaterialIcons on Android and web.

import { type OpaqueColorValue, type StyleProp, type TextStyle } from '@/components/native';
import { Ionicons } from '@/components/native/Icons';

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: any;
}) {
  // Mapping SF symbols to Ionicons for web
  const mapping: Record<string, string> = {
    'house.fill': 'home',
    'paperplane.fill': 'share',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.right': 'chevron-forward',
    'xmark.circle.fill': 'close-circle',
  };

  return <Ionicons color={color as string} size={size} name={mapping[name] || 'help-circle'} style={style} />;
}
