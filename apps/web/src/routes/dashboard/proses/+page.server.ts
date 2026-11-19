import { fail, redirect } from '@sveltejs/kit';

import { auth, db } from '../../../services';
import { nextStatus, STATUS_LABEL, STATUS_COLOR } from '#lib/order.js';
import type { PageServerLoad, Actions } from './$types';

async function requireAdmin(event: { request: Request }) {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	return session.user;
}

export const load: PageServerLoad = async (event) => {
	const user = await requireAdmin(event);
	const orders = await db.order.findMany({
		where: { status: { not: 'dibatalkan' } },
		include: { customer: true, items: { include: { serviceCategory: true } } },
		orderBy: { createdAt: 'asc' }
	});
	return {
		orders: orders.map((o) => ({
			...o,
			items: o.items.map((it) => ({ ...it, qty: Number(it.qty) }))
		})),
		user,
		statusLabel: STATUS_LABEL,
		statusColor: STATUS_COLOR
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