import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';

import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['node_modules', 'tsconfig.tsbuildinfo']),

    {
        files: ['**/*.{js,ts,jsx,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            'import': importPlugin,
            'react': pluginReact,
            'react-hooks': reactHooks,
            '@typescript-eslint': tseslint.plugin,
            'prettier': eslintPluginPrettier,
        },
        extends: [
            js.configs.recommended,
            pluginReact.configs.flat.recommended,
            eslintConfigPrettier,
            ...tseslint.configs.recommended,
        ],
        settings: {
            'react': { version: 'detect' },
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
            },
        },
        rules: {
            'no-undef': 'off',
            'no-shadow': 'off',
            'camelcase': 'off',
            'no-bitwise': 'off',
            'no-continue': 'off',
            'no-unused-vars': 'warn',
            'no-return-await': 'off',
            'no-await-in-loop': 'off',
            'no-param-reassign': 'off',
            'import/extensions': 'off',
            'react/display-name': 'off',
            'no-underscore-dangle': 'off',
            'import/no-unresolved': 'off',
            'prefer-destructuring': 'off',
            'no-restricted-syntax': 'off',
            'jsx-a11y/no-autofocus': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/no-array-index-key': 'off',
            'react/require-default-props': 'off',
            'import/prefer-default-export': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react/jsx-no-useless-fragment': 'off',
            'import/no-extraneous-dependencies': 'off',
            'jsx-a11y/interactive-supports-focus': 'off',
            'react/function-component-definition': 'off',
            'jsx-a11y/label-has-associated-control': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',
            'jsx-a11y/no-static-element-interactions': 'off',
            'react/self-closing-comp': ['error', { component: true, html: true }],
            'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.tsx'] }],
            'max-len': ['error', { ignoreComments: true, code: 120 }],
            'react/jsx-max-props-per-line': ['warn', { maximum: 4 }],
            'import/order': [
                'error',
                {
                    'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'pathGroups': [
                        {
                            pattern: '@(**)',
                            group: 'external',
                            position: 'after',
                        },
                        { pattern: '@/app/**', group: 'internal', position: 'before' },
                        { pattern: '@/pages/**', group: 'internal', position: 'before' },
                        { pattern: '@/widgets/**', group: 'internal', position: 'before' },
                        { pattern: '@/features/**', group: 'internal', position: 'before' },
                        { pattern: '@/entities/**', group: 'internal', position: 'before' },
                        { pattern: '@/shared/**', group: 'internal', position: 'before' },
                    ],
                    'pathGroupsExcludedImportTypes': ['builtin'],
                    'alphabetize': { order: 'asc', caseInsensitive: false },
                    'newlines-between': 'always',
                },
            ],
        },
    },
]);
