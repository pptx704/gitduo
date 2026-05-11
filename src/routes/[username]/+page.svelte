<script lang="ts">
	import { Avatar, XPBar, StreakBadge, SkillBadge, UnitCard } from '$lib';
	import type { GitHubUser, GitHubRepo, ContributionsData, PinnedRepo } from '$lib/api/github';
	import { computeStreak } from '$lib/utils';
	import { computePlayerLevel, XP_MAX } from '$lib/leveling';

	interface Props {
		data: {
			profile: GitHubUser | null;
			repos: GitHubRepo[];
			contributions: { user: { contributionsCollection: ContributionsData } } | null;
			languages: Record<string, number>;
			pinnedRepos: PinnedRepo[];
			isOwnProfile: boolean;
		};
	}

	let { data }: Props = $props();

	const profile = $derived(data.profile);
	const contribs = $derived(data.contributions?.user?.contributionsCollection);
	const calendar = $derived(contribs?.contributionCalendar);

	const streak = $derived(computeStreak(calendar));

	const totalStars = $derived(data.repos.reduce((sum, r) => sum + r.stargazers_count, 0));

	const langTotal = $derived(Object.values(data.languages).reduce((a, b) => a + b, 0));
	const langEntries = $derived(
		Object.entries(data.languages)
			.map(([name, count]) => ({ name, percentage: (count / langTotal) * 100 }))
			.sort((a, b) => b.percentage - a.percentage)
	);

	const langSkillCount = $derived(langEntries.filter((l) => l.percentage > 5).length);

	const playerLevel = $derived(computePlayerLevel({
		commits: contribs?.totalCommitContributions ?? 0,
		prsOpened: contribs?.totalPullRequestContributions ?? 0,
		publicRepos: profile?.public_repos ?? 0,
		starsReceived: totalStars,
		followers: profile?.followers ?? 0,
		languageSkills: langSkillCount,
	}));

	const calendarWeeks = $derived(calendar?.weeks.slice(-52) ?? []);

	function contribColor(count: number): string {
		if (count === 0) return '#E5E5E5';
		if (count <= 3) return '#D7FFB8';
		if (count <= 6) return '#89E219';
		if (count <= 9) return '#58CC02';
		return '#3B8700';
	}

	// Repo filtering
	let repoSearch = $state('');
	let repoFilter = $state<'all' | 'source' | 'fork' | 'private'>('all');

	const filteredRepos = $derived.by(() => {
		let repos = data.repos;
		if (repoFilter === 'source') repos = repos.filter((r) => !r.fork);
		else if (repoFilter === 'fork') repos = repos.filter((r) => r.fork);
		else if (repoFilter === 'private') repos = repos.filter((r) => r.private);

		if (repoSearch.trim()) {
			const q = repoSearch.toLowerCase();
			repos = repos.filter((r) =>
				r.name.toLowerCase().includes(q) ||
				r.description?.toLowerCase().includes(q)
			);
		}
		return repos;
	});
</script>

<svelte:head>
	<title>{profile?.name ?? profile?.login ?? 'Profile'} — GitDuo</title>
</svelte:head>

