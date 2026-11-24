<script lang="ts">
	import { enhance } from '$app/forms';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { STATUS_LABEL, STATUS_COLOR, type OrderStatus } from '#lib/order.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PowerIcon from '@lucide/svelte/icons/power';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import UserCheckIcon from '@lucide/svelte/icons/user-check';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import XIcon from '@lucide/svelte/icons/x';

	let { data, form } = $props();

	type CustomerRow = (typeof data.customers)[number];

	let searchQuery = $derived(data.q ?? '');
	let createOpen = $state(false);
	let editCustomer = $state<CustomerRow | null>(null);
	let historyOpen = $state(false);
	let historyCustomer = $state<CustomerRow | null>(null);
	let confirmOpen = $state(false);
	let actionTarget = $state<{
		mode: 'delete' | 'deactivate' | 'activate';
		id: string;
		name: string;
	} | null>(null);
	let submitting = $state(false);

	const closeAll = () => {
		createOpen = false;
		editCustomer = null;
		historyOpen = false;
		historyCustomer = null;
		confirmOpen = false;
		actionTarget = null;
	};

	const handleEnhance = () => {
		submitting = true;
		return async ({
			result,
			update
		}: {
			result: { type: string };
			update: () => Promise<void>;
		}) => {
			try {
				if (result.type === 'success') closeAll();
				await update();
			} finally {
				submitting = false;
			}
		};
	};

	$effect(() => {
		const f = form as {
			success?: boolean;
			info?: string;
			message?: string;
			existingCustomerName?: string;
			errors?: Record<string, string[]>;
		} | null;
		if (!f) return;
		if (f.success) {
			toast.success(f.info ?? 'Berhasil disimpan');
		} else if (f.message) {
			toast.error(f.message);
		}
		if (f.existingCustomerName) {
			toast.info(`Nomor sudah terdaftar: ${f.existingCustomerName}`);
		}
		if (f.errors) {
			const first = Object.values(f.errors)[0];
			if (Array.isArray(first) && first[0]) toast.error(first[0]);
		}
	});

	const getInitials = (name: string) =>
		name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase() ?? '')
			.join('') || 'C';

	function buildFilterUrl(status: string, q = searchQuery) {
		const params = new SvelteURLSearchParams();
		if (q.trim()) params.set('q', q.trim());
		if (status !== 'all') params.set('status', status);
		const qs = params.toString();
		return qs ? `/dashboard/customers?${qs}` : '/dashboard/customers';
	}

	const hasActiveFilter = $derived(Boolean(data.q) || data.status !== 'all');

	const STATUS_TABS = [
		{ key: 'all', label: 'Semua' },
		{ key: 'active', label: 'Aktif' },
		{ key: 'inactive', label: 'Nonaktif' }
	] as const;

	function openActionConfirm(c: CustomerRow) {
		if (!c.isActive) {
			actionTarget = { mode: 'activate', id: c.id, name: c.name };
		} else if (c.orderCount === 0) {
			actionTarget = { mode: 'delete', id: c.id, name: c.name };
		} else {
			actionTarget = { mode: 'deactivate', id: c.id, name: c.name };
		}
		confirmOpen = true;
	}
</script>

