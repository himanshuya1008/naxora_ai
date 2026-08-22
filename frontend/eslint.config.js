import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: '19.0' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // react-three-fiber renders three.js objects as JSX host elements
    // (<mesh>, <pointLight>, ...) with props that map to Three.js object
    // properties, not DOM attributes — react/no-unknown-property has no
    // way to know that `args`/`position`/`intensity`/etc. are valid here,
    // so it would flag every one of them as if this were plain DOM JSX.
    // Scoped to just the one file that uses R3F, not disabled app-wide.
    files: ['src/components/illustrations/AiCoreScene.jsx'],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
