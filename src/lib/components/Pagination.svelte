<script lang="ts">
	import { page } from '$app/state';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		currentPage: number;
		hasMore: boolean;
	}

	let { currentPage, hasMore }: Props = $props();

	function buildUrl(pageNum: number): string {
		const url = new URL(page.url);
		url.searchParams.set('page', String(pageNum));
		return url.pathname + url.search;
	}
</script>

{#if currentPage > 1 || hasMore}
	<div class="flex items-center justify-center gap-3 pt-4">
		{#if currentPage > 1}
			<a href={buildUrl(currentPage - 1)} class="duo-btn duo-btn-ghost text-xs px-4 py-2 no-underline inline-flex items-center gap-1.5">
				<ChevronLeft size={14} strokeWidth={2.5} />
				Newer
			</a>
		{/if}
		<span class="text-xs font-extrabold text-duo-gray-400">Page {currentPage}</span>
		{#if hasMore}
			<a href={buildUrl(currentPage + 1)} class="duo-btn duo-btn-ghost text-xs px-4 py-2 no-underline inline-flex items-center gap-1.5">
				Older
				<ChevronRight size={14} strokeWidth={2.5} />
			</a>
		{/if}
	</div>
{/if}
