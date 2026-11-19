import { redirect } from '@sveltejs/kit';

import { auth } from '../../services';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(303, '/login');
	return {
		user: {
			name: session.user.name,
			email: session.user.email,
			image: session.user.image
		}
	};
};