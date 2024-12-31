import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import pluginImport from 'eslint-plugin-import';
import stylisticJs from '@stylistic/eslint-plugin-js';

/** @type {import('eslint').Linter.Config[]} */
// eslint-disable-next-line import/no-default-export
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      react,
      import: pluginImport,
      '@stylistic/js': stylisticJs,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'import/no-default-export': 'error',
      '@stylistic/js/eol-last': 'error',
      '@stylistic/js/max-len': ['error', { code: 80 }],
      '@stylistic/js/no-extra-semi': 'error',
      '@stylistic/js/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/js/no-tabs': 'error',
      '@stylistic/js/one-var-declaration-per-line': 'error',
      '@stylistic/js/wrap-iife': 'error',
      'no-unused-vars': 'error',
      'no-trailing-spaces': 'error',
      '@typescript-eslint/no-shadow': 'error',
      "no-nested-ternary": "error",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
];
