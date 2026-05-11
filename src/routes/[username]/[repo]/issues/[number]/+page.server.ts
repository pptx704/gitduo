import { getIssue, getIssueComments } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const token = locals.token;
	const num = parseInt(params.number);
	if (!token || isNaN(num)) return { issue: null, comments: [], owner: params.username, repo: params.repo };

	const [issue, comments] = await Promise.all([
		getIssue(token, params.username, params.repo, num).catch(() => null),
		getIssueComments(token, params.username, params.repo, num).catch(() => [])
	]);

	return { issue, comments, owner: params.username, repo: params.repo };
};
