import { getPull, getPullComments, getCheckRuns, getCommitStatus } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const token = locals.token;
	const num = parseInt(params.number);
	if (!token || isNaN(num)) return { pull: null, comments: [], checkRuns: [], commitStatus: null, owner: params.username, repo: params.repo };

	const [pull, comments] = await Promise.all([
		getPull(token, params.username, params.repo, num).catch(() => null),
		getPullComments(token, params.username, params.repo, num).catch(() => [])
	]);

	let checkRuns: Awaited<ReturnType<typeof getCheckRuns>> | null = null;
	let commitStatus: Awaited<ReturnType<typeof getCommitStatus>> | null = null;

	if (pull) {
		[checkRuns, commitStatus] = await Promise.all([
			getCheckRuns(token, params.username, params.repo, pull.head.sha).catch(() => null),
			getCommitStatus(token, params.username, params.repo, pull.head.sha).catch(() => null)
		]);
	}

	return {
		pull,
		comments,
		checkRuns: checkRuns?.check_runs ?? [],
		commitStatus,
		owner: params.username,
		repo: params.repo
	};
};
