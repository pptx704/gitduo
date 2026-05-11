import { getRepoReleases } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const token = locals.token;
	if (!token) return { releases: [], owner: params.username, repo: params.repo };

	const releases = await getRepoReleases(token, params.username, params.repo).catch(() => []);

	return { releases, owner: params.username, repo: params.repo };
};
