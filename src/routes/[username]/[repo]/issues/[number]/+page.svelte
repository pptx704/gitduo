<script lang="ts">
	import { Avatar, PillBadge, MarkdownRenderer } from '$lib';
	import { ChevronLeft, Send } from 'lucide-svelte';
	import type { GitHubIssue, GitHubComment } from '$lib/api/github';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		data: {
			issue: GitHubIssue | null;
			comments: GitHubComment[];
			owner: string;
			repo: string;
		};
	}

	let { data }: Props = $props();
	const issue = $derived(data.issue);

	let commentBody = $state('');
	let submitting = $state(false);

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

	async function submitComment() {
		if (!commentBody.trim() || submitting) return;
		submitting = true;
		try {
			await fetch(`/api/comment`, {
				method: 'POST',
				body: JSON.stringify({
					owner: data.owner,
					repo: data.repo,
					number: issue?.number,
					body: commentBody
				})
			});
			commentBody = '';
			await invalidateAll();
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>#{issue?.number} {issue?.title ?? 'Issue'} — GitDuo</title>
</svelte:head>

{#if issue}
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<a href="/{data.owner}/{data.repo}/issues" class="text-sm font-bold text-duo-blue hover:underline no-underline mb-2 inline-flex items-center gap-1"><ChevronLeft size={16} strokeWidth={2.5} /> Issues</a>
			<div class="flex items-start gap-3">
				<div class="flex-1">
					<h1 class="text-2xl font-extrabold text-duo-text">{issue.title} <span class="text-duo-gray-300 font-bold text-lg">#{issue.number}</span></h1>
					<div class="flex items-center gap-2 mt-2">
						<PillBadge variant={issue.state}>{issue.state}</PillBadge>
						<span class="text-sm text-duo-gray-400 font-bold">
							{issue.user.login} opened {timeAgo(issue.created_at)}
						</span>
					</div>
				</div>
			</div>
		</div>

		<div class="flex gap-6 flex-col lg:flex-row">
			<!-- Main content -->
			<div class="flex-1 space-y-4">
				<!-- Issue body -->
				{#if issue.body}
					<div class="duo-card p-5">
						<div class="flex items-center gap-2 mb-3">
							<Avatar src={issue.user.avatar_url} username={issue.user.login} size="sm" />
							<span class="text-sm font-extrabold text-duo-text">{issue.user.login}</span>
							<span class="text-xs text-duo-gray-400 font-bold">{timeAgo(issue.created_at)}</span>
						</div>
						<MarkdownRenderer content={issue.body} />
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

				<!-- Comment form -->
				<div class="duo-card p-4">
					<textarea
						bind:value={commentBody}
						placeholder="Leave a comment..."
						rows="3"
						class="w-full bg-duo-snow border-2 border-duo-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-duo-text placeholder:text-duo-gray-300 focus:border-duo-blue focus:outline-none transition-colors resize-none"
					></textarea>
					<div class="flex justify-end mt-2">
						<button
							class="duo-btn duo-btn-primary text-sm px-6 py-2"
							onclick={submitComment}
							disabled={submitting || !commentBody.trim()}
						>
							{#if submitting}Posting...{:else}<Send size={14} strokeWidth={2.5} class="mr-1" /> Post Comment{/if}
						</button>
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<div class="w-full lg:w-56 space-y-4">
				<!-- Assignees -->
				{#if issue.assignees.length > 0}
					<div class="duo-card p-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-2">Assignees</h3>
						{#each issue.assignees as assignee}
							<a href="/{assignee.login}" class="flex items-center gap-2 py-1 no-underline">
								<Avatar src={assignee.avatar_url} username={assignee.login} size="sm" />
								<span class="text-sm font-bold text-duo-text">{assignee.login}</span>
							</a>
						{/each}
					</div>
				{/if}

				<!-- Labels -->
				{#if issue.labels.length > 0}
					<div class="duo-card p-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-2">Labels</h3>
						<div class="flex flex-wrap gap-1.5">
							{#each issue.labels as label}
								<span
									class="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full"
									style:background="#{label.color}22"
									style:color="#{label.color}"
								>{label.name}</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Milestone -->
				{#if issue.milestone}
					<div class="duo-card p-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-2">Milestone</h3>
						<span class="text-sm font-bold text-duo-text">{issue.milestone.title}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="duo-card p-12 text-center">
		<div class="text-5xl mb-4">📋</div>
		<h2 class="text-xl font-extrabold text-duo-text mb-2">Issue not found</h2>
		<p class="text-sm text-duo-text-light font-bold">It may have been deleted or the number is wrong</p>
	</div>
{/if}
