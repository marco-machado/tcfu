// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'vite/**/*.mjs']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // TypeScript specific rules optimized for Phaser.js game development
      '@typescript-eslint/no-explicit-any': 'warn', // Allow but warn for Phaser flexibility
      '@typescript-eslint/explicit-function-return-type': 'off', // Optional for game methods
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      
      // Import organization rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'import/no-unresolved': 'error',
      'import/extensions': ['error', 'never', { 
        json: 'always',
        css: 'always' 
      }],
      
      // General code quality rules
      'no-console': 'warn', // Useful for debugging games but warn for production
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': ['error', {
        array: false, // Don't enforce for arrays (common in game dev)
        object: true
      }],
      
      // Phaser.js specific adjustments
      'no-unused-expressions': 'off', // Phaser uses method chaining
      '@typescript-eslint/no-unsafe-member-access': 'off', // Phaser has dynamic properties
      '@typescript-eslint/no-unsafe-call': 'off', // Phaser methods can be dynamic
      '@typescript-eslint/no-unsafe-assignment': 'warn', // Warn but don't block
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        },
        node: true
      }
    }
  }
);