<script lang="ts">
	import { formatRupiah } from '#lib/utils.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.customer.name} — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<Button variant="ghost" href="/dashboard/customers" class="gap-2">
		<ArrowLeftIcon class="size-4" /> Kembali
	</Button>
	<Card.Root>
		<Card.Header>
			<Card.Title>{data.customer.name}</Card.Title>
			<Card.Description>{data.customer.whatsapp ?? 'Tanpa nomor WhatsApp'}</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">Total order: {data.customer.orders.length}</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Riwayat Order</Card.Title>
		</Card.Header>
		<Card.Content class="p-0">
			<table class="w-full text-sm">
				<thead class="bg-muted/50">
					<tr>
						<th class="p-3 text-left">Kode</th>
						<th class="p-3 text-left">Total</th>
						<th class="p-3 text-left">Status</th>
						<th class="p-3 text-left">Tanggal</th>
					</tr>
				</thead>
				<tbody>
					{#each data.customer.orders as o (o.id)}
						<tr class="border-t">
							<td class="p-3 font-medium">{o.orderCode}</td>
							<td class="p-3 tabular-nums">{formatRupiah(o.totalPrice)}</td>
							<td class="p-3">
								<Badge variant="outline">{o.status}</Badge>
							</td>
							<td class="p-3 text-muted-foreground">{new Date(o.createdAt).toLocaleString('id-ID')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>
</div>