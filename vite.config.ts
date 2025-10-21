import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@maity/shared": path.resolve(__dirname, "./packages/shared/src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendors (always needed)
          'vendor-core': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // UI framework (Radix UI components)
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // 3D rendering (used in demo pages)
          'vendor-3d': [
            'three',
            '@react-three/fiber',
            '@react-three/drei',
          ],
          // Charts (used in analytics/reports)
          'vendor-charts': [
            'recharts',
          ],
          // Audio/Voice (ElevenLabs, wavesurfer)
          'vendor-audio': [
            '@elevenlabs/client',
            '@elevenlabs/elevenlabs-js',
            '@elevenlabs/react',
            'wavesurfer.js',
            '@wavesurfer/react',
            'opus-decoder',
          ],
          // State management and data fetching
          'vendor-state': [
            '@tanstack/react-query',
            '@supabase/supabase-js',
          ],
          // Utilities and common libraries
          'vendor-utils': [
            'date-fns',
            'zod',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'framer-motion',
            'lottie-react',
            'lucide-react',
          ],
          // Form handling
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'react-day-picker',
            'input-otp',
          ],
        },
      },
    },
    // Increase chunk size warning limit (acceptable with code splitting)
    chunkSizeWarningLimit: 1000,
  },
}));
