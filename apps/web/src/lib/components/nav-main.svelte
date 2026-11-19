<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';

	let { items }: { items: { title: string; url: string; icon: Component; isActive?: boolean }[] } =
		$props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.title)}
			{@const isActive =
				item.url === '/dashboard'
					? page.url.pathname === '/dashboard'
					: page.url.pathname === item.url || page.url.pathname.startsWith(item.url + '/')}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					{isActive}
					tooltipContent={item.title}
					class={isActive
						? 'bg-primary! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground! active:bg-primary/90! active:text-primary-foreground! data-active:bg-primary! data-active:text-primary-foreground!'
						: 'bg-transparent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent'}
				>
					{#snippet child({ props })}<a
							href={item.url}
							aria-current={isActive ? 'page' : undefined}
							{...props}
						>
							<item.icon /><span>{item.title}</span>
						</a>{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
