<script lang="ts">
	import { formatRupiah } from '#lib/utils.js';
	import { STATUS_LABEL, STATUS_COLOR } from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import PackageIcon from '@lucide/svelte/icons/package';
	import TruckIcon from '@lucide/svelte/icons/truck';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';

	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-medium text-primary">Ringkasan</p>
			<h1 class="text-3xl font-bold tracking-tight">Halo, {data.user.name || data.user.email}</h1>
			<p class="text-muted-foreground">Berikut kondisi laundry hari ini.</p>
		</div>
		<form method="GET" action="/dashboard" class="flex gap-2">
			<Select.Root type="single" name="period" value={data.period}>
				<Select.Trigger class="w-40">
					{data.period === 'today' ? 'Hari ini' : data.period === 'week' ? 'Minggu ini' : 'Bulan ini'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="today">Hari ini</Select.Item>
					<Select.Item value="week">Minggu ini</Select.Item>
					<Select.Item value="month">Bulan ini</Select.Item>
				</Select.Content>
			</Select.Root>
			<Button type="submit" variant="secondary">Terapkan</Button>
		</form>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
		<Card.Root>
			<Card.Content class="p-5">
				<p class="text-sm text-muted-foreground">Omzet (Lunas)</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{formatRupiah(data.summary.revenue)}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-5">
				<p class="text-sm text-muted-foreground">Belum Bayar</p>
				<p class="mt-2 text-2xl font-bold tabular-nums text-red-600">{formatRupiah(data.summary.unpaidAmount)}</p>
				<p class="mt-1 text-xs text-muted-foreground">{data.summary.unpaidCount} order belum dibayar</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-5">
				<p class="text-sm text-muted-foreground">Order Baru</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{data.summary.newCount}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-5">
				<p class="text-sm text-muted-foreground">Dalam Proses</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{data.summary.inProcess}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-5">
				<p class="text-sm text-muted-foreground">Siap Diambil</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{data.summary.siapDiambil}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Omzet 7 Hari Terakhir</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex h-40 items-end gap-2">
				{#each data.chart as c (c.day)}
					{@const max = Math.max(...data.chart.map((x) => x.value), 1)}
					<div class="flex flex-1 flex-col items-center justify-end gap-1">
						<div class="w-full rounded-t bg-primary/80" style={`height:${(c.value / max) * 100}%`}></div>
						<span class="text-xs text-muted-foreground">{c.day}</span>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title>Order Terbaru</Card.Title>
			<Button href="/dashboard/orders" variant="ghost" size="sm" class="gap-1">
				Lihat semua <ArrowRightIcon class="size-3" />
			</Button>
		</Card.Header>
		<Card.Content class="p-0">
			<table class="w-full text-sm">
				<thead class="bg-muted/50">
					<tr>
						<th class="p-3 text-left">Kode</th>
						<th class="p-3 text-left">Customer</th>
						<th class="p-3 text-left">Total</th>
						<th class="p-3 text-left">Status</th>
						<th class="p-3 text-left">Waktu</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recent as o (o.id)}
						<tr class="border-t">
							<td class="p-3 font-medium">
								<a href={`/dashboard/orders/${o.id}`} class="hover:underline">{o.orderCode}</a>
							</td>
							<td class="p-3">{o.customer.name}</td>
							<td class="p-3 tabular-nums">{formatRupiah(o.totalPrice)}</td>
							<td class="p-3">
								<Badge class={STATUS_COLOR[o.status as keyof typeof STATUS_COLOR]}>{STATUS_LABEL[o.status as keyof typeof STATUS_LABEL]}</Badge>
							</td>
							<td class="p-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString('id-ID')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>
</div>