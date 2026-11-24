import { auth, db } from '../services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const [session, categories] = await Promise.all([
		auth.api.getSession({ headers: event.request.headers }),
		db.serviceCategory.findMany({
			where: { isActive: true },
			include: {
				priceItems: {
					where: { isActive: true },
					orderBy: { minQty: 'asc' }
				}
			},
			orderBy: { name: 'asc' },
			take: 6
		})
	]);

	return {
		isLoggedIn: Boolean(session?.user),
		userName: session?.user?.name ?? null,
		services: categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			description: cat.description,
			unit: cat.unit,
			priceItems: cat.priceItems.map((item) => ({
				id: item.id,
				minQty: Number(item.minQty),
				price: item.price
			}))
		}))
	};
};
