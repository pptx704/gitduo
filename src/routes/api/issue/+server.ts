import { createIssue } from '$lib/api/github';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.token) return error(401);

	const { owner, repo, title, body } = await request.json();
	if (!owner || !repo || !title) return error(400, 'Missing required fields');

	const issue = await createIssue(locals.token, owner, repo, title, body ?? '');
	return json({ number: issue.number });
};
