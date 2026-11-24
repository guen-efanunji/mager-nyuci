import { fail, redirect } from '@sveltejs/kit';

import { auth, db } from '../../../services';
import { nextStatus, type OrderStatus } from '#lib/order.js';
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
	const payment = event.url.searchParams.get('payment') ?? 'all';

	const where: Record<string, unknown> = {};
	const and: Record<string, unknown>[] = [];
	if (q) {
		and.push({
			OR: [
				{ orderCode: { contains: q, mode: 'insensitive' } },
				{ customer: { name: { contains: q, mode: 'insensitive' } } },
				{ customer: { whatsapp: { contains: q, mode: 'insensitive' } } }
			]
		});
	}
	if (status !== 'all') and.push({ status });
	if (payment === 'lunas' || payment === 'belum_bayar') and.push({ paymentStatus: payment });
	if (and.length) where.AND = and;

	const [orders, statusGroups, unpaidCount] = await Promise.all([
		db.order.findMany({
			where,
			include: { customer: true, items: { include: { serviceCategory: true } } },
			orderBy: { createdAt: 'desc' },
			take: 50
		}),
		db.order.groupBy({
			by: ['status'],
			_count: { _all: true }
		}),
		db.order.count({
			where: { paymentStatus: 'belum_bayar', status: { not: 'dibatalkan' } }
		})
	]);

	const statusCounts: Record<string, number> = {};
	let totalAll = 0;
	for (const g of statusGroups) {
		statusCounts[g.status] = g._count._all;
		totalAll += g._count._all;
	}

	return {
		orders: orders.map((o) => ({
			...o,
			items: o.items.map((it) => ({ ...it, qty: Number(it.qty) }))
		})),
		q,
		status,
		payment,
		statusCounts,
		totalAll,
		unpaidCount,
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
		const next = nextStatus(order.status as OrderStatus);
		if (!next) return fail(400, { message: 'Tidak ada tahap berikutnya' });
		const paymentStatus = ['siap_diambil', 'selesai'].includes(next)
			? 'lunas'
			: order.paymentStatus;
		await db.$transaction([
			db.order.update({ where: { id }, data: { status: next, paymentStatus } }),
			db.orderStatusHistory.create({
				data: {
					orderId: id,
					statusLama: order.status as OrderStatus,
					statusBaru: next,
					updatedById: user.id
				}
			})
		]);
		return { success: true, nextStatus: next };
	}
};
