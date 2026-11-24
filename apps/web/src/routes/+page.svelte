<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import FlameIcon from '@lucide/svelte/icons/flame';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import PackageCheckIcon from '@lucide/svelte/icons/package-check';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShirtIcon from '@lucide/svelte/icons/shirt';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import SunIcon from '@lucide/svelte/icons/sun';
	import WashingMachineIcon from '@lucide/svelte/icons/washing-machine';
	import WindIcon from '@lucide/svelte/icons/wind';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { cn, formatRupiah } from '#lib/utils.js';

	let { data } = $props();

	let orderCode = $state('');

	const PREVIEW_STEPS = [
		{
			key: 'diterima',
			label: 'Diterima',
			time: '09:15',
			done: true,
			active: false,
			icon: ReceiptIcon
		},
		{
			key: 'dicuci',
			label: 'Dicuci',
			time: '10:30',
			done: true,
			active: false,
			icon: WashingMachineIcon
		},
		{
			key: 'dikeringkan',
			label: 'Dikeringkan',
			time: '12:40',
			done: true,
			active: false,
			icon: WindIcon
		},
		{
			key: 'disetrika',
			label: 'Disetrika',
			time: 'Saat ini',
			done: false,
			active: true,
			icon: FlameIcon
		},
		{
			key: 'siap_diambil',
			label: 'Siap Diambil',
			time: 'Estimasi',
			done: false,
			active: false,
			icon: PackageCheckIcon
		},
		{ key: 'selesai', label: 'Selesai', time: '-', done: false, active: false, icon: CheckIcon }
	] as const;

	const WORKFLOW_HIGHLIGHTS = [
		{
			icon: QrCodeIcon,
			step: '01',
			title: 'Order & QR Nota Instan',
			description:
				'Kasir mencatat berat atau satuan cucian dengan tarif bertingkat otomatis. Setiap nota langsung memiliki kode unik dan QR code.'
		},
		{
			icon: WashingMachineIcon,
			step: '02',
			title: 'Pantau 6 Tahap Proses',
			description:
				'Status bergerak jelas dari Diterima, Dicuci, Dikeringkan, Disetrika, Siap Diambil, hingga Selesai dengan riwayat waktu.'
		},
		{
			icon: ShieldCheckIcon,
			step: '03',
			title: 'Verifikasi WhatsApp Aman',
			description:
				'Pelanggan cukup memasukkan kode order dan 4 digit terakhir nomor WhatsApp di halaman cek tanpa perlu membuat akun.'
		}
	] as const;
</script>

<svelte:head>
	<title>KiloTrack — Pantau Status Cucian & Kelola Outlet Laundry</title>
	<meta
		name="description"
		content="Lacak proses cucian 6 tahap secara real-time dengan kode order atau QR nota, serta kelola order, tarif, dan pelanggan laundry di KiloTrack."
	/>
</svelte:head>

