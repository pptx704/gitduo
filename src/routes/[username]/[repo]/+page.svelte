<script lang="ts">
	import { goto } from '$app/navigation';
	import { FileTree, MarkdownRenderer } from '$lib';
	import { getLanguageColor } from '$lib/lang-colors';
	import {
		GitBranch,
		BookOpen,
		Lock,
		Code,
		Copy,
		Check,
		Download
	} from 'lucide-svelte';
	import { timeAgo } from '$lib/utils';
	import type {
		GitHubRepo,
		GitHubContent,
		GitHubBranch,
		GitHubCommit,
		GitHubContributor
	} from '$lib/api/github';

	interface Props {
		data: {
			repo: GitHubRepo | null;
			contents: GitHubContent[];
			branches: GitHubBranch[];
			readmeContent: string | null;
			languages: Record<string, number>;
			lastCommit: GitHubCommit | null;
			releaseCount: number;
			contributors: GitHubContributor[];
			currentRef: string | null;
		};
	}

	let { data }: Props = $props();
	const repo = $derived(data.repo);
	const activeBranch = $derived(data.currentRef ?? repo?.default_branch ?? 'main');
	const isEmpty = $derived(data.contents.length === 0 && !data.lastCommit);

	let branchOpen = $state(false);

	function switchBranch(branch: string) {
		branchOpen = false;
		goto(`/${repo?.full_name}?ref=${branch}`, { replaceState: true });
	}

	const langTotal = $derived(Object.values(data.languages).reduce((a, b) => a + b, 0));
	const langBars = $derived(
		Object.entries(data.languages)
			.map(([name, bytes]) => ({
				name,
				pct: (bytes / langTotal) * 100,
				color: getLanguageColor(name)
			}))
			.sort((a, b) => b.pct - a.pct)
	);

	let cloneOpen = $state(false);
	let copied = $state<'https' | 'ssh' | null>(null);

	const httpsUrl = $derived(
		repo?.clone_url ?? `https://github.com/${repo?.full_name}.git`
	);
	const sshUrl = $derived(
		repo?.ssh_url ?? `git@github.com:${repo?.full_name}.git`
	);
	const zipUrl = $derived(
		`https://github.com/${repo?.full_name}/archive/refs/heads/${repo?.default_branch ?? 'main'}.zip`
	);

	async function copyUrl(url: string, type: 'https' | 'ssh') {
		await navigator.clipboard.writeText(url);
		copied = type;
		setTimeout(() => (copied = null), 2000);
	}
</script>

