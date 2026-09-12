import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The repository root has a PostCSS config for the Angular build; the demo
  // does not need it, so PostCSS config discovery is disabled here.
  css: { postcss: {} },
});
