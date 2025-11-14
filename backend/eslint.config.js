import globals from 'globals';
import pluginN from 'eslint-plugin-n';
import eslintConfigPrettier from 'eslint-config-prettier';
import js from '@eslint/js';

export default [
  // Ignore the config file itself
  {
    ignores: ['eslint.config.js'],
  },

  // Global configuration for all files
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // Recommended ESLint rules
  js.configs.recommended,

  // Recommended Node.js rules from eslint-plugin-n
  pluginN.configs['flat/recommended'],

  // Prettier configuration to disable conflicting rules
  eslintConfigPrettier,

  // Custom rules can be added here
  {
    rules: {
      'n/no-unsupported-features/es-syntax': ['error', { 'version': '>=18.0.0' }],
      'no-unused-vars': ['warn', { 'args': 'none' }],
      'n/no-unpublished-import': 'off'
    },
  },
  // Disable process.exit rule for specific files
  {
    files: ['server.js', 'src/config/db.js'],
    rules: {
      'n/no-process-exit': 'off'
    }
  }
];
