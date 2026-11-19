export const ORDER_STATUSES = ['diterima', 'dicuci', 'dikeringkan', 'disetrika', 'siap_diambil', 'selesai', 'dibatalkan'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
	diterima: 'Diterima',
	dicuci: 'Dicuci',
	dikeringkan: 'Dikeringkan',
	disetrika: 'Disetrika',
	siap_diambil: 'Siap Diambil',
	selesai: 'Selesai',
	dibatalkan: 'Dibatalkan'
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
	diterima: 'bg-slate-100 text-slate-700',
	dicuci: 'bg-blue-100 text-blue-700',
	dikeringkan: 'bg-indigo-100 text-indigo-700',
	disetrika: 'bg-purple-100 text-purple-700',
	siap_diambil: 'bg-amber-100 text-amber-700',
	selesai: 'bg-green-100 text-green-700',
	dibatalkan: 'bg-red-100 text-red-700'
};

export function pickPriceItem<T extends { minQty: number; isActive: boolean }>(items: T[], qty: number): T | null {
	const candidates = items.filter((p) => p.isActive && p.minQty <= qty);
	if (!candidates.length) return null;
	return candidates.reduce((best, cur) => (cur.minQty > best.minQty ? cur : best));
}

export function nextStatus(current: OrderStatus): OrderStatus | null {
	const flow: OrderStatus[] = ['diterima', 'dicuci', 'dikeringkan', 'disetrika', 'siap_diambil', 'selesai'];
	const idx = flow.indexOf(current);
	if (idx < 0 || idx === flow.length - 1) return null;
	return flow[idx + 1];
}

export function canCancel(status: OrderStatus): boolean {
	return status === 'diterima' || status === 'dicuci';
}

export type PaymentStatus = 'belum_bayar' | 'lunas';

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
	belum_bayar: 'Belum Bayar',
	lunas: 'Lunas'
};

export const PAYMENT_COLOR: Record<PaymentStatus, string> = {
	belum_bayar: 'bg-red-100 text-red-700',
	lunas: 'bg-green-100 text-green-700'
};