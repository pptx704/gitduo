import { redirect } from '@sveltejs/kit';
import { GITHUB_CLIENT_ID } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const redirectUri = `${url.origin}/auth/callback`;
	const params = new URLSearchParams({
		client_id: GITHUB_CLIENT_ID,
		scope: 'repo read:user notifications user:email',
		redirect_uri: redirectUri
	});

	redirect(302, `https://github.com/login/oauth/authorize?${params}`);
};
