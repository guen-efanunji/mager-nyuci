import { redirect } from '@sveltejs/kit';

import { auth, db } from '../../services';
import type { PageServerLoad } from './$types';

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function jakartaDayInfo(daysBack = 0) {
	const now = new Date();
	const local = new Date(now.getTime() + JAKARTA_OFFSET_MS);
	local.setUTCDate(local.getUTCDate() - daysBack);
	const y = local.getUTCFullYear();
	const m = local.getUTCMonth();
	const d = local.getUTCDate();
	const start = new Date(Date.UTC(y, m, d, 0, 0, 0) - JAKARTA_OFFSET_MS);
	const utcDay = new Date(Date.UTC(y, m, d, 0, 0, 0));
	return { start, utcDay };
}

export const load: PageServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');

	const rawPeriod = event.url.searchParams.get('period');
	const period = rawPeriod === 'week' || rawPeriod === 'month' ? rawPeriod : 'today';
	const end = new Date();
	const { start } =
		period === 'week'
			? jakartaDayInfo(6)
			: period === 'month'
				? jakartaDayInfo(29)
				: jakartaDayInfo(0);

	const orders = await db.order.findMany({
		where: { createdAt: { gte: start, lte: end } },
		include: { customer: true },
		orderBy: { createdAt: 'desc' }
	});

	const paidOrders = orders.filter((o) => o.paymentStatus === 'lunas' && o.status !== 'dibatalkan');
	const revenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

	const unpaid = orders.filter((o) => o.paymentStatus !== 'lunas' && o.status !== 'dibatalkan');
	const unpaidCount = unpaid.length;
	const unpaidAmount = unpaid.reduce((sum, o) => sum + o.totalPrice, 0);

	const newCount = orders.length;
	const inProcess = orders.filter(
		(o) => !['siap_diambil', 'selesai', 'dibatalkan'].includes(o.status)
	).length;
	const siapDiambil = orders.filter((o) => o.status === 'siap_diambil').length;
	const selesai = orders.filter((o) => o.status === 'selesai').length;

	// 7-day chart in a single query
	const { start: chartStart } = jakartaDayInfo(6);
	const { start: todayStart } = jakartaDayInfo(0);
	const chartEnd = new Date(todayStart.getTime() + 86_400_000);

	const chartOrders = await db.order.findMany({
		where: { createdAt: { gte: chartStart, lt: chartEnd } },
		select: { createdAt: true, totalPrice: true, paymentStatus: true, status: true }
	});

	const chart: { date: string; day: string; value: number; orders: number }[] = [];
	for (let i = 6; i >= 0; i--) {
		const { start: dayStart, utcDay } = jakartaDayInfo(i);
		const dayEndMs = dayStart.getTime() + 86_400_000;
		const dayStartMs = dayStart.getTime();

		let val = 0;
		let count = 0;
		for (const o of chartOrders) {
			const ts = o.createdAt.getTime();
			if (ts >= dayStartMs && ts < dayEndMs && o.status !== 'dibatalkan') {
				count++;
				if (o.paymentStatus === 'lunas') {
					val += o.totalPrice;
				}
			}
		}

		chart.push({
			date: utcDay.toISOString(),
			day: dayStart.toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }),
			value: val,
			orders: count
		});
	}

	const recent = orders.slice(0, 10);

	return {
		user: { name: session.user.name, email: session.user.email, image: session.user.image },
		period,
		todayLabel: new Date().toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'Asia/Jakarta'
		}),
		summary: {
			revenue,
			paidCount: paidOrders.length,
			newCount,
			inProcess,
			siapDiambil,
			selesai,
			unpaidCount,
			unpaidAmount
		},
		chart,
		recent
	};
};
