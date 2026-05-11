<script lang="ts">
	import { Avatar, PillBadge, MarkdownRenderer } from '$lib';
	import { ChevronLeft, GitMerge, FileCode, CheckCircle2, XCircle, Clock, CircleDot, Loader2 } from 'lucide-svelte';
	import type { GitHubPull, GitHubComment, GitHubCheckRun, GitHubCombinedStatus } from '$lib/api/github';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		data: {
			pull: GitHubPull | null;
			comments: GitHubComment[];
			checkRuns: GitHubCheckRun[];
			commitStatus: GitHubCombinedStatus | null;
			owner: string;
			repo: string;
		};
	}

	let { data }: Props = $props();
	const pr = $derived(data.pull);

	let merging = $state(false);
	let merged = $state(false);
	let mergeError = $state('');

	function prVariant(pr: GitHubPull): 'open' | 'merged' | 'closed' | 'draft' {
		if (pr.draft) return 'draft';
		if (pr.merged) return 'merged';
		return pr.state;
	}

	function timeAgo(dateStr: string): string {
		const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString();
	}

	async function handleMerge() {
		if (!pr || merging) return;
		merging = true;
		mergeError = '';
		try {
			const res = await fetch('/api/merge', {
				method: 'POST',
				body: JSON.stringify({ owner: data.owner, repo: data.repo, number: pr.number })
			});
			const result = await res.json();
			if (result.merged) {
				merged = true;
				await invalidateAll();
			} else {
				mergeError = result.message ?? 'Merge failed';
			}
		} catch (e) {
			mergeError = 'Merge request failed';
		} finally {
			merging = false;
		}
	}

	const totalChanges = $derived((pr?.additions ?? 0) + (pr?.deletions ?? 0));
	const addPct = $derived(totalChanges > 0 ? ((pr?.additions ?? 0) / totalChanges) * 100 : 50);
</script>

<svelte:head>
	<title>#{pr?.number} {pr?.title ?? 'PR'} — GitDuo</title>
</svelte:head>

