<script lang="ts">
	import { goto } from '$app/navigation';
	import { QuestCard, Pagination } from '$lib';
	import type { GitHubPull } from '$lib/api/github';

	interface Props {
		data: {
			pulls: GitHubPull[];
			owner: string;
			repo: string;
			state: 'open' | 'closed';
			page: number;
			hasMore: boolean;
		};
	}

	let { data }: Props = $props();

	function prState(pr: GitHubPull): 'open' | 'merged' | 'closed' {
		if (pr.merged) return 'merged';
		return pr.state;
	}

	function setFilter(state: string) {
		goto(`?state=${state}`, { replaceState: true });
	}
</script>

<svelte:head>
	<title>Pull Requests — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-5">
	<h1 class="text-2xl font-extrabold text-duo-text">Pull Requests</h1>

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
			🟣 Closed / Merged
		</button>
	</div>

	<!-- PR list -->
	<div class="space-y-2">
		{#each data.pulls as pr}
			<QuestCard
				number={pr.number}
				title={pr.title}
				state={prState(pr)}
				draft={pr.draft}
				author={pr.user.login}
				authorAvatar={pr.user.avatar_url}
				createdAt={pr.created_at}
				commentCount={pr.comments}
				labels={pr.labels.map((l) => ({ name: l.name, color: l.color }))}
				href="/{data.owner}/{data.repo}/pulls/{pr.number}"
				type="pr"
			/>
		{/each}

		{#if data.pulls.length === 0}
			<div class="duo-card p-10 text-center">
				<div class="text-4xl mb-3">{data.state === 'open' ? '🎉' : '📭'}</div>
				<h2 class="text-lg font-extrabold text-duo-text">No {data.state} pull requests</h2>
				<p class="text-sm text-duo-text-light font-bold mt-1">{data.state === 'open' ? 'No PRs waiting for review' : 'No closed or merged PRs yet'}</p>
			</div>
		{/if}

		<Pagination currentPage={data.page} hasMore={data.hasMore} />
	</div>
</div>
