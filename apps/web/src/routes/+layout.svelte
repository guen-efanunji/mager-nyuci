<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';

	const { children } = $props();
</script>

<ModeWatcher />
<main class="min-h-svh">
	{@render children()}
</main>
<Toaster position="top-center" richColors />
