<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { STATUS_LABEL, STATUS_COLOR, nextStatus, canCancel, PAYMENT_LABEL, PAYMENT_COLOR } from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import PrinterIcon from '@lucide/svelte/icons/printer';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { data, form } = $props();
	const order = $derived(data.order);

	let cancelOpen = $state(false);
	let cancelReason = $state('');

	$effect(() => {
		if (form?.success) toast.success('Berhasil');
		if (form?.message) toast.error(form.message);
	});

	const waLink = $derived(() => {
		if (!order.customer.whatsapp) return null;
		const lines = [
			`Halo Kak ${order.customer.name.split(' ')[0]},`,
			`Nota laundry KiloTrack`,
			`Kode: ${order.orderCode}`,
			`Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}`,
			...order.items.map((it: any) => `- ${it.serviceCategory.name} ${it.qty} = ${formatRupiah(it.subtotal)}`),
			`Total: ${formatRupiah(order.totalPrice)}`,
			`Cek status: ${data.appUrl ?? ''}/t/${order.orderCode}?tk=${order.trackingToken}`
		];
		const text = encodeURIComponent(lines.join('\n'));
		const num = order.customer.whatsapp.replace('+', '');
		return `https://wa.me/${num}?text=${text}`;
	});
</script>

<svelte:head>
	<title>{order.orderCode} — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<Button variant="ghost" href="/dashboard/orders" class="gap-2">
		<ArrowLeftIcon class="size-4" /> Kembali
	</Button>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div>
				<Card.Title>{order.orderCode}</Card.Title>
				<Card.Description>{order.customer.name} · {new Date(order.createdAt).toLocaleString('id-ID')}</Card.Description>
			</div>
			<Badge class={STATUS_COLOR[order.status as keyof typeof STATUS_COLOR]}>{STATUS_LABEL[order.status as keyof typeof STATUS_LABEL]}</Badge>
			<Badge class={PAYMENT_COLOR[(order.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_COLOR]}>
				{PAYMENT_LABEL[(order.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_LABEL]}
			</Badge>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm font-medium">Rincian</p>
					<ul class="mt-2 space-y-1 text-sm">
						{#each order.items as it (it.id)}
							<li class="flex justify-between">
								<span>{it.serviceCategory.name} · {it.qty} {it.serviceCategory.unit}</span>
								<span class="tabular-nums">{formatRupiah(it.subtotal)}</span>
							</li>
						{/each}
					</ul>
					<div class="mt-2 flex justify-between border-t pt-2 font-semibold">
						<span>Total</span>
						<span class="tabular-nums">{formatRupiah(order.totalPrice)}</span>
					</div>
				</div>
				<div class="flex flex-col items-center gap-2">
					<img src={`/api/qr/${order.orderCode}`} alt="QR" class="size-40 rounded border" />
					<p class="text-xs text-muted-foreground">Scan untuk cek status</p>
				</div>
			</div>

			{#if order.notes}
				<p class="text-sm text-muted-foreground">Catatan: {order.notes}</p>
			{/if}
			{#if order.cancelReason}
				<p class="text-sm text-destructive">Dibatalkan: {order.cancelReason}</p>
			{/if}

			<div class="flex flex-wrap gap-2">
				{#if !order.customer.whatsapp}
					<p class="text-sm text-muted-foreground">Customer tanpa nomor WA — print nota saja</p>
				{:else if data.whatsappDriver === 'fonnte'}
					<form method="POST" action="?/sendWhatsApp" use:enhance>
						<input type="hidden" name="id" value={order.id} />
						<Button type="submit" class="gap-2 bg-green-600 hover:bg-green-700">
							<MessageCircleIcon class="size-4" /> Kirim via WhatsApp (Fonnte)
						</Button>
					</form>
				{:else if waLink()}
					<a href={waLink()} target="_blank" rel="noopener">
						<Button class="gap-2 bg-green-600 hover:bg-green-700">
							<MessageCircleIcon class="size-4" /> Kirim via WhatsApp
						</Button>
					</a>
				{/if}
				<Button variant="secondary" onclick={() => window.print()} class="gap-2">
					<PrinterIcon class="size-4" /> Print Nota
				</Button>
				{#if nextStatus(order.status as any)}
					<form method="POST" action="?/advanceStatus" use:enhance>
						<input type="hidden" name="id" value={order.id} />
						<Button type="submit" class="gap-2">
							<ArrowRightIcon class="size-4" /> Lanjut Tahap
						</Button>
					</form>
				{/if}
				<form method="POST" action="?/togglePayment" use:enhance>
					<input type="hidden" name="id" value={order.id} />
					<input type="hidden" name="paymentStatus" value={order.paymentStatus === 'lunas' ? 'belum_bayar' : 'lunas'} />
					<Button type="submit" variant="secondary">
						{order.paymentStatus === 'lunas' ? 'Tandai Belum Bayar' : 'Tandai Lunas'}
					</Button>
				</form>
				{#if canCancel(order.status as any)}
					<AlertDialog.Root bind:open={cancelOpen}>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="destructive">Batalkan Order</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content size="sm">
							<AlertDialog.Header>
								<AlertDialog.Title>Batalkan order?</AlertDialog.Title>
								<AlertDialog.Description>Wajib isi alasan pembatalan.</AlertDialog.Description>
							</AlertDialog.Header>
							<form method="POST" action="?/cancelOrder" use:enhance class="space-y-3">
								<input type="hidden" name="id" value={order.id} />
								<textarea
									name="reason"
									bind:value={cancelReason}
									class="w-full rounded-md border p-2 text-sm"
									rows={3}
									placeholder="Alasan..."
								></textarea>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
									<AlertDialog.Action type="submit">Batalkan</AlertDialog.Action>
								</AlertDialog.Footer>
							</form>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{/if}
			</div>

			{#if order.statusHistories.length}
				<div class="border-t pt-4">
					<p class="mb-2 text-sm font-medium">Riwayat Status</p>
					<ul class="space-y-1 text-sm text-muted-foreground">
						{#each order.statusHistories as h (h.id)}
							<li>{h.statusLama ?? '—'} → {h.statusBaru} · {new Date(h.createdAt).toLocaleString('id-ID')}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>