import { redirect } from '@sveltejs/kit';

import { auth, db } from '../../services';
import { STATUS_LABEL } from '#lib/order.js';
import type { PageServerLoad } from './$types';

function jakartaRange(daysBack = 0) {
	const offset = 7 * 60;
	const now = new Date();
	const local = new Date(now.getTime() + offset * 60000);
	local.setUTCDate(local.getUTCDate() - daysBack);
	const y = local.getUTCFullYear();
	const m = local.getUTCMonth();
	const d = local.getUTCDate();
	const start = new Date(Date.UTC(y, m, d, 0, 0, 0) - offset * 60000);
	return start;
}

export const load: PageServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');

	const period = event.url.searchParams.get('period') ?? 'today';
	let start: Date;
	const end = new Date();
	if (period === 'week') start = jakartaRange(6);
	else if (period === 'month') start = jakartaRange(29);
	else start = jakartaRange(0);
	// adjust start to beginning of that day
	const offset = 7 * 60;
	const localStart = new Date(start.getTime() + offset * 60000);
	const s = new Date(Date.UTC(localStart.getUTCFullYear(), localStart.getUTCMonth(), localStart.getUTCDate(), 0, 0, 0) - offset * 60000);

	const paidStatuses = ['siap_diambil', 'selesai'] as const;

	const orders = await db.order.findMany({
		where: { createdAt: { gte: s, lte: end } },
		include: { customer: true },
		orderBy: { createdAt: 'desc' }
	});

	const todayStart = jakartaRange(0);
	const todayOrders = orders.filter((o) => o.createdAt >= todayStart);

	const revenue = orders
		.filter((o) => o.paymentStatus === 'lunas' && o.status !== 'dibatalkan')
		.reduce((sum, o) => sum + o.totalPrice, 0);

	const unpaid = orders.filter((o) => o.paymentStatus !== 'lunas' && o.status !== 'dibatalkan');
	const unpaidCount = unpaid.length;
	const unpaidAmount = unpaid.reduce((sum, o) => sum + o.totalPrice, 0);

	const newCount = orders.length;
	const inProcess = orders.filter((o) => !['siap_diambil', 'selesai', 'dibatalkan'].includes(o.status)).length;
	const siapDiambil = orders.filter((o) => o.status === 'siap_diambil').length;
	const selesai = orders.filter((o) => o.status === 'selesai').length;

	// 7-day chart
	const chart: { day: string; value: number }[] = [];
	for (let i = 6; i >= 0; i--) {
		const dayStart = jakartaRange(i);
		const dayEnd = new Date(dayStart.getTime() + 86400000);
		const dayOrders = await db.order.findMany({
			where: { createdAt: { gte: dayStart, lt: dayEnd } }
		});
		const val = dayOrders
			.filter((o) => o.paymentStatus === 'lunas' && o.status !== 'dibatalkan')
			.reduce((sum, o) => sum + o.totalPrice, 0);
		chart.push({ day: dayStart.toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }), value: val });
	}

	const recent = orders.slice(0, 10);

	return {
		user: { name: session.user.name, email: session.user.email, image: session.user.image },
		period,
		summary: { revenue, newCount, inProcess, siapDiambil, selesai, unpaidCount, unpaidAmount },
		chart,
		recent,
		statusLabel: STATUS_LABEL
	};
};