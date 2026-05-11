const API_BASE = 'https://api.github.com';
const GRAPHQL_URL = 'https://api.github.com/graphql';

interface FetchOptions {
	method?: string;
	body?: unknown;
	headers?: Record<string, string>;
}

interface RateLimit {
	limit: number;
	remaining: number;
	reset: number;
}

let lastRateLimit: RateLimit = { limit: 5000, remaining: 5000, reset: 0 };

export function getRateLimit(): RateLimit {
	return lastRateLimit;
}

async function ghFetch<T>(token: string, path: string, options: FetchOptions = {}): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: options.method ?? 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'Content-Type': 'application/json',
			...options.headers
		},
		body: options.body ? JSON.stringify(options.body) : undefined
	});

	const limit = res.headers.get('x-ratelimit-limit');
	const remaining = res.headers.get('x-ratelimit-remaining');
	const reset = res.headers.get('x-ratelimit-reset');
	if (limit && remaining && reset) {
		lastRateLimit = {
			limit: parseInt(limit),
			remaining: parseInt(remaining),
			reset: parseInt(reset)
		};
	}

	if (!res.ok) {
		throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
	}

	return res.json() as Promise<T>;
}

async function ghGraphQL<T>(token: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
	const res = await fetch(GRAPHQL_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query, variables })
	});

	if (!res.ok) {
		throw new Error(`GitHub GraphQL error: ${res.status}`);
	}

	const json = await res.json();
	if (json.errors) {
		throw new Error(json.errors[0].message);
	}

	return json.data as T;
}

// User
export function getMe(token: string) {
	return ghFetch<GitHubUser>(token, '/user');
}

export function getProfile(token: string, username: string) {
	return ghFetch<GitHubUser>(token, `/users/${username}`);
}

export function getUserRepos(token: string, username: string, page = 1, perPage = 30) {
	return ghFetch<GitHubRepo[]>(token, `/users/${username}/repos?sort=updated&per_page=${perPage}&page=${page}`);
}

export function getMyRepos(token: string, page = 1, perPage = 30) {
	return ghFetch<GitHubRepo[]>(token, `/user/repos?sort=updated&per_page=${perPage}&page=${page}&affiliation=owner,collaborator`);
}

// Repo
export function getRepo(token: string, owner: string, repo: string) {
	return ghFetch<GitHubRepo>(token, `/repos/${owner}/${repo}`);
}

export function getRepoContents(token: string, owner: string, repo: string, path = '', ref?: string) {
	const q = ref ? `?ref=${ref}` : '';
	return ghFetch<GitHubContent | GitHubContent[]>(token, `/repos/${owner}/${repo}/contents/${path}${q}`);
}

export function getRepoCommits(token: string, owner: string, repo: string, page = 1, perPage = 20) {
	return ghFetch<GitHubCommit[]>(token, `/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`);
}

export function getRepoBranches(token: string, owner: string, repo: string) {
	return ghFetch<GitHubBranch[]>(token, `/repos/${owner}/${repo}/branches`);
}

export function getRepoLanguages(token: string, owner: string, repo: string) {
	return ghFetch<Record<string, number>>(token, `/repos/${owner}/${repo}/languages`);
}

export function getRepoReadme(token: string, owner: string, repo: string) {
	return ghFetch<GitHubContent>(token, `/repos/${owner}/${repo}/readme`);
}

// Issues
export function getIssues(token: string, owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', page = 1) {
	return ghFetch<GitHubIssue[]>(token, `/repos/${owner}/${repo}/issues?state=${state}&per_page=30&page=${page}`);
}

export function getIssue(token: string, owner: string, repo: string, number: number) {
	return ghFetch<GitHubIssue>(token, `/repos/${owner}/${repo}/issues/${number}`);
}

export function createIssue(token: string, owner: string, repo: string, title: string, body: string) {
	return ghFetch<GitHubIssue>(token, `/repos/${owner}/${repo}/issues`, {
		method: 'POST',
		body: { title, body }
	});
}

export function createIssueComment(token: string, owner: string, repo: string, number: number, body: string) {
	return ghFetch<GitHubComment>(token, `/repos/${owner}/${repo}/issues/${number}/comments`, {
		method: 'POST',
		body: { body }
	});
}

export function getIssueComments(token: string, owner: string, repo: string, number: number) {
	return ghFetch<GitHubComment[]>(token, `/repos/${owner}/${repo}/issues/${number}/comments`);
}

// Pull Requests
export function getPulls(token: string, owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', page = 1) {
	return ghFetch<GitHubPull[]>(token, `/repos/${owner}/${repo}/pulls?state=${state}&per_page=30&page=${page}`);
}

