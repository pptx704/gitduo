import { getIssues } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const token = locals.token;
	if (!token) return { issues: [], owner: params.username, repo: params.repo, state: 'open' as const };

	const state = (url.searchParams.get('state') as 'open' | 'closed') ?? 'open';
	const page = parseInt(url.searchParams.get('page') ?? '1');

	const issues = await getIssues(token, params.username, params.repo, state, page).catch(() => []);
	const filtered = issues.filter((i) => !i.pull_request);

	return { issues: filtered, owner: params.username, repo: params.repo, state, page, hasMore: issues.length >= 30 };
};
