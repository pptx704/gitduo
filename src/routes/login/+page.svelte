<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { Flame, Zap, Trophy } from 'lucide-svelte';
</script>

<svelte:head>
	<title>GitDuo — Login</title>
</svelte:head>

<div class="login-page">
	<div class="text-center mb-12 animate-slide-up">
		<div class="text-[120px] leading-none mb-6">🐙</div>
		<h1 class="login-title">GitDuo</h1>
		<p class="text-xl mt-4 font-extrabold" style="color: oklch(55% 0.1 145)">GitHub, but way more fun</p>
	</div>

	<a
		href="/auth/login"
		class="duo-btn duo-btn-primary text-lg px-14 py-5 no-underline animate-slide-up"
		style="animation-delay: 0.1s; font-size: 17px"
	>
		CONTINUE WITH GITHUB
	</a>

	<div class="mt-14 flex flex-col sm:flex-row gap-10 animate-slide-up" style="animation-delay: 0.2s">
		<div class="flex flex-col items-center gap-2">
			<span class="w-16 h-16 rounded-2xl flex items-center justify-center text-duo-orange" style="background: oklch(95% 0.05 60)"><Flame size={30} strokeWidth={2.5} /></span>
			<span class="text-sm font-extrabold uppercase tracking-wider text-duo-text mt-1">Streaks</span>
			<span class="text-xs font-bold text-duo-gray-300">Build daily habits</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<span class="w-16 h-16 rounded-2xl flex items-center justify-center text-duo-green" style="background: oklch(95% 0.05 145)"><Zap size={30} strokeWidth={2.5} /></span>
			<span class="text-sm font-extrabold uppercase tracking-wider text-duo-text mt-1">XP</span>
			<span class="text-xs font-bold text-duo-gray-300">Track your progress</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<span class="w-16 h-16 rounded-2xl flex items-center justify-center text-duo-yellow" style="background: oklch(95% 0.05 90)"><Trophy size={30} strokeWidth={2.5} /></span>
			<span class="text-sm font-extrabold uppercase tracking-wider text-duo-text mt-1">Badges</span>
			<span class="text-xs font-bold text-duo-gray-300">Earn achievements</span>
		</div>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: linear-gradient(180deg, oklch(92% 0.06 145) 0%, oklch(97.5% 0.007 145) 60%);
	}

	.login-title {
		font-size: clamp(3.5rem, 8vw, 5rem);
		font-weight: 800;
		color: #3C3C3C;
		letter-spacing: -0.02em;
	}
</style>
