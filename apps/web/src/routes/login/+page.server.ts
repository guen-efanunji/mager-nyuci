import { redirect } from '@sveltejs/kit';

import { auth } from '../../services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (session?.user) throw redirect(303, '/dashboard');
	return {};
};
