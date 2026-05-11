import { json } from '@sveltejs/kit';
import { createIssueComment } from '$lib/api/github';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const token = locals.token;
	if (!token) return json({ error: 'Unauthorized' }, { status: 401 });

	const { owner, repo, number, body } = await request.json();

	if (!owner || !repo || !number || !body) {
		return json({ error: 'Missing fields' }, { status: 400 });
	}

	try {
		const comment = await createIssueComment(token, owner, repo, number, body);
		return json(comment);
	} catch (e) {
		return json({ error: 'Failed to create comment' }, { status: 500 });
	}
};
