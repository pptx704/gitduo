import { getRepoContents, getRepoBranches } from '$lib/api/github';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params, url, depends }) => {
	depends('repo:tree');
	const token = locals.token;
	if (!token) return { rootContents: [], branches: [], currentRef: null };

	const ref = url.searchParams.get('ref') ?? undefined;

	const [rootContents, branches] = await Promise.all([
		getRepoContents(token, params.username, params.repo, '', ref).catch(() => []),
		getRepoBranches(token, params.username, params.repo).catch(() => [])
	]);

	return {
		rootContents: Array.isArray(rootContents) ? rootContents : [rootContents],
		branches,
		currentRef: ref ?? null
	};
};
