<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { formatRupiah } from '#lib/utils.js';
	let { data } = $props();
	const order = $derived(data.order);

	// Auto-refresh tiap 10 detik tanpa reload halaman
	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 10_000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Status {order.orderCode} — KiloTrack</title>
</svelte:head>

<div class="mx-auto max-w-md space-y-4 p-4">
	<div class="text-center">
		<p class="text-lg font-bold text-primary">KiloTrack</p>
		<h1 class="text-xl font-semibold">Halo, Kak {order.customerFirstName} 👋</h1>
		<p class="text-sm text-muted-foreground">{order.orderCode} · {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
	</div>

	{#if order.cancelled}
		<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
			<p class="font-semibold">Order dibatalkan</p>
		</div>
	{:else}
		<div class="rounded-xl border bg-card p-4 shadow-sm">
			<ol class="space-y-3">
				{#each data.statuses as st, i (st)}
					{@const done = data.statuses.indexOf(order.status as any) >= i}
					{@const current = order.status === st}
					<li class="flex items-start gap-3">
						<span
							class={`flex size-8 shrink-0 items-center justify-center rounded-full border ${done ? 'border-primary bg-primary text-white' : 'border-border bg-background text-muted-foreground'} ${current ? 'animate-pulse bg-amber-500 border-amber-500' : ''}`}
						>
							{#if done && !current}✓{/if}
						</span>
						<div>
							<p class={`text-sm font-medium ${current ? 'text-amber-600' : ''}`}>{data.statusLabel[st]}</p>
							{#if order.histories[st]}
								<p class="text-xs text-muted-foreground">{new Date(order.histories[st]).toLocaleString('id-ID')}</p>
							{/if}
						</div>
					</li>
				{/each}
			</ol>
		</div>

		<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
			<p class="text-sm font-medium text-amber-700">Estimasi selesai: {new Date(new Date(order.createdAt).getTime() + 2 * 86400000).toLocaleString('id-ID')}</p>
		</div>

		<div class="rounded-xl border bg-card p-4">
			<p class="mb-2 text-sm font-medium">Rincian</p>
			<ul class="space-y-1 text-sm">
				{#each order.items as it (it.name + it.qty)}
					<li class="flex justify-between">
						<span>{it.name} · {it.qty} {it.unit}</span>
					</li>
				{/each}
			</ul>
		</div>

		{#if order.status === 'siap_diambil'}
			<div class="rounded-xl border border-amber-300 bg-amber-100 p-4 text-center text-amber-800">
				<p class="font-semibold">Cucian siap diambil! 🎉</p>
			</div>
		{/if}
	{/if}

	<div class="text-center">
		<a href="/cek" class="text-sm text-primary hover:underline">Cek order lain</a>
	</div>
</div>