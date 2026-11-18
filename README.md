# svelte-plate

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines SvelteKit, Self, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **SvelteKit** - Web framework for building Svelte apps
- **Tailwind CSS v4** - Utility-first CSS for rapid UI development
- **shadcn-svelte** - Accessible, customizable UI components added as project source
- **Lucide Svelte** - Consistent SVG icon components
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

Generate the Prisma client before development, typechecking, or building, including in CI and deployment builds. Run this again after changing the Prisma schema:

```bash
bun run db:generate
```

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/web/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
bun run db:push
```

Then, run the development server:

```bash
bun run dev
```

To use a custom port, pass it through to Vite:

```bash
bun run dev --port 6721
```

Or run just the web app:

```bash
bun run dev:web --port 6721
```

Open the URL printed by Vite (usually [http://localhost:5173](http://localhost:5173)) in your browser.

## Environment Configuration

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `bun run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

Bun's automatic env loading is disabled in `bunfig.toml`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

Run standalone Node/Bun tools that use Varlock from the owning app directory so they load that app's schema and env files. `env:generate` only generates TypeScript files; it does not initialize environment values in a subsequent command.

## Project Structure

```
svelte-plate/
├── apps/
│   └── web/         # Fullstack application (SvelteKit)
├── packages/
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:generate`: Generate database client/types
- `bun run db:migrate`: Run database migrations
- `bun run db:studio`: Open database studio UI

## Admin Seeder

After configuring `DATABASE_URL` and applying the Prisma schema, create the development admin account with:

```bash
bun run db:seed
```

Defaults: `admin@gmail.com` / `masuk123`. Override them with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME`. The seeder is idempotent: it will not overwrite an existing account. Use the default password only for local development and change it before deploying.

## UI Components and Icons

This starter uses [shadcn-svelte](https://www.shadcn-svelte.com/) with Tailwind CSS v4 and [Lucide Svelte](https://lucide.dev/). Components are copied into the app so you can customize them directly.

Add a component from `apps/web`:

```bash
cd apps/web
bun x shadcn-svelte@latest add button
```

The generated components live in `apps/web/src/lib/components/ui/`. Import them using the `#lib` alias, for example:

```svelte
<script lang="ts">
  import { Button } from "#lib/components/ui/button/index.js";
  import { House } from "@lucide/svelte";
</script>

<Button><House /> Home</Button>
```

Shadcn configuration is in `apps/web/components.json`; global design tokens are in `apps/web/src/app.css`.

## Better Auth Schema Generation

After changing auth plugins or schema options, run `bun run auth:generate` from the project root. The script runs the Better Auth CLI through `varlock run` from the owning app directory, loading the auth instance from `src/services.ts`. Review the schema changes, then use your ORM's migration workflow to apply them.
