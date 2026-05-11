<script lang="ts">
	import { goto } from '$app/navigation';
	import { UnitCard } from '$lib';
	import { Search, TrendingUp } from 'lucide-svelte';
	import type { GitHubRepo } from '$lib/api/github';

	interface Props {
		data: {
			repos: GitHubRepo[];
			query: string;
			totalCount?: number;
		};
	}

	let { data }: Props = $props();

	let searchQuery = $state(data.query);

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			goto('/explore');
		}
	}

	const langTopics = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'Ruby', 'Swift'];
</script>

<svelte:head>
	<title>Explore — GitDuo</title>
</svelte:head>

<div class="space-y-8">
	<!-- Search hero -->
	<div class="text-center py-8 px-4 rounded-3xl" style="background: oklch(96% 0.02 230)">
		<h1 class="text-4xl font-extrabold text-duo-text mb-2">Explore</h1>
		<p class="text-duo-text-light font-bold mb-7 text-base">Find your next favorite repo</p>

		<form onsubmit={handleSearch} class="max-w-lg mx-auto">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search repositories..."
				class="w-full bg-white border-2 border-duo-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-duo-text placeholder:text-duo-gray-300 focus:border-duo-blue focus:outline-none transition-colors"
				style="box-shadow: 0 4px 0 oklch(90% 0.01 230)"
			/>
		</form>
	</div>

	<!-- Language topic pills -->
	{#if !data.query}
		<div class="flex flex-wrap gap-2.5 justify-center">
			{#each langTopics as lang}
				<a
					href="/explore?q=language:{lang.toLowerCase()}"
					class="topic-pill"
				>
					{lang}
				</a>
			{/each}
		</div>
	{/if}

	<!-- Results header -->
	{#if data.query}
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-extrabold text-duo-text">
				Results for "{data.query}" <span class="text-duo-gray-400 font-bold text-sm">({data.totalCount?.toLocaleString() ?? 0})</span>
			</h2>
			<a href="/explore" class="text-sm font-bold text-duo-blue no-underline hover:underline">Clear</a>
		</div>
	{:else}
		<h2 class="text-xl font-extrabold text-duo-text flex items-center gap-2"><TrendingUp size={22} strokeWidth={2.5} class="text-duo-orange" /> Trending This Week</h2>
	{/if}

	<!-- Repo grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		{#each data.repos as repo}
			<UnitCard
				name={repo.name}
				fullName={repo.full_name}
				description={repo.description}
				language={repo.language}
				stars={repo.stargazers_count}
				forks={repo.forks_count}
				isPrivate={repo.private}
			/>
		{/each}
	</div>

	{#if data.repos.length === 0}
		<div class="duo-card p-10 text-center">
			<div class="text-duo-gray-300 flex justify-center mb-3"><Search size={40} strokeWidth={1.5} /></div>
			<h2 class="text-lg font-extrabold text-duo-text">No results found</h2>
			<p class="text-sm text-duo-text-light font-bold mt-1">Try different keywords or <a href="/explore" class="text-duo-blue no-underline hover:underline">browse trending</a></p>
		</div>
	{/if}
</div>

<style>
	.topic-pill {
		padding: 10px 20px;
		border-radius: 12px;
		background: white;
		border: 2px solid #E5E5E5;
		font-size: 14px;
		font-weight: 800;
		color: #3C3C3C;
		text-decoration: none;
		box-shadow: 0 3px 0 #E5E5E5;
		transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1),
			border-color 0.15s, color 0.15s;
	}

	.topic-pill:hover,
	.topic-pill:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 5px 0 oklch(85% 0.04 230);
		border-color: #1CB0F6;
		color: #1CB0F6;
	}

	.topic-pill:active {
		transform: translateY(1px);
		box-shadow: 0 1px 0 oklch(85% 0.04 230);
	}
</style>
