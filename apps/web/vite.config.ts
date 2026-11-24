import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { varlockVitePlugin } from '@varlock/vite-integration';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		varlockVitePlugin({ ssrInjectMode: 'auto-load' }),
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter()
		})
	],
	ssr: {
		noExternal: ['layerchart']
	}
});
