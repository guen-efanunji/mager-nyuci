<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import ShirtIcon from '@lucide/svelte/icons/shirt';
	import SunIcon from '@lucide/svelte/icons/sun';
	import WashingMachineIcon from '@lucide/svelte/icons/washing-machine';
	import LoginForm from '#lib/components/login-form.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	const STAFF_PILLARS = [
		{
			icon: ReceiptIcon,
			title: 'Kasir & Tarif Bertingkat',
			description: 'Hitung otomatis kiloan maupun satuan sesuai minimum qty.'
		},
		{
			icon: WashingMachineIcon,
			title: 'Papan Proses 6 Tahap',
			description: 'Perbarui status cucian dari Diterima hingga Siap Diambil.'
		},
		{
			icon: QrCodeIcon,
			title: 'Nota & QR Pelacakan',
			description: 'Pelanggan pantau cucian sendiri tanpa perlu chat admin.'
		}
	] as const;
</script>

<svelte:head>
	<title>Masuk Staf — KiloTrack</title>
	<meta
		name="description"
		content="Masuk atau buat akun staf untuk mengelola order, proses cucian, layanan, dan pelanggan di KiloTrack."
	/>
</svelte:head>

<div class="grid min-h-svh bg-background lg:grid-cols-2">
	<section class="flex flex-col gap-6 p-6 md:p-10">
		<div class="flex items-center justify-between gap-4">
			<a href="/" class="flex items-center gap-2.5" aria-label="Beranda KiloTrack">
				<span
					class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs"
				>
					<ShirtIcon class="size-5" />
				</span>
				<span class="flex flex-col leading-tight">
					<span class="text-base font-bold tracking-tight">KiloTrack</span>
					<span class="text-[11px] text-muted-foreground">Portal Staf &amp; Kasir</span>
				</span>
			</a>

			<Button
				variant="outline"
				size="icon"
				class="relative"
				onclick={toggleMode}
				aria-label="Ubah tema warna"
			>
				<SunIcon class="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<MoonIcon class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				<span class="sr-only">Ubah tema</span>
			</Button>
		</div>

		<div class="flex flex-1 items-center justify-center py-4">
			<div class="w-full max-w-md">
				<LoginForm />
			</div>
		</div>
	</section>

	<aside
		class="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block"
		aria-label="Ringkasan operasional KiloTrack"
	>
		<div
			class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.76_0.12_258_/_0.35),transparent_55%),linear-gradient(155deg,oklch(0.45_0.17_258),oklch(0.28_0.11_260))]"
		></div>
		<div class="absolute -right-24 top-16 size-96 rounded-full border border-white/10"></div>
		<div class="absolute -right-10 top-32 size-72 rounded-full border border-white/10"></div>

		<div class="relative flex h-full flex-col justify-between p-12 xl:p-16">
			<div class="flex flex-1 flex-col justify-center gap-8">
				<div class="flex max-w-lg flex-col gap-4">
					<Badge
						variant="secondary"
						class="w-fit border border-white/15 bg-white/10 text-white hover:bg-white/15"
					>
						Operasional Outlet Laundry
					</Badge>
					<h2 class="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
						Kelola order dan proses cucian dalam satu tempat.
					</h2>
					<p class="max-w-md text-base leading-7 text-white/75">
						Catat cucian masuk dengan cepat, perbarui progres 6 tahap secara real-time, dan beri
						pelanggan akses pelacakan langsung dari struk nota.
					</p>
				</div>

				<div
					class="flex max-w-lg flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-sm"
				>
					{#each STAFF_PILLARS as item (item.title)}
						{@const ItemIcon = item.icon}
						<div class="flex items-start gap-3 rounded-xl bg-white/10 p-3.5">
							<span
								class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"
							>
								<ItemIcon class="size-4" />
							</span>
							<div class="flex flex-col gap-0.5">
								<p class="text-sm font-semibold text-white">{item.title}</p>
								<p class="text-xs leading-5 text-white/75">{item.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<p class="text-xs text-white/60">KiloTrack · Sistem Manajemen &amp; Pelacakan Laundry</p>
		</div>
	</aside>
</div>
