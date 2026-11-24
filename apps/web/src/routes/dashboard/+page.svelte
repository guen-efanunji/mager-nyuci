<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import { LineChart } from 'layerchart';
	import { formatRupiah } from '#lib/utils.js';
	import { STATUS_LABEL, STATUS_COLOR, PAYMENT_LABEL, PAYMENT_COLOR } from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import PackageIcon from '@lucide/svelte/icons/package';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import WalletIcon from '@lucide/svelte/icons/wallet';

	let { data } = $props();

	const periods = [
		{ value: 'today', label: 'Hari ini' },
		{ value: 'week', label: 'Minggu ini' },
		{ value: 'month', label: 'Bulan ini' }
	] as const;

	const periodLabel = $derived(periods.find((p) => p.value === data.period)?.label ?? 'Hari ini');

	const chartData = $derived(
		data.chart.map((c) => ({
			date: new Date(c.date),
			day: c.day,
			revenue: c.value,
			orders: c.orders
		}))
	);

	const chartConfig = {
		revenue: {
			label: 'Omzet Lunas',
			color: 'var(--chart-1)'
		}
	} satisfies Chart.ChartConfig;

	const total7DaysRevenue = $derived(chartData.reduce((sum, item) => sum + item.revenue, 0));
	const total7DaysOrders = $derived(chartData.reduce((sum, item) => sum + item.orders, 0));
	const maxRevenue = $derived(Math.max(...chartData.map((d) => d.revenue), 0));
	const yDomain = $derived<[number, number]>([
		0,
		maxRevenue > 0 ? Math.ceil(maxRevenue * 1.15) : 100_000
	]);

	const dateRangeLabel = $derived.by(() => {
		if (!chartData.length) return '';
		const first = chartData[0].date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		});
		const last = chartData[chartData.length - 1].date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		});
		return `${first} – ${last}`;
	});

	function formatCompactRupiah(value: number) {
		if (value === 0) return 'Rp 0';
		if (value >= 1_000_000) {
			const jt = value / 1_000_000;
			return `Rp ${Number.isInteger(jt) ? jt : jt.toFixed(1)}jt`;
		}
		if (value >= 1_000) {
			return `Rp ${Math.round(value / 1_000)}rb`;
		}
		return `Rp ${value}`;
	}
</script>

