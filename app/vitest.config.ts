// app/vitest.config.ts
// Test runner config for unit tests (e.g. the pre-sign-up Lambda handler).
// Live AWS validation is authoritative; unit tests cover pure logic only.
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^\$amplify\/env\/.+$/,
        replacement: fileURLToPath(new URL('./amplify/functions/shared/__tests__/amplify-env.ts', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['amplify/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