export function getPull(token: string, owner: string, repo: string, number: number) {
	return ghFetch<GitHubPull>(token, `/repos/${owner}/${repo}/pulls/${number}`);
}

export function getPullComments(token: string, owner: string, repo: string, number: number) {
	return ghFetch<GitHubComment[]>(token, `/repos/${owner}/${repo}/issues/${number}/comments`);
}

export function getPullFiles(token: string, owner: string, repo: string, number: number) {
	return ghFetch<GitHubCommitFile[]>(token, `/repos/${owner}/${repo}/pulls/${number}/files`);
}

export function mergePull(token: string, owner: string, repo: string, number: number) {
	return ghFetch<{ merged: boolean; message: string }>(token, `/repos/${owner}/${repo}/pulls/${number}/merge`, {
		method: 'PUT'
	});
}

// Notifications
export function getNotifications(token: string, all = false, page = 1) {
	return ghFetch<GitHubNotification[]>(token, `/notifications?all=${all}&per_page=30&page=${page}`);
}

export function markNotificationRead(token: string, threadId: string) {
	return fetch(`${API_BASE}/notifications/threads/${threadId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json'
		}
	});
}

// Search
export function searchRepos(token: string, query: string, page = 1) {
	return ghFetch<{ total_count: number; items: GitHubRepo[] }>(token, `/search/repositories?q=${encodeURIComponent(query)}&per_page=20&page=${page}`);
}

export function searchUsers(token: string, query: string, page = 1) {
	return ghFetch<{ total_count: number; items: GitHubUser[] }>(token, `/search/users?q=${encodeURIComponent(query)}&per_page=20&page=${page}`);
}

// Trending (uses search with stars)
export function getTrending(token: string, language?: string) {
	const date = new Date();
	date.setDate(date.getDate() - 7);
	const since = date.toISOString().split('T')[0];
	const langQ = language ? `+language:${language}` : '';
	return ghFetch<{ total_count: number; items: GitHubRepo[] }>(
		token,
		`/search/repositories?q=created:>${since}${langQ}&sort=stars&order=desc&per_page=20`
	);
}

// Releases
export function getRepoReleases(token: string, owner: string, repo: string, page = 1, perPage = 20) {
	return ghFetch<GitHubRelease[]>(token, `/repos/${owner}/${repo}/releases?per_page=${perPage}&page=${page}`);
}

export function getRepoRelease(token: string, owner: string, repo: string, id: number) {
	return ghFetch<GitHubRelease>(token, `/repos/${owner}/${repo}/releases/${id}`);
}

// Tags
export function getRepoTags(token: string, owner: string, repo: string, page = 1, perPage = 30) {
	return ghFetch<GitHubTag[]>(token, `/repos/${owner}/${repo}/tags?per_page=${perPage}&page=${page}`);
}

// Contributors
export function getRepoContributors(token: string, owner: string, repo: string, page = 1, perPage = 30) {
	return ghFetch<GitHubContributor[]>(token, `/repos/${owner}/${repo}/contributors?per_page=${perPage}&page=${page}`);
}

// Check runs / CI status
export function getCheckRuns(token: string, owner: string, repo: string, ref: string) {
	return ghFetch<{ total_count: number; check_runs: GitHubCheckRun[] }>(token, `/repos/${owner}/${repo}/commits/${ref}/check-runs`);
}

export function getCommitStatus(token: string, owner: string, repo: string, ref: string) {
	return ghFetch<GitHubCombinedStatus>(token, `/repos/${owner}/${repo}/commits/${ref}/status`);
}

// Single commit with diff
export function getCommit(token: string, owner: string, repo: string, sha: string) {
	return ghFetch<GitHubCommitDetail>(token, `/repos/${owner}/${repo}/commits/${sha}`);
}

// GitHub Actions
export function getWorkflows(token: string, owner: string, repo: string) {
	return ghFetch<{ total_count: number; workflows: GitHubWorkflow[] }>(token, `/repos/${owner}/${repo}/actions/workflows`);
}

export function getWorkflowRuns(token: string, owner: string, repo: string, page = 1, perPage = 20) {
	return ghFetch<{ total_count: number; workflow_runs: GitHubWorkflowRun[] }>(token, `/repos/${owner}/${repo}/actions/runs?per_page=${perPage}&page=${page}`);
}

export function getWorkflowRunJobs(token: string, owner: string, repo: string, runId: number) {
	return ghFetch<{ total_count: number; jobs: GitHubWorkflowJob[] }>(token, `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`);
}

// Received events (activity feed for dashboard — what happened in repos you watch)
export function getReceivedEvents(token: string, username: string, page = 1) {
	return ghFetch<GitHubEvent[]>(token, `/users/${username}/received_events?per_page=30&page=${page}`);
}

// Events (for activity feed)
export function getUserEvents(token: string, username: string, page = 1) {
	return ghFetch<GitHubEvent[]>(token, `/users/${username}/events?per_page=20&page=${page}`);
}

// Pinned repos via GraphQL
export function getPinnedRepos(token: string, username: string) {
	return ghGraphQL<{ user: { pinnedItems: { nodes: PinnedRepo[] } } }>(token, `
		query($username: String!) {
			user(login: $username) {
				pinnedItems(first: 6, types: REPOSITORY) {
					nodes {
						... on Repository {
							name
							nameWithOwner
							description
							stargazerCount
							forkCount
							primaryLanguage { name color }
							isPrivate
						}
					}
				}
			}
		}
	`, { username });
}

export interface PinnedRepo {
	name: string;
	nameWithOwner: string;
	description: string | null;
	stargazerCount: number;
	forkCount: number;
	primaryLanguage: { name: string; color: string } | null;
	isPrivate: boolean;
}

// Contribution data via GraphQL
export function getContributions(token: string, username: string) {
	return ghGraphQL<{ user: { contributionsCollection: ContributionsData } }>(token, `
		query($username: String!) {
			user(login: $username) {
				contributionsCollection {
					totalCommitContributions
					totalPullRequestContributions
					contributionCalendar {
						totalContributions
						weeks {
							contributionDays {
								contributionCount
								date
								color
							}
						}
					}
				}
			}
		}
	`, { username });
}

// Dashboard feed via GraphQL
export function getDashboardFeed(token: string) {
	return ghGraphQL<DashboardData>(token, `
		query {
			viewer {
				login
				avatarUrl
				name
				bio
				followers { totalCount }
				following { totalCount }
				repositories(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }, ownerAffiliations: OWNER) {
					totalCount
					nodes {
						name
						nameWithOwner
						description
						stargazerCount
						forkCount
						primaryLanguage { name color }
						updatedAt
						isPrivate
					}
				}
				pinnedItems(first: 6, types: REPOSITORY) {
					nodes {
						... on Repository {
							name
							nameWithOwner
							description
							stargazerCount
							forkCount
							primaryLanguage { name color }
						}
					}
				}
			}
		}
	`);
}

// Types
export interface GitHubUser {
	login: string;
	id: number;
	avatar_url: string;
	html_url: string;
	name: string | null;
	bio: string | null;
	company: string | null;
	location: string | null;
	email: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
}

export interface GitHubRepo {
	id: number;
	name: string;
	full_name: string;
	owner: { login: string; avatar_url: string };
	description: string | null;
	private: boolean;
	fork: boolean;
	html_url: string;
	clone_url: string;
	ssh_url: string;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	watchers_count: number;
	open_issues_count: number;
	default_branch: string;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	topics: string[];
	license: { name: string } | null;
}

export interface GitHubContent {
	name: string;
	path: string;
	sha: string;
	size: number;
	type: 'file' | 'dir' | 'symlink' | 'submodule';
	content?: string;
	encoding?: string;
	download_url: string | null;
	html_url: string;
}

export interface GitHubCommit {
	sha: string;
	commit: {
		message: string;
		author: { name: string; email: string; date: string };
		committer: { name: string; email: string; date: string };
	};
	author: { login: string; avatar_url: string } | null;
	html_url: string;
}

export interface GitHubBranch {
	name: string;
	commit: { sha: string };
	protected: boolean;
}

export interface GitHubIssue {
	id: number;
	number: number;
	title: string;
	body: string | null;
	state: 'open' | 'closed';
	user: { login: string; avatar_url: string };
	labels: { id: number; name: string; color: string }[];
	assignees: { login: string; avatar_url: string }[];
	milestone: { title: string; number: number } | null;
	comments: number;
	created_at: string;
	updated_at: string;
	closed_at: string | null;
	pull_request?: { url: string };
}

export interface GitHubPull {
	id: number;
	number: number;
	title: string;
	body: string | null;
	state: 'open' | 'closed';
	merged: boolean;
	draft: boolean;
	user: { login: string; avatar_url: string };
	labels: { id: number; name: string; color: string }[];
	assignees: { login: string; avatar_url: string }[];
	head: { ref: string; sha: string };
	base: { ref: string; sha: string };
	additions: number;
	deletions: number;
	changed_files: number;
	comments: number;
	created_at: string;
	updated_at: string;
	merged_at: string | null;
	closed_at: string | null;
	mergeable: boolean | null;
	mergeable_state: string;
}

export interface GitHubComment {
	id: number;
	body: string;
	user: { login: string; avatar_url: string };
	created_at: string;
	updated_at: string;
}

export interface GitHubNotification {
	id: string;
	unread: boolean;
	reason: string;
	subject: {
		title: string;
		url: string | null;
		type: string;
	};
	repository: {
		full_name: string;
		owner: { login: string; avatar_url: string };
	};
	updated_at: string;
}

export interface GitHubEvent {
	id: string;
	type: string;
	actor: { login: string; avatar_url: string };
	repo: { name: string };
	payload: Record<string, unknown>;
	created_at: string;
}

export interface GitHubRelease {
	id: number;
	tag_name: string;
	name: string | null;
	body: string | null;
	draft: boolean;
	prerelease: boolean;
	created_at: string;
	published_at: string | null;
	author: { login: string; avatar_url: string };
	html_url: string;
	assets: {
		id: number;
		name: string;
		size: number;
		download_count: number;
		browser_download_url: string;
	}[];
	tarball_url: string | null;
	zipball_url: string | null;
}

export interface GitHubTag {
	name: string;
	commit: { sha: string; url: string };
	zipball_url: string;
	tarball_url: string;
}

export interface GitHubContributor {
	login: string;
	avatar_url: string;
	contributions: number;
	html_url: string;
}

export interface GitHubCheckRun {
	id: number;
	name: string;
	status: 'queued' | 'in_progress' | 'completed';
	conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
	started_at: string | null;
	completed_at: string | null;
	html_url: string;
	app: { name: string; slug: string } | null;
}

export interface GitHubCombinedStatus {
	state: 'success' | 'failure' | 'pending' | 'error';
	total_count: number;
	statuses: {
		state: string;
		context: string;
		description: string | null;
		target_url: string | null;
	}[];
}

export interface ContributionsData {
	totalCommitContributions: number;
	totalPullRequestContributions: number;
	contributionCalendar: {
		totalContributions: number;
		weeks: {
			contributionDays: {
				contributionCount: number;
				date: string;
				color: string;
			}[];
		}[];
	};
}

export interface DashboardData {
	viewer: {
		login: string;
		avatarUrl: string;
		name: string | null;
		bio: string | null;
		followers: { totalCount: number };
		following: { totalCount: number };
		repositories: {
			totalCount: number;
			nodes: {
				name: string;
				nameWithOwner: string;
				description: string | null;
				stargazerCount: number;
				forkCount: number;
				primaryLanguage: { name: string; color: string } | null;
				updatedAt: string;
				isPrivate: boolean;
			}[];
		};
		pinnedItems: {
			nodes: {
				name: string;
				nameWithOwner: string;
				description: string | null;
				stargazerCount: number;
				forkCount: number;
				primaryLanguage: { name: string; color: string } | null;
			}[];
		};
	};
}

export interface GitHubCommitDetail {
	sha: string;
	commit: {
		message: string;
		author: { name: string; email: string; date: string };
		committer: { name: string; email: string; date: string };
	};
	author: { login: string; avatar_url: string } | null;
	html_url: string;
	stats: { additions: number; deletions: number; total: number };
	files: GitHubCommitFile[];
	parents: { sha: string; html_url: string }[];
}

export interface GitHubCommitFile {
	sha: string;
	filename: string;
	status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
	additions: number;
	deletions: number;
	changes: number;
	patch?: string;
	previous_filename?: string;
}

export interface GitHubWorkflow {
	id: number;
	name: string;
	path: string;
	state: 'active' | 'disabled_manually' | 'disabled_inactivity' | 'deleted' | 'setup';
	created_at: string;
	updated_at: string;
	badge_url: string;
}

export interface GitHubWorkflowRun {
	id: number;
	name: string | null;
	display_title: string;
	head_branch: string | null;
	head_sha: string;
	status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested' | 'pending';
	conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | 'stale' | null;
	workflow_id: number;
	run_number: number;
	event: string;
	created_at: string;
	updated_at: string;
	run_started_at: string | null;
	html_url: string;
	actor: { login: string; avatar_url: string };
	run_attempt: number;
}

export interface GitHubWorkflowJob {
	id: number;
	run_id: number;
	name: string;
	status: 'queued' | 'in_progress' | 'completed' | 'waiting';
	conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
	started_at: string | null;
	completed_at: string | null;
	steps: GitHubWorkflowStep[];
}

export interface GitHubWorkflowStep {
	name: string;
	status: 'queued' | 'in_progress' | 'completed';
	conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | null;
	number: number;
	started_at: string | null;
	completed_at: string | null;
}
