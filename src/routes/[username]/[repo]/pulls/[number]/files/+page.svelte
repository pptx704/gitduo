<script lang="ts">
	import { DiffViewer } from '$lib';
	import { ChevronLeft } from 'lucide-svelte';
	import type { GitHubPull, GitHubCommitFile } from '$lib/api/github';

	interface Props {
		data: {
			files: GitHubCommitFile[];
			owner: string;
			repo: string;
			number: number;
			pull: GitHubPull | null;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Files changed — #{data.number} — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-3">
		<a href="/{data.owner}/{data.repo}/pulls/{data.number}" class="text-sm font-bold text-duo-blue hover:underline no-underline flex items-center gap-1">
			<ChevronLeft size={16} strokeWidth={2.5} /> #{data.number}
		</a>
		<h1 class="text-xl font-extrabold text-duo-text truncate">{data.pull?.title ?? `PR #${data.number}`}</h1>
	</div>

	{#if data.files.length > 0}
		<DiffViewer files={data.files} />
	{:else}
		<div class="duo-card p-10 text-center">
			<div class="text-4xl mb-3">📝</div>
			<h2 class="text-lg font-extrabold text-duo-text">No files changed</h2>
		</div>
	{/if}
</div>