<div class="flex min-h-svh flex-col bg-background text-foreground">
	<header
		class="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
	>
		<div
			class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"
		>
			<a href="/" class="flex items-center gap-2.5" aria-label="Beranda KiloTrack">
				<span
					class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs"
				>
					<ShirtIcon class="size-5" />
				</span>
				<span class="flex flex-col leading-tight">
					<span class="text-base font-bold tracking-tight">KiloTrack</span>
					<span class="text-[11px] text-muted-foreground">Laundry &amp; Order Tracking</span>
				</span>
			</a>

			<nav
				class="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex"
				aria-label="Navigasi utama"
			>
				<a href="#cara-kerja" class="transition-colors hover:text-foreground">Cara Kerja</a>
				<a href="#layanan" class="transition-colors hover:text-foreground">Layanan &amp; Tarif</a>
				<a href="/cek" class="transition-colors hover:text-foreground">Cek Cucian</a>
			</nav>

			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					class="relative"
					onclick={toggleMode}
					aria-label="Ubah tema warna"
				>
					<SunIcon class="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<MoonIcon
						class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Ubah tema</span>
				</Button>

				{#if data.isLoggedIn}
					<Button href="/dashboard">
						<LayoutDashboardIcon data-icon="inline-start" />
						Buka Dashboard
					</Button>
				{:else}
					<Button variant="ghost" href="/login" class="hidden sm:inline-flex">Masuk Staf</Button>
					<Button href="/cek">
						Cek Status
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
				{/if}
			</div>
		</div>
	</header>

	<main class="flex-1">
		<!-- Hero -->
		<section class="relative overflow-hidden">
			<div
				class="pointer-events-none absolute -top-24 -left-32 size-[28rem] rounded-full bg-primary/10 blur-[100px]"
			></div>
			<div
				class="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-10 lg:py-24"
			>
				<div class="relative z-10 flex flex-col items-start gap-6">
					<Badge variant="secondary" class="gap-1.5 px-3 py-1">
						<SparklesIcon class="size-3.5 text-primary" />
						Transparansi Cucian Real-Time
					</Badge>

					<h1
						class="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
					>
						Pantau cucian dari timbang sampai <span class="text-primary">siap ambil.</span>
					</h1>

					<p class="max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
						Pelanggan cukup masukkan kode order atau pindai QR di nota untuk melacak 6 tahap proses
						cucian. Kasir dan admin kelola order, tarif bertingkat, dan pembayaran dalam satu
						dashboard.
					</p>

					<!-- Quick Tracking Form -->
					<Card.Root class="w-full max-w-xl shadow-sm">
						<Card.Header class="pb-3">
							<Card.Title class="text-base">Lacak Status Cucian Sekarang</Card.Title>
							<Card.Description>
								Masukkan kode order yang tertera pada struk nota atau pesan WhatsApp Anda.
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<form method="GET" action="/cek" class="flex flex-col gap-3 sm:flex-row">
								<Field.Field class="flex-1">
									<Field.FieldLabel for="hero-order-code" class="sr-only">
										Kode Order
									</Field.FieldLabel>
									<InputGroup.Root class="h-10">
										<InputGroup.Addon align="inline-start">
											<SearchIcon />
										</InputGroup.Addon>
										<InputGroup.Input
											id="hero-order-code"
											name="code"
											bind:value={orderCode}
											placeholder="Contoh: LN-261125-0001"
											autocomplete="off"
											autocapitalize="characters"
											class="font-mono uppercase tracking-wide"
											required
										/>
									</InputGroup.Root>
								</Field.Field>
								<Button type="submit" class="h-10 px-5">
									Lacak Order
									<ArrowRightIcon data-icon="inline-end" />
								</Button>
							</form>
						</Card.Content>
						<Card.Footer
							class="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground"
						>
							<span>Verifikasi aman menggunakan 4 digit terakhir WhatsApp.</span>
							<a href="/cek" class="font-medium text-primary underline-offset-4 hover:underline">
								Buka halaman cek →
							</a>
						</Card.Footer>
					</Card.Root>

					<div class="flex flex-wrap items-center gap-3 pt-1">
						{#if data.isLoggedIn}
							<Button variant="outline" href="/dashboard">
								<LayoutDashboardIcon data-icon="inline-start" />
								Ke Dashboard{data.userName ? ` (${data.userName})` : ''}
							</Button>
						{:else}
							<Button variant="outline" href="/login">
								Masuk Dashboard Staf
								<ArrowRightIcon data-icon="inline-end" />
							</Button>
						{/if}
						<div
							class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm"
						>
							<span class="inline-flex items-center gap-1.5">
								<CheckIcon class="size-4 text-primary" />
								6 tahap terpantau
							</span>
							<span class="inline-flex items-center gap-1.5">
								<CheckIcon class="size-4 text-primary" />
								Struk QR otomatis
							</span>
							<span class="inline-flex items-center gap-1.5">
								<CheckIcon class="size-4 text-primary" />
								Tanpa instal aplikasi
							</span>
						</div>
					</div>
				</div>

				<!-- Live Tracking Preview Card -->
				<div class="relative mx-auto w-full max-w-lg lg:ml-auto">
					<div class="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl"></div>
					<Card.Root class="relative shadow-xl">
						<Card.Header class="border-b pb-4">
							<div class="flex items-start justify-between gap-3">
								<div class="flex flex-col gap-1">
									<span class="text-xs font-medium text-muted-foreground">
										Pratinjau Pelacakan Nota
									</span>
									<Card.Title class="font-mono text-lg tracking-wide">LN-261125-0014</Card.Title>
									<Card.Description>Pelanggan: Rina · Estimasi selesai hari ini</Card.Description>
								</div>
								<div class="flex flex-col items-end gap-1.5">
									<Badge>Sedang Disetrika</Badge>
									<Badge variant="secondary">Lunas</Badge>
								</div>
							</div>
							<div class="mt-4 flex flex-col gap-1.5">
								<div class="flex items-center justify-between text-xs">
									<span class="text-muted-foreground">Progres cucian</span>
									<span class="font-semibold tabular-nums">67%</span>
								</div>
								<Progress value={67} class="h-2" />
							</div>
						</Card.Header>
						<Card.Content class="flex flex-col gap-3 pt-4">
							{#each PREVIEW_STEPS as step (step.key)}
								{@const StepIcon = step.icon}
								<div
									class={cn(
										'flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm',
										step.active
											? 'border-primary/40 bg-accent/60'
											: step.done
												? 'border-border bg-background'
												: 'border-border/60 bg-muted/30 text-muted-foreground'
									)}
								>
									<div class="flex items-center gap-2.5">
										<span
											class={cn(
												'flex size-7 shrink-0 items-center justify-center rounded-full',
												step.active
													? 'bg-primary text-primary-foreground'
													: step.done
														? 'bg-accent text-primary'
														: 'bg-muted text-muted-foreground'
											)}
										>
											<StepIcon class="size-3.5" />
										</span>
										<span class={cn('font-medium', step.active && 'text-foreground')}>
											{step.label}
										</span>
									</div>
									<span class="text-xs text-muted-foreground tabular-nums">{step.time}</span>
								</div>
							{/each}
						</Card.Content>
						<Card.Footer class="flex items-center justify-between border-t pt-4 text-sm">
							<div class="flex flex-col">
								<span class="text-xs text-muted-foreground">Cuci Komplit Express · 4.5 kg</span>
								<span class="font-semibold tabular-nums">Rp31.500</span>
							</div>
							<Button variant="outline" size="sm" href="/cek">
								<ClockIcon data-icon="inline-start" />
								Coba Lacak
							</Button>
						</Card.Footer>
					</Card.Root>
				</div>
			</div>
		</section>

		<Separator />

		<!-- How it works -->
		<section id="cara-kerja" class="bg-muted/30">
			<div
				class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
			>
				<div class="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
					<Badge variant="outline">Alur Kerja KiloTrack</Badge>
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
						Pelanggan tenang, operasional outlet lebih rapi.
					</h2>
					<p class="text-muted-foreground">
						Dirancang untuk kebutuhan laundry kiloan dan satuan: dari penerimaan order di kasir
						hingga pengambilan cucian.
					</p>
				</div>

				<div class="grid gap-5 md:grid-cols-3">
					{#each WORKFLOW_HIGHLIGHTS as item (item.step)}
						{@const ItemIcon = item.icon}
						<Card.Root class="transition-shadow hover:shadow-md">
							<Card.Header>
								<div class="flex items-center justify-between gap-2">
									<div
										class="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"
									>
										<ItemIcon class="size-5" />
									</div>
									<Badge variant="secondary" class="font-mono">{item.step}</Badge>
								</div>
								<Card.Title class="mt-3 text-lg">{item.title}</Card.Title>
								<Card.Description class="leading-6">{item.description}</Card.Description>
							</Card.Header>
						</Card.Root>
					{/each}
				</div>
			</div>
		</section>

		<Separator />

		<!-- Active Services & Pricing -->
		<section
			id="layanan"
			class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
		>
			<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div class="flex max-w-2xl flex-col gap-2">
					<Badge variant="outline" class="w-fit">Daftar Layanan Aktif</Badge>
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
						Layanan &amp; Tarif Transparan
					</h2>
					<p class="text-muted-foreground">
						Harga dihitung otomatis sesuai berat atau jumlah item beserta paket minimum yang
						berlaku.
					</p>
				</div>
				<Button variant="outline" href="/cek" class="w-fit">
					Sudah punya nota? Cek status
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>

			{#if data.services.length > 0}
				<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
					{#each data.services as service (service.id)}
						<Card.Root class="flex flex-col">
							<Card.Header>
								<div class="flex items-start justify-between gap-2">
									<Card.Title class="text-lg">{service.name}</Card.Title>
									<Badge variant="secondary">per {service.unit}</Badge>
								</div>
								<Card.Description>
									{service.description || `Layanan laundry dihitung per ${service.unit}.`}
								</Card.Description>
							</Card.Header>
							<Card.Content class="flex flex-1 flex-col gap-2">
								{#if service.priceItems.length > 0}
									{#each service.priceItems as tier (tier.id)}
										<div
											class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
										>
											<span class="text-muted-foreground">
												{tier.minQty > 0 ? `Min. ${tier.minQty} ${service.unit}` : `Tarif dasar`}
											</span>
											<span class="font-semibold tabular-nums">
												{formatRupiah(tier.price)}/{service.unit}
											</span>
										</div>
									{/each}
								{:else}
									<p class="text-sm text-muted-foreground">
										Hubungi kasir untuk informasi tarif layanan ini.
									</p>
								{/if}
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{:else}
				<Empty.Root class="border">
					<Empty.Header>
						<Empty.Media variant="icon">
							<ShirtIcon />
						</Empty.Media>
						<Empty.Title>Daftar layanan belum tersedia</Empty.Title>
						<Empty.Description>
							Staf outlet dapat menambahkan kategori layanan dan tarif bertingkat melalui dashboard.
						</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<Button href={data.isLoggedIn ? '/dashboard/services' : '/login'}>
							{data.isLoggedIn ? 'Atur Layanan' : 'Masuk Staf'}
						</Button>
					</Empty.Content>
				</Empty.Root>
			{/if}
		</section>

		<Separator />

		<!-- Bottom CTA -->
		<section class="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
			<Card.Root class="bg-muted/40">
				<Card.Content
					class="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8"
				>
					<div class="flex flex-col gap-1.5">
						<h2 class="text-2xl font-bold tracking-tight">Siap mengecek atau mengelola cucian?</h2>
						<p class="text-sm text-muted-foreground sm:text-base">
							Pelanggan bisa langsung lacak order dari nota, sementara kasir bisa masuk ke dashboard
							operasional.
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-3">
						<Button href="/cek">
							<SearchIcon data-icon="inline-start" />
							Cek Status Cucian
						</Button>
						<Button variant="outline" href={data.isLoggedIn ? '/dashboard' : '/login'}>
							{data.isLoggedIn ? 'Buka Dashboard' : 'Masuk Staf'}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	</main>

	<footer class="border-t border-border">
		<div
			class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"
		>
			<a href="/" class="flex items-center gap-2 font-semibold text-foreground">
				<ShirtIcon class="size-4 text-primary" />
				KiloTrack
			</a>
			<div class="flex flex-wrap items-center gap-4">
				<a href="/cek" class="transition-colors hover:text-foreground">Cek Status Cucian</a>
				<a
					href={data.isLoggedIn ? '/dashboard' : '/login'}
					class="transition-colors hover:text-foreground"
				>
					{data.isLoggedIn ? 'Dashboard Staf' : 'Masuk Staf'}
				</a>
			</div>
		</div>
	</footer>
</div>
