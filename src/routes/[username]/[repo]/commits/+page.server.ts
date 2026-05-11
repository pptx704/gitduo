import { getRepoCommits, getCommitStatus } from '$lib/api/github';
import type { GitHubCombinedStatus } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const token = locals.token;
	if (!token) return { commits: [], owner: params.username, repo: params.repo, statuses: {} };

	const page = parseInt(url.searchParams.get('page') ?? '1');

	const commits = await getRepoCommits(token, params.username, params.repo, page, 30).catch(
		() => []
	);

	const statusMap: Record<string, GitHubCombinedStatus> = {};
	const statusPromises = commits.slice(0, 10).map(async (c) => {
		try {
			const status = await getCommitStatus(token, params.username, params.repo, c.sha);
			if (status.total_count > 0) {
				statusMap[c.sha] = status;
			}
		} catch {
			/* ignore */
		}
	});
	await Promise.all(statusPromises);

	return { commits, owner: params.username, repo: params.repo, page, statuses: statusMap };
};
