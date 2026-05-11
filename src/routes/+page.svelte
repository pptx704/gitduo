<script lang="ts">
	import { XPBar, StreakBadge, SkillBadge, UnitCard, Avatar } from '$lib';
	import { GitCommit, Sparkles, CircleDot, GitPullRequest, Star, GitFork, Trash2, Activity, MessageCircle, Tag, Eye, ArrowRight } from 'lucide-svelte';
	import type { ContributionsData, DashboardData, GitHubEvent } from '$lib/api/github';
	import { computeStreak } from '$lib/utils';
	import { computePlayerLevel } from '$lib/leveling';

	interface Props {
		data: {
			user: import('$lib/api/github').GitHubUser;
			feed: DashboardData | null;
			contributions: { user: { contributionsCollection: ContributionsData } } | null;
			receivedEvents: GitHubEvent[];
		};
	}

	let { data }: Props = $props();

	const contribs = $derived(data.contributions?.user?.contributionsCollection);
	const calendar = $derived(contribs?.contributionCalendar);
	const totalContributions = $derived(calendar?.totalContributions ?? 0);
	const totalCommitsThisWeek = $derived(contribs?.totalCommitContributions ?? 0);
	const weeklyGoal = 50;

	const totalStars = $derived(
		data.feed?.viewer.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0) ?? 0
	);

	const streak = $derived(computeStreak(calendar));

	const todayContribs = $derived.by(() => {
		if (!calendar) return 0;
		const days = calendar.weeks.flatMap((w) => w.contributionDays);
		return days[days.length - 1]?.contributionCount ?? 0;
	});

	const langStats = $derived.by(() => {
		if (!data.feed) return [];
		const langs: Record<string, { count: number; color: string }> = {};
		for (const repo of data.feed.viewer.repositories.nodes) {
			if (repo.primaryLanguage) {
				const name = repo.primaryLanguage.name;
				if (!langs[name]) langs[name] = { count: 0, color: repo.primaryLanguage.color };
				langs[name].count++;
			}
		}
		const total = Object.values(langs).reduce((a, b) => a + b.count, 0);
		return Object.entries(langs)
			.map(([name, { count, color }]) => ({ name, percentage: (count / total) * 100, color }))
			.sort((a, b) => b.percentage - a.percentage);
	});

	const recentRepos = $derived(data.feed?.viewer.repositories.nodes.slice(0, 6) ?? []);

	const langSkillCount = $derived(langStats.filter((l) => l.percentage > 5).length);

	const playerLevel = $derived(computePlayerLevel({
		commits: contribs?.totalCommitContributions ?? 0,
		prsOpened: contribs?.totalPullRequestContributions ?? 0,
		publicRepos: data.user?.public_repos ?? 0,
		starsReceived: totalStars,
		followers: data.user?.followers ?? 0,
		languageSkills: langSkillCount,
	}));

	function eventAction(event: GitHubEvent): string {
		const type = event.type;
		if (type === 'PushEvent') {
			const commits = (event.payload as { commits?: unknown[] }).commits;
			const count = (commits?.length || 0) || (event.payload as { size?: number }).size || 0;
			if (count > 0) return `Pushed ${count} commit${count !== 1 ? 's' : ''}`;
			return 'Pushed';
		}
		if (type === 'CreateEvent') return `Created ${(event.payload as { ref_type?: string }).ref_type ?? 'repo'}`;
		if (type === 'IssuesEvent') {
			const action = (event.payload as { action?: string }).action ?? 'updated';
			return `${action.charAt(0).toUpperCase() + action.slice(1)} issue`;
		}
		if (type === 'PullRequestEvent') {
			const action = (event.payload as { action?: string }).action ?? 'updated';
			return `${action.charAt(0).toUpperCase() + action.slice(1)} PR`;
		}
		if (type === 'WatchEvent') return 'Starred';
		if (type === 'ForkEvent') return 'Forked';
		if (type === 'IssueCommentEvent') return 'Commented';
		if (type === 'ReleaseEvent') return 'Published release';
		if (type === 'DeleteEvent') return `Deleted ${(event.payload as { ref_type?: string }).ref_type ?? 'branch'}`;
		if (type === 'PullRequestReviewEvent') return 'Reviewed PR';
		return 'Activity';
	}

	interface EventGroup {
		actor: { login: string; avatar_url: string };
		repo: string;
		events: GitHubEvent[];
		latestAt: string;
	}

	const groupedEvents = $derived.by(() => {
		const groups: EventGroup[] = [];
		for (const event of data.receivedEvents) {
			const key = `${event.actor.login}:${event.repo.name}`;
			const last = groups[groups.length - 1];
			if (last && `${last.actor.login}:${last.repo}` === key) {
				last.events.push(event);
			} else {
				groups.push({
					actor: event.actor,
					repo: event.repo.name,
					events: [event],
					latestAt: event.created_at
				});
			}
		}
		return groups.slice(0, 20);
	});

	const eventIcons: Record<string, typeof GitCommit> = {
		PushEvent: GitCommit,
		CreateEvent: Sparkles,
		IssuesEvent: CircleDot,
		PullRequestEvent: GitPullRequest,
		WatchEvent: Star,
		ForkEvent: GitFork,
		DeleteEvent: Trash2,
		IssueCommentEvent: MessageCircle,
		ReleaseEvent: Tag,
		PullRequestReviewEvent: Eye
	};

	function timeAgo(dateStr: string): string {
		const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h`;
		const days = Math.floor(hours / 24);
		return `${days}d`;
	}
</script>

<svelte:head>
	<title>GitDuo — Dashboard</title>
</svelte:head>

<div class="space-y-8">
	<!-- Daily Status -->
	<div class="duo-card p-6" style="background: oklch(96% 0.025 145); border-color: oklch(90% 0.04 145)">
		<div class="flex items-center justify-between mb-5">
			<div class="flex items-center gap-4">
				<Avatar src={data.user?.avatar_url} username={data.user?.login ?? ''} size="lg" />
				<div>
					<h1 class="text-2xl font-extrabold text-duo-text">{data.user?.name ?? data.user?.login}</h1>
					<p class="text-sm text-duo-text-light font-bold mt-0.5">
						{#if todayContribs > 0}
							{todayContribs} contribution{todayContribs !== 1 ? 's' : ''} today 🎯
						{:else}
							No contributions today — make your first!
						{/if}
					</p>
				</div>
			</div>
			<StreakBadge count={streak} size="lg" />
		</div>

		<div class="grid grid-cols-3 gap-4">
			<div class="text-center rounded-2xl py-3 px-2" style="background: oklch(99% 0.01 145)">
				<div class="text-3xl font-extrabold tabular-nums" style:color={playerLevel.tierInfo.cssColor}>{playerLevel.currentXP.toLocaleString()}</div>
				<div class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400 mt-1">Total XP</div>
			</div>
			<div class="text-center rounded-2xl py-3 px-2" style="background: oklch(97% 0.01 230)">
				<div class="text-3xl font-extrabold" style:color={playerLevel.tierInfo.cssColor}>Lv.{playerLevel.level}</div>
				<div class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400 mt-1">{playerLevel.tier}</div>
			</div>
			<div class="text-center rounded-2xl py-3 px-2" style="background: oklch(97% 0.01 310)">
				<div class="text-3xl font-extrabold tabular-nums text-duo-purple">{totalContributions.toLocaleString()}</div>
				<div class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400 mt-1">This year</div>
			</div>
		</div>
	</div>

	<!-- Weekly Goal -->
	<div class="duo-card p-5" style="background: oklch(98% 0.015 145)">
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-extrabold uppercase tracking-wider" style="color: #3B8700">Weekly Goal</span>
			<span class="text-base font-extrabold text-duo-text">{totalCommitsThisWeek}/{weeklyGoal}</span>
		</div>
		<XPBar current={totalCommitsThisWeek} max={weeklyGoal} color="green" size="md" />
	</div>

	<!-- Quick Access -->
	{#if recentRepos.length > 0}
		<div>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-extrabold text-duo-text">Quick Access</h2>
				<a href="/{data.user?.login}" class="text-sm font-bold text-duo-blue no-underline hover:underline inline-flex items-center gap-1">All repos <ArrowRight size={14} strokeWidth={2.5} /></a>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each recentRepos as repo}
					<UnitCard
						name={repo.name}
						fullName={repo.nameWithOwner}
						description={repo.description}
						language={repo.primaryLanguage?.name}
						languageColor={repo.primaryLanguage?.color}
						stars={repo.stargazerCount}
						forks={repo.forkCount}
						isPrivate={repo.isPrivate}
					/>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Language Skills (compact, links to profile for full view) -->
	{#if langStats.length > 0}
		<div>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-extrabold text-duo-text">Skills</h2>
				<a href="/{data.user?.login}" class="text-sm font-bold text-duo-blue no-underline hover:underline inline-flex items-center gap-1">Full profile <ArrowRight size={14} strokeWidth={2.5} /></a>
			</div>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{#each langStats.slice(0, 6) as lang}
					<SkillBadge language={lang.name} percentage={lang.percentage} color={lang.color} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Feed — Received Events -->
	{#if groupedEvents.length > 0}
		<div>
			<h2 class="text-xl font-extrabold text-duo-text mb-4">Feed</h2>
			<div class="duo-card divide-y divide-duo-gray-100 overflow-hidden">
				{#each groupedEvents as group}
					<a
						href="/{group.repo}"
						class="feed-item block px-4 py-3.5 no-underline transition-colors"
					>
						<div class="flex items-center gap-3 mb-1.5">
							<img src={group.actor.avatar_url} alt="" class="w-7 h-7 rounded-full flex-shrink-0" loading="lazy" />
							<div class="flex-1 min-w-0">
								<span class="text-sm font-extrabold text-duo-text">{group.actor.login}</span>
								<span class="text-xs font-bold text-duo-gray-400 ml-1.5">{group.repo}</span>
							</div>
							<span class="text-xs font-bold text-duo-gray-400 flex-shrink-0">{timeAgo(group.latestAt)}</span>
						</div>
						<div class="ml-10 flex flex-wrap gap-x-4 gap-y-1">
							{#each group.events as event}
								{@const Icon = eventIcons[event.type] ?? Activity}
								<span class="flex items-center gap-1.5 text-xs font-bold text-duo-gray-400">
									<Icon size={12} strokeWidth={2.5} />
									{eventAction(event)}
								</span>
							{/each}
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Empty state -->
	{#if !data.feed && groupedEvents.length === 0}
		<div class="duo-card p-12 text-center">
			<div class="text-5xl mb-4">🚀</div>
			<h2 class="text-xl font-extrabold text-duo-text mb-2">Your adventure begins!</h2>
			<p class="text-duo-text-light font-bold">Star repos or follow users to fill your feed</p>
		</div>
	{/if}
</div>

<style>
	.feed-item {
		background: oklch(99.5% 0.003 145);
	}

	.feed-item:hover,
	.feed-item:focus-visible {
		background: oklch(97% 0.015 145);
	}
</style>
