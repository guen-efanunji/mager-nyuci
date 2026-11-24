<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { cn, formatRupiah } from '#lib/utils.js';
	import { pickPriceItem, type PaymentStatus } from '#lib/order.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Command from '#lib/components/ui/command/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import PackageIcon from '@lucide/svelte/icons/package';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import UserIcon from '@lucide/svelte/icons/user';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import XIcon from '@lucide/svelte/icons/x';

	let { data, form } = $props();

	type CustomerMode = 'existing' | 'new';
	type Item = { uid: number; categoryId: string; qty: string };

	const categories = $derived(data.categories);
	const customers = $derived(data.customers);

	let customerMode = $state<CustomerMode>('existing');
	let customerModeInitialized = $state(false);
	let customerId = $state('');
	let customerOpen = $state(false);
	let customerName = $state('');
	let customerWhatsapp = $state('');
	let notes = $state('');
	let paymentStatus = $state<PaymentStatus>('belum_bayar');
	let submitting = $state(false);

	let nextUid = 2;
	let items = $state<Item[]>([{ uid: 1, categoryId: '', qty: '' }]);

	const quickNotes = ['Pisah baju luntur', 'Tanpa pewangi', 'Setrika rapi', 'Packing terpisah'];

	$effect(() => {
		if (!customerModeInitialized) {
			customerMode = customers.length > 0 ? 'existing' : 'new';
			customerModeInitialized = true;
		}
	});

	$effect(() => {
		if (form?.message) toast.error(form.message);
	});

	const selectedCustomer = $derived(customers.find((c) => c.id === customerId) ?? null);

	function initialsOf(name: string): string {
		const parts = name.trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) return 'C';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}

	function addItem() {
		items = [...items, { uid: nextUid++, categoryId: '', qty: '' }];
	}

	function removeItem(uid: number) {
		if (items.length <= 1) {
			items = [{ uid: nextUid++, categoryId: '', qty: '' }];
			return;
		}
		items = items.filter((it) => it.uid !== uid);
	}

	function getCategory(id: string) {
		return categories.find((c) => c.id === id) ?? null;
	}

	function getPriceInfo(item: Item) {
		const cat = getCategory(item.categoryId);
		const qtyNum = Number(item.qty);
		const hasQtyInput = item.qty !== '' && !Number.isNaN(qtyNum) && qtyNum > 0;
		const sortedTiers = cat ? [...cat.priceItems].sort((a, b) => a.minQty - b.minQty) : [];
		const minTier = sortedTiers[0] ?? null;
		const matchedTier = cat && hasQtyInput ? pickPriceItem(cat.priceItems, qtyNum) : null;
		const belowMinTier = Boolean(cat && hasQtyInput && minTier && !matchedTier);
		return {
			cat,
			qtyNum,
			hasQtyInput,
			sortedTiers,
			minTier,
			matchedTier,
			belowMinTier,
			price: matchedTier ? matchedTier.price : 0
		};
	}

	const itemSummaries = $derived(
		items.map((item) => ({
			item,
			info: getPriceInfo(item)
		}))
	);

	const validItems = $derived(itemSummaries.filter((row) => row.info.matchedTier !== null));
	const allItemsValid = $derived(
		items.length > 0 && itemSummaries.every((row) => row.info.matchedTier !== null)
	);
	const total = $derived(itemSummaries.reduce((sum, row) => sum + row.info.price, 0));

	const customerReady = $derived(
		customerMode === 'existing' ? Boolean(selectedCustomer) : customerName.trim().length > 0
	);
	const canSubmit = $derived(customerReady && allItemsValid && categories.length > 0);

	function hasQuickNote(chip: string): boolean {
		return notes
			.split(',')
			.map((p) => p.trim())
			.includes(chip);
	}

	const selectedQuickNotes = $derived(quickNotes.filter((chip) => hasQuickNote(chip)));

	function onQuickNotesChange(nextSelected: string[]) {
		const customParts = notes
			.split(',')
			.map((p) => p.trim())
			.filter((p) => Boolean(p) && !quickNotes.includes(p));
		notes = [...nextSelected, ...customParts].join(', ');
	}
</script>