<svelte:head>
	<title>Dashboard — KiloTrack</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div class="space-y-1">
			<p class="text-xs font-medium tracking-wide text-primary uppercase">Ringkasan Operasional</p>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
				Halo, {data.user.name || data.user.email}
			</h1>
			<p class="text-sm text-muted-foreground">{data.todayLabel}</p>
		</div>

		<div class="flex flex-wrap items-center gap-2.5">
			<div class="inline-flex items-center rounded-lg border bg-muted/40 p-1">
				{#each periods as p (p.value)}
					<a
						href={`/dashboard?period=${p.value}`}
						class={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
							data.period === p.value
								? 'bg-background text-foreground shadow-xs'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						{p.label}
					</a>
				{/each}
			</div>

			<Button href="/dashboard/orders/new" class="gap-1.5">
				<PlusIcon class="size-4" />
				Order Baru
			</Button>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		<Card.Root>
			<Card.Content class="p-5">
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-muted-foreground">Omzet (Lunas)</p>
					<span
						class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<WalletIcon class="size-4" />
					</span>
				</div>
				<p class="mt-3 text-2xl font-bold tracking-tight tabular-nums">
					{formatRupiah(data.summary.revenue)}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{data.summary.paidCount} order lunas • {periodLabel}
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="p-5">
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-muted-foreground">Belum Bayar</p>
					<span
						class={`flex size-8 items-center justify-center rounded-lg ${
							data.summary.unpaidAmount > 0
								? 'bg-red-500/10 text-red-600'
								: 'bg-muted text-muted-foreground'
						}`}
					>
						<CircleAlertIcon class="size-4" />
					</span>
				</div>
				<p
					class={`mt-3 text-2xl font-bold tracking-tight tabular-nums ${
						data.summary.unpaidAmount > 0 ? 'text-red-600' : ''
					}`}
				>
					{formatRupiah(data.summary.unpaidAmount)}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{data.summary.unpaidCount} order belum dibayar
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="p-5">
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-muted-foreground">Order Masuk</p>
					<span class="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
						<ReceiptIcon class="size-4" />
					</span>
				</div>
				<p class="mt-3 text-2xl font-bold tracking-tight tabular-nums">{data.summary.newCount}</p>
				<p class="mt-1 text-xs text-muted-foreground">{data.summary.selesai} order sudah selesai</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="p-5">
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-muted-foreground">Dalam Proses</p>
					<span
						class="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"
					>
						<ClockIcon class="size-4" />
					</span>
				</div>
				<p class="mt-3 text-2xl font-bold tracking-tight tabular-nums">{data.summary.inProcess}</p>
				<p class="mt-1 text-xs text-muted-foreground">
					<a href="/dashboard/proses" class="hover:text-foreground hover:underline">
						Kelola antrian proses
					</a>
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class={data.summary.siapDiambil > 0 ? 'border-amber-200/80 dark:border-amber-900/50' : ''}
		>
			<Card.Content class="p-5">
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-muted-foreground">Siap Diambil</p>
					<span
						class={`flex size-8 items-center justify-center rounded-lg ${
							data.summary.siapDiambil > 0
								? 'bg-amber-500/15 text-amber-600'
								: 'bg-muted text-muted-foreground'
						}`}
					>
						<PackageIcon class="size-4" />
					</span>
				</div>
				<p class="mt-3 text-2xl font-bold tracking-tight tabular-nums">
					{data.summary.siapDiambil}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">Menunggu diambil pelanggan</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Omzet 7 Hari Terakhir LineChart -->
	<Card.Root>
		<Card.Header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<Card.Title>Omzet 7 Hari Terakhir</Card.Title>
				<Card.Description>
					Pemasukan harian dari order berstatus lunas (7 hari terakhir)
				</Card.Description>
			</div>
			<div class="text-left sm:text-right">
				<p class="text-xs text-muted-foreground">Total 7 Hari</p>
				<p class="text-lg font-bold tracking-tight tabular-nums">
					{formatRupiah(total7DaysRevenue)}
				</p>
			</div>
		</Card.Header>
		<Card.Content>
			<Chart.Container config={chartConfig} class="aspect-auto h-64 w-full">
				<LineChart
					data={chartData}
					x="date"
					xScale={scaleUtc()}
					{yDomain}
					axis={true}
					grid={{ y: true, x: false }}
					points={{ r: 3.5 }}
					padding={{ left: 62, right: 16, top: 12, bottom: 28 }}
					series={[
						{
							key: 'revenue',
							label: chartConfig.revenue.label,
							color: chartConfig.revenue.color
						}
					]}
					props={{
						spline: { curve: curveMonotoneX, motion: 'tween', strokeWidth: 2.5 },
						xAxis: {
							ticks: chartData.map((d) => d.date),
							format: (v: Date) =>
								v.toLocaleDateString('id-ID', {
									weekday: 'short',
									day: 'numeric',
									timeZone: 'UTC'
								})
						},
						yAxis: {
							format: formatCompactRupiah
						},
						highlight: { points: { r: 5 } }
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip
							labelFormatter={(v) =>
								v instanceof Date
									? v.toLocaleDateString('id-ID', {
											weekday: 'long',
											day: 'numeric',
											month: 'short',
											timeZone: 'UTC'
										})
									: String(v)}
						>
							{#snippet formatter({ value, item })}
								<div class="flex w-full items-center justify-between gap-4">
									<span class="flex items-center gap-1.5 text-muted-foreground">
										<span
											class="size-2 rounded-[2px]"
											style={`background-color: ${item.color ?? 'var(--chart-1)'}`}
										></span>
										Omzet Lunas
									</span>
									<span class="font-mono font-semibold text-foreground tabular-nums">
										{formatRupiah(Number(value ?? 0))}
									</span>
								</div>
							{/snippet}
						</Chart.Tooltip>
					{/snippet}
				</LineChart>
			</Chart.Container>
		</Card.Content>
		<Card.Footer class="border-t pt-4">
			<div
				class="flex w-full flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
			>
				<div class="flex items-center gap-1.5 font-medium text-foreground">
					<TrendingUpIcon class="size-4 text-primary" />
					<span>{total7DaysOrders} order masuk dalam 7 hari terakhir</span>
				</div>
				<span>{dateRangeLabel}</span>
			</div>
		</Card.Footer>
	</Card.Root>

	<!-- Order Terbaru -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between border-b pb-4">
			<div>
				<Card.Title>Order Terbaru</Card.Title>
				<Card.Description>
					10 transaksi terbaru pada periode {periodLabel.toLowerCase()}
				</Card.Description>
			</div>
			<Button href="/dashboard/orders" variant="ghost" size="sm" class="gap-1">
				Lihat semua <ArrowRightIcon class="size-3.5" />
			</Button>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="pl-5">Kode Order</Table.Head>
						<Table.Head>Customer</Table.Head>
						<Table.Head>Total</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Pembayaran</Table.Head>
						<Table.Head>Waktu</Table.Head>
						<Table.Head class="pr-5 text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.recent.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="py-12 text-center">
								<div class="flex flex-col items-center gap-2 text-muted-foreground">
									<p class="text-sm font-medium text-foreground">
										Belum ada order pada periode {periodLabel.toLowerCase()}
									</p>
									<p class="text-xs">Catat order cucian baru atau ganti rentang periode di atas.</p>
									<Button
										href="/dashboard/orders/new"
										size="sm"
										variant="outline"
										class="mt-1 gap-1.5"
									>
										<PlusIcon class="size-3.5" />
										Buat Order Baru
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.recent as o (o.id)}
							{@const pStatus = (o.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_LABEL}
							<Table.Row>
								<Table.Cell class="pl-5 font-mono text-xs font-medium sm:text-sm">
									<a href={`/dashboard/orders/${o.id}`} class="text-primary hover:underline">
										{o.orderCode}
									</a>
								</Table.Cell>
								<Table.Cell class="font-medium">{o.customer.name}</Table.Cell>
								<Table.Cell class="font-medium tabular-nums">
									{formatRupiah(o.totalPrice)}
								</Table.Cell>
								<Table.Cell>
									<Badge class={STATUS_COLOR[o.status as keyof typeof STATUS_COLOR]}>
										{STATUS_LABEL[o.status as keyof typeof STATUS_LABEL]}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge class={PAYMENT_COLOR[pStatus]}>
										{PAYMENT_LABEL[pStatus]}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-xs text-muted-foreground">
									{new Date(o.createdAt).toLocaleString('id-ID', {
										day: '2-digit',
										month: 'short',
										hour: '2-digit',
										minute: '2-digit',
										timeZone: 'Asia/Jakarta'
									})}
								</Table.Cell>
								<Table.Cell class="pr-5 text-right">
									<Button href={`/dashboard/orders/${o.id}`} variant="ghost" size="sm">
										Detail
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
