<script lang="ts">
	import { Pagination } from '$lib';
	import { CheckCircle2, XCircle, Clock } from 'lucide-svelte';
	import type { GitHubCommit, GitHubCombinedStatus } from '$lib/api/github';

	interface Props {
		data: {
			commits: GitHubCommit[];
			owner: string;
			repo: string;
			page: number;
			statuses: Record<string, GitHubCombinedStatus>;
		};
	}

	let { data }: Props = $props();

	function timeAgo(dateStr: string): string {
		const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function shortSha(sha: string): string {
		return sha.slice(0, 7);
	}

	function firstLine(msg: string): string {
		return msg.split('\n')[0];
	}

	const grouped = $derived.by(() => {
		const groups: { date: string; commits: GitHubCommit[] }[] = [];
		for (const commit of data.commits) {
			const date = new Date(commit.commit.author.date).toLocaleDateString('en-US', {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			});
			const existing = groups.find((g) => g.date === date);
			if (existing) {
				existing.commits.push(commit);
			} else {
				groups.push({ date, commits: [commit] });
			}
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Commits — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-extrabold text-duo-text">Commits</h1>

	{#each grouped as group}
		<div>
			<div class="flex items-center gap-2.5 mb-3">
				<div class="w-3.5 h-3.5 rounded-full flex-shrink-0" style="background: #58CC02; box-shadow: 0 0 0 3px oklch(92% 0.04 145)"></div>
				<h2 class="text-sm font-extrabold text-duo-gray-400 uppercase tracking-wider">{group.date}</h2>
			</div>

			<div class="duo-card overflow-hidden divide-y divide-duo-gray-100">
				{#each group.commits as commit}
					<a
						href="/{data.owner}/{data.repo}/commits/{commit.sha}"
						class="flex items-start gap-3 p-4 hover:bg-duo-snow/50 transition-colors no-underline"
					>
						{#if commit.author}
							<img src={commit.author.avatar_url} alt={commit.author.login} class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy" />
						{:else}
							<div class="w-8 h-8 rounded-full bg-duo-gray-100 flex items-center justify-center text-xs text-duo-gray-400 flex-shrink-0">?</div>
						{/if}

						<div class="flex-1 min-w-0">
							<p class="text-sm font-bold text-duo-text leading-snug">
								{firstLine(commit.commit.message)}
							</p>
							<div class="flex items-center gap-2 mt-1 text-xs text-duo-gray-400 font-bold">
								<span>{commit.author?.login ?? commit.commit.author.name}</span>
								<span>·</span>
								<span>{timeAgo(commit.commit.author.date)}</span>
							</div>
						</div>

						<div class="flex items-center gap-2 flex-shrink-0">
							{#if data.statuses[commit.sha]}
								{@const status = data.statuses[commit.sha]}
								{#if status.state === 'success'}
									<CheckCircle2 size={16} strokeWidth={2.5} class="text-duo-green" />
								{:else if status.state === 'failure' || status.state === 'error'}
									<XCircle size={16} strokeWidth={2.5} class="text-duo-red" />
								{:else}
									<Clock size={16} strokeWidth={2.5} class="text-duo-orange" />
								{/if}
							{/if}
							<code class="text-xs font-mono bg-duo-snow text-duo-gray-400 px-2 py-1 rounded-lg border border-duo-gray-100">
								{shortSha(commit.sha)}
							</code>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/each}

	{#if data.commits.length === 0}
		<div class="duo-card p-10 text-center">
			<div class="text-4xl mb-3">📝</div>
			<h2 class="text-lg font-extrabold text-duo-text">No commits yet</h2>
		</div>
	{/if}

	<Pagination currentPage={data.page} hasMore={data.commits.length >= 30} />
</div>
