import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['.svelte-kit/**', 'build/**', 'dist/**', 'node_modules/**', 'src/env.generated.ts']
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs.recommended,
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,svelte}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				project: './tsconfig.json',
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		files: ['**/*.{ts,js,mts,mjs}'],
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		files: ['src/lib/components/ui/**', 'src/lib/hooks/**'],
		rules: {
			'@typescript-eslint/no-unsafe-function-type': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		rules: {
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/require-each-key': 'off'
		}
	},
	{
		files: ['src/lib/components/app-sidebar.svelte'],
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^HouseIcon$' }]
		}
	},
	{
		files: ['src/lib/components/ui/sidebar/context.svelte.ts', 'src/lib/hooks/is-mobile.svelte.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		files: ['scripts/**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: false,
				projectService: false
			}
		}
	},
	prettier
);
