<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { z } from 'zod';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Field,
		FieldDescription,
		FieldGroup,
		FieldLabel
	} from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { authClient } from '#lib/auth-client.ts';

	let mode = $state<'signin' | 'signup'>('signin');
	let mounted = $state(false);
	let isSubmitting = $state(false);
	let isNavigating = $state(false);
	const session = authClient.useSession();

	onMount(() => {
		mounted = true;
	});

	const signInForm = createForm(() => ({
		defaultValues: { email: '', password: '' },
		validators: {
			onSubmit: z.object({
				email: z.email('Enter a valid email address'),
				password: z.string().min(1, 'Password is required')
			})
		},
		onSubmit: async ({ value }) => {
			isSubmitting = true;
			try {
				await authClient.signIn.email(value, {
					onSuccess: async () => {
						await $session.refetch();
						toast.success('Welcome back! You are now signed in.');
						isNavigating = true;
						await goto('/dashboard');
					},
					onError: (error) => {
						toast.error(error.error.message || 'Unable to sign in. Please try again.');
					}
				});
			} finally {
				if (!isNavigating) isSubmitting = false;
			}
		}
	}));

	const signUpForm = createForm(() => ({
		defaultValues: { name: '', email: '', password: '' },
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, 'Name must be at least 2 characters'),
				email: z.email('Enter a valid email address'),
				password: z.string().min(8, 'Password must be at least 8 characters')
			})
		},
		onSubmit: async ({ value }) => {
			isSubmitting = true;
			try {
				await authClient.signUp.email(value, {
					onSuccess: async () => {
						await $session.refetch();
						toast.success('Your account has been created. Welcome!');
						isNavigating = true;
						await goto('/dashboard');
					},
					onError: (error) => {
						toast.error(error.error.message || 'Unable to create your account. Please try again.');
					}
				});
			} finally {
				if (!isNavigating) isSubmitting = false;
			}
		}
	}));
</script>

{#if isSubmitting || isNavigating}
	<div
		class="auth-progress fixed inset-x-0 top-0 z-50"
		role="status"
		aria-label={isNavigating ? 'Opening your workspace' : 'Authenticating'}
	>
		<Progress value={isNavigating ? 85 : 35} class="h-1 rounded-none bg-primary/15" />
	</div>
{/if}

{#if mode === 'signin'}
	<form
		class="flex flex-col gap-6"
		onsubmit={(event) => {
			event.preventDefault();
			signInForm.handleSubmit();
		}}
	>
		<FieldGroup>
			<div class="flex flex-col gap-1 text-center">
				<h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
				<p class="text-sm text-balance text-muted-foreground">
					Sign in to continue to your workspace.
				</p>
			</div>
			<Field>
				<FieldLabel for="signin-email">Email</FieldLabel>
				<signInForm.Field name="email">
					{#snippet children(field)}<Input
							id="signin-email"
							name="email"
							type="email"
							autocomplete="email"
							placeholder="you@example.com"
							required
							onblur={field.handleBlur}
							value={field.state.value}
							oninput={(event) => field.handleChange(event.currentTarget.value)}
						/>{/snippet}
				</signInForm.Field>
			</Field>
			<signInForm.Field name="password">
				{#snippet children(field)}<Field>
						<FieldLabel for="signin-password">Password</FieldLabel><Input
							id="signin-password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							onblur={field.handleBlur}
							value={field.state.value}
							oninput={(event) => field.handleChange(event.currentTarget.value)}
						/>
					</Field>{/snippet}
			</signInForm.Field>
			<Field>
				<signInForm.Subscribe
					selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
				>
					{#snippet children(state)}<Button
							type="submit"
							class="w-full"
							disabled={!mounted || !state.canSubmit || state.isSubmitting}
						>
							{#if state.isSubmitting}<Spinner data-icon="inline-start" />{/if}{state.isSubmitting
								? 'Signing in…'
								: 'Sign in'}
						</Button>{/snippet}
				</signInForm.Subscribe>
			</Field>
			<FieldDescription class="text-center">
				New to SveltePlate? <button
					type="button"
					class="font-medium text-primary underline-offset-4 hover:underline"
					onclick={() => (mode = 'signup')}
				>
					Create an account
				</button>
			</FieldDescription>
		</FieldGroup>
	</form>
{:else}
	<form
		class="flex flex-col gap-6"
		onsubmit={(event) => {
			event.preventDefault();
			signUpForm.handleSubmit();
		}}
	>
		<FieldGroup>
			<div class="flex flex-col gap-1 text-center">
				<h1 class="text-2xl font-bold tracking-tight">Create your account</h1>
				<p class="text-sm text-balance text-muted-foreground">
					Start building your next idea today.
				</p>
			</div>
			<signUpForm.Field name="name">
				{#snippet children(field)}<Field>
						<FieldLabel for="signup-name">Name</FieldLabel><Input
							id="signup-name"
							name="name"
							autocomplete="name"
							placeholder="Your name"
							required
							onblur={field.handleBlur}
							value={field.state.value}
							oninput={(event) => field.handleChange(event.currentTarget.value)}
						/>
					</Field>{/snippet}
			</signUpForm.Field>
			<signUpForm.Field name="email">
				{#snippet children(field)}<Field>
						<FieldLabel for="signup-email">Email</FieldLabel><Input
							id="signup-email"
							name="email"
							type="email"
							autocomplete="email"
							placeholder="you@example.com"
							required
							onblur={field.handleBlur}
							value={field.state.value}
							oninput={(event) => field.handleChange(event.currentTarget.value)}
						/>
					</Field>{/snippet}
			</signUpForm.Field>
			<signUpForm.Field name="password">
				{#snippet children(field)}<Field>
						<FieldLabel for="signup-password">Password</FieldLabel><Input
							id="signup-password"
							name="password"
							type="password"
							autocomplete="new-password"
							minlength={8}
							required
							onblur={field.handleBlur}
							value={field.state.value}
							oninput={(event) => field.handleChange(event.currentTarget.value)}
						/>
						<p class="text-xs text-muted-foreground">Use at least 8 characters.</p>
					</Field>{/snippet}
			</signUpForm.Field>
			<Field>
				<signUpForm.Subscribe
					selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
				>
					{#snippet children(state)}<Button
							type="submit"
							class="w-full"
							disabled={!mounted || !state.canSubmit || state.isSubmitting}
						>
							{#if state.isSubmitting}<Spinner data-icon="inline-start" />{/if}{state.isSubmitting
								? 'Creating account…'
								: 'Create account'}
						</Button>{/snippet}
				</signUpForm.Subscribe>
			</Field>
			<FieldDescription class="text-center">
				Already have an account? <button
					type="button"
					class="font-medium text-primary underline-offset-4 hover:underline"
					onclick={() => (mode = 'signin')}
				>
					Sign in
				</button>
			</FieldDescription>
		</FieldGroup>
	</form>
{/if}
<div class="mt-6 text-center">
	<a
		href="/"
		class="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
	>
		<ArrowLeftIcon class="size-3.5" /> Back to home
	</a>
</div>

<style>
	.auth-progress :global([data-slot='progress-indicator']) {
		animation: auth-progress 1.4s ease-in-out infinite;
	}

	@keyframes auth-progress {
		50% {
			opacity: 0.65;
		}
	}
</style>
