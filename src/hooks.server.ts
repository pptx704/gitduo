import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('github_token') ?? null;
	event.locals.token = token;

	if (!token && !event.url.pathname.startsWith('/login') && !event.url.pathname.startsWith('/auth')) {
		return new Response(null, {
			status: 302,
			headers: { location: '/login' }
		});
	}

	return resolve(event);
};
