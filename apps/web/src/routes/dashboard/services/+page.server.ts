import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

import { auth, db } from '../../../services';
import type { PageServerLoad, Actions } from './$types';

const categorySchema = z.object({
	name: z.string().trim().min(1, 'Nama wajib diisi').max(100, 'Maksimal 100 karakter'),
	description: z.string().trim().optional().or(z.literal('')),
	unit: z.enum(['kg', 'pcs'], { message: 'Satuan tidak valid' }),
	isActive: z
		.union([z.literal('true'), z.literal('false'), z.boolean()])
		.transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
		.default(true)
});

const priceItemSchema = z.object({
	serviceCategoryId: z.string().min(1, 'Kategori wajib dipilih'),
	minQty: z
		.string()
		.trim()
		.min(1, 'Min qty wajib diisi')
		.refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Min qty tidak valid')
		.transform((v) => Number(v)),
	price: z
		.string()
		.trim()
		.min(1, 'Harga wajib diisi')
		.refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, 'Harga harus angka positif')
		.transform((v) => Number(v))
});

async function requireAdmin(event: { request: Request }) {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	return session.user;
}

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	const url = event.url;
	const q = url.searchParams.get('q')?.trim() ?? '';
	const status = url.searchParams.get('status') ?? 'all';

	const where: Record<string, unknown> = {};
	const and: Record<string, unknown>[] = [];
	if (q) and.push({ name: { contains: q, mode: 'insensitive' } });
	if (status === 'active') and.push({ isActive: true });
	if (status === 'inactive') and.push({ isActive: false });
	if (and.length) where.AND = and;

	const categories = await db.serviceCategory.findMany({
		where,
		include: { priceItems: { orderBy: { minQty: 'asc' } } },
		orderBy: { createdAt: 'desc' }
	});

	return {
		categories: categories.map((c) => ({
			...c,
			priceItems: c.priceItems.map((p) => ({
				...p,
				minQty: Number(p.minQty)
			}))
		})),
		q,
		status
	};
};

export const actions: Actions = {
	createCategory: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const parsed = categorySchema.safeParse({
			name: form.get('name'),
			description: form.get('description') ?? '',
			unit: form.get('unit'),
			isActive: form.get('isActive') ?? 'true'
		});
		if (!parsed.success) {
			return fail(400, { action: 'createCategory', errors: parsed.error.flatten().fieldErrors });
		}
		const { name, description, unit, isActive } = parsed.data;
		try {
			await db.serviceCategory.create({
				data: { name, description: description || null, unit, isActive }
			});
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(400, {
					action: 'createCategory',
					errors: { name: ['Nama kategori sudah digunakan'] }
				});
			}
			return fail(500, { action: 'createCategory', message: 'Gagal menyimpan kategori' });
		}
		return { success: true, action: 'createCategory' };
	},

	updateCategory: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { action: 'updateCategory', message: 'ID tidak valid' });
		const parsed = categorySchema.safeParse({
			name: form.get('name'),
			description: form.get('description') ?? '',
			unit: form.get('unit'),
			isActive: form.get('isActive') ?? 'true'
		});
		if (!parsed.success) {
			return fail(400, { action: 'updateCategory', errors: parsed.error.flatten().fieldErrors });
		}
		const { name, description, unit, isActive } = parsed.data;
		try {
			await db.serviceCategory.update({
				where: { id },
				data: { name, description: description || null, unit, isActive }
			});
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(400, {
					action: 'updateCategory',
					errors: { name: ['Nama kategori sudah digunakan'] }
				});
			}
			return fail(500, { action: 'updateCategory', message: 'Gagal memperbarui kategori' });
		}
		return { success: true, action: 'updateCategory' };
	},

	toggleCategory: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const isActive = String(form.get('isActive') ?? '') === 'true';
		if (!id) return fail(400, { action: 'toggleCategory', message: 'ID tidak valid' });
		try {
			await db.serviceCategory.update({ where: { id }, data: { isActive } });
		} catch {
			return fail(500, { action: 'toggleCategory', message: 'Gagal mengubah status' });
		}
		return { success: true, action: 'toggleCategory' };
	},

	createPriceItem: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const parsed = priceItemSchema.safeParse({
			serviceCategoryId: form.get('serviceCategoryId'),
			minQty: form.get('minQty'),
			price: form.get('price')
		});
		if (!parsed.success) {
			return fail(400, { action: 'createPriceItem', errors: parsed.error.flatten().fieldErrors });
		}
		const { serviceCategoryId, minQty, price } = parsed.data;
		try {
			await db.priceItem.create({
				data: { serviceCategoryId, minQty, price, isActive: true }
			});
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(400, {
					action: 'createPriceItem',
					errors: { minQty: ['Min qty sudah ada untuk kategori ini'] }
				});
			}
			return fail(500, { action: 'createPriceItem', message: 'Gagal menyimpan harga' });
		}
		return { success: true, action: 'createPriceItem' };
	},

	updatePriceItem: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { action: 'updatePriceItem', message: 'ID tidak valid' });
		const parsed = priceItemSchema.safeParse({
			serviceCategoryId: form.get('serviceCategoryId'),
			minQty: form.get('minQty'),
			price: form.get('price')
		});
		if (!parsed.success) {
			return fail(400, { action: 'updatePriceItem', errors: parsed.error.flatten().fieldErrors });
		}
		const { minQty, price } = parsed.data;
		try {
			await db.priceItem.update({ where: { id }, data: { minQty, price } });
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(400, {
					action: 'updatePriceItem',
					errors: { minQty: ['Min qty sudah ada untuk kategori ini'] }
				});
			}
			return fail(500, { action: 'updatePriceItem', message: 'Gagal memperbarui harga' });
		}
		return { success: true, action: 'updatePriceItem' };
	},

	togglePriceItem: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const isActive = String(form.get('isActive') ?? '') === 'true';
		if (!id) return fail(400, { action: 'togglePriceItem', message: 'ID tidak valid' });
		try {
			await db.priceItem.update({ where: { id }, data: { isActive } });
		} catch {
			return fail(500, { action: 'togglePriceItem', message: 'Gagal mengubah status' });
		}
		return { success: true, action: 'togglePriceItem' };
	}
};