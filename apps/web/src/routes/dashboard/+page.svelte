<script lang="ts">
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import type { PageProps } from './$types';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Breadcrumb from '#lib/components/ui/breadcrumb/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import AppSidebar from '#lib/components/app-sidebar.svelte';

	let { data }: PageProps = $props();

	const stats = [
		{ label: 'Active projects', value: '04', change: '+2 this month', icon: FolderKanbanIcon },
		{ label: 'Tasks completed', value: '12', change: '+8.2% this week', icon: CheckCircle2Icon },
		{ label: 'Hours focused', value: '18.5', change: 'This week', icon: Clock3Icon }
	];
	const projects = [
		{
			name: 'Website refresh',
			category: 'Design & engineering',
			progress: 72,
			status: 'In progress',
			color: 'bg-primary'
		},
		{
			name: 'Product launch',
			category: 'Marketing',
			progress: 48,
			status: 'In progress',
			color: 'bg-chart-2'
		},
		{
			name: 'Customer research',
			category: 'Research',
			progress: 86,
			status: 'On track',
			color: 'bg-chart-4'
		}
	];
	const activities = [
		{ title: 'You created your workspace', time: 'Just now', icon: SparklesIcon },
		{ title: 'Your dashboard is ready to go', time: 'A moment ago', icon: CheckCircle2Icon },
		{ title: 'A fresh start for your next idea', time: 'Today', icon: ActivityIcon }
	];
	const weeklyFocus = [
		{ day: 'Mon', value: 44 },
		{ day: 'Tue', value: 68 },
		{ day: 'Wed', value: 52 },
		{ day: 'Thu', value: 84 },
		{ day: 'Fri', value: 62 },
		{ day: 'Sat', value: 34 },
		{ day: 'Sun', value: 48 }
	];
</script>

<svelte:head>
	<title>Dashboard — SveltePlate</title>
	<meta name="description" content="Your SveltePlate workspace dashboard." />
