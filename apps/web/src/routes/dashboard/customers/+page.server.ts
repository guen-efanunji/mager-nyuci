import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

import { auth, db } from '../../../services';
import { normalizeWa } from '#lib/phone.js';
import type { PageServerLoad, Actions } from './$types';

async function requireAdmin(event: { request: Request }) {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	return session.user;
}

const customerSchema = z.object({
	name: z.string().trim().min(1, 'Nama wajib diisi').max(100, 'Maksimal 100 karakter'),
	whatsapp: z.string().optional().or(z.literal(''))
});

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	const q = event.url.searchParams.get('q')?.trim() ?? '';
	const status = event.url.searchParams.get('status') ?? 'all';

	const where: Record<string, unknown> = {};
	const and: Record<string, unknown>[] = [];
	if (q) {
		and.push({
			OR: [
				{ name: { contains: q, mode: 'insensitive' } },
				{ whatsapp: { contains: q, mode: 'insensitive' } }
			]
		});
	}
	if (status === 'active') and.push({ isActive: true });
	if (status === 'inactive') and.push({ isActive: false });
	if (and.length) where.AND = and;

	const [customers, totalCustomers, activeCustomers, totalOrders] = await Promise.all([
		db.customer.findMany({
			where,
			include: {
				orders: {
					select: {
						id: true,
						orderCode: true,
						totalPrice: true,
						status: true,
						paymentStatus: true,
						createdAt: true
					},
					orderBy: { createdAt: 'desc' }
				}
			},
			orderBy: { createdAt: 'desc' }
		}),
		db.customer.count(),
		db.customer.count({ where: { isActive: true } }),
		db.order.count({ where: { status: { not: 'dibatalkan' } } })
	]);

	return {
		customers: customers.map((c) => ({
			...c,
			orderCount: c.orders.length,
			totalSpent: c.orders
				.filter((o) => o.status !== 'dibatalkan')
				.reduce((sum, o) => sum + o.totalPrice, 0),
			orders: c.orders.map((o) => ({ ...o, totalPrice: o.totalPrice }))
		})),
		stats: {
			totalCustomers,
			activeCustomers,
			totalOrders
		},
		q,
		status
	};
};

export const actions: Actions = {
	createCustomer: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const parsed = customerSchema.safeParse({
			name: form.get('name'),
			whatsapp: form.get('whatsapp') ?? ''
		});
		if (!parsed.success) {
			return fail(400, { action: 'createCustomer', errors: parsed.error.flatten().fieldErrors });
		}
		const { name } = parsed.data;
		const { value: whatsapp, error: waError } = normalizeWa(parsed.data.whatsapp);
		if (waError) {
			return fail(400, { action: 'createCustomer', errors: { whatsapp: [waError] } });
		}
		if (whatsapp) {
			const existing = await db.customer.findUnique({ where: { whatsapp } });
			if (existing) {
				return fail(409, {
					action: 'createCustomer',
					message: `Nomor sudah terdaftar atas nama ${existing.name}`,
					existingCustomerId: existing.id,
					existingCustomerName: existing.name
				});
			}
		}
		try {
			await db.customer.create({ data: { name, whatsapp, isActive: true } });
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(400, { action: 'createCustomer', message: 'Nomor WhatsApp sudah digunakan' });
			}
			return fail(500, { action: 'createCustomer', message: 'Gagal menyimpan customer' });
		}
		return { success: true, action: 'createCustomer', info: 'Customer baru berhasil ditambahkan' };
	},

	updateCustomer: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { action: 'updateCustomer', message: 'ID tidak valid' });
		const parsed = customerSchema.safeParse({
			name: form.get('name'),
			whatsapp: form.get('whatsapp') ?? ''
		});
		if (!parsed.success) {
			return fail(400, { action: 'updateCustomer', errors: parsed.error.flatten().fieldErrors });
		}
		const { name } = parsed.data;
		const { value: whatsapp, error: waError } = normalizeWa(parsed.data.whatsapp);
		if (waError) {
			return fail(400, { action: 'updateCustomer', errors: { whatsapp: [waError] } });
		}
		if (whatsapp) {
			const existing = await db.customer.findUnique({ where: { whatsapp } });
			if (existing && existing.id !== id) {
				return fail(409, {
					action: 'updateCustomer',
					message: `Nomor sudah terdaftar atas nama ${existing.name}`,
					existingCustomerId: existing.id
				});
			}
		}
		try {
			await db.customer.update({ where: { id }, data: { name, whatsapp } });
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(400, { action: 'updateCustomer', message: 'Nomor WhatsApp sudah digunakan' });
			}
			return fail(500, { action: 'updateCustomer', message: 'Gagal memperbarui customer' });
		}
		return { success: true, action: 'updateCustomer', info: 'Data customer diperbarui' };
	},

	toggleCustomer: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const isActive = String(form.get('isActive') ?? '') === 'true';
		if (!id) return fail(400, { action: 'toggleCustomer', message: 'ID tidak valid' });
		try {
			await db.customer.update({ where: { id }, data: { isActive } });
		} catch {
			return fail(500, { action: 'toggleCustomer', message: 'Gagal mengubah status customer' });
		}
		return {
			success: true,
			action: 'toggleCustomer',
			info: isActive ? 'Customer diaktifkan kembali' : 'Customer dinonaktifkan'
		};
	},

	deleteCustomer: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { action: 'deleteCustomer', message: 'ID tidak valid' });
		const customer = await db.customer.findUnique({
			where: { id },
			include: { _count: { select: { orders: true } } }
		});
		if (!customer) {
			return fail(404, { action: 'deleteCustomer', message: 'Customer tidak ditemukan' });
		}
		if (customer._count.orders > 0) {
			await db.customer.update({ where: { id }, data: { isActive: false } });
			return {
				success: true,
				action: 'deleteCustomer',
				info: 'Customer dinonaktifkan karena memiliki riwayat order'
			};
		}
		await db.customer.delete({ where: { id } });
		return { success: true, action: 'deleteCustomer', info: 'Customer berhasil dihapus' };
	}
};
