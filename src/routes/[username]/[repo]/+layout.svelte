<script lang="ts">
	import { page } from '$app/state';
	import {
		Star,
		GitFork,
		Eye,
		CircleDot,
		Code,
		GitPullRequest,
		GitCommitHorizontal,
		Tag,
		Lock,
		Zap
	} from 'lucide-svelte';
	import type { GitHubRepo } from '$lib/api/github';
	import type { Snippet } from 'svelte';

	interface Props {
		data: {
			repo: GitHubRepo | null;
			owner: string;
			repoName: string;
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();
	const repo = $derived(data.repo);
	const basePath = $derived(`/${data.owner}/${data.repoName}`);

	const activeTab = $derived.by(() => {
		const path = page.url.pathname;
		if (path.startsWith(`${basePath}/issues`)) return 'issues';
		if (path.startsWith(`${basePath}/pulls`)) return 'pulls';
		if (path.startsWith(`${basePath}/actions`)) return 'actions';
		if (path.startsWith(`${basePath}/commits`)) return 'commits';
		if (path.startsWith(`${basePath}/releases`)) return 'releases';
		return 'code';
	});

	const tabs = $derived([
		{ id: 'code', href: basePath, label: 'Code', icon: Code },
		{
			id: 'issues',
			href: `${basePath}/issues`,
			label: 'Issues',
			icon: CircleDot,
			count: repo?.open_issues_count
		},
		{ id: 'pulls', href: `${basePath}/pulls`, label: 'Pull Requests', icon: GitPullRequest },
		{ id: 'actions', href: `${basePath}/actions`, label: 'Actions', icon: Zap },
		{ id: 'commits', href: `${basePath}/commits`, label: 'Commits', icon: GitCommitHorizontal },
		{ id: 'releases', href: `${basePath}/releases`, label: 'Releases', icon: Tag }
	]);
</script>

<svelte:head>
	<title>{repo?.full_name ?? `${data.owner}/${data.repoName}`} — GitDuo</title>
</svelte:head>

{#if repo}
	<div class="repo-layout">
		<!-- Header -->
		<header class="repo-header">
			<div class="flex items-center gap-2 flex-wrap">
				<a
					href="/{repo.owner.login}"
					class="flex items-center gap-1.5 text-sm font-bold text-duo-gray-400 no-underline hover:text-duo-blue transition-colors"
				>
					<img src={repo.owner.avatar_url} alt="" class="w-6 h-6 rounded-full" />
					{repo.owner.login}
				</a>
				<span class="text-duo-gray-300 font-normal">/</span>
				<span class="text-xl font-extrabold text-duo-text">{repo.name}</span>
				{#if repo.private}
					<span class="repo-badge badge-private"><Lock size={10} strokeWidth={3} /> Private</span
					>
				{/if}
				{#if repo.fork}
					<span class="repo-badge badge-fork">Fork</span>
				{/if}
			</div>

			{#if repo.description}
				<p class="text-sm text-duo-text-light font-semibold mt-1.5 leading-relaxed">
					{repo.description}
				</p>
			{/if}

			{#if repo.topics && repo.topics.length > 0}
				<div class="flex flex-wrap gap-1.5 mt-2">
					{#each repo.topics as topic}
						<a
							href="/explore?q=topic:{topic}"
							class="topic-pill"
						>
							{topic}
						</a>
					{/each}
				</div>
			{/if}

			<!-- Stats row -->
			<div class="flex flex-wrap items-center gap-4 mt-3">
				{#each [
					{ icon: Star, value: repo.stargazers_count, label: 'Stars', color: 'text-duo-yellow' },
					{ icon: GitFork, value: repo.forks_count, label: 'Forks', color: 'text-duo-blue' },
					{ icon: Eye, value: repo.watchers_count, label: 'Watchers', color: 'text-duo-gray-400' }
				] as stat}
					{@const StatIcon = stat.icon}
					<span class="flex items-center gap-1.5">
						<span class={stat.color}><StatIcon size={14} strokeWidth={2.5} /></span>
						<span class="text-sm font-extrabold text-duo-text"
							>{stat.value.toLocaleString()}</span
						>
						<span class="text-[11px] font-bold text-duo-gray-400 uppercase tracking-wider"
							>{stat.label}</span
						>
					</span>
				{/each}
				{#if repo.license}
					<span class="flex items-center gap-1.5">
						<Tag size={12} strokeWidth={2.5} class="text-duo-gray-400" />
						<span class="text-xs font-bold text-duo-gray-400">{repo.license.name}</span>
					</span>
				{/if}
			</div>
		</header>

		<!-- Tab Navigation -->
		<nav class="repo-tabs">
			{#each tabs as tab}
				{@const TabIcon = tab.icon}
				<a href={tab.href} class="tab-item" class:tab-active={activeTab === tab.id}>
					<TabIcon size={15} strokeWidth={2.5} />
					<span>{tab.label}</span>
					{#if tab.count !== undefined && tab.count > 0}
						<span class="tab-count" class:tab-count-active={activeTab === tab.id}
							>{tab.count.toLocaleString()}</span
						>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- Page Content -->
		<div class="repo-content">
			{@render children()}
		</div>
	</div>
{:else}
	<div class="duo-card p-12 text-center">
		<div class="text-5xl mb-4">📦</div>
		<h2 class="text-xl font-extrabold text-duo-text mb-2">Repository not found</h2>
		<p class="text-sm text-duo-text-light font-bold">
			It may be private or the URL might be wrong
		</p>
	</div>
{/if}

<style>
	.repo-layout {
		display: flex;
		flex-direction: column;
	}

	.repo-header {
		padding-bottom: 16px;
	}

	.repo-badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 2px 8px;
		border-radius: 99px;
	}

	.badge-private {
		background: oklch(94% 0.005 145);
		color: #6E6E6E;
	}

	.badge-fork {
		background: oklch(93% 0.04 230);
		color: #1899d6;
	}

	.topic-pill {
		font-size: 11px;
		font-weight: 800;
		background: oklch(93% 0.04 230);
		color: #1899d6;
		padding: 3px 10px;
		border-radius: 99px;
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.topic-pill:hover {
		background: #1cb0f6;
		color: white;
	}

	/* Tab Navigation */
	.repo-tabs {
		display: flex;
		gap: 2px;
		border-bottom: 2px solid #e5e5e5;
		overflow-x: auto;
		margin-bottom: 20px;
		scrollbar-width: none;
	}

	.repo-tabs::-webkit-scrollbar {
		display: none;
	}

	.tab-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 12px 16px;
		font-size: 13px;
		font-weight: 700;
		color: #6E6E6E;
		text-decoration: none;
		border-bottom: 3px solid transparent;
		border-radius: 12px 12px 0 0;
		white-space: nowrap;
		transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
		margin-bottom: -2px;
	}

	.tab-item:hover {
		color: #3c3c3c;
		background: oklch(97% 0.01 145);
	}

	.tab-active {
		color: #58cc02;
		border-bottom-color: #58cc02;
		font-weight: 800;
		background: oklch(97% 0.02 145);
	}

	.tab-count {
		font-size: 11px;
		font-weight: 800;
		background: #e5e5e5;
		color: #6E6E6E;
		padding: 1px 7px;
		border-radius: 99px;
		line-height: 1.4;
	}

	.tab-count-active {
		background: oklch(93% 0.06 145);
		color: #46a302;
	}
</style>
