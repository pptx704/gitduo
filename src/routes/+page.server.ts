import { getDashboardFeed, getContributions, getReceivedEvents, getNotifications, getRateLimit } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const token = locals.token;
	if (!token) return { feed: null, contributions: null, receivedEvents: [], rateLimit: getRateLimit() };

	const { user } = await parent();
	if (!user) return { feed: null, contributions: null, receivedEvents: [], rateLimit: getRateLimit() };

	const [feed, contributions, receivedEvents] = await Promise.all([
		getDashboardFeed(token).catch(() => null),
		getContributions(token, user.login).catch(() => null),
		getReceivedEvents(token, user.login).catch(() => [])
	]);

	return { feed, contributions, receivedEvents, rateLimit: getRateLimit() };
};
