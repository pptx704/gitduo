import { json } from '@sveltejs/kit';
import { mergePull } from '$lib/api/github';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const token = locals.token;
	if (!token) return json({ error: 'Unauthorized' }, { status: 401 });

	const { owner, repo, number } = await request.json();

	if (!owner || !repo || !number) {
		return json({ error: 'Missing fields' }, { status: 400 });
	}

	try {
		const result = await mergePull(token, owner, repo, number);
		return json(result);
	} catch (e) {
		return json({ error: 'Merge failed', merged: false }, { status: 500 });
	}
};