{#if pr}
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<a href="/{data.owner}/{data.repo}/pulls" class="text-sm font-bold text-duo-blue hover:underline no-underline mb-2 inline-flex items-center gap-1"><ChevronLeft size={16} strokeWidth={2.5} /> Pull Requests</a>
			<h1 class="text-2xl font-extrabold text-duo-text">{pr.title} <span class="text-duo-gray-300 font-bold text-lg">#{pr.number}</span></h1>
			<div class="flex items-center gap-2 mt-2 flex-wrap">
				<PillBadge variant={prVariant(pr)}>{prVariant(pr)}</PillBadge>
				<span class="text-sm text-duo-gray-400 font-bold">
					{pr.user.login} wants to merge <strong class="text-duo-text">{pr.head.ref}</strong> into <strong class="text-duo-text">{pr.base.ref}</strong>
				</span>
			</div>
		</div>

		<!-- Diff stats -->
		<div class="duo-card p-4">
			<div class="flex items-center gap-4 mb-3">
				<span class="text-sm font-extrabold text-duo-gray-400 flex items-center gap-1.5"><FileCode size={14} strokeWidth={2.5} /> {pr.changed_files} files changed</span>
				<span class="text-sm font-extrabold text-duo-green">+{pr.additions.toLocaleString()}</span>
				<span class="text-sm font-extrabold text-duo-red">-{pr.deletions.toLocaleString()}</span>
				<a href="/{data.owner}/{data.repo}/pulls/{pr.number}/files" class="ml-auto text-xs font-bold text-duo-blue no-underline hover:underline">View all files →</a>
			</div>
			<div class="h-2.5 rounded-full overflow-hidden flex bg-duo-gray-100">
				<div class="h-full bg-duo-green rounded-l-full" style:width="{addPct}%"></div>
				<div class="h-full bg-duo-red rounded-r-full" style:width="{100 - addPct}%"></div>
			</div>
		</div>

		<!-- CI / Check Runs -->
		{#if data.checkRuns.length > 0 || (data.commitStatus && data.commitStatus.total_count > 0)}
			<div class="duo-card overflow-hidden">
				<div class="px-4 py-3 border-b-2 border-duo-gray-100 flex items-center justify-between">
					<span class="text-sm font-extrabold text-duo-text">Checks</span>
					{#if data.checkRuns.every(c => c.conclusion === 'success') && (!data.commitStatus || data.commitStatus.state === 'success')}
						<span class="flex items-center gap-1 text-xs font-extrabold text-duo-green"><CheckCircle2 size={14} strokeWidth={2.5} /> All passed</span>
					{:else if data.checkRuns.some(c => c.conclusion === 'failure') || data.commitStatus?.state === 'failure'}
						<span class="flex items-center gap-1 text-xs font-extrabold text-duo-red"><XCircle size={14} strokeWidth={2.5} /> Some failed</span>
					{:else if data.checkRuns.some(c => c.status !== 'completed')}
						<span class="flex items-center gap-1 text-xs font-extrabold text-duo-orange"><Clock size={14} strokeWidth={2.5} /> In progress</span>
					{:else}
						<span class="flex items-center gap-1 text-xs font-extrabold text-duo-gray-400"><CircleDot size={14} strokeWidth={2.5} /> Pending</span>
					{/if}
				</div>
				<div class="divide-y divide-duo-gray-100">
					{#each data.checkRuns as check}
						<div class="flex items-center gap-3 px-4 py-2.5">
							{#if check.status !== 'completed'}
								<Loader2 size={16} strokeWidth={2.5} class="text-duo-orange animate-spin" />
							{:else if check.conclusion === 'success'}
								<CheckCircle2 size={16} strokeWidth={2.5} class="text-duo-green" />
							{:else if check.conclusion === 'failure'}
								<XCircle size={16} strokeWidth={2.5} class="text-duo-red" />
							{:else if check.conclusion === 'skipped'}
								<CircleDot size={16} strokeWidth={2.5} class="text-duo-gray-300" />
							{:else}
								<Clock size={16} strokeWidth={2.5} class="text-duo-gray-400" />
							{/if}
							<div class="flex-1 min-w-0">
								<span class="text-sm font-bold text-duo-text">{check.name}</span>
								{#if check.app}
									<span class="text-xs text-duo-gray-400 font-bold ml-2">{check.app.name}</span>
								{/if}
							</div>
							{#if check.conclusion}
								<span class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400">{check.conclusion}</span>
							{:else}
								<span class="text-[11px] font-extrabold uppercase tracking-wider text-duo-orange">{check.status}</span>
							{/if}
						</div>
					{/each}
					{#if data.commitStatus}
						{#each data.commitStatus.statuses as status}
							<div class="flex items-center gap-3 px-4 py-2.5">
								{#if status.state === 'success'}
									<CheckCircle2 size={16} strokeWidth={2.5} class="text-duo-green" />
								{:else if status.state === 'failure' || status.state === 'error'}
									<XCircle size={16} strokeWidth={2.5} class="text-duo-red" />
								{:else}
									<Clock size={16} strokeWidth={2.5} class="text-duo-orange" />
								{/if}
								<div class="flex-1 min-w-0">
									<span class="text-sm font-bold text-duo-text">{status.context}</span>
									{#if status.description}
										<span class="text-xs text-duo-gray-400 font-bold ml-2">{status.description}</span>
									{/if}
								</div>
								{#if status.target_url}
									<a href={status.target_url} target="_blank" rel="noopener" class="text-xs font-bold text-duo-blue no-underline hover:underline">Details</a>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/if}

		<!-- Merge button -->
		{#if pr.state === 'open' && !pr.merged}
			<div class="duo-card p-4 flex items-center justify-between">
				<div>
					{#if merged}
						<span class="text-sm font-extrabold text-duo-green">✅ Successfully merged!</span>
					{:else if mergeError}
						<span class="text-sm font-extrabold text-duo-red">{mergeError}</span>
					{:else}
						<span class="text-sm font-bold text-duo-gray-400">This PR is ready to merge</span>
					{/if}
				</div>
				{#if !merged}
					<button
						class="duo-btn duo-btn-primary text-sm px-6 py-2"
						onclick={handleMerge}
						disabled={merging}
					>
						{#if merging}Merging...{:else}<GitMerge size={16} strokeWidth={2.5} class="mr-1" /> Merge{/if}
					</button>
				{/if}
			</div>
		{/if}

		<!-- PR body -->
		{#if pr.body}
			<div class="duo-card p-5">
				<div class="flex items-center gap-2 mb-3">
					<Avatar src={pr.user.avatar_url} username={pr.user.login} size="sm" />
					<span class="text-sm font-extrabold text-duo-text">{pr.user.login}</span>
					<span class="text-xs text-duo-gray-400 font-bold">{timeAgo(pr.created_at)}</span>
				</div>
				<MarkdownRenderer content={pr.body} />
			</div>
		{/if}

		<!-- Comments -->
		{#each data.comments as comment}
			<div class="duo-card p-5">
				<div class="flex items-center gap-2 mb-3">
					<Avatar src={comment.user.avatar_url} username={comment.user.login} size="sm" />
					<span class="text-sm font-extrabold text-duo-text">{comment.user.login}</span>
					<span class="text-xs text-duo-gray-400 font-bold">{timeAgo(comment.created_at)}</span>
				</div>
				<MarkdownRenderer content={comment.body} />
			</div>
		{/each}
	</div>
{:else}
	<div class="duo-card p-12 text-center">
		<div class="text-5xl mb-4">🔀</div>
		<h2 class="text-xl font-extrabold text-duo-text mb-2">Pull request not found</h2>
		<p class="text-sm text-duo-text-light font-bold">It may have been deleted or the number is wrong</p>
	</div>
{/if}
