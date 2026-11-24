import { db } from '../../services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const rawCode = event.url.searchParams.get('code')?.trim() ?? '';
	const code = rawCode.toUpperCase();
	const wa = event.url.searchParams.get('wa')?.trim() ?? '';

	if (!code) {
		return { step: 'code' as const, code: '', error: null, order: null };
	}

	const order = await db.order.findFirst({
		where: { orderCode: { equals: code, mode: 'insensitive' } },
		include: {
			customer: true,
			items: { include: { serviceCategory: true, priceItem: true } },
			statusHistories: { orderBy: { createdAt: 'asc' } }
		}
	});

	if (!order) {
		return {
			step: 'code' as const,
			code,
			error: 'Kode order tidak ditemukan. Periksa kembali kode pada nota Anda.',
			order: null
		};
	}

	const last4 = (order.customer.whatsapp ?? '').replace(/\D/g, '').slice(-4);

	if (!wa) {
		return {
			step: 'verify' as const,
			code: order.orderCode,
			error: null,
			order: { orderCode: order.orderCode }
		};
	}

	if (last4.length < 4 || wa !== last4) {
		return {
			step: 'verify' as const,
			code: order.orderCode,
			error:
				last4.length < 4
					? 'Order ini tidak memiliki nomor WhatsApp terdaftar. Gunakan link QR pada nota.'
					: '4 digit terakhir nomor WhatsApp tidak cocok.',
			order: { orderCode: order.orderCode }
		};
	}

	const historyMap: Record<string, Date> = {};
	for (const h of order.statusHistories) historyMap[h.statusBaru] = h.createdAt;
	if (!historyMap['diterima']) historyMap['diterima'] = order.createdAt;

	return {
		step: 'result' as const,
		code: order.orderCode,
		error: null,
		order: {
			orderCode: order.orderCode,
			customerFirstName: order.customer.name.split(' ')[0],
			createdAt: order.createdAt,
			status: order.status,
			paymentStatus: order.paymentStatus,
			totalPrice: order.totalPrice,
			notes: order.notes,
			cancelled: order.status === 'dibatalkan',
			items: order.items.map((it) => ({
				name: it.serviceCategory.name,
				qty: Number(it.qty),
				unit: it.serviceCategory.unit,
				minQty: it.priceItem ? Number(it.priceItem.minQty) : 0,
				subtotal: it.subtotal
			})),
			histories: historyMap
		}
	};
};
