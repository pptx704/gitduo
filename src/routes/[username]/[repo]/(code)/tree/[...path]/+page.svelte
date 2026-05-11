<script lang="ts">
	import { FileTree } from '$lib';
	import type { GitHubContent } from '$lib/api/github';

	interface Props {
		data: {
			contents: GitHubContent[];
			owner: string;
			repo: string;
			dirPath: string;
			currentRef: string | null;
		};
	}

	let { data }: Props = $props();

	const pathParts = $derived(data.dirPath.split('/'));
</script>

<svelte:head>
	<title>{data.dirPath} — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-4">
	<!-- Breadcrumb -->
	<div class="flex items-center gap-1.5 text-sm font-bold flex-wrap">
		<a href="/{data.owner}/{data.repo}" class="text-duo-blue hover:underline no-underline">{data.owner}/{data.repo}</a>
		{#each pathParts as part, i}
			<span class="text-duo-gray-300">/</span>
			{#if i === pathParts.length - 1}
				<span class="text-duo-text font-extrabold">{part}</span>
			{:else}
				<a
					href="/{data.owner}/{data.repo}/tree/{pathParts.slice(0, i + 1).join('/')}"
					class="text-duo-blue hover:underline no-underline"
				>{part}</a>
			{/if}
		{/each}
	</div>

	<!-- Directory contents -->
	<div class="duo-card overflow-hidden">
		{#if data.contents.length > 0}
			<FileTree
				items={data.contents.map((c) => ({ name: c.name, path: c.path, type: c.type === 'dir' ? 'dir' : 'file', size: c.size }))}
				basePath="/{data.owner}/{data.repo}"
				ref={data.currentRef ?? undefined}
			/>
		{:else}
			<div class="p-8 text-center text-duo-gray-400 font-bold">This folder is empty</div>
		{/if}
	</div>
</div>
