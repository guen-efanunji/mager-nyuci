<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PowerIcon from '@lucide/svelte/icons/power';
	import EyeIcon from '@lucide/svelte/icons/eye';

	let { data, form } = $props();

	let createOpen = $state(false);
	let editCustomer = $state<any>(null);
	let historyOpen = $state(false);
	let historyCustomer = $state<any>(null);
	let confirmOpen = $state(false);
	let deleteTarget = $state<{ id: string; name: string } | null>(null);

	const closeAll = () => {
		createOpen = false;
		editCustomer = null;
		historyOpen = false;
		historyCustomer = null;
		confirmOpen = false;
		deleteTarget = null;
	};

	const handleEnhance = () => {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			if (result.type === 'success') closeAll();
			await update();
		};
	};

	$effect(() => {
		if (form?.success) toast.success('Berhasil disimpan');
		if (form?.message) toast.error(form.message);
		const existingName = (form as { existingCustomerName?: string } | null)?.existingCustomerName;
		if (existingName) toast.info(`Nomor sudah terdaftar: ${existingName}`);
		const errors = form?.errors;
		if (errors) {
			const first = Object.values(errors)[0];
			if (Array.isArray(first) && first[0]) toast.error(first[0]);
		}
	});
</script>

<svelte:head>
	<title>Customer — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Customer</h1>
			<p class="text-sm text-muted-foreground">Kelola data customer dan riwayat order.</p>
		</div>
		<Button onclick={() => (createOpen = true)} class="gap-2">
			<PlusIcon class="size-4" /> Customer Baru
		</Button>
	</div>

	<Card.Root>
		<Card.Content class="p-4">
			<form method="GET" action="/dashboard/customers" class="flex gap-3">
				<div class="relative flex-1">
					<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input name="q" value={data.q} placeholder="Cari nama atau nomor WhatsApp..." class="pl-9" />
				</div>
				<Button type="submit" variant="secondary">Cari</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nama</Table.Head>
						<Table.Head>No. WhatsApp</Table.Head>
						<Table.Head>Jumlah Order</Table.Head>
						<Table.Head>Total Belanja</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.customers.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="py-10 text-center text-muted-foreground">
								Belum ada customer.
							</Table.Cell>
						</Table.Row>
					{/if}
					{#each data.customers as c (c.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{c.name}</Table.Cell>
							<Table.Cell>{c.whatsapp ?? '-'}</Table.Cell>
							<Table.Cell class="tabular-nums">{c.orderCount}</Table.Cell>
							<Table.Cell class="tabular-nums">{formatRupiah(c.totalSpent)}</Table.Cell>
							<Table.Cell>
								<Badge variant={c.isActive ? 'default' : 'secondary'}>
									{c.isActive ? 'Aktif' : 'Nonaktif'}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => {
											historyCustomer = c;
											historyOpen = true;
										}}
									>
										<EyeIcon class="size-4" />
									</Button>
									<Button variant="ghost" size="sm" onclick={() => (editCustomer = c)}>
										<PencilIcon class="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => {
											deleteTarget = { id: c.id, name: c.name };
											confirmOpen = true;
										}}
									>
										<PowerIcon class="size-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<!-- Create -->
<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Customer Baru</Dialog.Title>
		</Dialog.Header>
		<form method="POST" action="?/createCustomer" use:enhance={handleEnhance} class="space-y-4">
			<div class="space-y-2">
				<Label for="cc-name">Nama</Label>
				<Input id="cc-name" name="name" required maxlength={100} />
			</div>
			<div class="space-y-2">
				<Label for="cc-wa">No. WhatsApp (opsional)</Label>
				<Input id="cc-wa" name="whatsapp" placeholder="0812..." />
			</div>
			<Dialog.Footer>
				<Button type="button" variant="secondary" onclick={() => (createOpen = false)}>Batal</Button>
				<Button type="submit">Simpan</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit -->
<Dialog.Root open={!!editCustomer} onOpenChange={(o) => { if (!o) editCustomer = null; }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Customer</Dialog.Title>
		</Dialog.Header>
		{#if editCustomer}
			<form method="POST" action="?/updateCustomer" use:enhance={handleEnhance} class="space-y-4">
				<input type="hidden" name="id" value={editCustomer.id} />
				<div class="space-y-2">
					<Label for="ec-name">Nama</Label>
					<Input id="ec-name" name="name" value={editCustomer.name} required maxlength={100} />
				</div>
				<div class="space-y-2">
					<Label for="ec-wa">No. WhatsApp (opsional)</Label>
					<Input id="ec-wa" name="whatsapp" value={editCustomer.whatsapp ?? ''} />
				</div>
				<Dialog.Footer>
					<Button type="button" variant="secondary" onclick={() => (editCustomer = null)}>Batal</Button>
					<Button type="submit">Simpan</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Confirm Dialog -->
<AlertDialog.Root bind:open={confirmOpen}>
	<AlertDialog.Content size="sm">
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus customer?</AlertDialog.Title>
			<AlertDialog.Description>{deleteTarget?.name}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
			<form method="POST" action="?/deleteCustomer" use:enhance={handleEnhance}>
				<input type="hidden" name="id" value={deleteTarget?.id} />
				<AlertDialog.Action type="submit" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
					Hapus
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- History Dialog -->
<Dialog.Root bind:open={historyOpen}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{historyCustomer?.name}</Dialog.Title>
			<Dialog.Description>{historyCustomer?.whatsapp ?? 'Tanpa nomor WhatsApp'} · Total order: {historyCustomer?.orderCount ?? 0}</Dialog.Description>
		</Dialog.Header>
		{#if historyCustomer?.orders?.length}
			<div class="max-h-80 overflow-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/50">
						<tr>
							<th class="p-2 text-left">Kode</th>
							<th class="p-2 text-left">Total</th>
							<th class="p-2 text-left">Status</th>
							<th class="p-2 text-left">Tanggal</th>
						</tr>
					</thead>
					<tbody>
						{#each historyCustomer.orders as o (o.id)}
							<tr class="border-t">
								<td class="p-2 font-medium">{o.orderCode}</td>
								<td class="p-2 tabular-nums">{formatRupiah(o.totalPrice)}</td>
								<td class="p-2">{o.status}</td>
								<td class="p-2 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString('id-ID')}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Belum ada riwayat order.</p>
		{/if}
		<Dialog.Footer>
			<Button variant="secondary" onclick={() => (historyOpen = false)}>Tutup</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>