<svelte:head>
	<title>Order Baru — KiloTrack</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" href="/dashboard/orders" class="-ms-2">
					<ArrowLeftIcon data-icon="inline-start" />
					Kembali ke Order
				</Button>
			</div>
			<h1 class="text-2xl font-bold tracking-tight">Buat Order Baru</h1>
			<p class="text-sm text-muted-foreground">
				Pilih pelanggan, input cucian masuk, dan cek total tagihan sebelum menyimpan.
			</p>
		</div>
		<Button variant="outline" href="/dashboard/orders">Batal</Button>
	</div>

	{#if form?.message}
		<Alert.Root variant="destructive">
			<CircleAlertIcon />
			<Alert.Title>Order belum bisa disimpan</Alert.Title>
			<Alert.Description>{form.message}</Alert.Description>
		</Alert.Root>
	{/if}

	<form
		method="POST"
		action="?/createOrder"
		use:enhance={() => {
			submitting = true;
			return async ({ result, update }) => {
				try {
					await update();
				} finally {
					if (result.type !== 'redirect') {
						submitting = false;
					}
				}
			};
		}}
		class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
	>
		<!-- Left Column: Customer, Items, Notes -->
		<div class="flex flex-col gap-6">
			<!-- Section 1: Customer -->
			<Card.Root>
				<Card.Header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex flex-col gap-1">
						<Card.Title>1. Data Pelanggan</Card.Title>
						<Card.Description>
							Cari pelanggan terdaftar atau daftarkan pelanggan baru langsung.
						</Card.Description>
					</div>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						size="sm"
						value={customerMode}
						onValueChange={(v) => {
							if (v === 'existing' || v === 'new') {
								customerMode = v;
							}
						}}
					>
						<ToggleGroup.Item value="existing" disabled={customers.length === 0}>
							<UserIcon data-icon="inline-start" />
							Pelanggan Lama
						</ToggleGroup.Item>
						<ToggleGroup.Item value="new">
							<UserPlusIcon data-icon="inline-start" />
							Pelanggan Baru
						</ToggleGroup.Item>
					</ToggleGroup.Root>
				</Card.Header>

				<Card.Content>
					<input
						type="hidden"
						name="customerId"
						value={customerMode === 'existing' ? customerId : ''}
					/>

					{#if customerMode === 'existing'}
						<Field.FieldGroup>
							<Field.Field>
								<Field.FieldLabel for="customer-combobox">Cari Pelanggan</Field.FieldLabel>
								<Popover.Root bind:open={customerOpen}>
									<Popover.Trigger>
										{#snippet child({ props })}
											<Button
												{...props}
												id="customer-combobox"
												variant="outline"
												role="combobox"
												aria-expanded={customerOpen}
												class="w-full justify-between font-normal"
											>
												{#if selectedCustomer}
													<span class="flex items-center gap-2 truncate">
														<span class="font-medium text-foreground">{selectedCustomer.name}</span>
														{#if selectedCustomer.whatsapp}
															<span class="text-xs text-muted-foreground">
																{selectedCustomer.whatsapp}
															</span>
														{/if}
													</span>
												{:else}
													<span class="text-muted-foreground">
														Pilih nama atau nomor WhatsApp pelanggan...
													</span>
												{/if}
												<ChevronsUpDownIcon data-icon="inline-end" class="opacity-50" />
											</Button>
										{/snippet}
									</Popover.Trigger>
									<Popover.Content
										align="start"
										class="w-[var(--bits-popover-anchor-width)] min-w-72 p-0"
									>
										<Command.Root>
											<Command.Input placeholder="Ketik nama atau nomor WA..." />
											<Command.List>
												<Command.Empty>
													<div class="flex flex-col items-center gap-2 py-2 text-center">
														<p class="text-sm text-muted-foreground">Pelanggan tidak ditemukan.</p>
														<Button
															type="button"
															variant="secondary"
															size="sm"
															onclick={() => {
																customerOpen = false;
																customerMode = 'new';
															}}
														>
															<UserPlusIcon data-icon="inline-start" />
															Input sebagai Pelanggan Baru
														</Button>
													</div>
												</Command.Empty>
												<Command.Group>
													{#each customers as c (c.id)}
														<Command.Item
															value={`${c.name} ${c.whatsapp ?? ''}`}
															onSelect={() => {
																customerId = c.id;
																customerOpen = false;
															}}
														>
															<CheckIcon
																class={cn(
																	'mr-2 size-4 shrink-0',
																	customerId === c.id ? 'opacity-100' : 'opacity-0'
																)}
															/>
															<div class="flex min-w-0 flex-1 items-center justify-between gap-2">
																<span class="truncate font-medium">{c.name}</span>
																{#if c.whatsapp}
																	<span class="shrink-0 text-xs text-muted-foreground tabular-nums">
																		{c.whatsapp}
																	</span>
																{/if}
															</div>
														</Command.Item>
													{/each}
												</Command.Group>
											</Command.List>
										</Command.Root>
									</Popover.Content>
								</Popover.Root>
								{#if !selectedCustomer}
									<Field.FieldDescription>
										Belum ada pelanggan dipilih. Pilih dari daftar atau klik "Pelanggan Baru".
									</Field.FieldDescription>
								{/if}
							</Field.Field>

							{#if selectedCustomer}
								<div
									class="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3"
								>
									<div class="flex min-w-0 items-center gap-3">
										<Avatar.Root class="size-9">
											<Avatar.Fallback>{initialsOf(selectedCustomer.name)}</Avatar.Fallback>
										</Avatar.Root>
										<div class="flex min-w-0 flex-col">
											<span class="truncate text-sm font-semibold">{selectedCustomer.name}</span>
											<span class="text-xs text-muted-foreground">
												{selectedCustomer.whatsapp ?? 'Belum ada nomor WhatsApp'}
											</span>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => {
											customerId = '';
											customerOpen = true;
										}}
									>
										<XIcon data-icon="inline-start" />
										Ganti
									</Button>
								</div>
							{/if}
						</Field.FieldGroup>
					{:else}
						<Field.FieldGroup class="grid gap-4 sm:grid-cols-2">
							<Field.Field>
								<Field.FieldLabel for="cn">Nama Pelanggan *</Field.FieldLabel>
								<InputGroup.Root>
									<InputGroup.Addon>
										<UserIcon />
									</InputGroup.Addon>
									<InputGroup.Input
										id="cn"
										name="customerName"
										required
										bind:value={customerName}
										placeholder="Contoh: Kak Budi"
									/>
								</InputGroup.Root>
							</Field.Field>
							<Field.Field>
								<Field.FieldLabel for="cw">No. WhatsApp</Field.FieldLabel>
								<InputGroup.Root>
									<InputGroup.Addon>
										<PhoneIcon />
									</InputGroup.Addon>
									<InputGroup.Input
										id="cw"
										name="customerWhatsapp"
										type="tel"
										bind:value={customerWhatsapp}
										placeholder="08123456789"
									/>
								</InputGroup.Root>
								<Field.FieldDescription>
									Opsional. Format 08xxx atau 628xxx untuk kirim nota WA.
								</Field.FieldDescription>
							</Field.Field>
						</Field.FieldGroup>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Section 2: Laundry Items -->
			<Card.Root>
				<Card.Header class="flex flex-row items-start justify-between gap-3">
					<div class="flex flex-col gap-1">
						<Card.Title>2. Rincian Cucian</Card.Title>
						<Card.Description>
							Pilih jenis layanan dan masukkan berat atau jumlah item. Harga mengikuti tarif paket.
						</Card.Description>
					</div>
					{#if categories.length > 0}
						<Button type="button" variant="outline" size="sm" onclick={addItem}>
							<PlusIcon data-icon="inline-start" />
							Tambah Item
						</Button>
					{/if}
				</Card.Header>

				<Card.Content class="flex flex-col gap-3">
					{#if categories.length === 0}
						<Empty.Root>
							<Empty.Header>
								<Empty.Media variant="icon">
									<PackageIcon />
								</Empty.Media>
								<Empty.Title>Belum ada layanan aktif</Empty.Title>
								<Empty.Description>
									Tambahkan kategori layanan dan daftar harga terlebih dahulu sebelum mencatat
									order.
								</Empty.Description>
							</Empty.Header>
							<Empty.Content>
								<Button href="/dashboard/services">Atur Layanan & Harga</Button>
							</Empty.Content>
						</Empty.Root>
					{:else}
						{#each itemSummaries as { item, info }, idx (item.uid)}
							<div
								class={cn(
									'flex flex-col gap-3 rounded-lg border p-4 transition-colors',
									info.belowMinTier ? 'border-destructive/50 bg-destructive/5' : 'bg-card'
								)}
							>
								<div class="flex items-center justify-between gap-2">
									<div class="flex items-center gap-2">
										<Badge variant="secondary">Item #{idx + 1}</Badge>
										{#if info.cat}
											<Badge variant="outline">{info.cat.unit}</Badge>
										{/if}
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										aria-label={`Hapus item ${idx + 1}`}
										disabled={items.length === 1 && !item.categoryId && !item.qty}
										onclick={() => removeItem(item.uid)}
									>
										<Trash2Icon />
									</Button>
								</div>

								<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_140px]">
									<Field.Field>
										<Field.FieldLabel for={`cat-${item.uid}`}>Layanan</Field.FieldLabel>
										<Select.Root type="single" bind:value={item.categoryId}>
											<Select.Trigger id={`cat-${item.uid}`} class="w-full">
												{#if info.cat}
													<span class="truncate">{info.cat.name}</span>
												{:else}
													<span class="text-muted-foreground">Pilih layanan...</span>
												{/if}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													{#each categories as c (c.id)}
														{@const lowest = c.priceItems[0]}
														<Select.Item value={c.id}>
															<div class="flex w-full items-center justify-between gap-4">
																<span>{c.name} ({c.unit})</span>
																{#if lowest}
																	<span class="text-xs text-muted-foreground tabular-nums">
																		mulai {formatRupiah(lowest.price)}
																	</span>
																{/if}
															</div>
														</Select.Item>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
										<input type="hidden" name="categoryId" value={item.categoryId} />
									</Field.Field>

									<Field.Field data-invalid={info.belowMinTier ? true : undefined}>
										<Field.FieldLabel for={`qty-${item.uid}`}>Qty</Field.FieldLabel>
										<InputGroup.Root>
											<InputGroup.Input
												id={`qty-${item.uid}`}
												name="qty"
												type="number"
												step="0.01"
												min="0.01"
												placeholder="0"
												aria-invalid={info.belowMinTier ? true : undefined}
												bind:value={item.qty}
											/>
											<InputGroup.Addon align="inline-end">
												{info.cat?.unit ?? 'unit'}
											</InputGroup.Addon>
										</InputGroup.Root>
									</Field.Field>

									<Field.Field>
										<Field.FieldLabel>Subtotal</Field.FieldLabel>
										<div
											class={cn(
												'flex h-9 items-center justify-end rounded-md border px-3 text-sm font-semibold tabular-nums',
												info.matchedTier
													? 'bg-muted/40 text-foreground'
													: 'bg-muted/20 text-muted-foreground'
											)}
										>
											{formatRupiah(info.price)}
										</div>
									</Field.Field>
								</div>

								{#if info.cat}
									<div class="flex flex-wrap items-center justify-between gap-2 text-xs">
										{#if info.belowMinTier && info.minTier}
											<span class="font-medium text-destructive">
												Minimal order untuk layanan ini {info.minTier.minQty}
												{info.cat.unit} ({formatRupiah(info.minTier.price)}).
											</span>
										{:else if info.matchedTier}
											<span class="text-muted-foreground">
												Tarif aktif: Paket &ge; {info.matchedTier.minQty}
												{info.cat.unit} ({formatRupiah(info.matchedTier.price)})
											</span>
										{:else if info.sortedTiers.length > 0}
											<span class="text-muted-foreground">
												Paket tersedia:
												{info.sortedTiers
													.map((p) => `≥${p.minQty} ${info.cat?.unit} (${formatRupiah(p.price)})`)
													.join(' · ')}
											</span>
										{:else}
											<span class="font-medium text-destructive">
												Belum ada tarif aktif untuk layanan ini.
											</span>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					{/if}
				</Card.Content>

				{#if categories.length > 0 && items.length > 1}
					<Separator />
					<Card.Footer class="justify-end">
						<Button type="button" variant="secondary" size="sm" onclick={addItem}>
							<PlusIcon data-icon="inline-start" />
							Tambah Item Lain
						</Button>
					</Card.Footer>
				{/if}
			</Card.Root>

			<!-- Section 3: Order Notes -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between gap-2">
						<Card.Title>3. Catatan Order</Card.Title>
						<Badge variant="outline">Opsional</Badge>
					</div>
					<Card.Description>
						Tambahkan instruksi khusus pengerjaan atau permintaan pelanggan.
					</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-3">
					<ToggleGroup.Root
						type="multiple"
						variant="outline"
						size="sm"
						spacing={2}
						class="flex-wrap"
						value={selectedQuickNotes}
						onValueChange={onQuickNotesChange}
					>
						{#each quickNotes as chip (chip)}
							<ToggleGroup.Item value={chip}>{chip}</ToggleGroup.Item>
						{/each}
					</ToggleGroup.Root>
					<Field.Field>
						<Field.FieldLabel for="notes" class="sr-only">Catatan</Field.FieldLabel>
						<Textarea
							id="notes"
							name="notes"
							rows={2}
							placeholder="Contoh: Pisahkan pakaian putih, jangan pakai pewangi..."
							bind:value={notes}
						/>
					</Field.Field>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right Column: Sticky Order Summary & Payment -->
		<div class="lg:sticky lg:top-20">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<ShoppingCartIcon class="size-5" />
						Ringkasan Order
					</Card.Title>
					<Card.Description>
						{#if customerMode === 'existing' && selectedCustomer}
							Pelanggan: <span class="font-medium text-foreground">{selectedCustomer.name}</span>
						{:else if customerMode === 'new' && customerName.trim()}
							Pelanggan baru: <span class="font-medium text-foreground">{customerName.trim()}</span>
						{:else}
							Belum ada pelanggan dipilih
						{/if}
					</Card.Description>
				</Card.Header>

				<Card.Content class="flex flex-col gap-4">
					<!-- Live Receipt Preview -->
					<div class="flex flex-col gap-2">
						{#if validItems.length === 0}
							<div
								class="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground"
							>
								Item cucian yang valid akan tampil di sini.
							</div>
						{:else}
							{#each validItems as { item, info } (item.uid)}
								<div class="flex items-start justify-between gap-2 text-sm">
									<div class="flex min-w-0 flex-col">
										<span class="truncate font-medium">{info.cat?.name}</span>
										<span class="text-xs text-muted-foreground">
											{item.qty}
											{info.cat?.unit}
										</span>
									</div>
									<span class="shrink-0 font-medium tabular-nums">
										{formatRupiah(info.price)}
									</span>
								</div>
							{/each}
						{/if}
					</div>

					<Separator />

					<!-- Payment Status -->
					<Field.Field>
						<Field.FieldLabel>Status Pembayaran</Field.FieldLabel>
						<ToggleGroup.Root
							type="single"
							variant="outline"
							class="w-full"
							value={paymentStatus}
							onValueChange={(v) => {
								if (v === 'belum_bayar' || v === 'lunas') {
									paymentStatus = v;
								}
							}}
						>
							<ToggleGroup.Item value="belum_bayar" class="flex-1">Belum Bayar</ToggleGroup.Item>
							<ToggleGroup.Item value="lunas" class="flex-1">Lunas</ToggleGroup.Item>
						</ToggleGroup.Root>
						<input type="hidden" name="paymentStatus" value={paymentStatus} />
						<Field.FieldDescription>
							{paymentStatus === 'lunas'
								? 'Order langsung dicatat sebagai lunas di awal.'
								: 'Pembayaran dapat ditagihkan saat cucian selesai.'}
						</Field.FieldDescription>
					</Field.Field>

					<Separator />

					<!-- Total -->
					<div class="flex items-baseline justify-between gap-2">
						<div class="flex flex-col">
							<span class="text-sm font-semibold">Total Tagihan</span>
							<span class="text-xs text-muted-foreground">{validItems.length} item valid</span>
						</div>
						<span class="text-2xl font-bold tracking-tight tabular-nums text-primary">
							{formatRupiah(total)}
						</span>
					</div>
				</Card.Content>

				<Card.Footer class="flex flex-col gap-2">
					<Button type="submit" size="lg" class="w-full" disabled={submitting || !canSubmit}>
						{#if submitting}
							<Spinner data-icon="inline-start" />
							Menyimpan Order...
						{:else}
							<CircleCheckIcon data-icon="inline-start" />
							Simpan Order
						{/if}
					</Button>
					<p class="text-center text-xs text-muted-foreground">
						{#if !customerReady}
							Lengkapi data pelanggan terlebih dahulu.
						{:else if !allItemsValid}
							Pastikan setiap baris layanan dan qty sudah sesuai tarif minimum.
						{:else}
							Nota &amp; QR code tracking dibuat otomatis setelah disimpan.
						{/if}
					</p>
				</Card.Footer>
			</Card.Root>
		</div>
	</form>
</div>
