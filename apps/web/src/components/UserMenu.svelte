<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { authClient } from '#lib/auth-client.ts';

	const sessionQuery = authClient.useSession();

	async function handleSignOut() {
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
	}
</script>

{#if $sessionQuery.isPending}
	<div class="h-9 w-20 animate-pulse rounded-lg bg-muted" aria-label="Loading account"></div>
{:else if $sessionQuery.data?.user}
	{@const user = $sessionQuery.data.user}
	<div class="flex items-center gap-3">
		<span
			class="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline"
			title={user.email}
		>
			{user.name || user.email?.split('@')[0] || 'User'}
		</span>
		<Button variant="outline" size="sm" class="rounded-lg" onclick={handleSignOut}>Sign out</Button>
	</div>
{:else}
	<Button href="/login" size="sm" class="rounded-lg">Sign in</Button>
{/if}
