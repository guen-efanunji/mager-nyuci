import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

import { auth, db } from '../../../../services';
import { normalizeWa } from '#lib/phone.js';
import { pickPriceItem } from '#lib/order.js';
import type { PageServerLoad, Actions } from './$types';

async function requireAdmin(event: { request: Request }) {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	return session.user;
}

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	const categories = await db.serviceCategory.findMany({
		where: { isActive: true },
		include: { priceItems: { where: { isActive: true }, orderBy: { minQty: 'asc' } } },
		orderBy: { name: 'asc' }
	});
	const customers = await db.customer.findMany({
		where: { isActive: true },
		orderBy: { name: 'asc' },
		select: { id: true, name: true, whatsapp: true }
	});
	return {
		categories: categories.map((c) => ({
			...c,
			priceItems: c.priceItems.map((p) => ({ ...p, minQty: Number(p.minQty) }))
		})),
		customers
	};
};

const itemSchema = z.object({
	categoryId: z.string().min(1),
	qty: z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Qty tidak valid')
});

export const actions: Actions = {
	createOrder: async (event) => {
		const user = await requireAdmin(event);
		const form = await event.request.formData();

		const customerIdRaw = String(form.get('customerId') ?? '').trim();
		const customerName = String(form.get('customerName') ?? '').trim();
		const customerWhatsappRaw = form.get('customerWhatsapp');
		const notes = String(form.get('notes') ?? '').trim() || null;
		const paymentStatusRaw = String(form.get('paymentStatus') ?? 'belum_bayar');
		const paymentStatus = paymentStatusRaw === 'lunas' ? 'lunas' : 'belum_bayar';

		const categoryIds = form.getAll('categoryId').map(String);
		const qtys = form.getAll('qty').map(String);

		if (categoryIds.length === 0 || categoryIds.length !== qtys.length) {
			return fail(400, { message: 'Minimal 1 item cucian' });
		}

		// resolve customer
		let customerId = customerIdRaw || null;
		if (!customerId) {
			if (!customerName) return fail(400, { message: 'Customer wajib dipilih/diisi' });
			const { value: whatsapp, error } = normalizeWa(customerWhatsappRaw);
			if (error) return fail(400, { message: error });
			if (whatsapp) {
				const existing = await db.customer.findUnique({ where: { whatsapp } });
				if (existing) customerId = existing.id;
			}
			if (!customerId) {
				const created = await db.customer.create({
					data: { name: customerName, whatsapp, isActive: true }
				});
				customerId = created.id;
			}
		}

		// validate categories & compute prices
		const categories = await db.serviceCategory.findMany({
			where: { id: { in: categoryIds }, isActive: true },
			include: { priceItems: { where: { isActive: true } } }
		});
		const catMap = new Map(categories.map((c) => [c.id, c]));

		const itemsData: { serviceCategoryId: string; priceItemId: string; qty: number; unitPrice: number; subtotal: number }[] = [];
		let total = 0;
		for (let i = 0; i < categoryIds.length; i++) {
			const cid = categoryIds[i];
			const qty = Number(qtys[i]);
			const cat = catMap.get(cid);
			if (!cat) return fail(400, { message: 'Kategori tidak valid' });
			if (Number.isNaN(qty) || qty <= 0) return fail(400, { message: 'Qty tidak valid' });
			const priceItem = pickPriceItem(
				cat.priceItems.map((p) => ({ ...p, minQty: Number(p.minQty) })),
				qty
			);
			if (!priceItem) return fail(400, { message: `Harga tidak tersedia untuk ${cat.name}` });
			const unitPrice = priceItem.price;
			const subtotal = unitPrice; // harga bertingkat per paket, bukan per kg
			// Note: PRD says price_item price is for min_qty tier; total uses that price
			itemsData.push({
				serviceCategoryId: cid,
				priceItemId: priceItem.id,
				qty,
				unitPrice,
				subtotal
			});
			total += subtotal;
		}

		// generate order code
		const now = new Date();
		const yy = String(now.getFullYear()).slice(-2);
		const mm = String(now.getMonth() + 1).padStart(2, '0');
		const dd = String(now.getDate()).padStart(2, '0');
		const prefix = `LN-${yy}${mm}${dd}-`;
		const countToday = await db.order.count({
			where: { orderCode: { startsWith: prefix } }
		});
		const seq = String(countToday + 1).padStart(4, '0');
		const orderCode = `${prefix}${seq}`;

		const trackingToken = crypto.randomUUID().replace(/-/g, ''); // 32 hex

		const order = await db.order.create({
			data: {
				orderCode,
				customerId: customerId!,
				totalPrice: total,
				status: 'diterima',
				paymentStatus,
				trackingToken,
				notes,
				createdById: user.id,
				items: { create: itemsData }
			}
		});

		throw redirect(303, `/dashboard/orders/${order.id}?created=1`);
	}
};