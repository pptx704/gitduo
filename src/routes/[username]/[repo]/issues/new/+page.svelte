<script lang="ts">
	import { goto } from '$app/navigation';
	import { ChevronLeft, Send } from 'lucide-svelte';

	interface Props {
		data: {
			owner: string;
			repo: string;
		};
	}

	let { data }: Props = $props();

	let title = $state('');
	let body = $state('');
	let submitting = $state(false);
	let error = $state('');

	async function submit(e: Event) {
		e.preventDefault();
		if (!title.trim()) return;

		submitting = true;
		error = '';

		try {
			const res = await fetch('/api/issue', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ owner: data.owner, repo: data.repo, title: title.trim(), body: body.trim() })
			});

			if (!res.ok) {
				const msg = await res.text();
				throw new Error(msg || 'Failed to create issue');
			}

			const result = await res.json();
			goto(`/${data.owner}/${data.repo}/issues/${result.number}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Issue — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-3">
		<a href="/{data.owner}/{data.repo}/issues" class="text-sm font-bold text-duo-blue hover:underline no-underline flex items-center gap-1">
			<ChevronLeft size={16} strokeWidth={2.5} /> Issues
		</a>
		<h1 class="text-2xl font-extrabold text-duo-text">New Issue</h1>
	</div>

	<form class="duo-card p-6 space-y-4" onsubmit={submit}>
		<div>
			<label for="title" class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-1.5 block">Title</label>
			<input
				id="title"
				type="text"
				bind:value={title}
				placeholder="Issue title..."
				class="w-full bg-duo-snow border-2 border-duo-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-duo-text placeholder:text-duo-gray-300 focus:border-duo-green focus:outline-none transition-colors"
				required
			/>
		</div>

		<div>
			<label for="body" class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-1.5 block">Description (Markdown)</label>
			<textarea
				id="body"
				bind:value={body}
				placeholder="Describe the issue..."
				rows="10"
				class="w-full bg-duo-snow border-2 border-duo-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-duo-text placeholder:text-duo-gray-300 focus:border-duo-green focus:outline-none transition-colors resize-y"
			></textarea>
		</div>

		{#if error}
			<div class="text-sm font-bold text-duo-red bg-red-50 border-2 border-red-100 rounded-xl px-4 py-3">
				{error}
			</div>
		{/if}

		<div class="flex justify-end">
			<button
				type="submit"
				class="duo-btn duo-btn-primary text-sm px-6 py-3 inline-flex items-center gap-2"
				disabled={submitting || !title.trim()}
			>
				<Send size={14} strokeWidth={2.5} />
				{submitting ? 'Creating...' : 'Create Issue'}
			</button>
		</div>
	</form>
</div>
