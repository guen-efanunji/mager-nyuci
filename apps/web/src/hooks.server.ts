import { building } from '$app/env';
import type { Handle } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { auth } from './services';

export const handle: Handle = async ({ event, resolve }) => {
	const authInstance = auth;

	return svelteKitHandler({
		event,
		resolve,
		auth: authInstance,
		building
	});
};
