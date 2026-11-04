// app/vitest.config.ts
// Test runner config for unit tests (e.g. the pre-sign-up Lambda handler).
// Live AWS validation is authoritative; unit tests cover pure logic only.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['amplify/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
