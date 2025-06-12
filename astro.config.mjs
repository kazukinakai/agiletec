import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      // Tailwind config file will be used
      configFile: './tailwind.config.mjs',
    }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['motion']
    }
  }
});