{#if profile}
	<div class="space-y-8">
		<!-- Player Card -->
		<div class="duo-card p-7" style="background: oklch(96% 0.025 145); border-color: oklch(90% 0.04 145)">
			<div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
				<Avatar src={profile.avatar_url} username={profile.login} size="xl" />
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-center sm:justify-start gap-3 mb-1">
						<h1 class="text-3xl font-extrabold text-duo-text truncate">{profile.name ?? profile.login}</h1>
						<StreakBadge count={streak} size="md" />
					</div>
					<p class="text-duo-text-light font-bold mb-3 text-base">@{profile.login}</p>
					{#if profile.bio}
						<p class="text-sm text-duo-text font-semibold mb-4">{profile.bio}</p>
					{/if}
					<div class="flex items-center gap-5 text-sm font-extrabold text-duo-gray-400 flex-wrap justify-center sm:justify-start">
						<span><strong class="text-duo-text text-base">{profile.followers.toLocaleString()}</strong> followers</span>
						<span><strong class="text-duo-text text-base">{profile.following.toLocaleString()}</strong> following</span>
						<span><strong class="text-duo-text text-base">{profile.public_repos}</strong> repos</span>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-5 mt-6 pt-5" style="border-top: 2px solid oklch(90% 0.03 145)">
				<div>
					<div class="flex items-center justify-between mb-1">
						<span class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400">Level {playerLevel.level}</span>
						<span class="text-[11px] font-extrabold uppercase tracking-wider" style:color={playerLevel.tierInfo.cssColor}>{playerLevel.tier}</span>
					</div>
					<XPBar current={playerLevel.levelXP} max={playerLevel.levelMax} color={playerLevel.tierInfo.color} size="sm" />
				</div>
				<div>
					<div class="flex items-center justify-between mb-1">
						<span class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400">XP</span>
						<span class="text-[11px] font-extrabold text-duo-gray-400">{playerLevel.currentXP.toLocaleString()}</span>
					</div>
					<XPBar current={playerLevel.currentXP} max={XP_MAX} label="" color="green" size="sm" />
				</div>
			</div>
		</div>

		<!-- Language Skill Tree -->
		{#if langEntries.length > 0}
			<div>
				<h2 class="text-xl font-extrabold text-duo-text mb-4">Language Skills</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{#each langEntries as lang}
						<SkillBadge language={lang.name} percentage={lang.percentage} />
					{/each}
				</div>
			</div>
		{/if}

		<!-- Contribution Calendar -->
		{#if calendarWeeks.length > 0}
			<div>
				<h2 class="text-xl font-extrabold text-duo-text mb-4">Contributions</h2>
				<div class="duo-card p-5 overflow-x-auto" style="background: oklch(98.5% 0.008 145)">
					<div class="contribution-grid">
						{#each calendarWeeks as week}
							<div class="flex flex-col gap-[3px]">
								{#each week.contributionDays as day}
									<div
										class="w-3 h-3 rounded-sm"
										style:background={contribColor(day.contributionCount)}
										title="{day.date}: {day.contributionCount} contributions"
									></div>
								{/each}
							</div>
						{/each}
					</div>
					<div class="flex items-center gap-1 mt-3 justify-end text-[11px] font-bold text-duo-gray-400">
						<span>Less</span>
						{#each [0, 2, 5, 8, 12] as n}
							<div class="w-3 h-3 rounded-sm" style:background={contribColor(n)}></div>
						{/each}
						<span>More</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Pinned Repos -->
		{#if data.pinnedRepos.length > 0}
			<div>
				<h2 class="text-xl font-extrabold text-duo-text mb-4">📌 Pinned</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each data.pinnedRepos as repo}
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

		<!-- Repositories -->
		<div id="repositories">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-extrabold text-duo-text">Repositories <span class="text-duo-gray-400 text-sm font-bold">({data.repos.length})</span></h2>
			</div>

			<!-- Search + Filter -->
			<div class="flex flex-col sm:flex-row gap-2 mb-4">
				<input
					type="text"
					bind:value={repoSearch}
					placeholder="Find a repository..."
					class="flex-1 bg-white border-2 border-duo-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-duo-text placeholder:text-duo-gray-300 focus:border-duo-blue focus:outline-none transition-colors"
				/>
				<div class="flex gap-1.5">
					{#each [
						{ key: 'all', label: 'All' },
						{ key: 'source', label: 'Source' },
						{ key: 'fork', label: 'Forks' },
						{ key: 'private', label: 'Private' }
					] as tab}
						<button
							class="px-3 py-2 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap"
							class:bg-duo-green-lightest={repoFilter === tab.key}
							class:text-duo-green-darker={repoFilter === tab.key}
							class:bg-duo-gray-100={repoFilter !== tab.key}
							class:text-duo-gray-400={repoFilter !== tab.key}
							onclick={() => repoFilter = tab.key as typeof repoFilter}
						>
							{tab.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Repo grid -->
			{#if filteredRepos.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each filteredRepos as repo}
						<UnitCard
							name={repo.name}
							fullName={repo.full_name}
							description={repo.description}
							language={repo.language}
							stars={repo.stargazers_count}
							forks={repo.forks_count}
							isPrivate={repo.private}
						/>
					{/each}
				</div>
			{:else}
				<div class="duo-card p-8 text-center">
					<p class="text-sm font-bold text-duo-gray-400">No repositories match your search</p>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="duo-card p-12 text-center">
		<div class="text-5xl mb-4">🔍</div>
		<h2 class="text-xl font-extrabold text-duo-text mb-2">User not found</h2>
		<p class="text-sm text-duo-text-light font-bold">Check username and try again</p>
	</div>
{/if}

<style>
	.contribution-grid {
		display: flex;
		gap: 3px;
	}
</style>
