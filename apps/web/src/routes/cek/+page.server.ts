import { db } from '../../services';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const code = event.url.searchParams.get('code')?.trim() ?? '';
	const wa = event.url.searchParams.get('wa')?.trim() ?? '';

	if (!code) {
		return { step: 'code', code: '', error: null, order: null };
	}

	const order = await db.order.findUnique({
		where: { orderCode: code },
		include: { customer: true, items: { include: { serviceCategory: true } }, statusHistories: true }
	});

	if (!order) {
		return { step: 'code', code, error: 'Kode order tidak ditemukan', order: null };
	}

	// verification step
	if (!wa) {
		return { step: 'verify', code, error: null, order: { orderCode: order.orderCode } };
	}

	const last4 = (order.customer.whatsapp ?? '').slice(-4);
	if (wa !== last4) {
		return { step: 'verify', code, error: '4 digit terakhir tidak cocok', order: { orderCode: order.orderCode } };
	}

	const historyMap: Record<string, Date> = {};
	for (const h of order.statusHistories) historyMap[h.statusBaru] = h.createdAt;
	if (!historyMap['diterima']) historyMap['diterima'] = order.createdAt;

	return {
		step: 'result',
		code,
		error: null,
		order: {
			orderCode: order.orderCode,
			customerFirstName: order.customer.name.split(' ')[0],
			createdAt: order.createdAt,
			status: order.status,
			cancelled: order.status === 'dibatalkan',
			items: order.items.map((it) => ({ name: it.serviceCategory.name, qty: Number(it.qty), unit: it.serviceCategory.unit })),
			histories: historyMap
		}
	};
};