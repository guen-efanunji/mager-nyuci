<script lang="ts">
	import HeartIcon from '@lucide/svelte/icons/heart';
	import { STATUS_LABEL, type OrderStatus, type PaymentStatus } from '#lib/order.js';
	import { cn, formatRupiah } from '#lib/utils.js';

	export interface ReceiptOrder {
		orderCode: string;
		createdAt: string | Date;
		status: string;
		paymentStatus: string | null;
		totalPrice: number;
		notes: string | null;
		customer: {
			name: string;
			whatsapp: string | null;
		};
		items: Array<{
			id: string;
			qty: number;
			subtotal: number;
			serviceCategory: {
				name: string;
				unit: string;
			};
			priceItem?: {
				minQty: number;
			} | null;
		}>;
	}

	let {
		order,
		variant = 'preview'
	}: {
		order: ReceiptOrder;
		variant?: 'preview' | 'print';
	} = $props();

	const currentStatus = $derived(order.status as OrderStatus);
	const currentPayment = $derived((order.paymentStatus ?? 'belum_bayar') as PaymentStatus);
	const isCancelled = $derived(currentStatus === 'dibatalkan');
	const isPaid = $derived(currentPayment === 'lunas');

	const stampText = $derived(isCancelled ? 'BATAL' : isPaid ? 'LUNAS' : 'BELUM LUNAS');
	const stampStyle = $derived(
		isCancelled
			? 'border-neutral-600 text-neutral-700'
			: isPaid
				? 'border-emerald-700 text-emerald-700'
				: 'border-red-600 text-red-600'
	);

	function formatReceiptDate(value: string | Date): string {
		return new Date(value).toLocaleString('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

<div
	class={cn(
		'mx-auto w-full max-w-[340px] font-mono text-neutral-900',
		variant === 'preview' ? 'drop-shadow-md' : 'bg-white'
	)}
>
	{#if variant === 'preview'}
		<div
			aria-hidden="true"
			class="h-2.5 w-full bg-[radial-gradient(circle_at_8px_0px,transparent_5px,#faf7ef_5.5px)] bg-[length:16px_10px] bg-repeat-x"
		></div>
	{/if}

	<div class={cn(variant === 'preview' ? 'bg-[#faf7ef] px-6 py-5' : 'bg-white px-4 py-4')}>
		<!-- Store Header -->
		<div class="text-center">
			<h2 class="font-sans text-2xl font-light tracking-[0.22em] text-neutral-900 uppercase">
				KiloTrack
			</h2>
			<p class="mt-0.5 text-[10px] font-medium tracking-[0.22em] text-neutral-500 uppercase">
				Laundry Kiloan &amp; Satuan
			</p>
		</div>

		<div class="my-4 border-t border-dashed border-neutral-400"></div>

		<!-- Order Metadata -->
		<dl class="space-y-1 text-[11px]">
			<div class="flex items-baseline justify-between gap-3">
				<dt class="text-neutral-500 uppercase">No. Nota</dt>
				<dd class="font-bold tracking-wide text-neutral-900 tabular-nums">{order.orderCode}</dd>
			</div>
			<div class="flex items-baseline justify-between gap-3">
				<dt class="text-neutral-500 uppercase">Tanggal</dt>
				<dd class="text-right text-neutral-800 tabular-nums">
					{formatReceiptDate(order.createdAt)}
				</dd>
			</div>
			<div class="flex items-baseline justify-between gap-3">
				<dt class="text-neutral-500 uppercase">Pelanggan</dt>
				<dd class="truncate text-right font-semibold text-neutral-900">{order.customer.name}</dd>
			</div>
			{#if order.customer.whatsapp}
				<div class="flex items-baseline justify-between gap-3">
					<dt class="text-neutral-500 uppercase">WhatsApp</dt>
					<dd class="text-right text-neutral-700 tabular-nums">{order.customer.whatsapp}</dd>
				</div>
			{/if}
			<div class="flex items-baseline justify-between gap-3">
				<dt class="text-neutral-500 uppercase">Status</dt>
				<dd class="text-right font-medium text-neutral-800 uppercase">
					{STATUS_LABEL[currentStatus]}
				</dd>
			</div>
		</dl>

		<div class="my-4 border-t border-dashed border-neutral-400"></div>

		<!-- Items Table -->
		<div class="text-xs">
			<div
				class="mb-2.5 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 text-[11px] font-bold tracking-wider text-neutral-900 uppercase"
			>
				<span>Layanan</span>
				<span class="text-right">Qty</span>
				<span class="text-right">Subtotal</span>
			</div>

			<ul class="space-y-2.5">
				{#each order.items as item (item.id)}
					<li class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-3">
						<div class="min-w-0">
							<p class="font-medium text-neutral-900 uppercase">{item.serviceCategory.name}</p>
							{#if item.priceItem}
								<p class="text-[10px] text-neutral-500">
									Paket &ge; {item.priceItem.minQty}
									{item.serviceCategory.unit}
								</p>
							{/if}
						</div>
						<span class="text-right text-neutral-700 tabular-nums">
							{item.qty}
							{item.serviceCategory.unit}
						</span>
						<span class="text-right font-medium text-neutral-900 tabular-nums">
							{formatRupiah(item.subtotal)}
						</span>
					</li>
				{/each}
			</ul>

			{#if order.notes}
				<div
					class="mt-3 border-t border-dotted border-neutral-300 pt-2 text-[11px] text-neutral-600"
				>
					<span class="font-semibold text-neutral-700 uppercase">Catatan:</span>
					<span>{order.notes}</span>
				</div>
			{/if}
		</div>

		<div class="my-4 border-t border-dashed border-neutral-400"></div>

		<!-- Total + Tilted Payment Stamp -->
		<div class="relative pb-2">
			<div class="flex items-baseline justify-between gap-4">
				<span class="text-xs font-bold tracking-wider text-neutral-900 uppercase">Total:</span>
				<span class="text-base font-bold text-neutral-900 tabular-nums">
					{formatRupiah(order.totalPrice)}
				</span>
			</div>

			<div class="mt-3 flex justify-end">
				<span
					class={cn(
						'inline-block -rotate-6 rounded border-2 px-3 py-0.5 text-xs font-black tracking-[0.18em] uppercase shadow-2xs',
						variant === 'preview' ? 'bg-[#faf7ef]/90' : 'bg-white',
						stampStyle
					)}
				>
					{stampText}
				</span>
			</div>
		</div>

		<!-- Thank You Message -->
		<div class="mt-3 flex flex-col items-center gap-1.5 text-center">
			<HeartIcon class="size-3.5 fill-neutral-900 text-neutral-900" />
			<p class="font-sans text-xs font-medium tracking-[0.14em] text-neutral-800 uppercase">
				Terima Kasih
				<br />
				Sudah Mencuci Bersama Kami.
			</p>
		</div>

		<!-- Scannable QR Code -->
		<div class="mt-5 flex flex-col items-center gap-1.5">
			<img
				src={`/api/qr/${order.orderCode}`}
				alt={`QR code tracking ${order.orderCode}`}
				class="size-24 object-contain mix-blend-multiply"
			/>
			<p class="text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
				Scan QR untuk cek status cucian
			</p>
			<p class="text-[11px] font-semibold tracking-widest text-neutral-800 tabular-nums">
				{order.orderCode}
			</p>
		</div>
	</div>

	{#if variant === 'preview'}
		<div
			aria-hidden="true"
			class="h-2.5 w-full bg-[radial-gradient(circle_at_8px_10px,transparent_5px,#faf7ef_5.5px)] bg-[length:16px_10px] bg-repeat-x"
		></div>
	{/if}
</div>
