<script lang="ts">
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import LoginForm from '#lib/components/login-form.svelte';
</script>

<svelte:head>
	<title>Sign in — SveltePlate</title>
	<meta name="description" content="Sign in or create your SveltePlate account." />
</svelte:head>

<div class="grid min-h-svh lg:grid-cols-2">
	<section class="flex flex-col gap-4 p-6 md:p-10">
		<a
			href="/"
			class="flex items-center gap-2 self-center font-semibold tracking-tight md:self-start"
		>
			<span
				class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
			>
				<GalleryVerticalEndIcon class="size-4" />
			</span>
			SveltePlate
		</a>
		<div class="flex flex-1 items-center justify-center py-8">
			<div class="w-full max-w-sm"><LoginForm /></div>
		</div>
	</section>
	<aside
		class="relative hidden overflow-hidden bg-primary lg:block"
		aria-label="SveltePlate workspace preview"
	>
		<div
			class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.13_270_/_0.8),transparent_52%),linear-gradient(145deg,oklch(0.31_0.16_270),oklch(0.2_0.09_275))]"
		></div>
		<div class="absolute -right-24 top-20 size-96 rounded-full border border-white/10"></div>
		<div class="absolute -right-10 top-34 size-72 rounded-full border border-white/10"></div>
		<div
			class="relative flex h-full min-h-[520px] flex-col p-10 text-primary-foreground md:p-12 xl:p-16"
		>
			<div class="flex flex-1 flex-col justify-center">
				<div class="max-w-lg">
					<p class="text-sm font-medium text-white/65">A good place to begin</p>
					<h2 class="mt-4 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
						Make room for your next big idea.
					</h2>
					<p class="mt-5 max-w-md leading-7 text-white/70">
						Your tools, your workflow, your product. Start with a foundation that gets out of your
						way.
					</p>
				</div>
				<div
					class="mt-10 max-w-lg rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-sm"
				>
					<div class="flex items-center gap-3">
						<span class="flex size-10 items-center justify-center rounded-xl bg-white/15">
							<GalleryVerticalEndIcon class="size-5" />
						</span>
						<div>
							<p class="text-sm font-semibold">A workspace built around you</p>
							<p class="mt-1 text-xs text-white/65">Everything starts with one small step.</p>
						</div>
					</div>
					<div class="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
						<div class="h-full w-2/3 rounded-full bg-white/80"></div>
					</div>
				</div>
			</div>
			<p class="mt-8 text-xs text-white/50">SveltePlate · Start with clarity</p>
		</div>
	</aside>
</div>
