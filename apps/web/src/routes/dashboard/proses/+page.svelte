<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { nextStatus, STATUS_LABEL, STATUS_COLOR, PAYMENT_LABEL, PAYMENT_COLOR } from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let { data, form } = $props();

	$effect(() => {
		if (form?.success) toast.success('Status diperbarui');
		if (form?.message) toast.error(form.message);
	});

	const columns = [
		{ key: 'antrian', title: 'Antrian', statuses: ['diterima'] },
		{ key: 'dicuci', title: 'Dicuci', statuses: ['dicuci'] },
		{ key: 'pengeringan', title: 'Pengeringan', statuses: ['dikeringkan', 'disetrika'] },
		{ key: 'selesai', title: 'Selesai', statuses: ['siap_diambil', 'selesai'] }
	];

	function ordersFor(statuses: string[]) {
		return data.orders.filter((o: any) => statuses.includes(o.status));
	}
</script>

<svelte:head>
	<title>Proses — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Proses Laundry</h1>
			<p class="text-sm text-muted-foreground">Papan kanban antrian cucian.</p>
		</div>
		<Button href="/dashboard/orders/new" class="gap-1">
			<PlusIcon class="size-4" /> Order Baru
		</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each columns as col (col.key)}
			<div class="rounded-xl border bg-muted/30 p-3">
				<div class="mb-3 flex items-center justify-between">
					<h2 class="font-semibold">{col.title}</h2>
					<Badge variant="secondary">{ordersFor(col.statuses).length}</Badge>
				</div>
				<div class="space-y-3">
					{#each ordersFor(col.statuses) as o (o.id)}
						<Card.Root class="p-3">
							<div class="flex items-start justify-between gap-2">
								<a href={`/dashboard/orders/${o.id}`} class="font-medium hover:underline">{o.orderCode}</a>
								<Badge class={STATUS_COLOR[o.status as keyof typeof STATUS_COLOR]}>{STATUS_LABEL[o.status as keyof typeof STATUS_LABEL]}</Badge>
								<Badge class={PAYMENT_COLOR[(o.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_COLOR]}>
									{PAYMENT_LABEL[(o.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_LABEL]}
								</Badge>
							</div>
							<p class="mt-1 text-sm">{o.customer.name}</p>
							<p class="text-xs text-muted-foreground">
								{o.items.map((i: any) => `${i.serviceCategory.name} ${i.qty}`).join(', ')}
							</p>
							<div class="mt-2 flex items-center justify-between">
								<span class="text-sm font-semibold tabular-nums">{formatRupiah(o.totalPrice)}</span>
								{#if nextStatus(o.status as any)}
									<form method="POST" action="?/advanceStatus" use:enhance>
										<input type="hidden" name="id" value={o.id} />
										<Button type="submit" size="sm" class="gap-1">
											Lanjut <ArrowRightIcon class="size-3" />
										</Button>
									</form>
								{/if}
							</div>
						</Card.Root>
					{/each}
					{#if ordersFor(col.statuses).length === 0}
						<p class="py-6 text-center text-xs text-muted-foreground">Kosong</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>