<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import UserRoundIcon from '@lucide/svelte/icons/user-round';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { authClient } from '#lib/auth-client.ts';
	import { useSidebar } from '#lib/components/ui/sidebar/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';

	let { user }: { user: { name: string; email: string; avatar?: string | null } } = $props();
	const sidebar = useSidebar();
	const initials = $derived(
		user.name
			.split(' ')
			.map((part) => part[0])
			.slice(0, 2)
			.join('')
			.toUpperCase() || 'U'
	);
	let isSigningOut = $state(false);

	async function handleSignOut() {
		isSigningOut = true;
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: async () => {
						toast.success('You have been signed out.');
						await goto('/');
					},
					onError: (error) => {
						toast.error(error.error.message || 'Unable to sign out. Please try again.');
					}
				}
			});
		} finally {
			isSigningOut = false;
		}
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user.avatar ?? undefined} alt={user.name} /><Avatar.Fallback
								class="rounded-lg"
							>
								{initials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span><span class="truncate text-xs">
								{user.email}
							</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user.avatar ?? undefined} alt={user.name} /><Avatar.Fallback
								class="rounded-lg"
							>
								{initials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 leading-tight">
							<span class="truncate font-medium">{user.name}</span><span
								class="truncate text-xs text-muted-foreground"
							>
								{user.email}
							</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onSelect={() => goto('/dashboard')}>
					<UserRoundIcon />Dashboard
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleSignOut} disabled={isSigningOut}>
					{#if isSigningOut}<Spinner data-icon="inline-start" />{:else}<LogOutIcon
						/>{/if}{isSigningOut ? 'Signing out…' : 'Sign out'}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
