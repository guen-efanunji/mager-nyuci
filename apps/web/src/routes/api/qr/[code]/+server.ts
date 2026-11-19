import { error } from '@sveltejs/kit';
import QRCode from 'qrcode';

import { db } from '../../../../services';
import { ENV } from '../../../../env.server';

export const GET = async ({ params }) => {
	const order = await db.order.findUnique({ where: { orderCode: params.code } });
	if (!order) throw error(404, 'Not found');

	const baseUrl = ENV.APP_URL.replace(/\/$/, '');
	const url = `${baseUrl}/t/${order.orderCode}?tk=${order.trackingToken}`;
	const buffer = await QRCode.toBuffer(url, { type: 'png', width: 320, margin: 1 });

	return new Response(new Uint8Array(buffer), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};