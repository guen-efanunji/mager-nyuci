<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { STATUS_LABEL, STATUS_COLOR } from '#lib/order.js';

	let { data } = $props();

	const STATUSES = ['diterima', 'dicuci', 'dikeringkan', 'disetrika', 'siap_diambil', 'selesai'] as const;

	let code = $state('');
	let wa = $state('');
	$effect(() => {
		code = data.code ?? '';
	});
</script>

<svelte:head>
	<title>Cek Status Cucian — KiloTrack</title>
</svelte:head>

<div class="mx-auto max-w-md space-y-4 p-4">
	<div class="text-center">
		<p class="text-lg font-bold text-primary">KiloTrack</p>
		<h1 class="text-xl font-semibold">Cek Status Cucian Kamu</h1>
	</div>

	{#if data.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{data.error}</div>
	{/if}

	{#if data.step === 'code'}
		<Card.Root>
			<Card.Content class="space-y-4 p-4">
				<form method="GET" action="/cek" class="space-y-4">
					<div class="space-y-2">
						<Label for="code">Kode Order</Label>
						<Input id="code" name="code" placeholder="LN-261119-0042" bind:value={code} required />
					</div>
					<Button type="submit" class="w-full">Cek Status</Button>
				</form>
			</Card.Content>
		</Card.Root>
	{:else if data.step === 'verify'}
		<Card.Root>
			<Card.Content class="space-y-4 p-4">
				<p class="text-sm text-muted-foreground">Masukkan 4 digit terakhir nomor WhatsApp untuk verifikasi.</p>
				<form method="GET" action="/cek" class="space-y-4">
					<input type="hidden" name="code" value={data.code} />
					<div class="space-y-2">
						<Label for="wa">4 digit terakhir WA</Label>
						<Input id="wa" name="wa" maxlength={4} bind:value={wa} required />
					</div>
					<Button type="submit" class="w-full">Verifikasi</Button>
				</form>
			</Card.Content>
		</Card.Root>
	{:else if data.step === 'result' && data.order}
		{@const order = data.order}
		<div class="rounded-xl border bg-card p-4 shadow-sm">
			<p class="text-center font-semibold">Halo, Kak {order.customerFirstName} 👋</p>
			<p class="text-center text-sm text-muted-foreground">{order.orderCode}</p>
			{#if order.cancelled}
				<div class="mt-3 rounded-md bg-red-50 p-3 text-center text-red-700">Order dibatalkan</div>
			{:else}
				<ol class="mt-4 space-y-3">
					{#each STATUSES as st, i (st)}
						{@const done = STATUSES.indexOf(order.status as any) >= i}
						{@const current = order.status === st}
						<li class="flex items-start gap-3">
							<span class={`flex size-8 shrink-0 items-center justify-center rounded-full border ${done ? 'border-primary bg-primary text-white' : 'border-border bg-background text-muted-foreground'} ${current ? 'animate-pulse bg-amber-500 border-amber-500' : ''}`}>
								{#if done && !current}✓{/if}
							</span>
							<div>
								<p class={`text-sm font-medium ${current ? 'text-amber-600' : ''}`}>{STATUS_LABEL[st]}</p>
								{#if order.histories?.[st]}
									<p class="text-xs text-muted-foreground">{new Date(order.histories[st]!).toLocaleString('id-ID')}</p>
								{/if}
							</div>
						</li>
					{/each}
				</ol>
				{#if order.status === 'siap_diambil'}
					<div class="mt-3 rounded-md bg-amber-100 p-3 text-center text-amber-800 font-semibold">Cucian siap diambil! 🎉</div>
				{/if}
			{/if}
		</div>
	{/if}

	<div class="text-center">
		<a href="/" class="text-sm text-primary hover:underline">Kembali</a>
	</div>
</div>