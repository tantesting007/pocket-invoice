import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // A time zone behind UTC catches ISO dates that shift by a day
    env: { TZ: 'America/New_York' },
    clearMocks: true,
    restoreMocks: true,
  },
})
