<script lang="ts">
	import { Avatar } from '$lib';
	import { CheckCircle2, XCircle, Clock, Loader2, CircleDot, Play, GitBranch, ChevronDown, ChevronRight, Zap } from 'lucide-svelte';
	import type { GitHubWorkflowRun, GitHubWorkflow, GitHubWorkflowJob } from '$lib/api/github';

	interface Props {
		data: {
			runs: GitHubWorkflowRun[];
			workflows: GitHubWorkflow[];
			jobs: Record<number, { total_count: number; jobs: GitHubWorkflowJob[] }>;
			owner: string;
			repo: string;
			page: number;
			totalCount: number;
		};
	}

	let { data }: Props = $props();

	let expandedRun = $state<number | null>(null);

	function conclusionIcon(conclusion: string | null, status: string) {
		if (status !== 'completed') return { icon: Loader2, color: 'text-duo-orange', spin: true };
		switch (conclusion) {
			case 'success': return { icon: CheckCircle2, color: 'text-duo-green', spin: false };
			case 'failure': return { icon: XCircle, color: 'text-duo-red', spin: false };
			case 'cancelled': return { icon: CircleDot, color: 'text-duo-gray-300', spin: false };
			case 'skipped': return { icon: CircleDot, color: 'text-duo-gray-300', spin: false };
			default: return { icon: Clock, color: 'text-duo-orange', spin: false };
		}
	}

	function timeAgo(dateStr: string): string {
		const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function duration(start: string | null, end: string | null): string {
		if (!start) return '';
		const s = new Date(start).getTime();
		const e = end ? new Date(end).getTime() : Date.now();
		const secs = Math.floor((e - s) / 1000);
		if (secs < 60) return `${secs}s`;
		const mins = Math.floor(secs / 60);
		const remSecs = secs % 60;
		if (mins < 60) return `${mins}m ${remSecs}s`;
		return `${Math.floor(mins / 60)}h ${mins % 60}m`;
	}

	function eventLabel(event: string): string {
		switch (event) {
			case 'push': return 'push';
			case 'pull_request': return 'PR';
			case 'schedule': return 'schedule';
			case 'workflow_dispatch': return 'manual';
			case 'release': return 'release';
			default: return event;
		}
	}

	const workflowMap = $derived(
		Object.fromEntries(data.workflows.map(w => [w.id, w]))
	);

	function toggleExpand(runId: number) {
		expandedRun = expandedRun === runId ? null : runId;
	}
</script>

<svelte:head>
	<title>Actions — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<h1 class="text-2xl font-extrabold text-duo-text flex items-center gap-2">
			<Zap size={24} strokeWidth={2.5} class="text-duo-orange" />
			Actions
		</h1>
		{#if data.totalCount > 0}
			<span class="text-sm font-bold text-duo-gray-400">{data.totalCount} runs</span>
		{/if}
	</div>

	<!-- Summary bar -->
	{#if data.runs.length > 0}
		{@const recent = data.runs.slice(0, 10)}
		{@const success = recent.filter(r => r.conclusion === 'success').length}
		{@const failed = recent.filter(r => r.conclusion === 'failure').length}
		{@const pending = recent.filter(r => r.status !== 'completed').length}
		<div class="grid grid-cols-3 gap-3">
			<div class="duo-card px-4 py-3 flex items-center gap-2.5" style:background="oklch(97% 0.03 145)">
				<CheckCircle2 size={18} strokeWidth={2.5} class="text-duo-green" />
				<span class="text-lg font-extrabold text-duo-text">{success}</span>
				<span class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400">Passed</span>
			</div>
			<div class="duo-card px-4 py-3 flex items-center gap-2.5" style:background="oklch(97% 0.03 25)">
				<XCircle size={18} strokeWidth={2.5} class="text-duo-red" />
				<span class="text-lg font-extrabold text-duo-text">{failed}</span>
				<span class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400">Failed</span>
			</div>
			<div class="duo-card px-4 py-3 flex items-center gap-2.5" style:background="oklch(97% 0.03 80)">
				<Loader2 size={18} strokeWidth={2.5} class="text-duo-orange" />
				<span class="text-lg font-extrabold text-duo-text">{pending}</span>
				<span class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400">Running</span>
			</div>
		</div>
	{/if}

	<!-- Workflow runs -->
	{#if data.runs.length > 0}
		<div class="duo-card overflow-hidden">
			{#each data.runs as run, i}
				{@const ci = conclusionIcon(run.conclusion, run.status)}
				{@const CiIcon = ci.icon}
				{@const jobs = data.jobs[run.id]?.jobs ?? []}
				<div
					class="border-b-2 border-duo-gray-100 last:border-b-0"
					class:bg-duo-red-lightest={run.conclusion === 'failure'}
				>
					<!-- Run row -->
					<button
						class="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-duo-snow/50 transition-colors"
						onclick={() => toggleExpand(run.id)}
					>
						<span class={ci.color}>
							{#if ci.spin}
								<CiIcon size={20} strokeWidth={2.5} class="animate-spin" />
							{:else}
								<CiIcon size={20} strokeWidth={2.5} />
							{/if}
						</span>

						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="text-sm font-extrabold text-duo-text truncate">{run.display_title}</span>
							</div>
							<div class="flex items-center gap-2 mt-0.5 text-xs text-duo-gray-400 font-bold">
								{#if workflowMap[run.workflow_id]}
									<span>{workflowMap[run.workflow_id].name}</span>
									<span>·</span>
								{/if}
								<span class="inline-flex items-center gap-1">
									<Play size={10} strokeWidth={3} />
									{eventLabel(run.event)}
								</span>
								{#if run.head_branch}
									<span>·</span>
									<span class="inline-flex items-center gap-1">
										<GitBranch size={10} strokeWidth={3} />
										{run.head_branch}
									</span>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-3 flex-shrink-0">
							<div class="text-right">
								<div class="text-xs font-bold text-duo-gray-400">{timeAgo(run.created_at)}</div>
								{#if run.run_started_at && run.status === 'completed'}
									<div class="text-[11px] font-bold text-duo-gray-300">{duration(run.run_started_at, run.updated_at)}</div>
								{/if}
							</div>
							<img src={run.actor.avatar_url} alt={run.actor.login} class="w-6 h-6 rounded-full" loading="lazy" />
							{#if jobs.length > 0}
								{#if expandedRun === run.id}
									<ChevronDown size={14} strokeWidth={2.5} class="text-duo-gray-300" />
								{:else}
									<ChevronRight size={14} strokeWidth={2.5} class="text-duo-gray-300" />
								{/if}
							{/if}
						</div>
					</button>

					<!-- Expanded jobs/steps -->
					{#if expandedRun === run.id && jobs.length > 0}
						<div class="px-4 pb-4">
							<div class="ml-7 space-y-2">
								{#each jobs as job}
									{@const jci = conclusionIcon(job.conclusion, job.status)}
									{@const JIcon = jci.icon}
									<div class="bg-white border-2 border-duo-gray-100 rounded-xl overflow-hidden">
										<div class="flex items-center gap-2.5 px-3 py-2.5">
											<span class={jci.color}>
												{#if jci.spin}
													<JIcon size={14} strokeWidth={2.5} class="animate-spin" />
												{:else}
													<JIcon size={14} strokeWidth={2.5} />
												{/if}
											</span>
											<span class="text-sm font-bold text-duo-text">{job.name}</span>
											{#if job.started_at && job.completed_at}
												<span class="text-[11px] font-bold text-duo-gray-300 ml-auto">{duration(job.started_at, job.completed_at)}</span>
											{/if}
										</div>
										{#if job.steps && job.steps.length > 0}
											<div class="border-t border-duo-gray-100 px-3 py-2 space-y-1">
												{#each job.steps as step}
													{@const sci = conclusionIcon(step.conclusion, step.status)}
													{@const SIcon = sci.icon}
													<div class="flex items-center gap-2 text-xs">
														<span class={sci.color}>
															{#if sci.spin}
																<SIcon size={11} strokeWidth={2.5} class="animate-spin" />
															{:else}
																<SIcon size={11} strokeWidth={2.5} />
															{/if}
														</span>
														<span class="font-bold text-duo-gray-400 truncate">{step.name}</span>
														{#if step.started_at && step.completed_at}
															<span class="text-[11px] text-duo-gray-300 ml-auto flex-shrink-0">{duration(step.started_at, step.completed_at)}</span>
														{/if}
													</div>
												{/each}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="duo-card p-10 text-center">
			<div class="text-4xl mb-3">⚡</div>
			<h2 class="text-lg font-extrabold text-duo-text">No workflow runs</h2>
			<p class="text-sm text-duo-text-light font-bold mt-1">This repository doesn't have any GitHub Actions runs yet</p>
		</div>
	{/if}

	<!-- Pagination -->
	{#if data.runs.length >= 20}
		<div class="flex justify-center gap-3">
			{#if data.page > 1}
				<a href="?page={data.page - 1}" class="duo-btn-ghost text-sm no-underline">← Newer</a>
			{/if}
			<a href="?page={data.page + 1}" class="duo-btn-ghost text-sm no-underline">Older →</a>
		</div>
	{/if}
</div>

<style>
	.bg-duo-red-lightest {
		background: oklch(98% 0.01 25);
	}
</style>
