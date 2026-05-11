import { getRepoContents } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const token = locals.token;
	if (!token) return { contents: [], owner: params.username, repo: params.repo, dirPath: params.path };

	const ref = url.searchParams.get('ref') ?? undefined;

	try {
		const contents = await getRepoContents(token, params.username, params.repo, params.path, ref);
		return {
			contents: Array.isArray(contents) ? contents : [],
			owner: params.username,
			repo: params.repo,
			dirPath: params.path
		};
	} catch {
		return { contents: [], owner: params.username, repo: params.repo, dirPath: params.path };
	}
};
