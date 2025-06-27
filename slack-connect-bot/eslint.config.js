import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import noSecrets from 'eslint-plugin-no-secrets'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'no-secrets': noSecrets,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      'no-secrets/no-secrets': ['error', {
        tolerance: 5,
        additionalRegexes: {
          'Slack Token': 'xox[baprs]-[0-9a-zA-Z-]+',
          'Private Key': '-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----',
        },
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.wrangler/**',
      '*.config.js',
      '.mf/**',
    ],
  },
]