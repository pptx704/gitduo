import { getCommit } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const token = locals.token;
	if (!token) return { commit: null, owner: params.username, repo: params.repo };

	try {
		const commit = await getCommit(token, params.username, params.repo, params.sha);
		return { commit, owner: params.username, repo: params.repo };
	} catch {
		return { commit: null, owner: params.username, repo: params.repo };
	}
};
