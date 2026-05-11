import { getPulls } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const token = locals.token;
	if (!token) return { pulls: [], owner: params.username, repo: params.repo, state: 'open' as const };

	const state = (url.searchParams.get('state') as 'open' | 'closed') ?? 'open';
	const page = parseInt(url.searchParams.get('page') ?? '1');

	const pulls = await getPulls(token, params.username, params.repo, state, page).catch(() => []);

	return { pulls, owner: params.username, repo: params.repo, state, page, hasMore: pulls.length >= 30 };
};