</svelte:head>

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	<Sidebar.Inset class="min-h-svh bg-background">
		<header
			class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6"
		>
			<Sidebar.Trigger class="-ms-1" aria-label="Toggle navigation sidebar" />
			<Separator orientation="vertical" class="me-2 h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item><Breadcrumb.Page>Dashboard</Breadcrumb.Page></Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
			<Button
				variant="outline"
				size="icon"
				class="ms-auto relative"
				onclick={toggleMode}
				aria-label="Toggle color theme"
			>
				<SunIcon
					class="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</header>
		<main
			class="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9 xl:px-10 2xl:px-12"
		>
			<section class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
				<div>
					<p class="text-sm font-medium text-primary">Workspace overview</p>
					<h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
						Welcome back, {data.user.name || data.user.email.split('@')[0]}
					</h1>
					<p class="mt-2 text-muted-foreground">Here’s what’s happening with your work today.</p>
				</div>
				<Button href="#projects" class="gap-2 rounded-lg">
					<PlusIcon class="size-4" /> New project
				</Button>
			</section>

			<section class="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Workspace overview">
				{#each stats as stat (stat.label)}
					<article
						class="rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
					>
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-medium text-muted-foreground">{stat.label}</p>
							<span
								class="flex size-9 items-center justify-center rounded-lg bg-muted text-primary"
							>
								<stat.icon class="size-4" />
							</span>
						</div>
						<p class="mt-5 text-3xl font-semibold tracking-tight">{stat.value}</p>
						<p class="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
							<ArrowUpRightIcon class="size-3.5 text-primary" />{stat.change}
						</p>
					</article>
				{/each}
				<article class="rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
					<div class="flex items-center justify-between gap-3">
						<p class="text-sm font-medium text-muted-foreground">Weekly completion</p>
						<span class="flex size-9 items-center justify-center rounded-lg bg-muted text-primary">
							<ActivityIcon class="size-4" />
						</span>
					</div>
					<p class="mt-5 flex items-baseline gap-2 text-3xl font-semibold tracking-tight">
						84% <span class="text-xs font-medium text-muted-foreground">goal reached</span>
					</p>
					<p class="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
						<ArrowDownIcon class="size-3.5" />Keep your momentum going
					</p>
				</article>
			</section>

			<section
				class="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]"
				aria-label="Workspace activity"
			>
				<div class="grid content-start gap-6">
					<section
						class="rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
						aria-labelledby="focus-title"
					>
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div>
								<h2 id="focus-title" class="text-lg font-semibold">Focus time</h2>
								<p class="mt-1 text-sm text-muted-foreground">
									Your activity throughout this week.
								</p>
							</div>
							<span
								class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
							>
								Last 7 days
							</span>
						</div>
						<div
							class="mt-8 flex h-44 items-end justify-between gap-3 border-b border-border/70 px-1 sm:px-4"
						>
							{#each weeklyFocus as item (item.day)}
								<div class="flex h-full flex-1 flex-col items-center justify-end gap-3">
									<div
										class="w-full max-w-12 rounded-t-md bg-primary/85 transition-colors hover:bg-primary"
										style={`height:${item.value}%`}
										aria-label={`${item.day}: ${item.value}%`}
									></div>
									<span class="pb-2 text-xs text-muted-foreground">{item.day}</span>
								</div>
							{/each}
						</div>
						<div class="mt-4 flex items-center justify-between text-xs text-muted-foreground">
							<span>Less focus</span><span>More focus</span>
						</div>
					</section>

					<section
						id="projects"
						class="scroll-mt-6 rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
					>
						<div class="flex items-start justify-between gap-4">
							<div>
								<h2 class="text-lg font-semibold">Projects</h2>
								<p class="mt-1 text-sm text-muted-foreground">A snapshot of what’s in motion.</p>
							</div>
							<a
								href="#projects"
								class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
							>
								View all <ArrowUpRightIcon class="size-4" />
							</a>
						</div>
						<div class="mt-5 overflow-x-auto">
							<table class="w-full min-w-[520px] text-left text-sm">
								<thead>
									<tr class="border-b border-border text-xs text-muted-foreground">
										<th class="pb-3 font-medium">Project</th><th class="pb-3 font-medium">
											Status
										</th><th class="pb-3 font-medium">Progress</th><th
											class="pb-3 text-right font-medium"
										>
										</th>
									</tr>
								</thead><tbody>
									{#each projects as project (project.name)}
										<tr class="border-b border-border/60 last:border-0">
											<td class="py-4">
												<div class="flex items-center gap-3">
													<span
														class="flex size-9 items-center justify-center rounded-lg bg-muted text-primary"
													>
														<FolderKanbanIcon class="size-4" />
													</span>
													<div>
														<p class="font-medium">{project.name}</p>
														<p class="mt-1 text-xs text-muted-foreground">{project.category}</p>
													</div>
												</div>
											</td><td class="py-4">
												<span
													class="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
												>
													<span class="size-1.5 rounded-full bg-primary"></span>{project.status}
												</span>
											</td><td class="py-4">
												<div class="flex items-center gap-3">
													<div class="h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:w-28">
														<div
															class={`h-full rounded-full ${project.color}`}
															style={`width:${project.progress}%`}
														></div>
													</div>
													<span class="text-xs tabular-nums text-muted-foreground">
														{project.progress}%
													</span>
												</div>
											</td><td class="py-4 text-right">
												<button
													type="button"
													class="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
													aria-label={`More options for ${project.name}`}
												>
													<MoreHorizontalIcon class="size-4" />
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>
				</div>

				<div class="grid content-start gap-6">
					<section
						id="activity"
						class="scroll-mt-6 rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
					>
						<div>
							<h2 class="text-lg font-semibold">Recent activity</h2>
							<p class="mt-1 text-sm text-muted-foreground">The latest from your workspace.</p>
						</div>
						<div class="mt-6 flex flex-col gap-5">
							{#each activities as activity, index (activity.title)}<div class="flex gap-3">
									<span
										class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary"
									>
										<activity.icon class="size-4" />
									</span>
									<div class="min-w-0 flex-1">
										<p class="text-sm font-medium">{activity.title}</p>
										<p class="mt-1 text-xs text-muted-foreground">{activity.time}</p>
									</div>
									{#if index === 0}<span class="mt-3 size-2 rounded-full bg-primary"></span>{/if}
								</div>{/each}
						</div>
					</section>
					<section
						id="settings"
						class="scroll-mt-6 rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
					>
						<div class="flex size-10 items-center justify-center rounded-lg bg-muted text-primary">
							<SparklesIcon class="size-5" />
						</div>
						<h2 class="mt-4 text-lg font-semibold">Settings</h2>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							Customize your workspace preferences and account settings.
						</p>
						<span
							class="mt-4 inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
						>
							Coming soon
						</span>
					</section>
				</div>
			</section>
			<footer class="border-t border-border/70 pt-5 text-xs text-muted-foreground">
				SveltePlate workspace <span aria-hidden="true">·</span> Ready for your next idea
			</footer>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
