<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import AppSidebar from '#lib/components/app-sidebar.svelte';

	let { data, children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	<Sidebar.Inset class="min-h-svh bg-background">
		<header
			class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6"
		>
			<Sidebar.Trigger class="-ms-1" aria-label="Toggle navigation sidebar" />
			<Separator orientation="vertical" class="me-2 h-4" />
			<Button
				variant="outline"
				size="icon"
				class="ms-auto relative"
				onclick={toggleMode}
				aria-label="Toggle color theme"
			>
				<SunIcon class="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<MoonIcon class="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				<span class="sr-only">Toggle theme</span>
			</Button>
		</header>
		<main class="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9 xl:px-10 2xl:px-12">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>