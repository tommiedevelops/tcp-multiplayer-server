import { defineConfig } from 'vite';

export default defineConfig({
    base: '/tcp-multiplayer-server/',
    server: {
        watch: {
            usePolling: true,
            interval: 100,
        }
    }
});