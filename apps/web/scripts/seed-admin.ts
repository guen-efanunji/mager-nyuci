import { createAuth } from '@svelte-plate/auth';
import { createPrismaClient } from '@svelte-plate/db';
import { ENV } from '../src/env.server';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'admin@gmail.com';
const password = process.env.ADMIN_PASSWORD || 'masuk123';
const name = process.env.ADMIN_NAME || 'Admin';

if (password.length < 8) {
	throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
}

const db = createPrismaClient(ENV);
const auth = createAuth(ENV, db);

try {
	const existingUser = await db.user.findUnique({ where: { email } });

	if (existingUser) {
		console.info(`Seed admin already exists: ${email}`);
	} else {
		const result = await auth.api.signUpEmail({
			body: { name, email, password }
		});
		console.info(`Seed admin created: ${result.user.email}`);
	}
} finally {
	await db.$disconnect();
}
