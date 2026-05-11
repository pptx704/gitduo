<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { House, User, Compass, Bell, LogOut, BookOpen, Search } from 'lucide-svelte';
	import RateLimitBar from './RateLimitBar.svelte';
	import StreakBadge from './StreakBadge.svelte';

	interface Props {
		username: string;
		avatarUrl: string;
		streak?: number;
		unreadCount?: number;
		rateLimit?: { remaining: number; limit: number };
	}

	let { username, avatarUrl, streak = 0, unreadCount = 0, rateLimit = { remaining: 5000, limit: 5000 } }: Props = $props();

	let searchQuery = $state('');

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
			searchQuery = '';
		}
	}

	const navItems = [
		{ href: '/', icon: House, label: 'Home' },
		{ href: `/${username}`, icon: User, label: 'Profile' },
		{ href: `/${username}#repositories`, icon: BookOpen, label: 'My Repos' },
		{ href: '/explore', icon: Compass, label: 'Explore' },
		{ href: '/notifications', icon: Bell, label: 'Inbox' }
	] as const;

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<a href="/" class="flex items-center gap-2.5 no-underline">
			<span class="text-3xl">🐙</span>
			<span class="text-xl font-extrabold tracking-tight" style="color: #3B8700">GitDuo</span>
		</a>
	</div>

	<div class="sidebar-search">
		<form onsubmit={handleSearch}>
			<div class="relative">
				<Search size={15} strokeWidth={2.5} class="absolute left-3 top-1/2 -translate-y-1/2 text-duo-gray-300 pointer-events-none" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search..."
					class="w-full bg-white border-2 border-duo-gray-100 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-duo-text placeholder:text-duo-gray-300 focus:border-duo-blue focus:outline-none transition-colors"
				/>
			</div>
		</form>
	</div>

	<div class="px-4 py-4">
		<nav class="flex flex-col gap-1">
			{#each navItems as item}
				{@const Icon = item.icon}
				<a
					href={item.href}
					class="nav-item"
					class:nav-item-active={isActive(item.href)}
				>
					<Icon size={20} strokeWidth={2.5} />
					<span>{item.label}</span>
					{#if item.label === 'Inbox' && unreadCount > 0}
						<span class="ml-auto bg-duo-red text-white text-[9px] font-extrabold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					{/if}
				</a>
			{/each}
		</nav>
	</div>

	<div class="mt-auto">
		<RateLimitBar remaining={rateLimit.remaining} limit={rateLimit.limit} />

		<div class="sidebar-footer">
			<div class="flex items-center justify-between">
				<a href="/{username}" class="flex items-center gap-2.5 no-underline">
					<img src={avatarUrl} alt={username} class="w-9 h-9 rounded-full border-2 border-duo-green" />
					<span class="text-sm font-extrabold text-duo-text">{username}</span>
				</a>
				<StreakBadge count={streak} size="sm" />
			</div>
			<a href="/auth/logout" class="flex items-center gap-2 mt-3 text-xs font-bold text-duo-gray-400 hover:text-duo-red transition-colors no-underline">
				<LogOut size={14} strokeWidth={2.5} />
				<span>Log out</span>
			</a>
		</div>
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: 240px;
		background: oklch(99% 0.005 145);
		border-right: 2px solid oklch(92% 0.01 145);
		display: flex;
		flex-direction: column;
		z-index: 40;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 20px 20px 16px;
		background: oklch(95% 0.03 145);
		border-bottom: 2px solid oklch(90% 0.04 145);
	}

	.sidebar-footer {
		padding: 16px 20px;
		border-top: 2px solid oklch(92% 0.01 145);
		background: oklch(98% 0.008 145);
	}

	.sidebar-search {
		padding: 12px 16px 4px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 11px 16px;
		border-radius: 14px;
		font-size: 15px;
		font-weight: 700;
		color: #6E6E6E;
		text-decoration: none;
		transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.nav-item:hover {
		background: oklch(95% 0.015 145);
		color: #3C3C3C;
		transform: translateX(2px);
	}

	.nav-item-active {
		background: #58CC02;
		color: white;
		font-weight: 800;
		box-shadow: 0 3px 0 #46A302;
	}

	.nav-item-active:hover {
		background: #58CC02;
		color: white;
		transform: none;
	}

	@media (max-width: 768px) {
		.sidebar {
			display: none;
		}
	}
</style>
