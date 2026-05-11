<script lang="ts">
	import '../app.css';
	import { Sidebar, BottomNav, TopBar } from '$lib';
	import { setCurrentUser } from '$lib/stores/user';
	import { setNotifications } from '$lib/stores/notifications';
	import { updateRateLimit } from '$lib/stores/ratelimit';
	import { page } from '$app/state';
	import { invalidate, afterNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';

	interface Props {
		data: {
			user: import('$lib/api/github').GitHubUser | null;
			notifications: import('$lib/api/github').GitHubNotification[];
			rateLimit: { limit: number; remaining: number; reset: number };
			streak: number;
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const isAuthPage = $derived(
		page.url.pathname.startsWith('/login') || page.url.pathname.startsWith('/auth')
	);

	const unreadCount = $derived(data.notifications.filter((n) => n.unread).length);

	afterNavigate(() => {
		invalidate('app:ratelimit');
	});

	$effect(() => {
		if (data.user) setCurrentUser(data.user);
		setNotifications(data.notifications);
		updateRateLimit(data.rateLimit);
	});
</script>

<svelte:head>
	<title>GitDuo</title>
</svelte:head>

{#if isAuthPage}
	{@render children()}
{:else if data.user}
	<Sidebar
		username={data.user.login}
		avatarUrl={data.user.avatar_url}
		rateLimit={data.rateLimit}
		streak={data.streak}
		{unreadCount}
	/>
	<TopBar
		avatarUrl={data.user.avatar_url}
		username={data.user.login}
		{unreadCount}
	/>
	<BottomNav username={data.user.login} {unreadCount} />

	<main class="main-content">
		<div class="max-w-4xl mx-auto">
			{@render children()}
		</div>
	</main>
{:else}
	{@render children()}
{/if}

<style>
	.main-content {
		margin-left: 240px;
		padding: 32px 40px 48px;
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 20px 16px 80px;
		}
	}
</style>