<svelte:head>
	<title>Customer — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Customer</h1>
			<p class="text-sm text-muted-foreground">
				Kelola data pelanggan, kontak WhatsApp, dan riwayat order mereka.
			</p>
		</div>
		<Button onclick={() => (createOpen = true)} class="gap-2 self-start sm:self-auto">
			<UserPlusIcon class="size-4" />
			Customer Baru
		</Button>
	</div>

	<!-- Ringkasan -->
	<div class="grid gap-3 sm:grid-cols-3">
		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Total Customer</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{data.stats.totalCustomers}</p>
				</div>
				<div class="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
					<UsersIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Customer Aktif</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{data.stats.activeCustomers}</p>
				</div>
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
				>
					<UserCheckIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Order Aktif & Selesai</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{data.stats.totalOrders}</p>
				</div>
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
				>
					<ReceiptIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Filter & Pencarian -->
	<Card.Root>
		<Card.Content class="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
			<form method="GET" action="/dashboard/customers" class="flex flex-1 gap-2">
				<input type="hidden" name="status" value={data.status} />
				<div class="relative flex-1">
					<SearchIcon
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						name="q"
						bind:value={searchQuery}
						placeholder="Cari nama atau nomor WhatsApp..."
						class="pr-9 pl-9"
					/>
					{#if searchQuery}
						<a
							href={buildFilterUrl(data.status, '')}
							aria-label="Hapus pencarian"
							class="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
						>
							<XIcon class="size-3.5" />
						</a>
					{/if}
				</div>
				<Button type="submit" variant="secondary">Cari</Button>
				{#if hasActiveFilter}
					<Button variant="ghost" href="/dashboard/customers" class="gap-1 px-3">
						<XIcon class="size-3.5" />
						Reset
					</Button>
				{/if}
			</form>

			<div class="flex flex-wrap gap-1.5">
				{#each STATUS_TABS as tab (tab.key)}
					{@const active = data.status === tab.key}
					<a
						href={buildFilterUrl(tab.key)}
						class="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors {active
							? 'border-primary bg-primary text-primary-foreground'
							: 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'}"
					>
						{tab.label}
					</a>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Tabel Customer -->
	<Card.Root>
		<Card.Content class="p-0">
			{#if data.customers.length === 0}
				<Empty.Root class="border-0 py-14">
					<Empty.Media variant="icon">
						<UsersIcon class="size-5" />
					</Empty.Media>
					<Empty.Header>
						<Empty.Title>
							{hasActiveFilter ? 'Customer tidak ditemukan' : 'Belum ada data customer'}
						</Empty.Title>
						<Empty.Description>
							{hasActiveFilter
								? 'Coba ubah kata kunci pencarian atau reset filter status.'
								: 'Tambahkan customer baru untuk memudahkan pencatatan order berikutnya.'}
						</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<div class="flex flex-wrap justify-center gap-2">
							{#if hasActiveFilter}
								<Button variant="outline" href="/dashboard/customers">Reset Filter</Button>
							{/if}
							<Button onclick={() => (createOpen = true)} class="gap-1.5">
								<PlusIcon class="size-4" />
								Customer Baru
							</Button>
						</div>
					</Empty.Content>
				</Empty.Root>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Pelanggan</Table.Head>
							<Table.Head>No. WhatsApp</Table.Head>
							<Table.Head class="text-right">Order</Table.Head>
							<Table.Head class="text-right">Total Belanja</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Aksi</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.customers as c (c.id)}
							<Table.Row class={c.isActive ? '' : 'opacity-75'}>
								<Table.Cell>
									<a href={`/dashboard/customers/${c.id}`} class="group flex items-center gap-3">
										<Avatar.Root class="size-8 shrink-0">
											<Avatar.Fallback class="bg-primary/10 text-xs font-semibold text-primary">
												{getInitials(c.name)}
											</Avatar.Fallback>
										</Avatar.Root>
										<div class="min-w-0">
											<p
												class="truncate font-medium group-hover:text-primary group-hover:underline"
											>
												{c.name}
											</p>
										</div>
									</a>
								</Table.Cell>

								<Table.Cell>
									{#if c.whatsapp}
										<span class="inline-flex items-center gap-1.5 text-sm tabular-nums">
											<PhoneIcon class="size-3.5 text-muted-foreground" />
											{c.whatsapp}
										</span>
									{:else}
										<span class="text-xs text-muted-foreground">Belum ada nomor</span>
									{/if}
								</Table.Cell>

								<Table.Cell class="text-right font-medium tabular-nums">
									{c.orderCount}
								</Table.Cell>

								<Table.Cell class="text-right font-semibold tabular-nums">
									{formatRupiah(c.totalSpent)}
								</Table.Cell>

								<Table.Cell>
									<Badge variant={c.isActive ? 'default' : 'secondary'}>
										{c.isActive ? 'Aktif' : 'Nonaktif'}
									</Badge>
								</Table.Cell>

								<Table.Cell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											class="size-8"
											aria-label="Lihat riwayat order"
											onclick={() => {
												historyCustomer = c;
												historyOpen = true;
											}}
										>
											<EyeIcon class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="size-8"
											aria-label="Edit customer"
											onclick={() => (editCustomer = c)}
										>
											<PencilIcon class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="size-8 {c.isActive
												? 'text-muted-foreground hover:text-destructive'
												: 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400'}"
											aria-label={c.isActive
												? c.orderCount === 0
													? 'Hapus customer'
													: 'Nonaktifkan customer'
												: 'Aktifkan customer'}
											onclick={() => openActionConfirm(c)}
										>
											{#if c.isActive && c.orderCount === 0}
												<Trash2Icon class="size-4" />
											{:else}
												<PowerIcon class="size-4" />
											{/if}
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Create -->
<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Customer Baru</Dialog.Title>
			<Dialog.Description>
				Tambahkan data pelanggan untuk mempermudah pembuatan order dan kirim nota WhatsApp.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/createCustomer" use:enhance={handleEnhance} class="space-y-4">
			<div class="space-y-2">
				<Label for="cc-name">Nama Lengkap</Label>
				<Input id="cc-name" name="name" placeholder="Contoh: Siti Rahma" required maxlength={100} />
			</div>
			<div class="space-y-2">
				<Label for="cc-wa">No. WhatsApp (opsional)</Label>
				<InputGroup.Root>
					<InputGroup.Addon align="inline-start">
						<PhoneIcon class="size-4" />
					</InputGroup.Addon>
					<InputGroup.Input id="cc-wa" name="whatsapp" placeholder="0812xxxxxxxx" />
				</InputGroup.Root>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (createOpen = false)}>Batal</Button>
				<Button type="submit" disabled={submitting} class="gap-2">
					{#if submitting}
						<Spinner class="size-4" />
					{/if}
					Simpan Customer
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit -->
<Dialog.Root
	open={!!editCustomer}
	onOpenChange={(o) => {
		if (!o) editCustomer = null;
	}}
>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Customer</Dialog.Title>
			<Dialog.Description>Perbarui nama atau nomor WhatsApp pelanggan.</Dialog.Description>
		</Dialog.Header>
		{#if editCustomer}
			<form method="POST" action="?/updateCustomer" use:enhance={handleEnhance} class="space-y-4">
				<input type="hidden" name="id" value={editCustomer.id} />
				<div class="space-y-2">
					<Label for="ec-name">Nama Lengkap</Label>
					<Input id="ec-name" name="name" value={editCustomer.name} required maxlength={100} />
				</div>
				<div class="space-y-2">
					<Label for="ec-wa">No. WhatsApp (opsional)</Label>
					<InputGroup.Root>
						<InputGroup.Addon align="inline-start">
							<PhoneIcon class="size-4" />
						</InputGroup.Addon>
						<InputGroup.Input
							id="ec-wa"
							name="whatsapp"
							placeholder="0812xxxxxxxx"
							value={editCustomer.whatsapp ?? ''}
						/>
					</InputGroup.Root>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (editCustomer = null)}>
						Batal
					</Button>
					<Button type="submit" disabled={submitting} class="gap-2">
						{#if submitting}
							<Spinner class="size-4" />
						{/if}
						Simpan Perubahan
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Confirm Dialog -->
<AlertDialog.Root bind:open={confirmOpen}>
	<AlertDialog.Content size="sm">
		<AlertDialog.Header>
			<AlertDialog.Title>
				{#if actionTarget?.mode === 'delete'}
					Hapus customer permanen?
				{:else if actionTarget?.mode === 'deactivate'}
					Nonaktifkan customer?
				{:else}
					Aktifkan kembali customer?
				{/if}
			</AlertDialog.Title>
			<AlertDialog.Description>
				{#if actionTarget?.mode === 'delete'}
					Data <strong>{actionTarget.name}</strong> akan dihapus permanen karena belum memiliki riwayat
					order.
				{:else if actionTarget?.mode === 'deactivate'}
					<strong>{actionTarget.name}</strong> memiliki riwayat order sehingga tidak dihapus permanen,
					melainkan dinonaktifkan.
				{:else}
					<strong>{actionTarget?.name}</strong> akan muncul kembali di pilihan kasir.
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
			<form
				method="POST"
				action={actionTarget?.mode === 'delete' ? '?/deleteCustomer' : '?/toggleCustomer'}
				use:enhance={handleEnhance}
			>
				<input type="hidden" name="id" value={actionTarget?.id} />
				{#if actionTarget?.mode !== 'delete'}
					<input type="hidden" name="isActive" value={String(actionTarget?.mode === 'activate')} />
				{/if}
				<AlertDialog.Action
					type="submit"
					disabled={submitting}
					class={actionTarget?.mode === 'delete'
						? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
						: ''}
				>
					{#if actionTarget?.mode === 'delete'}
						Hapus
					{:else if actionTarget?.mode === 'deactivate'}
						Nonaktifkan
					{:else}
						Aktifkan
					{/if}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- History Dialog -->
<Dialog.Root bind:open={historyOpen}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<div class="flex items-center gap-3">
				<Avatar.Root class="size-10">
					<Avatar.Fallback class="bg-primary/10 text-sm font-semibold text-primary">
						{getInitials(historyCustomer?.name ?? '')}
					</Avatar.Fallback>
				</Avatar.Root>
				<div>
					<Dialog.Title>{historyCustomer?.name}</Dialog.Title>
					<Dialog.Description>
						{historyCustomer?.whatsapp ?? 'Tanpa nomor WhatsApp'} · {historyCustomer?.orderCount ??
							0} order · Total {formatRupiah(historyCustomer?.totalSpent ?? 0)}
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>
		{#if historyCustomer?.orders?.length}
			<div class="max-h-80 overflow-auto rounded-lg border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Kode Order</Table.Head>
							<Table.Head>Total</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Tanggal</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each historyCustomer.orders as o (o.id)}
							<Table.Row>
								<Table.Cell class="font-mono font-medium">
									<a href={`/dashboard/orders/${o.id}`} class="hover:text-primary hover:underline">
										{o.orderCode}
									</a>
								</Table.Cell>
								<Table.Cell class="tabular-nums">{formatRupiah(o.totalPrice)}</Table.Cell>
								<Table.Cell>
									<Badge class={STATUS_COLOR[o.status as OrderStatus]}>
										{STATUS_LABEL[o.status as OrderStatus]}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-xs text-muted-foreground tabular-nums">
									{new Date(o.createdAt).toLocaleString('id-ID', {
										day: '2-digit',
										month: 'short',
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else}
			<div class="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
				Pelanggan ini belum memiliki riwayat order.
			</div>
		{/if}
		<Dialog.Footer>
			{#if historyCustomer}
				<Button variant="outline" href={`/dashboard/customers/${historyCustomer.id}`}>
					Buka Profil Lengkap
				</Button>
			{/if}
			<Button variant="secondary" onclick={() => (historyOpen = false)}>Tutup</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
