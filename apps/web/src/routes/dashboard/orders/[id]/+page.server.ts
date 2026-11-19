import { fail, redirect } from '@sveltejs/kit';

import { auth, db } from '../../../../services';
import { ENV } from '../../../../env.server';
import { nextStatus, canCancel, STATUS_LABEL } from '#lib/order.js';
import { normalizeWa } from '#lib/phone.js';
import type { PageServerLoad, Actions } from './$types';

async function requireAdmin(event: { request: Request }) {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	return session.user;
}

export const load: PageServerLoad = async (event) => {
	const user = await requireAdmin(event);
	const order = await db.order.findUnique({
		where: { id: event.params.id },
		include: {
			customer: true,
			items: { include: { serviceCategory: true, priceItem: true } },
			statusHistories: { orderBy: { createdAt: 'asc' }, include: { updatedBy: true } }
		}
	});
	if (!order) throw redirect(303, '/dashboard/orders');
	return {
		order: {
			...order,
			items: order.items.map((it) => ({
		...it,
		qty: Number(it.qty),
		priceItem: it.priceItem ? { ...it.priceItem, minQty: Number(it.priceItem.minQty) } : null
	}))
		},
		user,
		appUrl: ENV.APP_URL,
		whatsappDriver: ENV.WHATSAPP_DRIVER
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
		// optional WA notify
		if (next === 'siap_diambil' && process.env.WA_NOTIFY_STATUS === 'true') {
			// placeholder: actual sending via driver if implemented later
		}
		return { success: true };
	},
	cancelOrder: async (event) => {
		const user = await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const reason = String(form.get('reason') ?? '').trim();
		const order = await db.order.findUnique({ where: { id } });
		if (!order) return fail(404, { message: 'Order tidak ditemukan' });
		if (!canCancel(order.status as any)) return fail(400, { message: 'Order tidak bisa dibatalkan pada status ini' });
		if (!reason) return fail(400, { message: 'Alasan pembatalan wajib diisi' });
		await db.$transaction([
			db.order.update({ where: { id }, data: { status: 'dibatalkan', cancelReason: reason } }),
			db.orderStatusHistory.create({
				data: { orderId: id, statusLama: order.status as any, statusBaru: 'dibatalkan', updatedById: user.id }
			})
		]);
		return { success: true };
	},
	sendWhatsApp: async (event) => {
		const user = await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const order = await db.order.findUnique({ where: { id }, include: { customer: true } });
		if (!order) return fail(404, { message: 'Order tidak ditemukan' });
		if (!order.customer.whatsapp) return fail(400, { message: 'Customer tanpa nomor WA' });

		const driver = ENV.WHATSAPP_DRIVER;
		let status: 'success' | 'failed' = 'success';
		let errorMessage: string | null = null;

		if (driver === 'fonnte' && ENV.FONNTE_TOKEN) {
			const baseUrl = ENV.APP_URL.replace(/\/$/, '');
			const qrUrl = `${baseUrl}/api/qr/${order.orderCode}`;
			const message = `Halo Kak ${order.customer.name.split(' ')[0]}, nota laundry KiloTrack\nKode: ${order.orderCode}\nTotal: Rp${order.totalPrice}\nCek status: ${baseUrl}/t/${order.orderCode}?tk=${order.trackingToken}`;
			try {
				const res = await fetch('https://api.fonnte.com/send', {
					method: 'POST',
					headers: { Authorization: ENV.FONNTE_TOKEN },
					body: new URLSearchParams({
						target: order.customer.whatsapp,
						message,
						url: qrUrl
					})
				});
				const json = await res.json().catch(() => ({}));
				if (!res.ok || (json as any)?.status === false) {
					status = 'failed';
					errorMessage = (json as any)?.reason || res.statusText;
				}
			} catch (e) {
				status = 'failed';
				errorMessage = (e as Error).message;
			}
		} else {
			// manual driver: nothing to send server-side
			status = 'success';
		}

		await db.whatsAppLog.create({
			data: {
				orderId: id,
				toNumber: order.customer.whatsapp,
				driver,
				status,
				errorMessage
			}
		});

		if (status === 'failed') return fail(500, { message: `Gagal kirim WA: ${errorMessage}` });
		return { success: true, driver };
	},
	togglePayment: async (event) => {
		await requireAdmin(event);
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const paymentStatus = String(form.get('paymentStatus') ?? '') === 'lunas' ? 'lunas' : 'belum_bayar';
		if (!id) return fail(400, { message: 'ID tidak valid' });
		await db.order.update({ where: { id }, data: { paymentStatus } });
		return { success: true };
	}
};