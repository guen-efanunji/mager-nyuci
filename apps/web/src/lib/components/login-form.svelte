<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import SearchIcon from '@lucide/svelte/icons/search';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import { authClient } from '#lib/auth-client.ts';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';

	let mode = $state<'signin' | 'signup'>('signin');
	let mounted = $state(false);
	let isSubmitting = $state(false);
	let isNavigating = $state(false);
	let showSignInPassword = $state(false);
	let showSignUpPassword = $state(false);
	let authError = $state<string | null>(null);
	const session = authClient.useSession();

	onMount(() => {
		mounted = true;
	});

	function switchMode(nextMode: 'signin' | 'signup') {
		mode = nextMode;
		authError = null;
	}

	function formatErrors(errors: unknown[]): { message?: string }[] {
		return errors
			.map((err) => {
				if (typeof err === 'string') return { message: err };
				if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
					return { message: err.message };
				}
				return null;
			})
			.filter((item): item is { message: string } => item !== null);
	}

	const signInForm = createForm(() => ({
		defaultValues: { email: '', password: '' },
		validators: {
			onSubmit: z.object({
				email: z.email('Masukkan alamat email yang valid'),
				password: z.string().min(1, 'Kata sandi wajib diisi')
			})
		},
		onSubmit: async ({ value }) => {
			isSubmitting = true;
			authError = null;
			try {
				await authClient.signIn.email(value, {
					onSuccess: async () => {
						await $session.refetch();
						toast.success('Selamat datang kembali! Berhasil masuk.');
						isNavigating = true;
						await goto('/dashboard');
					},
					onError: (error) => {
						const msg = error.error.message || 'Email atau kata sandi tidak sesuai.';
						authError = msg;
						toast.error(msg);
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
				name: z.string().min(2, 'Nama minimal 2 karakter'),
				email: z.email('Masukkan alamat email yang valid'),
				password: z.string().min(8, 'Kata sandi minimal 8 karakter')
			})
		},
		onSubmit: async ({ value }) => {
			isSubmitting = true;
			authError = null;
			try {
				await authClient.signUp.email(value, {
					onSuccess: async () => {
						await $session.refetch();
						toast.success('Akun berhasil dibuat. Selamat datang di KiloTrack!');
						isNavigating = true;
						await goto('/dashboard');
					},
					onError: (error) => {
						const msg = error.error.message || 'Tidak dapat membuat akun. Silakan coba lagi.';
						authError = msg;
						toast.error(msg);
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
		aria-label={isNavigating ? 'Membuka dashboard' : 'Memproses autentikasi'}
	>
		<Progress value={isNavigating ? 85 : 35} class="h-1 rounded-none bg-primary/15" />
	</div>
{/if}

<Card.Root class="shadow-sm">
	<Card.Header class="text-center">
		<Card.Title class="text-2xl font-bold tracking-tight">
			{mode === 'signin' ? 'Masuk ke Dashboard' : 'Buat Akun Staf'}
		</Card.Title>
		<Card.Description class="text-balance">
			{mode === 'signin'
				? 'Masuk menggunakan akun staf atau admin KiloTrack.'
				: 'Daftarkan akun baru untuk mengakses dashboard operasional outlet.'}
		</Card.Description>
	</Card.Header>

	<Card.Content class="flex flex-col gap-5">
		{#if authError}
			<Alert.Root variant="destructive">
				<CircleAlertIcon />
				<Alert.Title>{mode === 'signin' ? 'Gagal Masuk' : 'Gagal Mendaftar'}</Alert.Title>
				<Alert.Description>{authError}</Alert.Description>
			</Alert.Root>
		{/if}

		{#if mode === 'signin'}
			<form
				class="flex flex-col gap-5"
				onsubmit={(event) => {
					event.preventDefault();
					signInForm.handleSubmit();
				}}
			>
				<Field.FieldGroup>
					<signInForm.Field name="email">
						{#snippet children(field)}
							{@const errs = formatErrors(field.state.meta.errors)}
							{@const invalid = field.state.meta.isTouched && errs.length > 0}
							<Field.Field data-invalid={invalid || undefined}>
								<Field.FieldLabel for="signin-email">Email</Field.FieldLabel>
								<Input
									id="signin-email"
									name="email"
									type="email"
									autocomplete="email"
									placeholder="kasir@kilotrack.id"
									aria-invalid={invalid || undefined}
									required
									onblur={field.handleBlur}
									value={field.state.value}
									oninput={(event) => field.handleChange(event.currentTarget.value)}
								/>
								{#if invalid}
									<Field.FieldError errors={errs} />
								{/if}
							</Field.Field>
						{/snippet}
					</signInForm.Field>

					<signInForm.Field name="password">
						{#snippet children(field)}
							{@const errs = formatErrors(field.state.meta.errors)}
							{@const invalid = field.state.meta.isTouched && errs.length > 0}
							<Field.Field data-invalid={invalid || undefined}>
								<Field.FieldLabel for="signin-password">Kata Sandi</Field.FieldLabel>
								<InputGroup.Root>
									<InputGroup.Input
										id="signin-password"
										name="password"
										type={showSignInPassword ? 'text' : 'password'}
										autocomplete="current-password"
										placeholder="Masukkan kata sandi"
										aria-invalid={invalid || undefined}
										required
										onblur={field.handleBlur}
										value={field.state.value}
										oninput={(event) => field.handleChange(event.currentTarget.value)}
									/>
									<InputGroup.Addon align="inline-end">
										<InputGroup.Button
											size="icon-xs"
											aria-label={showSignInPassword
												? 'Sembunyikan kata sandi'
												: 'Lihat kata sandi'}
											onclick={() => (showSignInPassword = !showSignInPassword)}
										>
											{#if showSignInPassword}
												<EyeOffIcon />
											{:else}
												<EyeIcon />
											{/if}
										</InputGroup.Button>
									</InputGroup.Addon>
								</InputGroup.Root>
								{#if invalid}
									<Field.FieldError errors={errs} />
								{/if}
							</Field.Field>
						{/snippet}
					</signInForm.Field>

					<Field.Field>
						<signInForm.Subscribe
							selector={(state) => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting
							})}
						>
							{#snippet children(state)}
								<Button
									type="submit"
									class="w-full"
									disabled={!mounted || !state.canSubmit || state.isSubmitting}
								>
									{#if state.isSubmitting}
										<Spinner data-icon="inline-start" />
										Memproses…
									{:else}
										<LogInIcon data-icon="inline-start" />
										Masuk
									{/if}
								</Button>
							{/snippet}
						</signInForm.Subscribe>
					</Field.Field>
				</Field.FieldGroup>

				<p class="text-center text-sm text-muted-foreground">
					Belum punya akun staf?
					<button
						type="button"
						class="font-medium text-primary underline-offset-4 hover:underline"
						onclick={() => switchMode('signup')}
					>
						Daftar akun
					</button>
				</p>
			</form>
		{:else}
			<form
				class="flex flex-col gap-5"
				onsubmit={(event) => {
					event.preventDefault();
					signUpForm.handleSubmit();
				}}
			>
				<Field.FieldGroup>
					<signUpForm.Field name="name">
						{#snippet children(field)}
							{@const errs = formatErrors(field.state.meta.errors)}
							{@const invalid = field.state.meta.isTouched && errs.length > 0}
							<Field.Field data-invalid={invalid || undefined}>
								<Field.FieldLabel for="signup-name">Nama Lengkap</Field.FieldLabel>
								<Input
									id="signup-name"
									name="name"
									autocomplete="name"
									placeholder="Nama staf atau kasir"
									aria-invalid={invalid || undefined}
									required
									onblur={field.handleBlur}
									value={field.state.value}
									oninput={(event) => field.handleChange(event.currentTarget.value)}
								/>
								{#if invalid}
									<Field.FieldError errors={errs} />
								{/if}
							</Field.Field>
						{/snippet}
					</signUpForm.Field>

					<signUpForm.Field name="email">
						{#snippet children(field)}
							{@const errs = formatErrors(field.state.meta.errors)}
							{@const invalid = field.state.meta.isTouched && errs.length > 0}
							<Field.Field data-invalid={invalid || undefined}>
								<Field.FieldLabel for="signup-email">Email</Field.FieldLabel>
								<Input
									id="signup-email"
									name="email"
									type="email"
									autocomplete="email"
									placeholder="kasir@kilotrack.id"
									aria-invalid={invalid || undefined}
									required
									onblur={field.handleBlur}
									value={field.state.value}
									oninput={(event) => field.handleChange(event.currentTarget.value)}
								/>
								{#if invalid}
									<Field.FieldError errors={errs} />
								{/if}
							</Field.Field>
						{/snippet}
					</signUpForm.Field>

					<signUpForm.Field name="password">
						{#snippet children(field)}
							{@const errs = formatErrors(field.state.meta.errors)}
							{@const invalid = field.state.meta.isTouched && errs.length > 0}
							<Field.Field data-invalid={invalid || undefined}>
								<Field.FieldLabel for="signup-password">Kata Sandi</Field.FieldLabel>
								<InputGroup.Root>
									<InputGroup.Input
										id="signup-password"
										name="password"
										type={showSignUpPassword ? 'text' : 'password'}
										autocomplete="new-password"
										placeholder="Minimal 8 karakter"
										aria-invalid={invalid || undefined}
										minlength={8}
										required
										onblur={field.handleBlur}
										value={field.state.value}
										oninput={(event) => field.handleChange(event.currentTarget.value)}
									/>
									<InputGroup.Addon align="inline-end">
										<InputGroup.Button
											size="icon-xs"
											aria-label={showSignUpPassword
												? 'Sembunyikan kata sandi'
												: 'Lihat kata sandi'}
											onclick={() => (showSignUpPassword = !showSignUpPassword)}
										>
											{#if showSignUpPassword}
												<EyeOffIcon />
											{:else}
												<EyeIcon />
											{/if}
										</InputGroup.Button>
									</InputGroup.Addon>
								</InputGroup.Root>
								{#if invalid}
									<Field.FieldError errors={errs} />
								{:else}
									<Field.FieldDescription>Gunakan minimal 8 karakter.</Field.FieldDescription>
								{/if}
							</Field.Field>
						{/snippet}
					</signUpForm.Field>

					<Field.Field>
						<signUpForm.Subscribe
							selector={(state) => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting
							})}
						>
							{#snippet children(state)}
								<Button
									type="submit"
									class="w-full"
									disabled={!mounted || !state.canSubmit || state.isSubmitting}
								>
									{#if state.isSubmitting}
										<Spinner data-icon="inline-start" />
										Mendaftarkan…
									{:else}
										<UserPlusIcon data-icon="inline-start" />
										Buat Akun
									{/if}
								</Button>
							{/snippet}
						</signUpForm.Subscribe>
					</Field.Field>
				</Field.FieldGroup>

				<p class="text-center text-sm text-muted-foreground">
					Sudah punya akun?
					<button
						type="button"
						class="font-medium text-primary underline-offset-4 hover:underline"
						onclick={() => switchMode('signin')}
					>
						Masuk
					</button>
				</p>
			</form>
		{/if}
	</Card.Content>

	<Card.Footer class="flex flex-col gap-3 border-t pt-4">
		<div class="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">
			<a href="/" class="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
				<ArrowLeftIcon class="size-3.5" />
				Kembali ke beranda
			</a>
			<Separator orientation="vertical" class="h-3.5" />
			<a
				href="/cek"
				class="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:underline"
			>
				<SearchIcon class="size-3.5" />
				Cek Status Cucian
			</a>
		</div>
	</Card.Footer>
</Card.Root>

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
