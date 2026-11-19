<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { STATUS_LABEL, STATUS_COLOR, nextStatus } from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { PAYMENT_LABEL, PAYMENT_COLOR } from '#lib/order.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { data, form } = $props();

	$effect(() => {
		if (form?.success) toast.success('Status diperbarui');
		if (form?.message) toast.error(form.message);
	});
</script>

<svelte:head>
	<title>Order — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Order</h1>
			<p class="text-sm text-muted-foreground">Daftar order cucian.</p>
		</div>
		<Button href="/dashboard/orders/new" class="gap-2">
			<PlusIcon class="size-4" /> Order Baru
		</Button>
	</div>

	<Card.Root>
		<Card.Content class="p-4">
			<form method="GET" action="/dashboard/orders" class="flex flex-col gap-3 sm:flex-row">
				<div class="relative flex-1">
					<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input name="q" value={data.q} placeholder="Cari kode order / nama customer..." class="pl-9" />
				</div>
				<Select.Root type="single" name="status" value={data.status}>
					<Select.Trigger class="w-full sm:w-44">
						{data.status === 'all' ? 'Semua status' : STATUS_LABEL[data.status as keyof typeof STATUS_LABEL]}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">Semua status</Select.Item>
						{#each Object.entries(STATUS_LABEL) as [k, v] (k)}
							<Select.Item value={k}>{v}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Button type="submit" variant="secondary">Cari</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Kode Order</Table.Head>
						<Table.Head>Customer</Table.Head>
						<Table.Head>Total</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Pembayaran</Table.Head>
						<Table.Head>Waktu</Table.Head>
						<Table.Head class="text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.orders.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="py-10 text-center text-muted-foreground">Belum ada order.</Table.Cell>
						</Table.Row>
					{/if}
					{#each data.orders as o (o.id)}
						<Table.Row>
							<Table.Cell class="font-medium">
								<a href={`/dashboard/orders/${o.id}`} class="hover:underline">{o.orderCode}</a>
							</Table.Cell>
							<Table.Cell>{o.customer.name}</Table.Cell>
							<Table.Cell class="tabular-nums">{formatRupiah(o.totalPrice)}</Table.Cell>
							<Table.Cell>
								<Badge class={STATUS_COLOR[o.status as keyof typeof STATUS_COLOR]}>{STATUS_LABEL[o.status as keyof typeof STATUS_LABEL]}</Badge>
							</Table.Cell>
							<Table.Cell>
								<Badge class={PAYMENT_COLOR[(o.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_COLOR]}>
									{PAYMENT_LABEL[(o.paymentStatus ?? 'belum_bayar') as keyof typeof PAYMENT_LABEL]}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleString('id-ID')}</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									{#if nextStatus(o.status as any)}
										<form method="POST" action="?/advanceStatus" use:enhance>
											<input type="hidden" name="id" value={o.id} />
											<Button type="submit" size="sm" class="gap-1">
												Lanjut <ArrowRightIcon class="size-3" />
											</Button>
										</form>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>