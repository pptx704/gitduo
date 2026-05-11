import { getRepoContents } from '$lib/api/github';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.token) return error(401);

	const owner = url.searchParams.get('owner');
	const repo = url.searchParams.get('repo');
	const path = url.searchParams.get('path');
	const ref = url.searchParams.get('ref') ?? undefined;

	if (!owner || !repo || !path) return error(400);

	const contents = await getRepoContents(locals.token, owner, repo, path, ref).catch(() => []);

	return json({ entries: Array.isArray(contents) ? contents : [contents] });
};
