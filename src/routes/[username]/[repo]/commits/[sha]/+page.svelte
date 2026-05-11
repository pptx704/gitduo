<script lang="ts">
	import { Avatar } from '$lib';
	import { ChevronLeft, FilePlus2, FileX2, FileEdit, FileSymlink, Copy, Check } from 'lucide-svelte';
	import type { GitHubCommitDetail, GitHubCommitFile } from '$lib/api/github';

	interface Props {
		data: {
			commit: GitHubCommitDetail | null;
			owner: string;
			repo: string;
		};
	}

	let { data }: Props = $props();
	const commit = $derived(data.commit);

	let copiedSha = $state(false);
	let collapsedFiles = $state<Set<string>>(new Set());

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

	function statusIcon(status: GitHubCommitFile['status']) {
		switch (status) {
			case 'added': return { icon: FilePlus2, color: 'text-duo-green', label: 'Added' };
			case 'removed': return { icon: FileX2, color: 'text-duo-red', label: 'Removed' };
			case 'renamed': return { icon: FileSymlink, color: 'text-duo-blue', label: 'Renamed' };
			default: return { icon: FileEdit, color: 'text-duo-orange', label: 'Modified' };
		}
	}

	function parsePatch(patch: string): { type: 'add' | 'del' | 'ctx' | 'hdr'; content: string; oldNum: number | null; newNum: number | null }[] {
		const lines = patch.split('\n');
		const result: { type: 'add' | 'del' | 'ctx' | 'hdr'; content: string; oldNum: number | null; newNum: number | null }[] = [];
		let oldLine = 0;
		let newLine = 0;

		for (const line of lines) {
			if (line.startsWith('@@')) {
				const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)/);
				if (match) {
					oldLine = parseInt(match[1]);
					newLine = parseInt(match[2]);
				}
				result.push({ type: 'hdr', content: line, oldNum: null, newNum: null });
			} else if (line.startsWith('+')) {
				result.push({ type: 'add', content: line.slice(1), oldNum: null, newNum: newLine });
				newLine++;
			} else if (line.startsWith('-')) {
				result.push({ type: 'del', content: line.slice(1), oldNum: oldLine, newNum: null });
				oldLine++;
			} else {
				const content = line.startsWith(' ') ? line.slice(1) : line;
				result.push({ type: 'ctx', content, oldNum: oldLine, newNum: newLine });
				oldLine++;
				newLine++;
			}
		}
		return result;
	}

	function toggleCollapse(filename: string) {
		const next = new Set(collapsedFiles);
		if (next.has(filename)) {
			next.delete(filename);
		} else {
			next.add(filename);
		}
		collapsedFiles = next;
	}

	async function copySha() {
		if (!commit) return;
		await navigator.clipboard.writeText(commit.sha);
		copiedSha = true;
		setTimeout(() => copiedSha = false, 2000);
	}

	const totalAdd = $derived(commit?.stats.additions ?? 0);
	const totalDel = $derived(commit?.stats.deletions ?? 0);
	const totalChanges = $derived(totalAdd + totalDel);
	const addPct = $derived(totalChanges > 0 ? (totalAdd / totalChanges) * 100 : 50);
</script>

<svelte:head>
	<title>{commit ? commit.commit.message.split('\n')[0] : 'Commit'} — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

