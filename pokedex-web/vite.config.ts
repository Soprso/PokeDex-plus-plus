import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
// Touch to force restart 7

// https://vite.dev/config/
export default defineConfig({
  define: {
    __DEV__: true,
    global: 'window',
  },
  plugins: [
    react({
      babel: {
        plugins: ['react-native-reanimated/plugin'],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: 'react-native/Libraries/Utilities/codegenNativeComponent', replacement: path.resolve(__dirname, './src/shims/codegenNativeComponent.js') },
      { find: 'react-native-web/Libraries/Utilities/codegenNativeComponent', replacement: path.resolve(__dirname, './src/shims/codegenNativeComponent.js') },
      { find: 'react-native/Libraries/Renderer/shims/ReactFabric', replacement: path.resolve(__dirname, './src/shims/ReactFabric.js') },
      { find: 'react-native-svg-original', replacement: path.resolve(__dirname, './node_modules/react-native-svg') },
      { find: 'react-native-svg', replacement: path.resolve(__dirname, './src/shims/react-native-svg.tsx') },
      { find: 'react-native-safe-area-context', replacement: path.resolve(__dirname, './src/shims/react-native-safe-area-context.tsx') },
      { find: 'react-native-reanimated', replacement: path.resolve(__dirname, './src/shims/react-native-reanimated.tsx') },
      { find: /^react-native$/, replacement: path.resolve(__dirname, './src/shims/react-native.js') },
      { find: 'react-native', replacement: 'react-native-web' },
      { find: 'react', replacement: path.resolve(__dirname, './node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, './node_modules/react-dom') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
  optimizeDeps: {
  },
})
