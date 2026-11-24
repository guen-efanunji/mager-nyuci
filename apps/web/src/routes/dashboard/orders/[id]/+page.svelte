<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { cn, formatRupiah } from '#lib/utils.js';
	import {
		STATUS_LABEL,
		STATUS_COLOR,
		nextStatus,
		canCancel,
		PAYMENT_LABEL,
		PAYMENT_COLOR,
		type OrderStatus,
		type PaymentStatus
	} from '#lib/order.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import OrderReceipt from '#lib/components/order-receipt.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BanIcon from '@lucide/svelte/icons/ban';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import PrinterIcon from '@lucide/svelte/icons/printer';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import StickyNoteIcon from '@lucide/svelte/icons/sticky-note';

	let { data, form } = $props();
	const order = $derived(data.order);

	const PROCESS_STEPS: OrderStatus[] = [
		'diterima',
		'dicuci',
		'dikeringkan',
		'disetrika',
		'siap_diambil',
		'selesai'
	];

	let cancelOpen = $state(false);
	let receiptOpen = $state(false);
	let cancelReason = $state('');
	let advancing = $state(false);
	let togglingPayment = $state(false);
	let sendingWa = $state(false);
	let cancelling = $state(false);
	let copiedCode = $state(false);
	let copiedLink = $state(false);

	const isCreatedBanner = $derived(page.url.searchParams.get('created') === '1');
	const currentStatus = $derived(order.status as OrderStatus);
	const currentPayment = $derived((order.paymentStatus ?? 'belum_bayar') as PaymentStatus);
	const nextStage = $derived(nextStatus(currentStatus));
	const isCancelled = $derived(currentStatus === 'dibatalkan');
	const activeStepIndex = $derived(PROCESS_STEPS.indexOf(currentStatus));

	const trackingPath = $derived(`/t/${order.orderCode}?tk=${order.trackingToken}`);
	const trackingUrl = $derived(
		`${(data.appUrl || page.url.origin).replace(/\/$/, '')}${trackingPath}`
	);

	const stepTimestamps = $derived.by(() => {
		const map: Partial<Record<OrderStatus, string>> = {
			diterima: String(order.createdAt)
		};
		for (const h of order.statusHistories) {
			map[h.statusBaru as OrderStatus] = String(h.createdAt);
		}
		return map;
	});

	$effect(() => {
		if (form?.success) toast.success('Order berhasil diperbarui');
		if (form?.message) toast.error(form.message);
	});

	const waLink = $derived.by(() => {
		if (!order.customer.whatsapp) return null;
		const lines = [
			`Halo Kak ${order.customer.name.split(' ')[0]},`,
			`Nota laundry KiloTrack`,
			`Kode: ${order.orderCode}`,
			`Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}`,
			...order.items.map(
				(it) =>
					`- ${it.serviceCategory.name} ${it.qty} ${it.serviceCategory.unit} = ${formatRupiah(it.subtotal)}`
			),
			`Total: ${formatRupiah(order.totalPrice)}`,
			`Status pembayaran: ${PAYMENT_LABEL[currentPayment]}`,
			`Cek status: ${trackingUrl}`
		];
		const text = encodeURIComponent(lines.join('\n'));
		const num = order.customer.whatsapp.replace('+', '');
		return `https://wa.me/${num}?text=${text}`;
	});

	function formatDateTime(value: string | Date): string {
		return new Date(value).toLocaleString('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	function initialsOf(name: string): string {
		const parts = name.trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) return 'C';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}

	async function copyText(text: string, type: 'code' | 'link') {
		try {
			await navigator.clipboard.writeText(text);
			if (type === 'code') {
				copiedCode = true;
				setTimeout(() => (copiedCode = false), 2000);
				toast.success('Kode order disalin');
			} else {
				copiedLink = true;
				setTimeout(() => (copiedLink = false), 2000);
				toast.success('Link tracking disalin');
			}
		} catch {
			toast.error('Gagal menyalin ke clipboard');
		}
	}
</script>

<svelte:head>
	<title>{order.orderCode} — KiloTrack</title>
</svelte:head>

