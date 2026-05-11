<script lang="ts">
	import { ChevronRight, ChevronDown, Loader2 } from 'lucide-svelte';
	import type { GitHubContent } from '$lib/api/github';

	interface GitEntry {
		name: string;
		path: string;
		type: 'file' | 'dir';
		size?: number;
	}

	interface Props {
		rootContents: GitHubContent[];
		basePath: string;
		ref?: string | null;
		activePath?: string;
		owner: string;
		repo: string;
	}

	let { rootContents, basePath, ref, activePath, owner, repo }: Props = $props();

	let expanded = $state(new Set<string>());
	let loadedChildren = $state(new Map<string, GitEntry[]>());
	let loading = $state(new Set<string>());

	const rootEntries: GitEntry[] = $derived(
		rootContents.map((c) => ({ name: c.name, path: c.path, type: c.type === 'dir' ? 'dir' as const : 'file' as const, size: c.size }))
			.sort((a, b) => {
				if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
				return a.name.localeCompare(b.name);
			})
	);

	// Auto-expand directories in the active path
	$effect(() => {
		if (activePath) {
			const parts = activePath.split('/');
			for (let i = 1; i < parts.length; i++) {
				const dirPath = parts.slice(0, i).join('/');
				if (!expanded.has(dirPath)) {
					expanded.add(dirPath);
					if (!loadedChildren.has(dirPath)) {
						fetchChildren(dirPath);
					}
				}
			}
		}
	});

	async function fetchChildren(path: string) {
		if (loadedChildren.has(path) || loading.has(path)) return;
		loading.add(path);
		loading = new Set(loading);

		try {
			const params = new URLSearchParams({ owner, repo, path });
			if (ref) params.set('ref', ref);
			const res = await fetch(`/api/repo-tree?${params}`);
			if (res.ok) {
				const data = await res.json();
				const entries: GitEntry[] = data.entries
					.map((c: GitHubContent) => ({ name: c.name, path: c.path, type: c.type === 'dir' ? 'dir' : 'file', size: c.size }))
					.sort((a: GitEntry, b: GitEntry) => {
						if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
						return a.name.localeCompare(b.name);
					});
				loadedChildren.set(path, entries);
				loadedChildren = new Map(loadedChildren);
			}
		} catch { /* silently fail */ }

		loading.delete(path);
		loading = new Set(loading);
	}

	function toggleDir(path: string) {
		if (expanded.has(path)) {
			expanded.delete(path);
			expanded = new Set(expanded);
		} else {
			expanded.add(path);
			expanded = new Set(expanded);
			fetchChildren(path);
		}
	}

	function buildHref(entry: GitEntry): string {
		const prefix = entry.type === 'dir' ? 'tree' : 'blob';
		const base = `${basePath}/${prefix}/${entry.path}`;
		if (ref) return `${base}?ref=${ref}`;
		return base;
	}

	function fileIcon(name: string): string {
		const lower = name.toLowerCase();
		if (lower === 'dockerfile') return '🐳';
		if (lower.startsWith('.env')) return '🔐';
		if (lower === 'readme.md') return '📖';
		if (lower === 'package.json' || lower === 'cargo.toml' || lower === 'go.mod') return '📦';

		const ext = name.split('.').pop()?.toLowerCase() ?? '';
		const icons: Record<string, string> = {
			ts: '🔷', tsx: '🔷', js: '🟨', jsx: '🟨',
			py: '🐍', rs: '🦀', go: '🐹', rb: '💎',
			java: '☕', swift: '🍎', dart: '🎯',
			c: '⚙️', cpp: '⚙️', h: '⚙️',
			md: '📝', json: '📋', yml: '⚙️', yaml: '⚙️',
			css: '🎨', scss: '🎨', html: '🌐',
			svelte: '🔶', vue: '💚',
			sh: '🐚', sql: '🗃️', lock: '🔒',
			svg: '🖼️', png: '🖼️', jpg: '🖼️',
		};
		return icons[ext] ?? '📄';
	}
</script>

<div class="repo-tree">
	{#each rootEntries as entry}
		{@render treeNode(entry, 0)}
	{/each}
</div>

{#snippet treeNode(entry: GitEntry, depth: number)}
	{@const isActive = activePath === entry.path}
	{@const isExpanded = expanded.has(entry.path)}
	{@const isLoading = loading.has(entry.path)}
	{@const children = loadedChildren.get(entry.path)}

	{#if entry.type === 'dir'}
		<button
			class="tree-item"
			class:tree-item-active={isActive}
			style:padding-left="{12 + depth * 16}px"
			onclick={() => toggleDir(entry.path)}
		>
			<span class="tree-chevron">
				{#if isLoading}
					<Loader2 size={12} strokeWidth={2.5} class="animate-spin text-duo-gray-300" />
				{:else if isExpanded}
					<ChevronDown size={12} strokeWidth={2.5} />
				{:else}
					<ChevronRight size={12} strokeWidth={2.5} />
				{/if}
			</span>
			<span class="text-xs">📁</span>
			<span class="tree-name" class:font-extrabold={isActive}>{entry.name}</span>
		</button>
		{#if isExpanded && children}
			{#each children as child}
				{@render treeNode(child, depth + 1)}
			{/each}
		{/if}
	{:else}
		<a
			href={buildHref(entry)}
			class="tree-item"
			class:tree-item-active={isActive}
			style:padding-left="{12 + depth * 16 + 16}px"
		>
			<span class="text-xs">{fileIcon(entry.name)}</span>
			<span class="tree-name" class:text-duo-green={isActive} class:font-extrabold={isActive}>{entry.name}</span>
		</a>
	{/if}
{/snippet}

<style>
	.repo-tree {
		overflow-y: auto;
		overflow-x: hidden;
	}

	.tree-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 5px 12px;
		font-size: 12px;
		font-weight: 600;
		color: #3C3C3C;
		text-decoration: none;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}

	.tree-item:hover {
		background: oklch(97% 0.015 145);
	}

	.tree-item-active {
		background: oklch(96% 0.025 145);
		border-right: 2px solid #58CC02;
	}

	.tree-chevron {
		flex-shrink: 0;
		width: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #AFAFAF;
	}

	.tree-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
