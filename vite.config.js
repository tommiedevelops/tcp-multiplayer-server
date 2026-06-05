import { defineConfig } from 'vite';

export default defineConfig({
    root: 'docs',
    server: {
        watch: {
            usePolling: true,
            interval: 100,
        }
    }
});