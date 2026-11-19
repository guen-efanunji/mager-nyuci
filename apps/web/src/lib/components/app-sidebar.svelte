<script lang="ts">
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import ColumnsIcon from '@lucide/svelte/icons/columns-3';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import ShirtIcon from '@lucide/svelte/icons/shirt';
	import UsersIcon from '@lucide/svelte/icons/users';
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
		{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboardIcon },
		{ title: 'Order', url: '/dashboard/orders', icon: ReceiptIcon },
		{ title: 'Proses', url: '/dashboard/proses', icon: ColumnsIcon },
		{ title: 'Layanan & Harga', url: '/dashboard/services', icon: ShirtIcon },
		{ title: 'Customer', url: '/dashboard/customers', icon: UsersIcon }
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
