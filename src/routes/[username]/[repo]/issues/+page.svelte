<script lang="ts">
	import { goto } from '$app/navigation';
	import { QuestCard, Pagination } from '$lib';
	import { Plus } from 'lucide-svelte';
	import type { GitHubIssue } from '$lib/api/github';

	interface Props {
		data: {
			issues: GitHubIssue[];
			owner: string;
			repo: string;
			state: 'open' | 'closed';
			page: number;
			hasMore: boolean;
		};
	}

	let { data }: Props = $props();

	function setFilter(state: string) {
		goto(`?state=${state}`, { replaceState: true });
	}
</script>

<svelte:head>
	<title>Issues — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-extrabold text-duo-text">Issues</h1>
		<a href="/{data.owner}/{data.repo}/issues/new" class="duo-btn duo-btn-primary text-xs px-4 py-2.5 no-underline inline-flex items-center gap-1.5">
			<Plus size={14} strokeWidth={2.5} />
			New Issue
		</a>
	</div>

	<!-- Filters -->
	<div class="flex gap-2">
		<button
			class="px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all"
			class:text-white={data.state === 'open'}
			class:bg-duo-gray-100={data.state !== 'open'}
			class:text-duo-gray-400={data.state !== 'open'}
			style:background={data.state === 'open' ? '#58CC02' : undefined}
			style:box-shadow={data.state === 'open' ? '0 3px 0 #46A302' : undefined}
			onclick={() => setFilter('open')}
		>
			🟢 Open
		</button>
		<button
			class="px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all"
			class:text-white={data.state === 'closed'}
			class:bg-duo-gray-100={data.state !== 'closed'}
			class:text-duo-gray-400={data.state !== 'closed'}
			style:background={data.state === 'closed' ? '#CE82FF' : undefined}
			style:box-shadow={data.state === 'closed' ? '0 3px 0 #A568CC' : undefined}
			onclick={() => setFilter('closed')}
		>
			🟣 Closed
		</button>
	</div>

	<!-- Issue list -->
	<div class="space-y-2">
		{#each data.issues as issue}
			<QuestCard
				number={issue.number}
				title={issue.title}
				state={issue.state}
				author={issue.user.login}
				authorAvatar={issue.user.avatar_url}
				createdAt={issue.created_at}
				commentCount={issue.comments}
				labels={issue.labels.map((l) => ({ name: l.name, color: l.color }))}
				href="/{data.owner}/{data.repo}/issues/{issue.number}"
				type="issue"
			/>
		{/each}

		{#if data.issues.length === 0}
			<div class="duo-card p-10 text-center">
				<div class="text-4xl mb-3">{data.state === 'open' ? '🎉' : '📭'}</div>
				<h2 class="text-lg font-extrabold text-duo-text">No {data.state} issues</h2>
				<p class="text-sm text-duo-text-light font-bold mt-1">{data.state === 'open' ? 'All clear — nothing to work on' : 'No closed issues yet'}</p>
			</div>
		{/if}

		<Pagination currentPage={data.page} hasMore={data.hasMore} />
	</div>
</div>
