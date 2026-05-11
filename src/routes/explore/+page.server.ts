import { getTrending, searchRepos } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const token = locals.token;
	if (!token) return { repos: [], query: '' };

	const query = url.searchParams.get('q') ?? '';

	if (query) {
		const result = await searchRepos(token, query).catch(() => ({ items: [], total_count: 0 }));
		return { repos: result.items, query, totalCount: result.total_count };
	}

	const trending = await getTrending(token).catch(() => ({ items: [], total_count: 0 }));
	return { repos: trending.items, query: '', totalCount: trending.total_count };
};
