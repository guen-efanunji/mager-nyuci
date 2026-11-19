import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

import { auth, db } from '../../../services';
import { nextStatus, canCancel } from '#lib/order.js';
import type { PageServerLoad, Actions } from './$types';

async function requireAdmin(event: { request: Request }) {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	return session.user;
}

export const load: PageServerLoad = async (event) => {
	const user = await requireAdmin(event);
	const q = event.url.searchParams.get('q')?.trim() ?? '';
	const status = event.url.searchParams.get('status') ?? 'all';

	const where: Record<string, unknown> = {};
	const and: Record<string, unknown>[] = [];
	if (q) {
		and.push({
			OR: [
				{ orderCode: { contains: q, mode: 'insensitive' } },
				{ customer: { name: { contains: q, mode: 'insensitive' } } }
			]
		});
	}
	if (status !== 'all') and.push({ status });
	if (and.length) where.AND = and;

	const orders = await db.order.findMany({
		where,
		include: { customer: true, items: { include: { serviceCategory: true } } },
		orderBy: { createdAt: 'desc' },
		take: 50
	});
	return {
		orders: orders.map((o) => ({
			...o,
			items: o.items.map((it) => ({ ...it, qty: Number(it.qty) }))
		})),
		q,
		status,
		user
	};
};

export const actions: Actions = {
	advanceStatus: async (event) => {
		const user = await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const order = await db.order.findUnique({ where: { id } });
		if (!order) return fail(404, { message: 'Order tidak ditemukan' });
		const next = nextStatus(order.status as any);
		if (!next) return fail(400, { message: 'Tidak ada tahap berikutnya' });
		const paymentStatus = ['siap_diambil', 'selesai'].includes(next) ? 'lunas' : order.paymentStatus;
		await db.$transaction([
			db.order.update({ where: { id }, data: { status: next, paymentStatus } }),
			db.orderStatusHistory.create({
				data: { orderId: id, statusLama: order.status as any, statusBaru: next, updatedById: user.id }
			})
		]);
		return { success: true };
	}
};