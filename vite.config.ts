import { defineConfig } from 'vite';
// Keep this standalone project isolated from the parent workspace's PostCSS setup.
export default defineConfig({ css: { postcss: { plugins: [] } } });
