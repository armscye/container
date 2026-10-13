import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.json',
    },
  },
});
