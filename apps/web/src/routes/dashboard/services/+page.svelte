<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PowerIcon from '@lucide/svelte/icons/power';
	import SearchIcon from '@lucide/svelte/icons/search';

	let { data, form } = $props();

	let createCategoryOpen = $state(false);
	let editCategory = $state<any>(null);
	let priceDialog = $state<{ open: boolean; categoryId: string; item: any | null }>({
		open: false,
		categoryId: '',
		item: null
	});

	let confirmOpen = $state(false);
	let deactivateTarget = $state<{ type: 'category' | 'price'; id: string; name: string; isActive: boolean } | null>(null);
	let priceValue = $state('');

	const closeAll = () => {
		createCategoryOpen = false;
		editCategory = null;
		priceDialog = { open: false, categoryId: '', item: null };
		confirmOpen = false;
		deactivateTarget = null;
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
		if (form?.errors) {
			const first = Object.values(form.errors)[0];
			if (Array.isArray(first) && first[0]) toast.error(first[0]);
		}
	});

	function openPriceDialog(categoryId: string, item: any = null) {
		priceDialog = { open: true, categoryId, item };
	}

	$effect(() => {
		if (priceDialog.open) priceValue = String(priceDialog.item?.price ?? '');
	});

	function askDeactivate(target: { type: 'category' | 'price'; id: string; name: string; isActive: boolean }) {
		deactivateTarget = target;
		confirmOpen = true;
	}

	function unitLabel(u: string) {
		return u === 'kg' ? 'kg' : 'pcs';
	}
</script>

