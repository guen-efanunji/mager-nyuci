<script lang="ts">
	import ChartNoAxesColumnIncreasingIcon from '@lucide/svelte/icons/chart-no-axes-column-increasing';
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import HouseIcon from '@lucide/svelte/icons/house';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import type { ComponentProps } from 'svelte';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';

	let {
		user,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		user: { name: string; email: string; image?: string | null };
	} = $props();

	const navMain = [
		{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboardIcon, isActive: true },
		{ title: 'Projects', url: '/dashboard#projects', icon: FolderKanbanIcon },
		{ title: 'Activity', url: '/dashboard#activity', icon: ChartNoAxesColumnIncreasingIcon },
		{ title: 'Settings', url: '/dashboard#settings', icon: SettingsIcon }
	];
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" tooltipContent="SveltePlate">
					<span
						class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
					>
						<GalleryVerticalEndIcon class="size-4" />
					</span>
					<span class="truncate font-semibold">SveltePlate</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser
			user={{ name: user.name || user.email.split('@')[0], email: user.email, avatar: user.image }}
		/>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
