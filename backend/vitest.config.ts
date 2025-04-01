import { defineConfig } from 'vitest/config';

export default defineConfig({
  'test': {
    'globals': true,
    'setupFiles': './vitestSetup.ts',
    'bail': 1,
    'environment': 'node'
  }
});
