import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Logic-only tests (cart math, API response mapping). No jsdom, no
    // component tests — see CLAUDE.md §8.
    include: ['src/**/*.test.js'],
  },
});
