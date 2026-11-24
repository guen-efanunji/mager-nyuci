<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import {
		STATUS_LABEL,
		STATUS_COLOR,
		PAYMENT_LABEL,
		PAYMENT_COLOR,
		nextStatus,
		type OrderStatus
	} from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import XIcon from '@lucide/svelte/icons/x';

	let { data, form } = $props();

	let searchQuery = $state(untrack(() => data.q ?? ''));
	let statusFilter = $state(untrack(() => data.status ?? 'all'));
	let paymentFilter = $state(untrack(() => data.payment ?? 'all'));
	let advancingId = $state<string | null>(null);

	$effect(() => {
		searchQuery = data.q ?? '';
		statusFilter = data.status ?? 'all';
		paymentFilter = data.payment ?? 'all';
	});

	$effect(() => {
		if (form?.success) {
			const next = (form as { nextStatus?: OrderStatus } | null)?.nextStatus;
			toast.success(
				next ? `Status diperbarui ke ${STATUS_LABEL[next]}` : 'Status berhasil diperbarui'
			);
		}
		if (form?.message) toast.error(form.message);
	});

	const STATUS_TABS: Array<{ key: string; label: string }> = [
		{ key: 'all', label: 'Semua' },
		{ key: 'diterima', label: STATUS_LABEL.diterima },
		{ key: 'dicuci', label: STATUS_LABEL.dicuci },
		{ key: 'dikeringkan', label: STATUS_LABEL.dikeringkan },
		{ key: 'disetrika', label: STATUS_LABEL.disetrika },
		{ key: 'siap_diambil', label: STATUS_LABEL.siap_diambil },
		{ key: 'selesai', label: STATUS_LABEL.selesai },
		{ key: 'dibatalkan', label: STATUS_LABEL.dibatalkan }
	];

	function buildFilterUrl(overrides: { q?: string; status?: string; payment?: string }) {
		const params = new SvelteURLSearchParams();
		const nextQ = (overrides.q ?? searchQuery).trim();
		const nextStatus = overrides.status ?? statusFilter;
		const nextPayment = overrides.payment ?? paymentFilter;
		if (nextQ) params.set('q', nextQ);
		if (nextStatus && nextStatus !== 'all') params.set('status', nextStatus);
		if (nextPayment && nextPayment !== 'all') params.set('payment', nextPayment);
		const qs = params.toString();
		return qs ? `/dashboard/orders?${qs}` : '/dashboard/orders';
	}

	function applyFilter(overrides: { q?: string; status?: string; payment?: string }) {
		goto(buildFilterUrl(overrides));
	}

	const hasActiveFilter = $derived(
		Boolean(data.q) || data.status !== 'all' || data.payment !== 'all'
	);

	const activeCount = $derived(
		data.totalAll - (data.statusCounts['selesai'] ?? 0) - (data.statusCounts['dibatalkan'] ?? 0)
	);

	const formatShortDate = (value: string | Date) =>
		new Date(value).toLocaleString('id-ID', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
</script>

<svelte:head>
	<title>Order — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Daftar Order</h1>
			<p class="text-sm text-muted-foreground">
				Kelola antrean cucian, status pembayaran, dan progres pengerjaan.
			</p>
		</div>
		<Button href="/dashboard/orders/new" class="gap-2 self-start sm:self-auto">
			<PlusIcon class="size-4" />
			Order Baru
		</Button>
	</div>

	<!-- Ringkasan Cepat -->
	<div class="grid gap-3 sm:grid-cols-3">
		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Total Order</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{data.totalAll}</p>
				</div>
				<div class="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
					<ReceiptIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Sedang Diproses / Siap</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{activeCount}</p>
				</div>
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
				>
					<ShoppingBagIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>

		<button
			type="button"
			class="text-left"
			onclick={() =>
				applyFilter({ payment: data.payment === 'belum_bayar' ? 'all' : 'belum_bayar' })}
		>
			<Card.Root
				class="transition-colors hover:border-primary/40 {data.payment === 'belum_bayar'
					? 'border-primary ring-1 ring-primary/20'
					: ''}"
			>
				<Card.Content class="flex items-center justify-between p-4">
					<div>
						<p class="text-xs font-medium text-muted-foreground">Belum Lunas (Klik Filter)</p>
						<p class="mt-1 text-2xl font-bold tabular-nums">{data.unpaidCount}</p>
					</div>
					<div
						class="flex size-9 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
					>
						<WalletIcon class="size-4" />
					</div>
				</Card.Content>
			</Card.Root>
		</button>
	</div>

	<!-- Filter & Pencarian -->
	<Card.Root>
		<Card.Content class="space-y-3 p-4">
			<form method="GET" action="/dashboard/orders" class="flex flex-col gap-3 sm:flex-row">
				<input type="hidden" name="status" value={statusFilter} />
				<div class="relative flex-1">
					<SearchIcon
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						name="q"
						bind:value={searchQuery}
						placeholder="Cari kode order, nama pelanggan, atau no. WhatsApp..."
						class="pr-9 pl-9"
					/>
					{#if searchQuery}
						<button
							type="button"
							aria-label="Hapus pencarian"
							class="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
							onclick={() => {
								searchQuery = '';
								applyFilter({ q: '' });
							}}
						>
							<XIcon class="size-3.5" />
						</button>
					{/if}
				</div>

				<Select.Root
					type="single"
					name="payment"
					bind:value={paymentFilter}
					onValueChange={(v) => applyFilter({ payment: v })}
				>
					<Select.Trigger class="w-full sm:w-44">
						{paymentFilter === 'lunas'
							? 'Lunas'
							: paymentFilter === 'belum_bayar'
								? 'Belum Bayar'
								: 'Semua pembayaran'}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="all">Semua pembayaran</Select.Item>
							<Select.Item value="belum_bayar">Belum Bayar</Select.Item>
							<Select.Item value="lunas">Lunas</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>

				<div class="flex gap-2">
					<Button type="submit" variant="secondary" class="flex-1 sm:flex-initial">Cari</Button>
					{#if hasActiveFilter}
						<Button variant="ghost" href="/dashboard/orders" class="gap-1 px-3">
							<XIcon class="size-3.5" />
							Reset
						</Button>
					{/if}
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Tab Status & Tabel Order -->
	<Tabs.Root
		bind:value={statusFilter}
		onValueChange={(v) => {
			if (v && v !== (data.status ?? 'all')) {
				applyFilter({ status: v });
			}
		}}
		class="w-full flex-col gap-3"
	>
		<div class="w-full max-w-full overflow-x-auto pb-0.5">
			<Tabs.List class="w-max min-w-full sm:w-fit sm:min-w-0">
				{#each STATUS_TABS as tab (tab.key)}
					{@const count = tab.key === 'all' ? data.totalAll : (data.statusCounts[tab.key] ?? 0)}
					{@const active = statusFilter === tab.key}
					<Tabs.Trigger value={tab.key} class="gap-1.5 px-2.5 text-xs sm:text-sm">
						<span>{tab.label}</span>
						<Badge
							variant={active ? 'secondary' : 'outline'}
							class="h-4 min-w-4 px-1.5 text-[10px] tabular-nums"
						>
							{count}
						</Badge>
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</div>

		{#each STATUS_TABS as tab (tab.key)}
			<Tabs.Content value={tab.key} class="w-full">
				{#if statusFilter === tab.key}
					<Card.Root>
						<Card.Content class="p-0">
							{#if data.orders.length === 0}
								<Empty.Root class="border-0 py-14">
									<Empty.Media variant="icon">
										<ReceiptIcon class="size-5" />
									</Empty.Media>
									<Empty.Header>
										<Empty.Title>
											{hasActiveFilter ? 'Order tidak ditemukan' : 'Belum ada order'}
										</Empty.Title>
										<Empty.Description>
											{hasActiveFilter
												? 'Coba ubah kata kunci pencarian atau reset filter status.'
												: 'Buat order pertama untuk mulai mencatat cucian pelanggan.'}
										</Empty.Description>
									</Empty.Header>
									<Empty.Content>
										<div class="flex flex-wrap justify-center gap-2">
											{#if hasActiveFilter}
												<Button variant="outline" href="/dashboard/orders">Reset Filter</Button>
											{/if}
											<Button href="/dashboard/orders/new" class="gap-1.5">
												<PlusIcon class="size-4" />
												Order Baru
											</Button>
										</div>
									</Empty.Content>
								</Empty.Root>
							{:else}
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Order</Table.Head>
											<Table.Head>Pelanggan</Table.Head>
											<Table.Head class="hidden md:table-cell">Layanan</Table.Head>
											<Table.Head>Total & Bayar</Table.Head>
											<Table.Head>Status</Table.Head>
											<Table.Head class="text-right">Aksi</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each data.orders as o (o.id)}
											{@const next = nextStatus(o.status as OrderStatus)}
											{@const paymentKey = (o.paymentStatus ??
												'belum_bayar') as keyof typeof PAYMENT_LABEL}
											{@const firstItem = o.items[0]}
											<Table.Row>
												<Table.Cell>
													<a
														href={`/dashboard/orders/${o.id}`}
														class="font-mono text-sm font-semibold hover:text-primary hover:underline"
													>
														{o.orderCode}
													</a>
													<div class="text-xs text-muted-foreground tabular-nums">
														{formatShortDate(o.createdAt)}
													</div>
												</Table.Cell>

												<Table.Cell>
													<a
														href={`/dashboard/customers/${o.customerId}`}
														class="font-medium hover:underline"
													>
														{o.customer.name}
													</a>
													{#if o.customer.whatsapp}
														<div class="flex items-center gap-1 text-xs text-muted-foreground">
															<PhoneIcon class="size-3" />
															<span class="tabular-nums">{o.customer.whatsapp}</span>
														</div>
													{/if}
												</Table.Cell>

												<Table.Cell class="hidden max-w-[220px] md:table-cell">
													{#if firstItem}
														<div class="truncate text-sm">
															{firstItem.serviceCategory.name}
															<span class="text-muted-foreground tabular-nums">
																({firstItem.qty}
																{firstItem.serviceCategory.unit})
															</span>
														</div>
														{#if o.items.length > 1}
															<span class="text-xs text-muted-foreground">
																+{o.items.length - 1} layanan lainnya
															</span>
														{/if}
													{:else}
														<span class="text-xs text-muted-foreground">-</span>
													{/if}
												</Table.Cell>

												<Table.Cell>
													<div class="font-semibold tabular-nums">
														{formatRupiah(o.totalPrice)}
													</div>
													<Badge class="{PAYMENT_COLOR[paymentKey]} mt-1 text-[11px]">
														{PAYMENT_LABEL[paymentKey]}
													</Badge>
												</Table.Cell>

												<Table.Cell>
													<Badge class={STATUS_COLOR[o.status as OrderStatus]}>
														{STATUS_LABEL[o.status as OrderStatus]}
													</Badge>
												</Table.Cell>

												<Table.Cell class="text-right">
													<div class="flex items-center justify-end gap-1.5">
														<Button
															variant="outline"
															size="sm"
															href={`/dashboard/orders/${o.id}`}
															class="gap-1 px-2.5"
														>
															<EyeIcon class="size-3.5" />
															<span class="hidden sm:inline">Detail</span>
														</Button>
														{#if next}
															<form
																method="POST"
																action="?/advanceStatus"
																use:enhance={() => {
																	advancingId = o.id;
																	return async ({ update }) => {
																		try {
																			await update();
																		} finally {
																			advancingId = null;
																		}
																	};
																}}
															>
																<input type="hidden" name="id" value={o.id} />
																<Button
																	type="submit"
																	size="sm"
																	class="gap-1"
																	disabled={advancingId === o.id}
																>
																	{#if advancingId === o.id}
																		<Spinner class="size-3.5" />
																	{:else}
																		<span class="hidden lg:inline">{STATUS_LABEL[next]}</span>
																		<span class="lg:hidden">Lanjut</span>
																		<ArrowRightIcon class="size-3.5" />
																	{/if}
																</Button>
															</form>
														{/if}
													</div>
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
