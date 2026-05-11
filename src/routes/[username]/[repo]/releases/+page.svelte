<script lang="ts">
	import { Avatar, PillBadge, MarkdownRenderer } from '$lib';
	import type { GitHubRelease } from '$lib/api/github';

	interface Props {
		data: {
			releases: GitHubRelease[];
			owner: string;
			repo: string;
		};
	}

	let { data }: Props = $props();

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	let expandedId = $state<number | null>(null);

	function toggleExpand(id: number) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<svelte:head>
	<title>Releases — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-extrabold text-duo-text">Releases</h1>

	{#if data.releases.length > 0}
		<div class="space-y-4">
			{#each data.releases as release, i}
				<div class="duo-card overflow-hidden" style:background={i === 0 ? 'oklch(98% 0.02 145)' : undefined}>
					<div class="p-5">
						<!-- Header -->
						<div class="flex items-start justify-between gap-3">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap mb-1">
									<h2 class="text-lg font-extrabold text-duo-text">{release.name ?? release.tag_name}</h2>
									{#if release.prerelease}
										<PillBadge variant="orange">Pre-release</PillBadge>
									{:else if release.draft}
										<PillBadge variant="gray">Draft</PillBadge>
									{:else if i === 0}
										<PillBadge variant="green">Latest</PillBadge>
									{/if}
								</div>
								<div class="flex items-center gap-3 text-xs text-duo-gray-400 font-bold">
									<span class="inline-flex items-center gap-1">
										<code class="bg-duo-snow px-1.5 py-0.5 rounded text-[11px] border border-duo-gray-100">{release.tag_name}</code>
									</span>
									<span>·</span>
									<a href="/{release.author.login}" class="inline-flex items-center gap-1 no-underline hover:text-duo-blue">
										<img src={release.author.avatar_url} alt="" class="w-4 h-4 rounded-full" loading="lazy" />
										{release.author.login}
									</a>
									<span>·</span>
									<span>{formatDate(release.published_at ?? release.created_at)}</span>
								</div>
							</div>
						</div>

						<!-- Body (expandable) -->
						{#if release.body}
							<button
								class="mt-3 text-sm font-bold text-duo-blue hover:underline"
								onclick={() => toggleExpand(release.id)}
							>
								{expandedId === release.id ? 'Hide details ▲' : 'Show details ▼'}
							</button>

							{#if expandedId === release.id}
								<div class="mt-3 pt-3 border-t-2 border-duo-gray-100">
									<MarkdownRenderer content={release.body} />
								</div>
							{/if}
						{/if}

						<!-- Assets -->
						{#if release.assets.length > 0}
							<div class="mt-4 pt-3 border-t-2 border-duo-gray-100">
								<h3 class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-2">Assets</h3>
								<div class="space-y-1.5">
									{#each release.assets as asset}
										<a
											href={asset.browser_download_url}
											class="flex items-center justify-between px-3 py-2 rounded-xl bg-duo-snow hover:bg-duo-gray-100 transition-colors no-underline group"
											target="_blank"
											rel="noopener"
										>
											<div class="flex items-center gap-2 min-w-0">
												<span class="text-sm">📦</span>
												<span class="text-sm font-bold text-duo-text truncate group-hover:text-duo-blue">{asset.name}</span>
											</div>
											<div class="flex items-center gap-3 flex-shrink-0 text-xs font-bold text-duo-gray-400">
												<span>{formatSize(asset.size)}</span>
												<span>⬇️ {asset.download_count.toLocaleString()}</span>
											</div>
										</a>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Source archives -->
						<div class="mt-3 flex gap-2">
							{#if release.tarball_url}
								<a href={release.tarball_url} class="text-xs font-bold text-duo-blue no-underline hover:underline" target="_blank" rel="noopener">tar.gz</a>
							{/if}
							{#if release.zipball_url}
								<a href={release.zipball_url} class="text-xs font-bold text-duo-blue no-underline hover:underline" target="_blank" rel="noopener">zip</a>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="duo-card p-10 text-center">
			<div class="text-4xl mb-3">📦</div>
			<h2 class="text-lg font-extrabold text-duo-text">No releases yet</h2>
			<p class="text-sm text-duo-text-light font-bold mt-1">This repo hasn't published any releases</p>
		</div>
	{/if}
</div>
