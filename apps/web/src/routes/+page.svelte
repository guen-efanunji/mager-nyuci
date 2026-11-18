<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Layers3Icon from '@lucide/svelte/icons/layers-3';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import { Button } from '#lib/components/ui/button/index.js';
</script>

<svelte:head>
	<title>Svelte Plate — Ship your next idea faster</title>
	<meta
		name="description"
		content="A polished SvelteKit starter with authentication, a flexible dashboard, and accessible UI components."
	/>
</svelte:head>

<div class="min-h-full overflow-hidden">
	<header class="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
		<a
			href="/"
			class="flex items-center gap-2.5 font-semibold tracking-tight"
			aria-label="Svelte Plate home"
		>
			<span
				class="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
			>
				<Layers3Icon class="size-5" />
			</span>
			<span>Svelte<span class="text-primary">Plate</span></span>
		</a>
		<nav class="flex items-center gap-3" aria-label="Main navigation">
			<a
				href="/login"
				class="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex"
			>
				Sign in
			</a>
			<Button href="/login" class="gap-2 rounded-lg">
				Get started <ArrowRightIcon class="size-4" />
			</Button>
		</nav>
	</header>

	<main>
		<section
			class="relative mx-auto grid min-h-[640px] w-full max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24"
		>
			<div
				class="pointer-events-none absolute -left-40 top-12 size-[32rem] rounded-full bg-primary/10 blur-[100px]"
			></div>
			<div class="relative z-10 max-w-2xl">
				<div
					class="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-accent/60 px-3.5 py-1.5 text-xs font-medium text-accent-foreground"
				>
					<SparklesIcon class="size-3.5 text-primary" /> Your next project starts here
				</div>
				<h1
					class="text-balance text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
				>
					A better starting point for <span class="text-primary">what’s next.</span>
				</h1>
				<p class="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
					Skip the setup fatigue. Build on a thoughtful SvelteKit foundation with authentication, a
					flexible dashboard, and beautiful components ready to make your own.
				</p>
				<div class="mt-9 flex flex-wrap items-center gap-3">
					<Button href="/login" size="lg" class="gap-2 rounded-xl px-6 shadow-md">
						Start building <ArrowRightIcon class="size-4" />
					</Button>
					<a
						href="#features"
						class="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium shadow-xs transition hover:bg-muted"
					>
						Explore the starter
					</a>
				</div>
				<div class="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
					<span class="inline-flex items-center gap-2">
						<CheckIcon class="size-4 text-primary" /> SvelteKit + TypeScript
					</span>
					<span class="inline-flex items-center gap-2">
						<CheckIcon class="size-4 text-primary" /> Accessible UI
					</span>
					<span class="inline-flex items-center gap-2">
						<CheckIcon class="size-4 text-primary" /> Auth included
					</span>
				</div>
			</div>

			<div class="relative mx-auto w-full max-w-xl lg:ml-auto">
				<div class="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-2xl"></div>
				<div
					class="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-primary/10"
				>
					<div class="flex items-center justify-between border-b border-border px-5 py-4">
						<div class="flex items-center gap-2">
							<span class="size-2.5 rounded-full bg-destructive/80"></span><span
								class="size-2.5 rounded-full bg-chart-2"
							></span><span class="size-2.5 rounded-full bg-chart-3"></span>
						</div>
						<div class="text-xs font-medium text-muted-foreground">Workspace overview</div>
						<div class="size-5"></div>
					</div>
					<div class="grid gap-5 p-5 sm:p-7">
						<div class="flex items-start justify-between gap-4">
							<div>
								<p class="text-sm text-muted-foreground">Good morning, Alex</p>
								<h2 class="mt-1 text-2xl font-semibold tracking-tight">Your workspace</h2>
							</div>
							<div
								class="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"
							>
								<ZapIcon class="size-5" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div class="rounded-xl border border-border bg-background p-4">
								<p class="text-xs text-muted-foreground">Projects</p>
								<p class="mt-2 text-2xl font-semibold">12</p>
								<p class="mt-1 text-xs text-chart-3">+2 this month</p>
							</div>
							<div class="rounded-xl border border-border bg-background p-4">
								<p class="text-xs text-muted-foreground">Tasks completed</p>
								<p class="mt-2 text-2xl font-semibold">86%</p>
								<p class="mt-1 text-xs text-chart-3">On track this week</p>
							</div>
						</div>
						<div class="rounded-xl border border-border bg-background p-4">
							<div class="mb-5 flex items-center justify-between">
								<div>
									<p class="text-sm font-medium">Weekly activity</p>
									<p class="mt-1 text-xs text-muted-foreground">A little progress adds up</p>
								</div>
								<span class="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground">
									This week
								</span>
							</div>
							<div
								class="flex h-32 items-end gap-2 sm:gap-3"
								aria-label="Decorative weekly activity chart"
							>
								{#each [{ day: 'Mon', height: '48%' }, { day: 'Tue', height: '68%' }, { day: 'Wed', height: '56%' }, { day: 'Thu', height: '88%' }, { day: 'Fri', height: '72%' }, { day: 'Sat', height: '100%' }, { day: 'Sun', height: '62%' }] as bar (bar.day)}
									<div class="flex h-full flex-1 flex-col items-center justify-end gap-2">
										<div
											class="w-full rounded-t-md bg-primary/80 transition hover:bg-primary"
											style={`height:${bar.height}`}
										></div>
										<span class="text-[10px] text-muted-foreground">{bar.day}</span>
									</div>
								{/each}
							</div>
						</div>
						<div class="flex items-center gap-3 rounded-xl bg-accent/60 p-4">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary"
							>
								<ShieldCheckIcon class="size-4" />
							</div>
							<div>
								<p class="text-sm font-medium">Everything in one place</p>
								<p class="mt-0.5 text-xs text-muted-foreground">
									A clear view of work and what comes next.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div
					class="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg sm:flex"
				>
					<span class="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
						<CheckIcon class="size-4" />
					</span><span>
						<span class="block text-sm font-medium">Ready when you are</span><span
							class="text-xs text-muted-foreground"
						>
							Thoughtful defaults, zero fuss
						</span>
					</span>
				</div>
			</div>
		</section>

		<section id="features" class="border-y border-border/70 bg-card/60">
			<div class="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
				<div class="mx-auto max-w-2xl text-center">
					<p class="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
						A head start, not a shortcut
					</p>
					<h2 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
						The foundation, already figured out.
					</h2>
					<p class="mt-4 leading-7 text-muted-foreground">
						Spend less time wiring the basics together and more time making something people love.
					</p>
				</div>
				<div class="mt-12 grid gap-4 md:grid-cols-3">
					{#each [{ icon: ShieldCheckIcon, title: 'Authentication that fits', description: 'A working Better Auth foundation with protected routes and a clear sign-in flow.' }, { icon: Layers3Icon, title: 'Components you can own', description: 'Accessible shadcn-svelte components live in your codebase, ready for your design.' }, { icon: ZapIcon, title: 'A dashboard that scales', description: 'A responsive workspace layout that gives your product room to grow.' }] as feature (feature.title)}
						<article
							class="rounded-2xl border border-border bg-background p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md"
						>
							<div
								class="flex size-11 items-center justify-center rounded-xl bg-accent text-primary"
							>
								<feature.icon class="size-5" />
							</div>
							<h3 class="mt-5 text-lg font-semibold">{feature.title}</h3>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<section
			class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center lg:px-10 lg:py-20"
		>
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">
					Your next idea deserves a great start.
				</h2>
				<p class="mt-2 text-muted-foreground">Take the first step. The foundation is ready.</p>
			</div>
			<Button href="/login" size="lg" class="gap-2 rounded-xl px-6">
				Create your workspace <ArrowRightIcon class="size-4" />
			</Button>
		</section>
	</main>
	<footer class="border-t border-border">
		<div
			class="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10"
		>
			<a href="/" class="font-medium text-foreground">SveltePlate</a><span>
				Built for the things you’re about to build.
			</span>
		</div>
	</footer>
</div>