{#if repo && isEmpty}
	<div class="space-y-6">
		<div class="duo-card p-8 text-center">
			<div class="text-5xl mb-4">🌱</div>
			<h2 class="text-2xl font-extrabold text-duo-text mb-2">This repo is empty</h2>
			<p class="text-duo-text-light font-bold mb-6">Get started by pushing code from your machine</p>
		</div>

		<div class="duo-card p-6 space-y-6">
			<div>
				<h3 class="text-sm font-extrabold uppercase tracking-wider text-duo-gray-400 mb-3">Create a new repository on the command line</h3>
				<pre class="setup-code">echo "# {repo.name}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin {repo.clone_url}
git push -u origin main</pre>
			</div>

			<div class="border-t-2 border-duo-gray-100 pt-6">
				<h3 class="text-sm font-extrabold uppercase tracking-wider text-duo-gray-400 mb-3">Push an existing repository</h3>
				<pre class="setup-code">git remote add origin {repo.clone_url}
git branch -M main
git push -u origin main</pre>
			</div>
		</div>
	</div>
{:else if repo}
	<div class="space-y-5">
		<!-- Branch selector + Clone + Last commit -->
		<div class="flex items-center gap-3 flex-wrap">
			<div class="relative">
				<button
					class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-duo-gray-100 rounded-xl text-sm font-bold hover:border-duo-blue transition-colors"
					onclick={() => (branchOpen = !branchOpen)}
					onkeydown={(e: KeyboardEvent) => { if (e.key === 'Escape') branchOpen = false; }}
				>
					<GitBranch size={16} strokeWidth={2.5} class="text-duo-green" />
					<span class="max-w-[140px] truncate">{activeBranch}</span>
					<span class="text-xs text-duo-gray-400">▼</span>
				</button>
				{#if branchOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="fixed inset-0 z-10" onclick={() => (branchOpen = false)}></div>
					<div
						class="absolute top-full left-0 mt-1 w-64 bg-white border-2 border-duo-gray-100 rounded-xl shadow-lg z-20 max-h-72 overflow-y-auto"
					>
						<div class="px-3 py-2 border-b-2 border-duo-gray-100">
							<span
								class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400"
								>Branches ({data.branches.length})</span
							>
						</div>
						{#each data.branches as branch}
							<button
								class="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-duo-snow transition-colors flex items-center justify-between"
								class:text-duo-green={branch.name === activeBranch}
								class:font-extrabold={branch.name === activeBranch}
								class:bg-duo-green-lightest={branch.name === activeBranch}
								onclick={() => switchBranch(branch.name)}
							>
								<span class="truncate">{branch.name}</span>
								{#if branch.name === repo?.default_branch}
									<span
										class="text-[9px] bg-duo-gray-100 text-duo-gray-400 px-1.5 py-0.5 rounded-full font-extrabold flex-shrink-0 ml-2"
										>default</span
									>
								{/if}
								{#if branch.protected}
									<span class="text-xs flex-shrink-0 ml-1">🔒</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			{#if data.lastCommit}
				<div
					class="flex items-center gap-2 text-xs text-duo-gray-400 font-bold flex-1 min-w-0"
				>
					{#if data.lastCommit.author}
						<img
							src={data.lastCommit.author.avatar_url}
							alt=""
							class="w-5 h-5 rounded-full flex-shrink-0"
						/>
					{/if}
					<span class="truncate">{data.lastCommit.commit.message.split('\n')[0]}</span>
					<span class="flex-shrink-0">{timeAgo(data.lastCommit.commit.author.date)}</span>
					<code
						class="bg-duo-snow px-1.5 py-0.5 rounded text-[11px] border border-duo-gray-100 flex-shrink-0"
					>
						{data.lastCommit.sha.slice(0, 7)}
					</code>
				</div>
			{/if}

			<!-- Clone dropdown -->
			<div class="relative ml-auto">
				<button
					class="duo-btn duo-btn-primary text-xs px-4 py-2.5"
					onclick={() => (cloneOpen = !cloneOpen)}
					onkeydown={(e: KeyboardEvent) => { if (e.key === 'Escape') cloneOpen = false; }}
				>
					<Code size={14} strokeWidth={2.5} />
					Clone
				</button>
				{#if cloneOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="fixed inset-0 z-10" onclick={() => (cloneOpen = false)}></div>
					<div
						class="absolute top-full right-0 mt-2 w-80 bg-white border-2 border-duo-gray-100 rounded-xl shadow-lg z-20 p-4 space-y-3"
					>
						<div>
							<span
								class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400"
								>HTTPS</span
							>
							<div class="flex items-center gap-2 mt-1">
								<input
									type="text"
									readonly
									value={httpsUrl}
									class="flex-1 bg-duo-snow border-2 border-duo-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-duo-text"
								/>
								<button
									class="text-duo-gray-400 hover:text-duo-green transition-colors"
									onclick={() => copyUrl(httpsUrl, 'https')}
									aria-label="Copy HTTPS URL"
								>
									{#if copied === 'https'}
										<Check size={16} strokeWidth={2.5} class="text-duo-green" />
									{:else}
										<Copy size={16} strokeWidth={2.5} />
									{/if}
								</button>
							</div>
						</div>
						<div>
							<span
								class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400"
								>SSH</span
							>
							<div class="flex items-center gap-2 mt-1">
								<input
									type="text"
									readonly
									value={sshUrl}
									class="flex-1 bg-duo-snow border-2 border-duo-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-duo-text"
								/>
								<button
									class="text-duo-gray-400 hover:text-duo-green transition-colors"
									onclick={() => copyUrl(sshUrl, 'ssh')}
									aria-label="Copy SSH URL"
								>
									{#if copied === 'ssh'}
										<Check size={16} strokeWidth={2.5} class="text-duo-green" />
									{:else}
										<Copy size={16} strokeWidth={2.5} />
									{/if}
								</button>
							</div>
						</div>
						<a
							href={zipUrl}
							class="flex items-center gap-2 text-xs font-bold text-duo-blue no-underline hover:underline"
						>
							<Download size={14} strokeWidth={2.5} />
							Download ZIP
						</a>
					</div>
				{/if}
			</div>
		</div>

		<!-- File Tree -->
		<div class="duo-card overflow-hidden">
			<FileTree
				items={data.contents.map((c) => ({
					name: c.name,
					path: c.path,
					type: c.type === 'dir' ? 'dir' : 'file',
					size: c.size
				}))}
				basePath="/{repo?.full_name}"
				ref={data.currentRef ?? undefined}
			/>
		</div>

		<!-- Language bar -->
		{#if langBars.length > 0}
			<div class="duo-card p-4">
				<div class="h-2.5 rounded-full overflow-hidden flex">
					{#each langBars as lang, i}
						<div
							class="h-full"
							class:rounded-l-full={i === 0}
							class:rounded-r-full={i === langBars.length - 1}
							style:width="{lang.pct}%"
							style:background={lang.color}
							title="{lang.name}: {lang.pct.toFixed(1)}%"
						></div>
					{/each}
				</div>
				<div class="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
					{#each langBars.slice(0, 8) as lang}
						<span class="text-xs font-bold text-duo-gray-400 flex items-center gap-1.5">
							<span
								class="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
								style:background={lang.color}
							></span>
							{lang.name}
							<span class="text-duo-text">{lang.pct.toFixed(1)}%</span>
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Contributors -->
		{#if data.contributors.length > 0}
			<div class="duo-card p-4">
				<h3 class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400 mb-3">
					Contributors
				</h3>
				<div class="flex flex-wrap gap-1.5">
					{#each data.contributors as contrib}
						<a
							href="/{contrib.login}"
							class="no-underline"
							title="{contrib.login} — {contrib.contributions} commits"
						>
							<img
								src={contrib.avatar_url}
								alt={contrib.login}
								class="w-8 h-8 rounded-full border-2 border-white hover:border-duo-green transition-colors"
								loading="lazy"
							/>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- README -->
		{#if data.readmeContent}
			<div class="duo-card p-6">
				<div class="flex items-center gap-2 mb-4 pb-3 border-b-2 border-duo-gray-100">
					<BookOpen size={16} strokeWidth={2.5} class="text-duo-gray-400" />
					<span class="text-sm font-extrabold uppercase tracking-wider text-duo-gray-400"
						>README.md</span
					>
				</div>
				<MarkdownRenderer content={data.readmeContent} />
			</div>
		{/if}
	</div>
{/if}

<style>
	.setup-code {
		background: #1E2D35;
		color: #E5E5E5;
		padding: 16px 20px;
		border-radius: 12px;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
		font-size: 13px;
		line-height: 1.7;
		overflow-x: auto;
		white-space: pre;
		margin: 0;
		user-select: all;
	}
</style>
