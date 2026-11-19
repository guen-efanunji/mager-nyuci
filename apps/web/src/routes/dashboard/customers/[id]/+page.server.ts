import { redirect } from '@sveltejs/kit';

import { auth, db } from '../../../../services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	const customer = await db.customer.findUnique({
		where: { id: event.params.id },
		include: { orders: { orderBy: { createdAt: 'desc' }, include: { items: { include: { serviceCategory: true } } } } }
	});
	if (customer) {
		(customer as any).orders = customer.orders.map((o: any) => ({
			...o,
			items: o.items.map((it: any) => ({ ...it, qty: Number(it.qty) }))
		}));
	}
	if (!customer) throw redirect(303, '/customers');
	return { customer };
};