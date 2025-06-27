import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  theme: {
    colors: {
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      }
    }
  },
  safelist: [
    // 動的に生成されるクラスを保護
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600',
    'bg-green-50', 'bg-green-100', 'bg-green-500', 'bg-green-600',
    'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'bg-purple-600',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'bg-orange-600',
    'bg-pink-50', 'bg-pink-100', 'bg-pink-500', 'bg-pink-600',
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-500', 'bg-yellow-600',
    'text-blue-800', 'text-green-800', 'text-purple-800', 'text-orange-800',
    'border-blue-500', 'border-green-500', 'border-purple-500', 'border-orange-500'
  ]
});