<svelte:head>
	<title>Layanan & Harga — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Layanan & Harga</h1>
			<p class="text-sm text-muted-foreground">Kelola kategori layanan dan daftar harga bertingkat.</p>
		</div>
		<Button onclick={() => (createCategoryOpen = true)} class="gap-2">
			<PlusIcon class="size-4" /> Kategori
		</Button>
	</div>

	<Card.Root>
		<Card.Content class="p-4">
			<form method="GET" action="/dashboard/services" class="flex flex-col gap-3 sm:flex-row">
				<div class="relative flex-1">
					<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input name="q" value={data.q} placeholder="Cari nama kategori..." class="pl-9" />
				</div>
				<Select.Root type="single" name="status" value={data.status}>
					<Select.Trigger class="w-full sm:w-44">
						{data.status === 'active' ? 'Aktif' : data.status === 'inactive' ? 'Nonaktif' : 'Semua status'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">Semua status</Select.Item>
						<Select.Item value="active">Aktif</Select.Item>
						<Select.Item value="inactive">Nonaktif</Select.Item>
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
						<Table.Head>Nama Kategori</Table.Head>
						<Table.Head>Satuan</Table.Head>
						<Table.Head>Rentang Harga</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.categories.length === 0}
						<Table.Row>
							<Table.Cell colspan={5} class="py-10 text-center text-muted-foreground">
								Belum ada kategori layanan.
							</Table.Cell>
						</Table.Row>
					{/if}
					{#each data.categories as category (category.id)}
						<Table.Row>
							<Table.Cell>
								<div class="font-medium">{category.name}</div>
								{#if category.description}
									<div class="text-xs text-muted-foreground">{category.description}</div>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{unitLabel(category.unit)}</Badge>
							</Table.Cell>
							<Table.Cell class="text-sm">
								{#if category.priceItems.length}
									{category.priceItems[0].minQty}{unitLabel(category.unit)} — {formatRupiah(category.priceItems[category.priceItems.length - 1].price)}
								{:else}
									<span class="text-muted-foreground">Belum ada harga</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Badge variant={category.isActive ? 'default' : 'secondary'}>
									{category.isActive ? 'Aktif' : 'Nonaktif'}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="sm" onclick={() => (editCategory = category)}>
										<PencilIcon class="size-4" />
									</Button>
									<Button variant="ghost" size="sm" onclick={() => openPriceDialog(category.id)}>
										<PlusIcon class="size-4" /> Harga
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() =>
											askDeactivate({
												type: 'category',
												id: category.id,
												name: category.name,
												isActive: category.isActive
											})}
									>
										<PowerIcon class="size-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>

						{#if category.priceItems.length}
							<Table.Row class="bg-muted/30">
								<Table.Cell colspan={5} class="py-2">
									<div class="flex flex-wrap gap-2 pl-4">
										{#each category.priceItems as item (item.id)}
											<div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm">
												<span class="tabular-nums">{item.minQty} {unitLabel(category.unit)}</span>
												<span class="font-medium">{formatRupiah(item.price)}</span>
												{#if !item.isActive}
													<Badge variant="secondary" class="text-xs">Nonaktif</Badge>
												{/if}
												<Button variant="ghost" size="sm" class="h-6 px-1" onclick={() => openPriceDialog(category.id, item)}>
													<PencilIcon class="size-3" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													class="h-6 px-1"
													onclick={() =>
														askDeactivate({
															type: 'price',
															id: item.id,
															name: `${item.minQty} ${unitLabel(category.unit)} — ${formatRupiah(item.price)}`,
															isActive: item.isActive
														})}
												>
													<PowerIcon class="size-3" />
												</Button>
											</div>
										{/each}
									</div>
								</Table.Cell>
							</Table.Row>
						{/if}
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<!-- Create Category Dialog -->
<Dialog.Root bind:open={createCategoryOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Kategori Baru</Dialog.Title>
		</Dialog.Header>
		<form method="POST" action="?/createCategory" use:enhance={handleEnhance} class="space-y-4">
			<div class="space-y-2">
				<Label for="cc-name">Nama</Label>
				<Input id="cc-name" name="name" required maxlength={100} />
			</div>
			<div class="space-y-2">
				<Label for="cc-desc">Deskripsi</Label>
				<Textarea id="cc-desc" name="description" rows={2} />
			</div>
			<div class="space-y-2">
				<Label for="cc-unit">Satuan</Label>
				<Select.Root type="single" name="unit" value="kg">
					<Select.Trigger id="cc-unit" class="w-full">kg</Select.Trigger>
					<Select.Content>
						<Select.Item value="kg">kg</Select.Item>
						<Select.Item value="pcs">pcs</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<input type="hidden" name="isActive" value="true" />
			<Dialog.Footer>
				<Button type="button" variant="secondary" onclick={() => (createCategoryOpen = false)}>Batal</Button>
				<Button type="submit">Simpan</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Category Dialog -->
<Dialog.Root open={!!editCategory} onOpenChange={(o) => { if (!o) editCategory = null; }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Kategori</Dialog.Title>
		</Dialog.Header>
		{#if editCategory}
			<form method="POST" action="?/updateCategory" use:enhance={handleEnhance} class="space-y-4">
				<input type="hidden" name="id" value={editCategory.id} />
				<div class="space-y-2">
					<Label for="ec-name">Nama</Label>
					<Input id="ec-name" name="name" value={editCategory.name} required maxlength={100} />
				</div>
				<div class="space-y-2">
					<Label for="ec-desc">Deskripsi</Label>
					<Textarea id="ec-desc" name="description" rows={2} value={editCategory.description ?? ''} />
				</div>
				<div class="space-y-2">
					<Label for="ec-unit">Satuan</Label>
					<Select.Root type="single" name="unit" value={editCategory.unit}>
						<Select.Trigger id="ec-unit" class="w-full">{editCategory.unit}</Select.Trigger>
						<Select.Content>
							<Select.Item value="kg">kg</Select.Item>
							<Select.Item value="pcs">pcs</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label for="ec-active">Status</Label>
					<Select.Root type="single" name="isActive" value={String(editCategory.isActive)}>
						<Select.Trigger id="ec-active" class="w-full">
							{editCategory.isActive ? 'Aktif' : 'Nonaktif'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="true">Aktif</Select.Item>
							<Select.Item value="false">Nonaktif</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="secondary" onclick={() => (editCategory = null)}>Batal</Button>
					<Button type="submit">Simpan</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Price Item Dialog -->
<Dialog.Root bind:open={priceDialog.open}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{priceDialog.item ? 'Edit Harga' : 'Tambah Harga'}</Dialog.Title>
		</Dialog.Header>
		{#if priceDialog.open}
			<form
				method="POST"
				action={priceDialog.item ? '?/updatePriceItem' : '?/createPriceItem'}
				use:enhance={handleEnhance}
				class="space-y-4"
			>
				<input type="hidden" name="serviceCategoryId" value={priceDialog.categoryId} />
				{#if priceDialog.item}
					<input type="hidden" name="id" value={priceDialog.item.id} />
				{/if}
				<div class="space-y-2">
					<Label for="pi-min">Min Qty</Label>
					<Input id="pi-min" name="minQty" type="number" step="0.01" min="0" value={priceDialog.item?.minQty ?? ''} required />
				</div>
				<div class="space-y-2">
					<Label for="pi-price">Harga (Rp)</Label>
					<div class="relative">
						<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
						<Input id="pi-price" name="price" type="number" step="1" min="1" bind:value={priceValue} class="pl-9" required />
					</div>
					<p class="text-xs text-muted-foreground">
						Pratinjau: {formatRupiah(Number(priceValue) || 0)}
					</p>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="secondary" onclick={() => (priceDialog.open = false)}>Batal</Button>
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
			<AlertDialog.Title>
				{deactivateTarget?.isActive ? 'Nonaktifkan' : 'Aktifkan'} {deactivateTarget?.type === 'category' ? 'kategori?' : 'harga?'}
			</AlertDialog.Title>
			<AlertDialog.Description>{deactivateTarget?.name}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
			<form
				method="POST"
				action={deactivateTarget?.type === 'category' ? '?/toggleCategory' : '?/togglePriceItem'}
				use:enhance={handleEnhance}
			>
				<input type="hidden" name="id" value={deactivateTarget?.id} />
				<input type="hidden" name="isActive" value={String(!deactivateTarget?.isActive)} />
				<AlertDialog.Action type="submit">
					{deactivateTarget?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>