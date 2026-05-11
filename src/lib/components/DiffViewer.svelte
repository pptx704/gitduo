<script lang="ts">
	import { FilePlus2, FileX2, FileEdit, FileSymlink } from 'lucide-svelte';
	import type { GitHubCommitFile } from '$lib/api/github';

	interface Props {
		files: GitHubCommitFile[];
	}

	let { files }: Props = $props();

	let collapsedFiles = $state(new Set<string>());

	const totalAdd = $derived(files.reduce((s, f) => s + f.additions, 0));
	const totalDel = $derived(files.reduce((s, f) => s + f.deletions, 0));
	const addPct = $derived(totalAdd + totalDel > 0 ? (totalAdd / (totalAdd + totalDel)) * 100 : 50);

	function toggleCollapse(filename: string) {
		if (collapsedFiles.has(filename)) {
			collapsedFiles.delete(filename);
		} else {
			collapsedFiles.add(filename);
		}
		collapsedFiles = new Set(collapsedFiles);
	}

	function statusIcon(status: string) {
		const map: Record<string, { icon: typeof FileEdit; color: string; label: string }> = {
			added: { icon: FilePlus2, color: 'text-duo-green', label: 'added' },
			removed: { icon: FileX2, color: 'text-duo-red', label: 'removed' },
			modified: { icon: FileEdit, color: 'text-duo-orange', label: 'modified' },
			renamed: { icon: FileSymlink, color: 'text-duo-blue', label: 'renamed' }
		};
		return map[status] ?? map.modified;
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
</script>

<!-- Stats bar -->
<div class="duo-card p-4">
	<div class="flex items-center gap-4 mb-3">
		<span class="text-sm font-extrabold text-duo-gray-400">{files.length} files changed</span>
		<span class="text-sm font-extrabold text-duo-green">+{totalAdd.toLocaleString()}</span>
		<span class="text-sm font-extrabold text-duo-red">-{totalDel.toLocaleString()}</span>
	</div>
	<div class="h-2.5 rounded-full overflow-hidden flex bg-duo-gray-100">
		<div class="h-full bg-duo-green rounded-l-full" style:width="{addPct}%"></div>
		<div class="h-full bg-duo-red rounded-r-full" style:width="{100 - addPct}%"></div>
	</div>
</div>

<!-- File list -->
<div class="duo-card p-4">
	<div class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-2">Changed files</div>
	<div class="space-y-1 max-h-60 overflow-y-auto">
		{#each files as file}
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
{#each files as file}
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