{#if commit}
	<div class="space-y-5">
		<!-- Header -->
		<div>
			<a href="/{data.owner}/{data.repo}/commits" class="text-sm font-bold text-duo-blue hover:underline no-underline mb-2 inline-flex items-center gap-1">
				<ChevronLeft size={16} strokeWidth={2.5} /> Commits
			</a>
			<h1 class="text-xl font-extrabold text-duo-text mt-1">{commit.commit.message.split('\n')[0]}</h1>
			{#if commit.commit.message.includes('\n')}
				<pre class="text-sm text-duo-gray-400 font-semibold mt-2 whitespace-pre-wrap font-[inherit]">{commit.commit.message.split('\n').slice(1).join('\n').trim()}</pre>
			{/if}
		</div>

		<!-- Author + SHA -->
		<div class="duo-card p-4 flex items-center justify-between flex-wrap gap-3">
			<div class="flex items-center gap-2.5">
				{#if commit.author}
					<a href="/{commit.author.login}" class="no-underline">
						<Avatar src={commit.author.avatar_url} username={commit.author.login} size="sm" />
					</a>
					<div>
						<a href="/{commit.author.login}" class="text-sm font-extrabold text-duo-text no-underline hover:text-duo-blue">{commit.author.login}</a>
						<div class="text-xs text-duo-gray-400 font-bold">{timeAgo(commit.commit.author.date)}</div>
					</div>
				{:else}
					<div class="w-8 h-8 rounded-full bg-duo-gray-100 flex items-center justify-center text-xs text-duo-gray-400">?</div>
					<div>
						<span class="text-sm font-extrabold text-duo-text">{commit.commit.author.name}</span>
						<div class="text-xs text-duo-gray-400 font-bold">{timeAgo(commit.commit.author.date)}</div>
					</div>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				{#if commit.parents.length > 0}
					<span class="text-xs font-bold text-duo-gray-400">parent</span>
					{#each commit.parents as parent}
						<a href="/{data.owner}/{data.repo}/commits/{parent.sha}" class="text-xs font-mono bg-duo-snow text-duo-blue px-2 py-1 rounded-lg border border-duo-gray-100 no-underline hover:border-duo-blue">
							{parent.sha.slice(0, 7)}
						</a>
					{/each}
				{/if}
				<button
					class="flex items-center gap-1 text-xs font-mono bg-duo-snow text-duo-gray-400 px-2 py-1 rounded-lg border border-duo-gray-100 hover:border-duo-blue hover:text-duo-blue transition-colors"
					onclick={copySha}
					aria-label="Copy commit SHA"
				>
					{commit.sha.slice(0, 7)}
					{#if copiedSha}
						<Check size={12} strokeWidth={2.5} class="text-duo-green" />
					{:else}
						<Copy size={12} strokeWidth={2.5} />
					{/if}
				</button>
			</div>
		</div>

		<!-- Diff stats overview -->
		<div class="duo-card p-4">
			<div class="flex items-center gap-4 mb-3">
				<span class="text-sm font-extrabold text-duo-gray-400">{commit.files.length} files changed</span>
				<span class="text-sm font-extrabold text-duo-green">+{totalAdd.toLocaleString()}</span>
				<span class="text-sm font-extrabold text-duo-red">-{totalDel.toLocaleString()}</span>
			</div>
			<div class="h-2.5 rounded-full overflow-hidden flex bg-duo-gray-100">
				<div class="h-full bg-duo-green rounded-l-full" style:width="{addPct}%"></div>
				<div class="h-full bg-duo-red rounded-r-full" style:width="{100 - addPct}%"></div>
			</div>
		</div>

		<!-- File list (jump links) -->
		<div class="duo-card p-4">
			<div class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-2">Changed files</div>
			<div class="space-y-1 max-h-60 overflow-y-auto">
				{#each commit.files as file}
					{@const si = statusIcon(file.status)}
					{@const SIcon = si.icon}
					<a href="#{file.filename}" class="flex items-center gap-2 text-sm no-underline hover:bg-duo-snow rounded-lg px-2 py-1 transition-colors">
						<SIcon size={13} strokeWidth={2.5} class={si.color} />
						<span class="font-bold text-duo-text truncate flex-1">{file.filename}</span>
						<span class="text-xs text-duo-green font-extrabold flex-shrink-0">+{file.additions}</span>
						<span class="text-xs text-duo-red font-extrabold flex-shrink-0">-{file.deletions}</span>
					</a>
				{/each}
			</div>
		</div>

		<!-- File diffs -->
		{#each commit.files as file}
			{@const si = statusIcon(file.status)}
			{@const SIcon = si.icon}
			{@const isCollapsed = collapsedFiles.has(file.filename)}
			<div class="duo-card overflow-hidden" id={file.filename}>
				<button
					class="w-full flex items-center gap-2.5 px-4 py-3 border-b-2 border-duo-gray-100 bg-duo-snow text-left hover:bg-duo-gray-100/30 transition-colors"
					onclick={() => toggleCollapse(file.filename)}
				>
					<SIcon size={14} strokeWidth={2.5} class={si.color} />
					<span class="text-sm font-bold text-duo-text truncate flex-1">
						{#if file.previous_filename}
							<span class="text-duo-gray-400">{file.previous_filename} →</span>
						{/if}
						{file.filename}
					</span>
					<span class="text-xs font-extrabold text-duo-green">+{file.additions}</span>
					<span class="text-xs font-extrabold text-duo-red">-{file.deletions}</span>
					<span class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-300 flex-shrink-0">{si.label}</span>
				</button>

				{#if !isCollapsed && file.patch}
					<div class="diff-container">
						<table class="diff-table">
							<tbody>
								{#each parsePatch(file.patch) as line}
									<tr
										class:diff-add={line.type === 'add'}
										class:diff-del={line.type === 'del'}
										class:diff-hdr={line.type === 'hdr'}
									>
										{#if line.type === 'hdr'}
											<td class="diff-gutter" colspan="2"></td>
											<td class="diff-hdr-content">{line.content}</td>
										{:else}
											<td class="diff-gutter diff-gutter-old">{line.oldNum ?? ''}</td>
											<td class="diff-gutter diff-gutter-new">{line.newNum ?? ''}</td>
											<td class="diff-code"><pre>{line.content}</pre></td>
										{/if}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else if !isCollapsed && !file.patch}
					<div class="p-6 text-center text-sm text-duo-gray-400 font-bold">
						{#if file.status === 'added'}
							File added (binary or too large to display)
						{:else if file.status === 'removed'}
							File removed
						{:else}
							Diff not available
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class="duo-card p-12 text-center">
		<div class="text-5xl mb-4">📝</div>
		<h2 class="text-xl font-extrabold text-duo-text mb-2">Commit not found</h2>
		<p class="text-sm text-duo-text-light font-bold">This commit may not exist or the SHA is incorrect</p>
	</div>
{/if}

<style>
	.diff-container {
		overflow-x: auto;
		font-size: 13px;
		line-height: 1.55;
	}

	.diff-table {
		width: 100%;
		border-collapse: collapse;
	}

	.diff-gutter {
		padding: 0 8px;
		text-align: right;
		color: #AFAFAF;
		font-size: 11px;
		user-select: none;
		white-space: nowrap;
		vertical-align: top;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
		width: 1px;
		border-right: 1px solid #E5E5E5;
	}

	.diff-gutter-old {
		padding-left: 12px;
	}

	.diff-code {
		padding: 0 12px;
		white-space: pre;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
	}

	.diff-code pre {
		margin: 0;
		background: none;
		padding: 0;
		color: inherit;
	}

	.diff-add {
		background: oklch(97% 0.04 145);
	}

	.diff-add .diff-gutter {
		background: oklch(94% 0.06 145);
		color: #3B8700;
	}

	.diff-del {
		background: oklch(97% 0.03 25);
	}

	.diff-del .diff-gutter {
		background: oklch(94% 0.05 25);
		color: #EA2B2B;
	}

	.diff-hdr {
		background: oklch(96% 0.02 250);
	}

	.diff-hdr-content {
		padding: 2px 12px;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
		font-size: 12px;
		color: #6E6E6E;
	}
</style>
