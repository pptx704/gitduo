import { getPull, getPullFiles } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const token = locals.token;
	if (!token) return { files: [], owner: params.username, repo: params.repo, number: parseInt(params.number), pull: null };

	const [pull, files] = await Promise.all([
		getPull(token, params.username, params.repo, parseInt(params.number)).catch(() => null),
		getPullFiles(token, params.username, params.repo, parseInt(params.number)).catch(() => [])
	]);

	return { files, owner: params.username, repo: params.repo, number: parseInt(params.number), pull };
};
