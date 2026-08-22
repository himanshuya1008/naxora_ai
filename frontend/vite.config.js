import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // chokidar's native file-watching is unreliable across the WSL2 <-> /mnt/c
    // (9p/DrvFs) filesystem boundary — a running dev server can silently keep
    // serving a stale cached transform of a file forever after an edit, with
    // no error, because it never receives the change notification. Polling
    // sidesteps that entirely at a small CPU cost.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split heavy, infrequently-changing vendor libs into their own
        // chunks so a deploy that only touches app code doesn't invalidate
        // the browser cache for charting/animation/realtime dependencies.
        manualChunks: {
          vendor_react: ['react', 'react-dom', 'react-router-dom'],
          vendor_charts: ['recharts'],
          vendor_motion: ['framer-motion'],
          vendor_realtime: ['socket.io-client'],
        },
      },
    },
  },
});
