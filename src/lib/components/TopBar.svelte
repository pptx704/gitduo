<script lang="ts">
	import { goto } from '$app/navigation';
	import { Search, Bell } from 'lucide-svelte';

	interface Props {
		avatarUrl?: string;
		username?: string;
		unreadCount?: number;
	}

	let { avatarUrl, username, unreadCount = 0 }: Props = $props();

	let searchQuery = $state('');

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
			searchQuery = '';
		}
	}
</script>

<header class="topbar">
	<a href="/" class="flex items-center gap-2 no-underline flex-shrink-0">
		<span class="text-xl">🐙</span>
		<span class="text-base font-extrabold text-duo-text tracking-tight hidden sm:inline">GitDuo</span>
	</a>

	<form onsubmit={handleSearch} class="flex-1 max-w-md mx-4">
		<div class="relative">
			<Search size={16} strokeWidth={2.5} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-duo-gray-300 pointer-events-none" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search repositories..."
				class="w-full bg-duo-snow border-2 border-duo-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm font-bold text-duo-text placeholder:text-duo-gray-300 focus:border-duo-blue focus:outline-none transition-colors"
			/>
		</div>
	</form>

	<div class="flex items-center gap-3">
		<a href="/notifications" class="relative no-underline text-duo-gray-400 hover:text-duo-text transition-colors">
			<Bell size={22} strokeWidth={2} />
			{#if unreadCount > 0}
				<span class="absolute -top-1.5 -right-1.5 bg-duo-red text-white text-[9px] font-extrabold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
					{unreadCount > 99 ? '99+' : unreadCount}
				</span>
			{/if}
		</a>

		{#if avatarUrl && username}
			<a href="/{username}" class="no-underline">
				<img src={avatarUrl} alt={username} class="w-8 h-8 rounded-full border-2 border-duo-green" />
			</a>
		{/if}
	</div>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		padding: 12px 20px;
		background: oklch(99% 0.005 145);
		border-bottom: 2px solid oklch(92% 0.01 145);
		z-index: 30;
	}

	@media (min-width: 769px) {
		.topbar {
			display: none;
		}
	}
</style>
