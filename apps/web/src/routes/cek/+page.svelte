<script lang="ts">
	import { formatRupiah } from '#lib/utils.js';
	import {
		STATUS_LABEL,
		STATUS_COLOR,
		PAYMENT_LABEL,
		PAYMENT_COLOR,
		type OrderStatus
	} from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BanIcon from '@lucide/svelte/icons/ban';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import FlameIcon from '@lucide/svelte/icons/flame';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import PackageCheckIcon from '@lucide/svelte/icons/package-check';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShirtIcon from '@lucide/svelte/icons/shirt';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import StickyNoteIcon from '@lucide/svelte/icons/sticky-note';
	import WashingMachineIcon from '@lucide/svelte/icons/washing-machine';
	import WindIcon from '@lucide/svelte/icons/wind';

	let { data } = $props();

	const STATUSES = [
		'diterima',
		'dicuci',
		'dikeringkan',
		'disetrika',
		'siap_diambil',
		'selesai'
	] as const;

	const STATUS_SUBTITLE: Record<(typeof STATUSES)[number], string> = {
		diterima: 'Cucian telah masuk dan dicatat di kasir',
		dicuci: 'Cucian sedang dalam proses pencucian',
		dikeringkan: 'Cucian sedang dikeringkan',
		disetrika: 'Cucian sedang disetrika & dirapikan',
		siap_diambil: 'Cucian bersih dan siap diambil di kasir',
		selesai: 'Cucian telah diambil pelanggan'
	};

	const STATUS_HERO_TITLE: Record<(typeof STATUSES)[number], string> = {
		diterima: 'Cucian Diterima',
		dicuci: 'Sedang Dicuci',
		dikeringkan: 'Sedang Dikeringkan',
		disetrika: 'Sedang Disetrika',
		siap_diambil: 'Cucian Siap Diambil!',
		selesai: 'Cucian Sudah Selesai'
	};

	const STEPS = [
		{ key: 'code', label: 'Kode Order' },
		{ key: 'verify', label: 'Verifikasi WA' },
		{ key: 'result', label: 'Status Cucian' }
	] as const;

	let code = $state('');
	let wa = $state('');

	$effect(() => {
		code = data.code ?? '';
		if (data.step === 'code') wa = '';
	});

	const stepIndex = $derived(STEPS.findIndex((s) => s.key === data.step));

	const formatDate = (value: string | Date) =>
		new Date(value).toLocaleString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
</script>

<svelte:head>
	<title>Cek Status Cucian — KiloTrack</title>
</svelte:head>

