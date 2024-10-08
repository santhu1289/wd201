import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Keep browser globals
        ...globals.node, // Add Node.js globals
        ...globals.jest, // Add Jest globals
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-undef': 'off', // Turn off no-undef for Jest and Node.js globals
      '@typescript-eslint/no-require-imports': 'off', // Disable this rule
    },
  },
]
