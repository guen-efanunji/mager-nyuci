<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import BanIcon from '@lucide/svelte/icons/ban';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CircleCheckBigIcon from '@lucide/svelte/icons/circle-check-big';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import DropletsIcon from '@lucide/svelte/icons/droplets';
	import FlameIcon from '@lucide/svelte/icons/flame';
	import PackageCheckIcon from '@lucide/svelte/icons/package-check';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import StickyNoteIcon from '@lucide/svelte/icons/sticky-note';
	import WashingMachineIcon from '@lucide/svelte/icons/washing-machine';
	import WindIcon from '@lucide/svelte/icons/wind';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import {
		PAYMENT_COLOR,
		PAYMENT_LABEL,
		type OrderStatus,
		type PaymentStatus
	} from '#lib/order.js';
	import { cn, formatRupiah } from '#lib/utils.js';

	let { data } = $props();
	const order = $derived(data.order);

	type TrackStep = (typeof data.statuses)[number];

	const STEP_DESCRIPTION: Record<TrackStep, string> = {
		diterima: 'Cucian sudah kami terima dan masuk daftar antrean.',
		dicuci: 'Cucian sedang dalam proses pencucian.',
		dikeringkan: 'Cucian sedang dalam tahap pengeringan.',
		disetrika: 'Cucian sedang disetrika dan dirapikan.',
		siap_diambil: 'Cucian sudah bersih, rapi, dan siap diambil di outlet.',
		selesai: 'Order telah selesai dan cucian sudah diambil.'
	};

	let refreshing = $state(false);
	let lastRefreshedAt = $state(new Date());

	async function handleRefresh() {
		if (refreshing) return;
		refreshing = true;
		try {
			await invalidateAll();
			lastRefreshedAt = new Date();
		} finally {
			refreshing = false;
		}
	}

	onMount(() => {
		const interval = setInterval(async () => {
			await invalidateAll();
			lastRefreshedAt = new Date();
		}, 15_000);
		return () => clearInterval(interval);
	});

	const currentStepIndex = $derived(
		order.cancelled ? -1 : data.statuses.indexOf(order.status as TrackStep)
	);
	const currentStatus = $derived(order.status as OrderStatus);
	const currentPayment = $derived((order.paymentStatus ?? 'belum_bayar') as PaymentStatus);
	const isCompleted = $derived(order.status === 'selesai');
	const isReadyForPickup = $derived(order.status === 'siap_diambil');
	const progressPercent = $derived(
		order.cancelled || currentStepIndex < 0
			? 0
			: Math.round(((currentStepIndex + 1) / data.statuses.length) * 100)
	);

	const estimatedFinishAt = $derived(
		new Date(new Date(order.createdAt).getTime() + 2 * 86_400_000)
	);

	function formatShortDate(value: string | Date): string {
		return new Date(value).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatDateTime(value: string | Date): string {
		return new Date(value).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatEstimate(value: Date): string {
		return value.toLocaleString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatSyncTime(value: Date): string {
		return value.toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Status {order.orderCode} — KiloTrack</title>
	<noscript>
		<meta http-equiv="refresh" content="30" />
	</noscript>
</svelte:head>

<div class="min-h-svh bg-muted/40">
	<!-- Slim Public Topbar -->
	<header class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
		<div class="mx-auto flex h-14 max-w-md items-center justify-between px-4">
			<div class="flex items-center gap-2.5">
				<div
					class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs"
				>
					<WashingMachineIcon class="size-4" />
				</div>
				<div class="leading-tight">
					<p class="text-sm font-semibold tracking-tight">KiloTrack</p>
					<p class="text-[11px] text-muted-foreground">Lacak Status Cucian</p>
				</div>
			</div>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				class="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
				onclick={handleRefresh}
				disabled={refreshing}
			>
				<RefreshCwIcon class={cn('size-3.5', refreshing && 'animate-spin')} />
				<span>Refresh</span>
			</Button>
		</div>
	</header>

	<div class="mx-auto max-w-md space-y-4 px-4 py-5 pb-10">
		<!-- Hero Summary Card -->
		<Card.Root class="overflow-hidden shadow-sm">
			<Card.Content class="space-y-4 p-5">
				<div class="flex items-start justify-between gap-3">
					<div class="space-y-1">
						<p class="text-xs font-medium text-muted-foreground">
							Halo, Kak {order.customerFirstName}
						</p>
						<h1 class="text-lg font-bold tracking-tight text-foreground">
							{order.cancelled
								? 'Order Dibatalkan'
								: isCompleted
									? 'Cucian Sudah Selesai'
									: isReadyForPickup
										? 'Cucian Siap Diambil!'
										: `Sedang ${data.statusLabel[currentStatus]}`}
						</h1>
					</div>
					<Badge
						class={cn(
							'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
							data.statusColor[currentStatus]
						)}
					>
						{data.statusLabel[currentStatus]}
					</Badge>
				</div>

				<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
					<span
						class="rounded-md bg-muted px-2 py-0.5 font-mono font-semibold text-foreground tabular-nums"
					>
						{order.orderCode}
					</span>
					<span>&middot;</span>
					<span class="tabular-nums">Masuk {formatShortDate(order.createdAt)}</span>
				</div>

				{#if !order.cancelled}
					<div class="space-y-2 pt-1">
						<div class="flex items-center justify-between text-xs">
							<span class="text-muted-foreground">
								{STEP_DESCRIPTION[order.status as TrackStep] ?? 'Memproses cucian Anda.'}
							</span>
						</div>
						<div class="space-y-1.5">
							<div
								class="flex items-center justify-between text-[11px] font-medium text-muted-foreground"
							>
								<span>Progres Pengerjaan</span>
								<span class="tabular-nums text-foreground">
									Tahap {currentStepIndex + 1} dari {data.statuses.length}
								</span>
							</div>
							<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
								<div
									class={cn(
										'h-full rounded-full transition-all duration-500',
										isCompleted
											? 'bg-emerald-600'
											: isReadyForPickup
												? 'bg-amber-500'
												: 'bg-primary'
									)}
									style={`width: ${progressPercent}%`}
								></div>
							</div>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		{#if order.cancelled}
			<Alert.Root variant="destructive" class="border-red-200 bg-red-50/80 text-red-900">
				<BanIcon class="size-4" />
				<Alert.Title>Order dibatalkan</Alert.Title>
				<Alert.Description class="text-red-800/90">
					Order dengan kode <span class="font-mono font-semibold">{order.orderCode}</span> telah dibatalkan.
					Silakan hubungi outlet jika membutuhkan informasi lebih lanjut.
				</Alert.Description>
			</Alert.Root>
		{:else}
			{#if isReadyForPickup}
				<Alert.Root class="border-amber-300 bg-amber-50 text-amber-950 shadow-2xs">
					<SparklesIcon class="size-4 text-amber-600" />
					<Alert.Title class="font-semibold text-amber-900">Cucian siap diambil!</Alert.Title>
					<Alert.Description class="text-amber-800">
						Cucian Kak {order.customerFirstName} sudah selesai diproses. Silakan tunjukkan kode
						<span class="font-mono font-semibold">{order.orderCode}</span> saat pengambilan.
					</Alert.Description>
				</Alert.Root>
			{:else if isCompleted}
				<Alert.Root class="border-emerald-200 bg-emerald-50 text-emerald-950 shadow-2xs">
					<CircleCheckBigIcon class="size-4 text-emerald-600" />
					<Alert.Title class="font-semibold text-emerald-900">Terima kasih!</Alert.Title>
					<Alert.Description class="text-emerald-800">
						Order ini sudah selesai dan diterima kembali oleh pelanggan.
					</Alert.Description>
				</Alert.Root>
			{/if}

			<!-- 6-Step Vertical Timeline -->
			<Card.Root class="shadow-sm">
				<Card.Header class="pb-3">
					<div class="flex items-center justify-between gap-2">
						<Card.Title class="text-base font-semibold">Tahapan Pengerjaan</Card.Title>
						{#if !isCompleted}
							<span
								class="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
							>
								<span class="size-1.5 animate-pulse rounded-full bg-emerald-500"></span>
								Live · {formatSyncTime(lastRefreshedAt)}
							</span>
						{/if}
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<ol class="relative space-y-0">
						{#each data.statuses as st, i (st)}
							{@const reached = currentStepIndex >= i}
							{@const current = order.status === st && !isCompleted}
							{@const finishedCurrent = order.status === st && isCompleted}
							{@const isLast = i === data.statuses.length - 1}
							{@const timestamp = order.histories[st]}
							<li class={cn('relative flex gap-3.5', !isLast && 'pb-5')}>
								{#if !isLast}
									<span
										aria-hidden="true"
										class={cn(
											'absolute top-8 left-4 h-[calc(100%-1.5rem)] w-0.5 -translate-x-1/2',
											currentStepIndex > i ? 'bg-primary' : 'bg-border'
										)}
									></span>
								{/if}

								<span
									class={cn(
										'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors',
										current
											? 'border-amber-500 bg-amber-500 text-white ring-4 ring-amber-500/20'
											: finishedCurrent
												? 'border-emerald-600 bg-emerald-600 text-white'
												: reached
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-border bg-background text-muted-foreground'
									)}
								>
									{#if current}
										{#if st === 'dicuci'}
											<DropletsIcon class="size-4 animate-pulse" />
										{:else if st === 'dikeringkan'}
											<WindIcon class="size-4 animate-pulse" />
										{:else if st === 'disetrika'}
											<FlameIcon class="size-4 animate-pulse" />
										{:else if st === 'siap_diambil'}
											<PackageCheckIcon class="size-4 animate-pulse" />
										{:else}
											<WashingMachineIcon class="size-4 animate-pulse" />
										{/if}
									{:else if reached}
										<CheckIcon class="size-4" />
									{:else}
										<span class="text-xs font-medium tabular-nums">{i + 1}</span>
									{/if}
								</span>

								<div class="flex min-w-0 flex-1 items-start justify-between gap-2 pt-1">
									<div>
										<p
											class={cn(
												'text-sm leading-tight font-medium',
												current
													? 'font-semibold text-amber-700'
													: finishedCurrent
														? 'font-semibold text-emerald-700'
														: reached
															? 'text-foreground'
															: 'text-muted-foreground'
											)}
										>
											{data.statusLabel[st]}
										</p>
										{#if current}
											<p class="mt-0.5 text-xs text-amber-700/80">Sedang berlangsung</p>
										{:else if !reached}
											<p class="mt-0.5 text-xs text-muted-foreground/75">
												Menunggu tahap sebelumnya
											</p>
										{/if}
									</div>

									{#if timestamp}
										<span class="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
											{formatDateTime(timestamp)}
										</span>
									{/if}
								</div>
							</li>
						{/each}
					</ol>
				</Card.Content>
			</Card.Root>

			<!-- Estimated Finish Card -->
			{#if !isCompleted && !isReadyForPickup}
				<Card.Root class="border-amber-200 bg-amber-50/70 shadow-sm">
					<Card.Content class="flex items-center gap-3.5 p-4">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"
						>
							<ClockIcon class="size-5" />
						</div>
						<div class="min-w-0">
							<p class="text-xs font-medium text-amber-800/90">Estimasi Selesai</p>
							<p class="text-sm font-semibold text-amber-950 tabular-nums">
								{formatEstimate(estimatedFinishAt)}
							</p>
							<p class="mt-0.5 text-[11px] text-amber-800/75">
								Estimasi standar 2 hari sejak cucian diterima.
							</p>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Order Items & Payment Summary -->
			<Card.Root class="shadow-sm">
				<Card.Header class="pb-3">
					<div class="flex items-center justify-between gap-2">
						<Card.Title class="flex items-center gap-2 text-base font-semibold">
							<ReceiptIcon class="size-4 text-muted-foreground" />
							<span>Rincian Cucian</span>
						</Card.Title>
						<Badge
							class={cn(
								'rounded-full px-2.5 py-0.5 text-xs font-medium',
								PAYMENT_COLOR[currentPayment]
							)}
						>
							{PAYMENT_LABEL[currentPayment]}
						</Badge>
					</div>
				</Card.Header>
				<Card.Content class="space-y-3 pt-0">
					<ul class="divide-y">
						{#each order.items as it (it.id)}
							<li class="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
								<div class="min-w-0">
									<p class="text-sm font-medium text-foreground">{it.name}</p>
									<p class="text-xs text-muted-foreground tabular-nums">
										{it.qty}
										{it.unit}
										{#if it.minQty !== null}
											<span>&middot; Paket &ge; {it.minQty} {it.unit}</span>
										{/if}
									</p>
								</div>
								<span class="shrink-0 text-sm font-medium text-foreground tabular-nums">
									{formatRupiah(it.subtotal)}
								</span>
							</li>
						{/each}
					</ul>

					{#if order.notes}
						<div class="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
							<StickyNoteIcon class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
							<div class="min-w-0">
								<span class="font-medium text-foreground">Catatan: </span>
								<span class="text-muted-foreground">{order.notes}</span>
							</div>
						</div>
					{/if}

					<Separator />

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-muted-foreground">Total Tagihan</span>
						<span class="text-lg font-bold text-foreground tabular-nums">
							{formatRupiah(order.totalPrice)}
						</span>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Public Footer -->
		<div class="flex flex-col items-center gap-2 pt-2 text-center">
			<p class="text-xs text-muted-foreground">Status diperbarui otomatis setiap 15 detik.</p>
			<Button href="/cek" variant="outline" size="sm" class="gap-1.5 rounded-full">
				<SearchIcon class="size-3.5" />
				<span>Cek Order Lain</span>
			</Button>
		</div>
	</div>
</div>
