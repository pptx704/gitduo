<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { RepoFileTree } from '$lib';
	import { GitBranch, PanelLeftClose, PanelLeftOpen } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { GitHubContent, GitHubBranch, GitHubRepo } from '$lib/api/github';

	interface Props {
		data: {
			repo: GitHubRepo | null;
			owner: string;
			repoName: string;
			rootContents: GitHubContent[];
			branches: GitHubBranch[];
			currentRef: string | null;
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();

	let sidebarOpen = $state(true);
	let branchOpen = $state(false);

	const activeBranch = $derived(data.currentRef ?? data.repo?.default_branch ?? 'main');

	const activePath = $derived.by(() => {
		const path = page.url.pathname;
		const base = `/${data.owner}/${data.repoName}`;
		const blobMatch = path.match(
			new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/blob/(.+)$`)
		);
		if (blobMatch) return blobMatch[1];
		const treeMatch = path.match(
			new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/tree/(.+)$`)
		);
		if (treeMatch) return treeMatch[1];
		return undefined;
	});

	function switchBranch(branch: string) {
		branchOpen = false;
		goto(`/${data.owner}/${data.repoName}?ref=${branch}`, { replaceState: true });
	}
</script>

{#if data.repo}
	<div class="code-layout">
		{#if sidebarOpen}
			<aside class="tree-sidebar">
				<div class="sidebar-header">
					<div class="flex items-center justify-between">
						<div class="relative flex-1">
							<button
								class="flex items-center gap-1.5 w-full px-2.5 py-1.5 bg-white border-2 border-duo-gray-100 rounded-lg text-xs font-bold hover:border-duo-blue transition-colors"
								onclick={() => (branchOpen = !branchOpen)}
							>
								<GitBranch
									size={13}
									strokeWidth={2.5}
									class="text-duo-green flex-shrink-0"
								/>
								<span class="truncate">{activeBranch}</span>
								<span class="text-duo-gray-300 ml-auto flex-shrink-0">▼</span>
							</button>
							{#if branchOpen}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="fixed inset-0 z-10"
									onclick={() => (branchOpen = false)}
								></div>
								<div
									class="absolute top-full left-0 mt-1 w-full bg-white border-2 border-duo-gray-100 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto"
								>
									<div class="px-2.5 py-1.5 border-b border-duo-gray-100">
										<span
											class="text-[9px] font-extrabold uppercase tracking-wider text-duo-gray-400"
											>Branches ({data.branches.length})</span
										>
									</div>
									{#each data.branches as branch}
										<button
											class="w-full text-left px-3 py-2 text-xs font-bold hover:bg-duo-snow transition-colors"
											class:text-duo-green={branch.name === activeBranch}
											class:font-extrabold={branch.name === activeBranch}
											class:bg-duo-green-lightest={branch.name === activeBranch}
											onclick={() => switchBranch(branch.name)}
										>
											<span class="truncate">{branch.name}</span>
											{#if branch.name === data.repo?.default_branch}
												<span
													class="text-[9px] bg-duo-gray-100 text-duo-gray-400 px-1 py-0.5 rounded-full font-extrabold ml-1"
													>default</span
												>
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
						<button
							class="ml-2 text-duo-gray-300 hover:text-duo-gray-400 transition-colors p-1"
							onclick={() => (sidebarOpen = false)}
							aria-label="Close file tree"
						>
							<PanelLeftClose size={14} strokeWidth={2.5} />
						</button>
					</div>
				</div>
				<RepoFileTree
					rootContents={data.rootContents}
					basePath="/{data.owner}/{data.repoName}"
					ref={data.currentRef}
					activePath={activePath}
					owner={data.owner}
					repo={data.repoName}
				/>
			</aside>
		{:else}
			<button class="sidebar-toggle" onclick={() => (sidebarOpen = true)} aria-label="Open file tree">
				<PanelLeftOpen size={14} strokeWidth={2.5} class="text-duo-gray-400" />
			</button>
		{/if}

		<div class="code-content">
			{@render children()}
		</div>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.code-layout {
		display: flex;
		gap: 16px;
		align-items: flex-start;
	}

	.tree-sidebar {
		width: 260px;
		flex-shrink: 0;
		position: sticky;
		top: 16px;
		max-height: calc(100vh - 32px);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: white;
		border: 2px solid oklch(92% 0.01 145);
		border-radius: 16px;
	}

	.sidebar-header {
		padding: 10px 10px 8px;
		border-bottom: 2px solid oklch(94% 0.01 145);
		background: oklch(98% 0.005 145);
		border-radius: 14px 14px 0 0;
		flex-shrink: 0;
	}

	.sidebar-toggle {
		flex-shrink: 0;
		position: sticky;
		top: 16px;
		background: white;
		border: 2px solid oklch(92% 0.01 145);
		border-radius: 12px;
		padding: 8px;
		cursor: pointer;
		transition: background 0.1s;
	}

	.sidebar-toggle:hover {
		background: oklch(97% 0.01 145);
	}

	.code-content {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 768px) {
		.code-layout {
			flex-direction: column;
		}

		.tree-sidebar {
			width: 100%;
			position: static;
			max-height: 300px;
		}
	}
</style>
