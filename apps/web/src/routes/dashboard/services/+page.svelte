<script lang="ts">
	import { enhance } from '$app/forms';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PowerIcon from '@lucide/svelte/icons/power';
	import SearchIcon from '@lucide/svelte/icons/search';
	import TagIcon from '@lucide/svelte/icons/tag';
	import XIcon from '@lucide/svelte/icons/x';

	let { data, form } = $props();

	type PriceItemData = (typeof data.categories)[number]['priceItems'][number];
	type CategoryData = (typeof data.categories)[number];

	let searchQuery = $derived(data.q ?? '');
	let createCategoryOpen = $state(false);
	let createUnit = $state<'kg' | 'pcs'>('kg');

	let editCategory = $state<CategoryData | null>(null);
	let editUnit = $state<'kg' | 'pcs'>('kg');
	let editActive = $state<'true' | 'false'>('true');

	let priceDialog = $state<{
		open: boolean;
		category: CategoryData | null;
		item: PriceItemData | null;
	}>({
		open: false,
		category: null,
		item: null
	});
	let priceValue = $state('');

	let confirmOpen = $state(false);
	let deactivateTarget = $state<{
		type: 'category' | 'price';
		id: string;
		name: string;
		isActive: boolean;
	} | null>(null);

	let submitting = $state(false);

	$effect(() => {
		if (editCategory) {
			editUnit = editCategory.unit === 'pcs' ? 'pcs' : 'kg';
			editActive = editCategory.isActive ? 'true' : 'false';
		}
	});

	$effect(() => {
		if (priceDialog.open) priceValue = String(priceDialog.item?.price ?? '');
	});

	const closeAll = () => {
		createCategoryOpen = false;
		createUnit = 'kg';
		editCategory = null;
		priceDialog = { open: false, category: null, item: null };
		confirmOpen = false;
		deactivateTarget = null;
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
		if (form?.success) toast.success('Perubahan berhasil disimpan');
		if (form?.message) toast.error(form.message);
		if (form?.errors) {
			const first = Object.values(form.errors)[0];
			if (Array.isArray(first) && first[0]) toast.error(first[0]);
		}
	});

	function openPriceDialog(category: CategoryData, item: PriceItemData | null = null) {
		priceDialog = { open: true, category, item };
	}

	function askDeactivate(target: {
		type: 'category' | 'price';
		id: string;
		name: string;
		isActive: boolean;
	}) {
		deactivateTarget = target;
		confirmOpen = true;
	}

	function unitLabel(u: string) {
		return u === 'kg' ? 'kg' : 'pcs';
	}

	function buildFilterUrl(status: string, q = searchQuery) {
		const params = new SvelteURLSearchParams();
		if (q.trim()) params.set('q', q.trim());
		if (status !== 'all') params.set('status', status);
		const qs = params.toString();
		return qs ? `/dashboard/services?${qs}` : '/dashboard/services';
	}

	const hasActiveFilter = $derived(Boolean(data.q) || data.status !== 'all');

	const STATUS_TABS = [
		{ key: 'all', label: 'Semua' },
		{ key: 'active', label: 'Aktif' },
		{ key: 'inactive', label: 'Nonaktif' }
	] as const;
</script>