<div class="min-h-screen bg-muted/30">
	<header class="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
		<div class="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
			<a href="/" class="flex items-center gap-2">
				<div
					class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
				>
					<ShirtIcon class="size-4" />
				</div>
				<div class="leading-tight">
					<p class="text-sm font-bold tracking-tight">KiloTrack</p>
					<p class="text-[11px] text-muted-foreground">Cek Status Cucian</p>
				</div>
			</a>

			{#if data.step !== 'code'}
				<Button variant="outline" size="sm" href="/cek" class="h-8 gap-1.5 px-2.5 text-xs">
					<SearchIcon class="size-3.5" />
					Cek Lain
				</Button>
			{/if}
		</div>
	</header>

	<main class="mx-auto max-w-lg space-y-4 px-4 py-6 pb-10">
		<div class="space-y-1 text-center">
			<h1 class="text-xl font-bold tracking-tight">Cek Status Cucian</h1>
			<p class="text-sm text-muted-foreground">
				Pantau proses cucian Anda dengan kode order dan verifikasi WhatsApp.
			</p>
		</div>

		<!-- Stepper -->
		<nav aria-label="Tahapan cek order" class="grid grid-cols-3 gap-2">
			{#each STEPS as item, idx (item.key)}
				{@const isDone = stepIndex > idx}
				{@const isActive = stepIndex === idx}
				<div
					class="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors {isActive
						? 'border-primary/40 bg-primary/5 font-medium text-foreground'
						: isDone
							? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
							: 'bg-background text-muted-foreground'}"
				>
					<span
						class="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold {isActive
							? 'bg-primary text-primary-foreground'
							: isDone
								? 'bg-emerald-600 text-white'
								: 'bg-muted text-muted-foreground'}"
					>
						{#if isDone}
							<CheckIcon class="size-3" />
						{:else}
							{idx + 1}
						{/if}
					</span>
					<span class="truncate">{item.label}</span>
				</div>
			{/each}
		</nav>

		{#if data.error}
			<Alert.Root variant="destructive">
				<CircleAlertIcon class="size-4" />
				<Alert.Title>Tidak Dapat Memproses</Alert.Title>
				<Alert.Description>{data.error}</Alert.Description>
			</Alert.Root>
		{/if}

		{#if data.step === 'code'}
			<Card.Root class="shadow-sm">
				<Card.Header class="pb-3">
					<Card.Title class="flex items-center gap-2 text-base">
						<ReceiptIcon class="size-4 text-muted-foreground" />
						Masukkan Kode Order
					</Card.Title>
					<Card.Description>
						Kode order tertera pada struk nota atau pesan WhatsApp dari kasir.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<form method="GET" action="/cek" class="space-y-4">
						<div class="space-y-2">
							<Label for="code">Kode Order</Label>
							<div class="relative">
								<SearchIcon
									class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="code"
									name="code"
									placeholder="Contoh: LN-261125-0001"
									bind:value={code}
									autocomplete="off"
									autocapitalize="characters"
									class="pl-9 font-mono uppercase tracking-wide"
									required
								/>
							</div>
						</div>
						<Button type="submit" class="w-full gap-2">
							Lanjutkan
							<ArrowRightIcon class="size-4" />
						</Button>
					</form>
				</Card.Content>
			</Card.Root>
		{:else if data.step === 'verify'}
			<Card.Root class="shadow-sm">
				<Card.Header class="pb-3">
					<div class="flex items-center justify-between gap-2">
						<Card.Title class="flex items-center gap-2 text-base">
							<ShieldCheckIcon class="size-4 text-primary" />
							Verifikasi Keamanan
						</Card.Title>
						<Badge variant="outline" class="font-mono text-xs">{data.code}</Badge>
					</div>
					<Card.Description>
						Masukkan 4 digit terakhir nomor WhatsApp yang terdaftar pada order ini.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<form method="GET" action="/cek" class="space-y-4">
						<input type="hidden" name="code" value={data.code} />
						<div class="space-y-2">
							<Label for="wa" class="flex items-center gap-1.5">
								<SmartphoneIcon class="size-3.5 text-muted-foreground" />
								4 Digit Terakhir WhatsApp
							</Label>
							<div class="relative">
								<KeyRoundIcon
									class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="wa"
									name="wa"
									type="tel"
									inputmode="numeric"
									pattern="[0-9]{4}"
									maxlength={4}
									placeholder="••••"
									bind:value={wa}
									autocomplete="one-time-code"
									class="pl-9 text-center font-mono text-lg tracking-[0.4em]"
									required
								/>
							</div>
							<p class="text-xs text-muted-foreground">
								Contoh: jika nomor Anda 0812-3456-7890, masukkan <span
									class="font-mono font-medium text-foreground"
								>
									7890
								</span>.
							</p>
						</div>
						<div class="flex flex-col gap-2 sm:flex-row">
							<Button type="button" variant="outline" href="/cek" class="gap-1.5 sm:flex-1">
								<ArrowLeftIcon class="size-4" />
								Ganti Kode
							</Button>
							<Button type="submit" class="gap-1.5 sm:flex-2">
								Verifikasi & Lihat Status
								<ArrowRightIcon class="size-4" />
							</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		{:else if data.step === 'result' && data.order}
			{@const order = data.order}
			{@const currentIdx = STATUSES.indexOf(order.status as (typeof STATUSES)[number])}
			{@const progressPercent = order.cancelled
				? 0
				: Math.round(((Math.max(currentIdx, 0) + 1) / STATUSES.length) * 100)}
			{@const paymentKey = (order.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_LABEL}

			<Card.Root class="overflow-hidden shadow-sm">
				<Card.Content class="space-y-4 p-5">
					<div class="flex items-start justify-between gap-3">
						<div class="space-y-1">
							<p class="text-xs font-medium text-muted-foreground">
								Halo, Kak {order.customerFirstName}
							</p>
							<h2 class="text-xl font-bold tracking-tight">
								{#if order.cancelled}
									Order Dibatalkan
								{:else}
									{STATUS_HERO_TITLE[order.status as (typeof STATUSES)[number]] ??
										STATUS_LABEL[order.status as OrderStatus]}
								{/if}
							</h2>
						</div>
						<Badge class="{STATUS_COLOR[order.status as OrderStatus]} shrink-0">
							{STATUS_LABEL[order.status as OrderStatus]}
						</Badge>
					</div>

					<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
						<span class="inline-flex items-center gap-1.5 font-mono font-medium text-foreground">
							<ReceiptIcon class="size-3.5 text-muted-foreground" />
							{order.orderCode}
						</span>
						<span class="inline-flex items-center gap-1.5">
							<CalendarIcon class="size-3.5" />
							Masuk {formatDate(order.createdAt)}
						</span>
					</div>

					{#if !order.cancelled}
						<div class="space-y-1.5 pt-1">
							<div class="flex items-center justify-between text-xs">
								<span class="text-muted-foreground">Progres Pengerjaan</span>
								<span class="font-medium tabular-nums">
									Tahap {Math.max(currentIdx, 0) + 1} dari {STATUSES.length}
								</span>
							</div>
							<Progress value={progressPercent} class="h-2" />
						</div>
					{/if}

					{#if order.status === 'siap_diambil'}
						<div
							class="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
						>
							<SparklesIcon class="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
							<div>
								<p class="font-semibold">Cucian siap diambil!</p>
								<p class="text-xs opacity-90">
									Silakan datang ke outlet dan tunjukkan kode order <span class="font-mono">
										{order.orderCode}
									</span>.
								</p>
							</div>
						</div>
					{:else if order.status === 'selesai'}
						<div
							class="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
						>
							<CircleCheckIcon
								class="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
							/>
							<div>
								<p class="font-semibold">Order sudah selesai</p>
								<p class="text-xs opacity-90">Terima kasih sudah mencuci bersama kami.</p>
							</div>
						</div>
					{:else if order.cancelled}
						<Alert.Root variant="destructive">
							<BanIcon class="size-4" />
							<Alert.Title>Order dibatalkan</Alert.Title>
							<Alert.Description>
								Silakan hubungi outlet jika Anda memerlukan informasi lebih lanjut.
							</Alert.Description>
						</Alert.Root>
					{/if}
				</Card.Content>
			</Card.Root>

			{#if !order.cancelled}
				<Card.Root class="shadow-sm">
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Tahap Pengerjaan</Card.Title>
					</Card.Header>
					<Card.Content>
						<ol class="space-y-0">
							{#each STATUSES as st, i (st)}
								{@const reached = currentIdx >= i}
								{@const current = order.status === st && st !== 'selesai'}
								{@const finishedAll = order.status === 'selesai' && st === 'selesai'}
								{@const isLast = i === STATUSES.length - 1}
								{@const timestamp = order.histories?.[st]}
								<li class="relative flex gap-3.5 {isLast ? '' : 'pb-5'}">
									{#if !isLast}
										<div
											class="absolute top-8 bottom-0 left-4 w-px -translate-x-1/2 {currentIdx > i
												? 'bg-primary'
												: 'bg-border'}"
										></div>
									{/if}

									<div
										class="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors {current
											? 'animate-pulse border-amber-500 bg-amber-500 text-white shadow-sm ring-4 ring-amber-500/20'
											: reached || finishedAll
												? 'border-primary bg-primary text-primary-foreground'
												: 'border-border bg-background text-muted-foreground'}"
									>
										{#if current}
											{#if st === 'diterima'}
												<ClockIcon class="size-4" />
											{:else if st === 'dicuci'}
												<WashingMachineIcon class="size-4" />
											{:else if st === 'dikeringkan'}
												<WindIcon class="size-4" />
											{:else if st === 'disetrika'}
												<FlameIcon class="size-4" />
											{:else}
												<PackageCheckIcon class="size-4" />
											{/if}
										{:else if reached || finishedAll}
											<CheckIcon class="size-4" />
										{:else}
											<span class="text-xs font-medium">{i + 1}</span>
										{/if}
									</div>

									<div class="flex min-w-0 flex-1 items-start justify-between gap-2 pt-1">
										<div class="space-y-0.5">
											<p
												class="text-sm leading-none font-medium {current
													? 'text-amber-700 dark:text-amber-400'
													: reached
														? 'text-foreground'
														: 'text-muted-foreground'}"
											>
												{STATUS_LABEL[st]}
											</p>
											<p class="text-xs text-muted-foreground">{STATUS_SUBTITLE[st]}</p>
										</div>
										{#if timestamp}
											<span class="shrink-0 text-[11px] text-muted-foreground tabular-nums">
												{new Date(timestamp).toLocaleString('id-ID', {
													day: '2-digit',
													month: 'short',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</span>
										{/if}
									</div>
								</li>
							{/each}
						</ol>
					</Card.Content>
				</Card.Root>
			{/if}

			<Card.Root class="shadow-sm">
				<Card.Header class="pb-3">
					<div class="flex items-center justify-between gap-2">
						<Card.Title class="text-base">Rincian Cucian</Card.Title>
						<Badge class={PAYMENT_COLOR[paymentKey]}>
							<CreditCardIcon class="mr-1 size-3" />
							{PAYMENT_LABEL[paymentKey]}
						</Badge>
					</div>
				</Card.Header>
				<Card.Content class="space-y-3">
					<div class="divide-y rounded-lg border">
						{#each order.items as item, idx (idx)}
							<div class="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
								<div class="min-w-0">
									<p class="truncate font-medium">{item.name}</p>
									<p class="text-xs text-muted-foreground tabular-nums">
										{item.qty}
										{item.unit}
										{#if item.minQty > 0}
											· Paket ≥ {item.minQty} {item.unit}
										{/if}
									</p>
								</div>
								<span class="shrink-0 font-medium tabular-nums">
									{formatRupiah(item.subtotal)}
								</span>
							</div>
						{/each}
					</div>

					{#if order.notes}
						<div
							class="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-xs"
						>
							<StickyNoteIcon class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
							<div>
								<span class="font-medium text-muted-foreground">Catatan: </span>
								<span>{order.notes}</span>
							</div>
						</div>
					{/if}

					<Separator />

					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Total Tagihan</span>
						<span class="text-lg font-bold tracking-tight tabular-nums">
							{formatRupiah(order.totalPrice)}
						</span>
					</div>
				</Card.Content>
			</Card.Root>

			<div class="grid grid-cols-2 gap-2.5">
				<Button variant="outline" href="/cek" class="w-full gap-1.5">
					<SearchIcon class="size-4" />
					Cek Order Lain
				</Button>
				<Button variant="secondary" href="/" class="w-full gap-1.5">
					<ArrowLeftIcon class="size-4" />
					Beranda
				</Button>
			</div>
		{/if}

		{#if data.step !== 'result'}
			<div class="pt-1 text-center">
				<Button variant="ghost" size="sm" href="/" class="gap-1.5 text-muted-foreground">
					<ArrowLeftIcon class="size-3.5" />
					Kembali ke Beranda
				</Button>
			</div>
		{/if}
	</main>
</div>
