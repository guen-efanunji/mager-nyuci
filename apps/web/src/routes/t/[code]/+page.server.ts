import { error, redirect } from '@sveltejs/kit';

import { db } from '../../../services';
import { STATUS_LABEL, STATUS_COLOR } from '#lib/order.js';
import type { PageServerLoad } from './$types';

const STATUSES = ['diterima', 'dicuci', 'dikeringkan', 'disetrika', 'siap_diambil', 'selesai'] as const;

export const load: PageServerLoad = async (event) => {
	const token = event.url.searchParams.get('tk');
	const code = event.params.code;
	const order = await db.order.findUnique({
		where: { orderCode: code },
		include: { customer: true, items: { include: { serviceCategory: true } }, statusHistories: true }
	});
	if (!order || !token || token !== order.trackingToken) {
		throw error(404, 'Not found');
	}
	// map status timestamps
	const historyMap: Record<string, Date> = {};
	for (const h of order.statusHistories) {
		historyMap[h.statusBaru] = h.createdAt;
	}
	// ensure first status timestamp from order createdAt if missing
	if (!historyMap['diterima']) historyMap['diterima'] = order.createdAt;

	return {
		order: {
			orderCode: order.orderCode,
			customerFirstName: order.customer.name.split(' ')[0],
			createdAt: order.createdAt,
			status: order.status,
			items: order.items.map((it) => ({ name: it.serviceCategory.name, qty: Number(it.qty), unit: it.serviceCategory.unit })),
			histories: historyMap,
			cancelled: order.status === 'dibatalkan'
		},
		statuses: STATUSES,
		statusLabel: STATUS_LABEL,
		statusColor: STATUS_COLOR
	};
};