import { redirect } from '@sveltejs/kit';
import type { BetterFetchOption } from 'better-auth/client';

import { authClient } from '#lib/auth-client.ts';

import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, request, url }) => {
	const fetchOptions = {
		customFetchImpl: fetch,
		baseURL: new URL('/api/auth', url).toString(),
		headers: { cookie: request.headers.get('cookie') ?? '' },
		signal: request.signal,
		throw: true
	} satisfies BetterFetchOption;
	const session = await authClient.getSession({ fetchOptions });
	if (!session) redirect(307, '/login');
	return {
		user: {
			name: session.user.name,
			email: session.user.email,
			image: session.user.image
		}
	};
}) satisfies PageServerLoad;
