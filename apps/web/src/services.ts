import { createAuth } from '@svelte-plate/auth';
import { createPrismaClient } from '@svelte-plate/db';

import { ENV } from './env.server';

export const db = createPrismaClient(ENV);
export const auth = createAuth(ENV, db);
