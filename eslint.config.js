import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

// Flat config. The Vite React template ships oxlint rather than ESLint, so this
// is hand-written rather than inherited from the template.
export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Note the `flat` namespace: `configs['recommended-latest']` is the legacy
  // eslintrc shape (plugins as an array) and ESLint 10 rejects it.
  reactHooks.configs.flat['recommended-latest'],
  reactRefresh.configs.vite,
  // Must stay last: turns off rules that would fight Prettier.
  prettier,
];