<svelte:head>
	<title>Layanan & Harga — KiloTrack</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Layanan & Harga</h1>
			<p class="text-sm text-muted-foreground">
				Kelola kategori layanan laundry beserta daftar paket tarif bertingkat.
			</p>
		</div>
		<Button onclick={() => (createCategoryOpen = true)} class="gap-2 self-start sm:self-auto">
			<PlusIcon class="size-4" />
			Kategori Baru
		</Button>
	</div>

	<!-- Ringkasan -->
	<div class="grid gap-3 sm:grid-cols-3">
		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Total Kategori</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{data.stats.totalCategories}</p>
				</div>
				<div class="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
					<LayersIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Kategori Aktif</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{data.stats.activeCategories}</p>
				</div>
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
				>
					<CircleCheckIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex items-center justify-between p-4">
				<div>
					<p class="text-xs font-medium text-muted-foreground">Paket Tarif Aktif</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">{data.stats.totalPriceItems}</p>
				</div>
				<div
					class="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
				>
					<TagIcon class="size-4" />
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Filter & Pencarian -->
	<Card.Root>
		<Card.Content class="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
			<form method="GET" action="/dashboard/services" class="flex flex-1 gap-2">
				<input type="hidden" name="status" value={data.status} />
				<div class="relative flex-1">
					<SearchIcon
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						name="q"
						bind:value={searchQuery}
						placeholder="Cari nama kategori layanan..."
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
					<Button variant="ghost" href="/dashboard/services" class="gap-1 px-3">
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

	<!-- Daftar Kategori & Paket Harga -->
	{#if data.categories.length === 0}
		<Card.Root>
			<Card.Content class="p-6">
				<Empty.Root class="border-0 py-10">
					<Empty.Media variant="icon">
						<LayersIcon class="size-5" />
					</Empty.Media>
					<Empty.Header>
						<Empty.Title>
							{hasActiveFilter ? 'Kategori tidak ditemukan' : 'Belum ada kategori layanan'}
						</Empty.Title>
						<Empty.Description>
							{hasActiveFilter
								? 'Coba ubah kata kunci pencarian atau pilih filter status lain.'
								: 'Tambahkan kategori seperti Cuci Komplit, Cuci Kering, atau Setrika Saja.'}
						</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<div class="flex flex-wrap justify-center gap-2">
							{#if hasActiveFilter}
								<Button variant="outline" href="/dashboard/services">Reset Filter</Button>
							{/if}
							<Button onclick={() => (createCategoryOpen = true)} class="gap-1.5">
								<PlusIcon class="size-4" />
								Tambah Kategori
							</Button>
						</div>
					</Empty.Content>
				</Empty.Root>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each data.categories as category (category.id)}
				{@const unit = unitLabel(category.unit)}
				<Card.Root class={category.isActive ? '' : 'opacity-75'}>
					<Card.Header class="border-b pb-4">
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div class="space-y-1">
								<div class="flex flex-wrap items-center gap-2">
									<Card.Title class="text-base">{category.name}</Card.Title>
									<Badge variant="outline" class="font-mono text-xs">{unit}</Badge>
									<Badge variant={category.isActive ? 'default' : 'secondary'}>
										{category.isActive ? 'Aktif' : 'Nonaktif'}
									</Badge>
								</div>
								{#if category.description}
									<Card.Description>{category.description}</Card.Description>
								{:else}
									<Card.Description class="italic">Belum ada deskripsi layanan</Card.Description>
								{/if}
							</div>

							<div class="flex flex-wrap items-center gap-1.5">
								<Button
									variant="outline"
									size="sm"
									class="gap-1.5"
									onclick={() => openPriceDialog(category)}
								>
									<PlusIcon class="size-3.5" />
									Tambah Tarif
								</Button>
								<Button
									variant="ghost"
									size="sm"
									class="gap-1.5"
									onclick={() => (editCategory = category)}
								>
									<PencilIcon class="size-3.5" />
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									class="gap-1.5 {category.isActive
										? 'text-muted-foreground hover:text-destructive'
										: 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400'}"
									onclick={() =>
										askDeactivate({
											type: 'category',
											id: category.id,
											name: category.name,
											isActive: category.isActive
										})}
								>
									<PowerIcon class="size-3.5" />
									<span class="hidden sm:inline">
										{category.isActive ? 'Nonaktifkan' : 'Aktifkan'}
									</span>
								</Button>
							</div>
						</div>
					</Card.Header>

					<Card.Content class="pt-4">
						{#if category.priceItems.length === 0}
							<div
								class="flex flex-col items-center justify-between gap-2 rounded-lg border border-dashed bg-muted/20 px-4 py-4 text-center sm:flex-row sm:text-left"
							>
								<p class="text-sm text-muted-foreground">
									Belum ada paket tarif untuk kategori ini. Layanan tidak bisa dipilih di kasir
									sebelum tarif ditambahkan.
								</p>
								<Button
									variant="secondary"
									size="sm"
									class="shrink-0 gap-1.5"
									onclick={() => openPriceDialog(category)}
								>
									<PlusIcon class="size-3.5" />
									Tambah Tarif
								</Button>
							</div>
						{:else}
							<div class="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
								{#each category.priceItems as item (item.id)}
									<div
										class="flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors {item.isActive
											? 'bg-background'
											: 'bg-muted/40 opacity-70'}"
									>
										<div class="min-w-0">
											<div class="flex items-center gap-1.5">
												<span class="text-xs font-medium text-muted-foreground tabular-nums">
													Min. {item.minQty}
													{unit}
												</span>
												{#if !item.isActive}
													<Badge variant="secondary" class="h-4 px-1.5 text-[10px]">Nonaktif</Badge>
												{/if}
											</div>
											<p class="mt-0.5 text-sm font-bold tabular-nums">
												{formatRupiah(item.price)}
												<span class="text-xs font-normal text-muted-foreground">/ {unit}</span>
											</p>
										</div>

										<div class="flex shrink-0 items-center gap-0.5">
											<Button
												variant="ghost"
												size="icon"
												class="size-7"
												aria-label="Edit tarif"
												onclick={() => openPriceDialog(category, item)}
											>
												<PencilIcon class="size-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="size-7 {item.isActive
													? 'text-muted-foreground hover:text-destructive'
													: 'text-emerald-700'}"
												aria-label={item.isActive ? 'Nonaktifkan tarif' : 'Aktifkan tarif'}
												onclick={() =>
													askDeactivate({
														type: 'price',
														id: item.id,
														name: `${category.name} — Min. ${item.minQty} ${unit} (${formatRupiah(item.price)}/${unit})`,
														isActive: item.isActive
													})}
											>
												<PowerIcon class="size-3.5" />
											</Button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Category Dialog -->
<Dialog.Root bind:open={createCategoryOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Kategori Layanan Baru</Dialog.Title>
			<Dialog.Description>
				Buat kategori layanan terlebih dahulu, lalu tambahkan paket harga bertingkatnya.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/createCategory" use:enhance={handleEnhance} class="space-y-4">
			<div class="space-y-2">
				<Label for="cc-name">Nama Kategori</Label>
				<Input
					id="cc-name"
					name="name"
					placeholder="Contoh: Cuci Komplit"
					required
					maxlength={100}
				/>
			</div>
			<div class="space-y-2">
				<Label for="cc-desc">Deskripsi (opsional)</Label>
				<Textarea
					id="cc-desc"
					name="description"
					placeholder="Cuci + kering + setrika + parfum"
					rows={2}
				/>
			</div>
			<div class="space-y-2">
				<Label>Satuan Hitung</Label>
				<input type="hidden" name="unit" value={createUnit} />
				<ToggleGroup.Root
					type="single"
					value={createUnit}
					onValueChange={(v) => {
						if (v === 'kg' || v === 'pcs') createUnit = v;
					}}
					variant="outline"
					class="grid w-full grid-cols-2"
				>
					<ToggleGroup.Item value="kg">Kiloan (kg)</ToggleGroup.Item>
					<ToggleGroup.Item value="pcs">Satuan (pcs)</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>
			<input type="hidden" name="isActive" value="true" />
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (createCategoryOpen = false)}>
					Batal
				</Button>
				<Button type="submit" disabled={submitting} class="gap-2">
					{#if submitting}
						<Spinner class="size-4" />
					{/if}
					Simpan Kategori
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Category Dialog -->
<Dialog.Root
	open={!!editCategory}
	onOpenChange={(o) => {
		if (!o) editCategory = null;
	}}
>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Kategori</Dialog.Title>
			<Dialog.Description>Perbarui informasi dan status kategori layanan.</Dialog.Description>
		</Dialog.Header>
		{#if editCategory}
			<form method="POST" action="?/updateCategory" use:enhance={handleEnhance} class="space-y-4">
				<input type="hidden" name="id" value={editCategory.id} />
				<div class="space-y-2">
					<Label for="ec-name">Nama Kategori</Label>
					<Input id="ec-name" name="name" value={editCategory.name} required maxlength={100} />
				</div>
				<div class="space-y-2">
					<Label for="ec-desc">Deskripsi (opsional)</Label>
					<Textarea
						id="ec-desc"
						name="description"
						rows={2}
						value={editCategory.description ?? ''}
					/>
				</div>
				<div class="space-y-2">
					<Label>Satuan Hitung</Label>
					<input type="hidden" name="unit" value={editUnit} />
					<ToggleGroup.Root
						type="single"
						value={editUnit}
						onValueChange={(v) => {
							if (v === 'kg' || v === 'pcs') editUnit = v;
						}}
						variant="outline"
						class="grid w-full grid-cols-2"
					>
						<ToggleGroup.Item value="kg">Kiloan (kg)</ToggleGroup.Item>
						<ToggleGroup.Item value="pcs">Satuan (pcs)</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>
				<div class="space-y-2">
					<Label>Status Kategori</Label>
					<input type="hidden" name="isActive" value={editActive} />
					<ToggleGroup.Root
						type="single"
						value={editActive}
						onValueChange={(v) => {
							if (v === 'true' || v === 'false') editActive = v;
						}}
						variant="outline"
						class="grid w-full grid-cols-2"
					>
						<ToggleGroup.Item value="true">Aktif</ToggleGroup.Item>
						<ToggleGroup.Item value="false">Nonaktif</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (editCategory = null)}>
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

<!-- Price Item Dialog -->
<Dialog.Root bind:open={priceDialog.open}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{priceDialog.item ? 'Edit Paket Tarif' : 'Tambah Paket Tarif'}</Dialog.Title>
			{#if priceDialog.category}
				<Dialog.Description>
					Kategori: <span class="font-medium text-foreground">{priceDialog.category.name}</span>
				</Dialog.Description>
			{/if}
		</Dialog.Header>
		{#if priceDialog.open && priceDialog.category}
			{@const unit = unitLabel(priceDialog.category.unit)}
			<form
				method="POST"
				action={priceDialog.item ? '?/updatePriceItem' : '?/createPriceItem'}
				use:enhance={handleEnhance}
				class="space-y-4"
			>
				<input type="hidden" name="serviceCategoryId" value={priceDialog.category.id} />
				{#if priceDialog.item}
					<input type="hidden" name="id" value={priceDialog.item.id} />
				{/if}
				<div class="space-y-2">
					<Label for="pi-min">Minimal Qty</Label>
					<InputGroup.Root>
						<InputGroup.Input
							id="pi-min"
							name="minQty"
							type="number"
							step="0.01"
							min="0"
							placeholder="1"
							value={priceDialog.item?.minQty ?? ''}
							required
						/>
						<InputGroup.Addon align="inline-end">{unit}</InputGroup.Addon>
					</InputGroup.Root>
					<p class="text-xs text-muted-foreground">
						Tarif ini aktif otomatis saat qty cucian mencapai minimal ini.
					</p>
				</div>
				<div class="space-y-2">
					<Label for="pi-price">Harga per {unit}</Label>
					<InputGroup.Root>
						<InputGroup.Addon align="inline-start">Rp</InputGroup.Addon>
						<InputGroup.Input
							id="pi-price"
							name="price"
							type="number"
							step="1"
							min="1"
							placeholder="7000"
							bind:value={priceValue}
							required
						/>
						<InputGroup.Addon align="inline-end">/ {unit}</InputGroup.Addon>
					</InputGroup.Root>
					<p class="text-xs text-muted-foreground">
						Pratinjau: <span class="font-medium text-foreground tabular-nums">
							{formatRupiah(Number(priceValue) || 0)}/{unit}
						</span>
					</p>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (priceDialog.open = false)}>
						Batal
					</Button>
					<Button type="submit" disabled={submitting} class="gap-2">
						{#if submitting}
							<Spinner class="size-4" />
						{/if}
						Simpan Tarif
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
				{deactivateTarget?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
				{deactivateTarget?.type === 'category' ? 'kategori?' : 'paket tarif?'}
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
				<AlertDialog.Action type="submit" disabled={submitting}>
					{deactivateTarget?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
