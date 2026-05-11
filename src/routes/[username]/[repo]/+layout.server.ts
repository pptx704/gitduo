import { getRepo } from '$lib/api/github';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const token = locals.token;
	if (!token) return { repo: null, owner: params.username, repoName: params.repo };

	const repo = await getRepo(token, params.username, params.repo).catch(() => null);

	return {
		repo,
		owner: params.username,
		repoName: params.repo
	};
};