<div class="flex flex-col gap-6 print:hidden">
	<!-- Top Navigation -->
	<div class="flex flex-wrap items-center justify-between gap-2 print:hidden">
		<Button variant="ghost" size="sm" href="/dashboard/orders" class="-ms-2">
			<ArrowLeftIcon data-icon="inline-start" />
			Kembali ke Daftar Order
		</Button>
		<Button variant="outline" size="sm" href="/dashboard/orders/new">Buat Order Baru</Button>
	</div>

	<!-- Newly Created Confirmation Banner -->
	{#if isCreatedBanner}
		<Alert.Root
			class="border-green-200 bg-green-50 text-green-900 print:hidden dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200"
		>
			<CircleCheckIcon class="text-green-600 dark:text-green-400" />
			<Alert.Title>Order {order.orderCode} berhasil dibuat</Alert.Title>
			<Alert.Description>
				Nota dan QR code tracking sudah siap. Anda dapat langsung mengirim nota via WhatsApp atau
				mencetak struk untuk pelanggan.
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Page Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex flex-col gap-2">
			<div class="flex flex-wrap items-center gap-2.5">
				<h1 class="text-2xl font-bold tracking-tight tabular-nums">{order.orderCode}</h1>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					class="print:hidden"
					aria-label="Salin kode order"
					onclick={() => copyText(order.orderCode, 'code')}
				>
					{#if copiedCode}
						<CheckIcon class="text-green-600" />
					{:else}
						<CopyIcon />
					{/if}
				</Button>
				<Badge class={STATUS_COLOR[currentStatus]}>{STATUS_LABEL[currentStatus]}</Badge>
				<Badge class={PAYMENT_COLOR[currentPayment]}>{PAYMENT_LABEL[currentPayment]}</Badge>
			</div>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
				<span class="inline-flex items-center gap-1.5">
					<CalendarIcon class="size-3.5" />
					Masuk {formatDateTime(order.createdAt)}
				</span>
				<span>·</span>
				<span>
					Pelanggan: <strong class="font-medium text-foreground">{order.customer.name}</strong>
				</span>
			</div>
		</div>

		<!-- Quick Header Actions -->
		<div class="flex flex-wrap items-center gap-2 print:hidden">
			<Button type="button" variant="outline" onclick={() => (receiptOpen = true)}>
				<EyeIcon data-icon="inline-start" />
				Preview Nota
			</Button>
			<Button type="button" variant="outline" onclick={() => window.print()}>
				<PrinterIcon data-icon="inline-start" />
				Print Nota
			</Button>
			{#if nextStage}
				<form
					method="POST"
					action="?/advanceStatus"
					use:enhance={() => {
						advancing = true;
						return async ({ update }) => {
							try {
								await update();
							} finally {
								advancing = false;
							}
						};
					}}
				>
					<input type="hidden" name="id" value={order.id} />
					<Button type="submit" disabled={advancing}>
						{#if advancing}
							<Spinner data-icon="inline-start" />
							Memproses...
						{:else}
							Lanjut ke {STATUS_LABEL[nextStage]}
							<ArrowRightIcon data-icon="inline-end" />
						{/if}
					</Button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Status Progress / Cancellation Banner -->
	{#if isCancelled}
		<Alert.Root variant="destructive">
			<CircleAlertIcon />
			<Alert.Title>Order Dibatalkan</Alert.Title>
			<Alert.Description>
				Alasan pembatalan: {order.cancelReason || 'Tidak ada alasan tercatat.'}
			</Alert.Description>
		</Alert.Root>
	{:else}
		<Card.Root class="print:hidden">
			<Card.Content class="py-4">
				<ol class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
					{#each PROCESS_STEPS as step, idx (step)}
						{@const isCompleted = activeStepIndex > idx || currentStatus === 'selesai'}
						{@const isCurrent = activeStepIndex === idx && currentStatus !== 'selesai'}
						{@const timestamp = stepTimestamps[step]}
						<li
							class={cn(
								'flex items-start gap-2.5 rounded-lg border p-2.5 transition-colors',
								isCurrent
									? 'border-primary/50 bg-primary/5'
									: isCompleted
										? 'border-border bg-muted/30'
										: 'border-dashed bg-transparent opacity-60'
							)}
						>
							<span
								class={cn(
									'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
									isCompleted
										? 'bg-primary text-primary-foreground'
										: isCurrent
											? 'border-2 border-primary bg-background text-primary'
											: 'border border-border bg-background text-muted-foreground'
								)}
							>
								{#if isCompleted}
									<CheckIcon class="size-3.5" />
								{:else}
									{idx + 1}
								{/if}
							</span>
							<div class="flex min-w-0 flex-col">
								<span
									class={cn(
										'truncate text-xs font-semibold',
										isCurrent ? 'text-primary' : 'text-foreground'
									)}
								>
									{STATUS_LABEL[step]}
								</span>
								<span class="truncate text-[11px] text-muted-foreground">
									{#if timestamp}
										{formatDateTime(timestamp)}
									{:else if isCurrent}
										Sedang diproses
									{:else}
										Menunggu
									{/if}
								</span>
							</div>
						</li>
					{/each}
				</ol>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Main 2-Column Content -->
	<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
		<!-- Left Column: Invoice Details & Status History -->
		<div class="flex flex-col gap-6">
			<!-- Card: Rincian Cucian & Tagihan -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between gap-2">
					<div class="flex flex-col gap-1">
						<Card.Title class="flex items-center gap-2">
							<ReceiptIcon class="size-4 text-muted-foreground" />
							Rincian Cucian
						</Card.Title>
						<Card.Description>Daftar layanan dan total tagihan untuk nota ini.</Card.Description>
					</div>
					<Badge variant="outline">{order.items.length} layanan</Badge>
				</Card.Header>

				<Card.Content class="flex flex-col gap-4">
					<div class="overflow-hidden rounded-lg border">
						<Table.Root>
							<Table.Header>
								<Table.Row class="bg-muted/40 hover:bg-muted/40">
									<Table.Head>Layanan</Table.Head>
									<Table.Head>Paket Tarif</Table.Head>
									<Table.Head class="text-right">Qty</Table.Head>
									<Table.Head class="text-right">Subtotal</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each order.items as it (it.id)}
									<Table.Row>
										<Table.Cell class="font-medium">{it.serviceCategory.name}</Table.Cell>
										<Table.Cell class="text-xs text-muted-foreground">
											{#if it.priceItem}
												Paket &ge; {it.priceItem.minQty} {it.serviceCategory.unit}
											{:else}
												Tarif standar
											{/if}
										</Table.Cell>
										<Table.Cell class="text-right tabular-nums">
											{it.qty}
											{it.serviceCategory.unit}
										</Table.Cell>
										<Table.Cell class="text-right font-semibold tabular-nums">
											{formatRupiah(it.subtotal)}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>

					{#if order.notes}
						<div class="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3 text-sm">
							<StickyNoteIcon class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-medium text-muted-foreground">Catatan Order</span>
								<p class="text-foreground">{order.notes}</p>
							</div>
						</div>
					{/if}

					<Separator />

					<div class="flex items-center justify-between gap-4">
						<div class="flex flex-col gap-0.5">
							<span class="text-sm font-semibold">Total Tagihan</span>
							<span class="text-xs text-muted-foreground">
								Status pembayaran: {PAYMENT_LABEL[currentPayment]}
							</span>
						</div>
						<span class="text-2xl font-bold tracking-tight text-primary tabular-nums">
							{formatRupiah(order.totalPrice)}
						</span>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Card: Riwayat Status -->
			<Card.Root class="print:hidden">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<HistoryIcon class="size-4 text-muted-foreground" />
						Riwayat Perubahan Status
					</Card.Title>
					<Card.Description>Jejak perpindahan tahap pengerjaan cucian.</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if order.statusHistories.length === 0}
						<p class="text-sm text-muted-foreground">
							Order baru diterima pada {formatDateTime(order.createdAt)}. Belum ada perpindahan
							tahap proses.
						</p>
					{:else}
						<ol class="relative ms-2 space-y-4 border-s border-border ps-5">
							{#each order.statusHistories as h (h.id)}
								{@const oldLabel = h.statusLama
									? STATUS_LABEL[h.statusLama as OrderStatus]
									: 'Baru'}
								{@const newStatus = h.statusBaru as OrderStatus}
								<li class="relative">
									<span
										class="absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-background bg-primary"
									></span>
									<div class="flex flex-wrap items-center justify-between gap-2">
										<div class="flex flex-wrap items-center gap-1.5 text-sm">
											<span class="text-muted-foreground">{oldLabel}</span>
											<ArrowRightIcon class="size-3.5 text-muted-foreground" />
											<Badge class={STATUS_COLOR[newStatus]}>{STATUS_LABEL[newStatus]}</Badge>
										</div>
										<span class="text-xs text-muted-foreground tabular-nums">
											{formatDateTime(h.createdAt)}
										</span>
									</div>
									{#if h.updatedBy?.name}
										<p class="mt-1 text-xs text-muted-foreground">
											Diperbarui oleh {h.updatedBy.name}
										</p>
									{/if}
								</li>
							{/each}
						</ol>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right Column: Customer, Actions & QR Code -->
		<div class="flex flex-col gap-6">
			<!-- Card: Pelanggan & WhatsApp -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Pelanggan</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="flex items-center justify-between gap-3">
						<div class="flex min-w-0 items-center gap-3">
							<Avatar.Root class="size-10">
								<Avatar.Fallback>{initialsOf(order.customer.name)}</Avatar.Fallback>
							</Avatar.Root>
							<div class="flex min-w-0 flex-col">
								<a
									href={`/dashboard/customers/${order.customer.id}`}
									class="inline-flex items-center gap-1 truncate text-sm font-semibold hover:underline"
								>
									<span class="truncate">{order.customer.name}</span>
									<ExternalLinkIcon class="size-3 shrink-0 text-muted-foreground print:hidden" />
								</a>
								<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
									<PhoneIcon class="size-3" />
									{order.customer.whatsapp ?? 'Belum ada nomor WhatsApp'}
								</span>
							</div>
						</div>
					</div>

					<div class="print:hidden">
						{#if !order.customer.whatsapp}
							<div class="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
								Pelanggan belum memiliki nomor WA. Gunakan tombol <strong>Print Nota</strong> untuk memberikan
								struk fisik.
							</div>
						{:else if data.whatsappDriver === 'fonnte'}
							<form
								method="POST"
								action="?/sendWhatsApp"
								use:enhance={() => {
									sendingWa = true;
									return async ({ update }) => {
										try {
											await update();
										} finally {
											sendingWa = false;
										}
									};
								}}
							>
								<input type="hidden" name="id" value={order.id} />
								<Button
									type="submit"
									disabled={sendingWa}
									class="w-full bg-green-600 text-white hover:bg-green-700"
								>
									{#if sendingWa}
										<Spinner data-icon="inline-start" />
										Mengirim Nota...
									{:else}
										<MessageCircleIcon data-icon="inline-start" />
										Kirim Nota via WhatsApp
									{/if}
								</Button>
							</form>
						{:else if waLink}
							<Button
								href={waLink}
								target="_blank"
								rel="noopener noreferrer"
								class="w-full bg-green-600 text-white hover:bg-green-700"
							>
								<MessageCircleIcon data-icon="inline-start" />
								Kirim Nota via WhatsApp
							</Button>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Card: Pembayaran & Kontrol Order -->
			<Card.Root class="print:hidden">
				<Card.Header>
					<Card.Title>Pembayaran &amp; Kontrol</Card.Title>
					<Card.Description>Ubah status pembayaran atau kelola status order.</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-3">
					<div class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
						<div class="flex items-center gap-2 text-sm">
							<CreditCardIcon class="size-4 text-muted-foreground" />
							<span class="font-medium">Pembayaran</span>
						</div>
						<Badge class={PAYMENT_COLOR[currentPayment]}>{PAYMENT_LABEL[currentPayment]}</Badge>
					</div>

					<form
						method="POST"
						action="?/togglePayment"
						use:enhance={() => {
							togglingPayment = true;
							return async ({ update }) => {
								try {
									await update();
								} finally {
									togglingPayment = false;
								}
							};
						}}
					>
						<input type="hidden" name="id" value={order.id} />
						<input
							type="hidden"
							name="paymentStatus"
							value={currentPayment === 'lunas' ? 'belum_bayar' : 'lunas'}
						/>
						<Button
							type="submit"
							variant={currentPayment === 'lunas' ? 'outline' : 'secondary'}
							class="w-full"
							disabled={togglingPayment}
						>
							{#if togglingPayment}
								<Spinner data-icon="inline-start" />
								Menyimpan...
							{:else if currentPayment === 'lunas'}
								Tandai Belum Bayar
							{:else}
								<CircleCheckIcon data-icon="inline-start" />
								Tandai Lunas
							{/if}
						</Button>
					</form>

					{#if canCancel(currentStatus)}
						<Separator class="my-1" />
						<AlertDialog.Root bind:open={cancelOpen}>
							<AlertDialog.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										class="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
									>
										<BanIcon data-icon="inline-start" />
										Batalkan Order
									</Button>
								{/snippet}
							</AlertDialog.Trigger>
							<AlertDialog.Content size="sm">
								<AlertDialog.Header>
									<AlertDialog.Title>Batalkan order {order.orderCode}?</AlertDialog.Title>
									<AlertDialog.Description>
										Tindakan ini tidak dapat dikembalikan. Wajib isi alasan pembatalan untuk catatan
										riwayat.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<form
									method="POST"
									action="?/cancelOrder"
									use:enhance={() => {
										cancelling = true;
										return async ({ result, update }) => {
											try {
												await update();
												if (result.type === 'success') {
													cancelOpen = false;
													cancelReason = '';
												}
											} finally {
												cancelling = false;
											}
										};
									}}
									class="flex flex-col gap-3"
								>
									<input type="hidden" name="id" value={order.id} />
									<Textarea
										name="reason"
										bind:value={cancelReason}
										rows={3}
										required
										placeholder="Contoh: Pelanggan membatalkan sebelum dicuci..."
									/>
									<AlertDialog.Footer>
										<AlertDialog.Cancel type="button">Kembali</AlertDialog.Cancel>
										<Button
											type="submit"
											variant="destructive"
											disabled={cancelling || !cancelReason.trim()}
										>
											{#if cancelling}
												<Spinner data-icon="inline-start" />
												Membatalkan...
											{:else}
												Ya, Batalkan Order
											{/if}
										</Button>
									</AlertDialog.Footer>
								</form>
							</AlertDialog.Content>
						</AlertDialog.Root>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Card: QR Code & Link Tracking -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<QrCodeIcon class="size-4 text-muted-foreground" />
						QR Code Tracking
					</Card.Title>
					<Card.Description>Scan untuk cek progres cucian tanpa login.</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col items-center gap-4">
					<div class="rounded-xl border bg-white p-3 shadow-xs">
						<img
							src={`/api/qr/${order.orderCode}`}
							alt={`QR code tracking ${order.orderCode}`}
							class="size-40"
						/>
					</div>

					<div class="flex w-full flex-col gap-2 print:hidden">
						<div
							class="rounded-md border bg-muted/40 px-2.5 py-1.5 text-center text-xs text-muted-foreground truncate"
						>
							{trackingUrl}
						</div>
						<div class="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={() => copyText(trackingUrl, 'link')}
							>
								{#if copiedLink}
									<CheckIcon data-icon="inline-start" class="text-green-600" />
									Tersalin
								{:else}
									<CopyIcon data-icon="inline-start" />
									Salin Link
								{/if}
							</Button>
							<Button
								variant="secondary"
								size="sm"
								href={trackingPath}
								target="_blank"
								rel="noopener noreferrer"
							>
								<ExternalLinkIcon data-icon="inline-start" />
								Buka Tracking
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<!-- Screen Preview Modal for Receipt -->
<Dialog.Root bind:open={receiptOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-md print:hidden">
		<Dialog.Header>
			<Dialog.Title>Preview Nota Struk</Dialog.Title>
			<Dialog.Description>
				Tampilan struk cetak untuk order {order.orderCode}.
			</Dialog.Description>
		</Dialog.Header>

		<div class="rounded-lg bg-neutral-200/70 p-5 dark:bg-neutral-900/70">
			<OrderReceipt {order} variant="preview" />
		</div>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (receiptOpen = false)}>Tutup</Button>
			<Button type="button" onclick={() => window.print()}>
				<PrinterIcon data-icon="inline-start" />
				Cetak Nota
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Dedicated Print-Only Receipt Layout -->
<div class="hidden print:flex print:justify-center print:py-2">
	<OrderReceipt {order} variant="print" />
</div>
