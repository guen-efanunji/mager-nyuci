<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '#lib/utils.js';
	import { pickPriceItem } from '#lib/order.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Command from '#lib/components/ui/command/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart';

	let { data, form } = $props();

	type Item = { categoryId: string; qty: string };
	let items = $state<Item[]>([{ categoryId: '', qty: '' }]);
	let customerId = $state('');
	let customerOpen = $state(false);
	let notes = $state('');

	$effect(() => {
		if (form?.message) toast.error(form.message);
	});

	function addItem() {
		items = [...items, { categoryId: '', qty: '' }];
	}
	function removeItem(i: number) {
		items = items.filter((_, idx) => idx !== i);
		if (items.length === 0) items = [{ categoryId: '', qty: '' }];
	}

	const categories = $derived(data.categories);

	function itemPrice(item: Item): number {
		const cat = categories.find((c: any) => c.id === item.categoryId);
		if (!cat || !item.qty) return 0;
		const qty = Number(item.qty);
		if (Number.isNaN(qty) || qty <= 0) return 0;
		const pi = pickPriceItem(cat.priceItems.map((p: any) => ({ ...p, minQty: Number(p.minQty) })), qty);
		return pi ? pi.price : 0;
	}

	const total = $derived(items.reduce((sum, it) => sum + itemPrice(it), 0));

	const catName = (id: string) => categories.find((c: any) => c.id === id)?.name ?? 'Pilih layanan';
</script>

<svelte:head>
	<title>Order Baru — KiloTrack</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Order Baru</h1>
			<p class="text-sm text-muted-foreground">Input cucian seperti kasir POS.</p>
		</div>
		<Button variant="secondary" href="/dashboard/orders">Batal</Button>
	</div>

	{#if form?.message}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.message}</div>
	{/if}

	<form method="POST" action="?/createOrder" use:enhance class="grid gap-6 lg:grid-cols-[1fr_320px]">
		<!-- Left: Customer + Items -->
		<div class="space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Customer</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<Label>Pilih Customer</Label>
						<Popover.Root bind:open={customerOpen}>
							<Popover.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										role="combobox"
										aria-expanded={customerOpen}
										class="w-full justify-between"
									>
										{customerId ? data.customers.find((c: any) => c.id === customerId)?.name ?? 'Pilih customer' : '— Customer baru —'}
										<ChevronsUpDownIcon class="size-4 opacity-50" />
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-[320px] p-0">
								<Command.Root>
									<Command.Input placeholder="Cari customer..." />
									<Command.List>
										<Command.Empty>Tidak ditemukan.</Command.Empty>
										<Command.Group>
											<Command.Item
												value=""
												onSelect={() => {
													customerId = '';
													customerOpen = false;
												}}
											>
												<CheckIcon class={`mr-2 size-4 ${customerId === '' ? 'opacity-100' : 'opacity-0'}`} />
												— Customer baru —
											</Command.Item>
											{#each data.customers as c (c.id)}
												<Command.Item
													value={c.name}
													onSelect={() => {
														customerId = c.id;
														customerOpen = false;
													}}
												>
													<CheckIcon class={`mr-2 size-4 ${customerId === c.id ? 'opacity-100' : 'opacity-0'}`} />
													{c.name} {c.whatsapp ? `(${c.whatsapp})` : ''}
												</Command.Item>
											{/each}
										</Command.Group>
									</Command.List>
								</Command.Root>
							</Popover.Content>
						</Popover.Root>
						<input type="hidden" name="customerId" value={customerId} />
					</div>

					{#if !customerId}
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for="cn">Nama Customer *</Label>
								<Input id="cn" name="customerName" required placeholder="Nama" />
							</div>
							<div class="space-y-2">
								<Label for="cw">No. WhatsApp</Label>
								<Input id="cw" name="customerWhatsapp" placeholder="0812..." />
							</div>
						</div>
					{/if}
					<div class="space-y-2">
						<Label for="notes">Catatan</Label>
						<Textarea id="notes" name="notes" rows={2} bind:value={notes} />
					</div>
					<div class="space-y-2">
						<Label>Status Pembayaran</Label>
						<Select.Root type="single" name="paymentStatus" value="belum_bayar">
							<Select.Trigger class="w-full">
								Belum Bayar
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="belum_bayar">Belum Bayar</Select.Item>
								<Select.Item value="lunas">Lunas (bayar di awal)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title>Rincian Cucian</Card.Title>
					<Button type="button" variant="secondary" size="sm" onclick={addItem} class="gap-1">
						<PlusIcon class="size-3" /> Tambah Item
					</Button>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#each items as item, i (i)}
						<div class="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_110px_120px_auto]">
							<div class="space-y-1">
								<Label>Layanan</Label>
								<Select.Root type="single" bind:value={item.categoryId}>
									<Select.Trigger class="w-full">
										{catName(item.categoryId)}
									</Select.Trigger>
									<Select.Content>
										{#each categories as c (c.id)}
											<Select.Item value={c.id}>{c.name} ({c.unit})</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<input type="hidden" name="categoryId" value={item.categoryId} />
							</div>
							<div class="space-y-1">
								<Label>Qty</Label>
								<Input name="qty" type="number" step="0.01" min="0.01" bind:value={item.qty} />
							</div>
							<div class="space-y-1">
								<Label>Harga</Label>
								<div class="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
									{formatRupiah(itemPrice(item))}
								</div>
							</div>
							<div class="flex items-end justify-end">
								<Button type="button" variant="ghost" size="icon" onclick={() => removeItem(i)}>
									<Trash2Icon class="size-4" />
								</Button>
							</div>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right: Summary -->
		<div class="lg:sticky lg:top-20">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<ShoppingCartIcon class="size-5" /> Ringkasan
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Jumlah item</span>
						<span class="font-medium">{items.filter((i) => i.categoryId).length}</span>
					</div>
					<div class="flex items-center justify-between border-t pt-3">
						<span class="font-semibold">Total</span>
						<span class="text-2xl font-bold tabular-nums">{formatRupiah(total)}</span>
					</div>
					<Button type="submit" class="w-full" size="lg">Simpan Order</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</form>
</div>