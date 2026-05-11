import { getMe, getNotifications, getRateLimit, getContributions } from '$lib/api/github';
import { computeStreak } from '$lib/utils';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('app:ratelimit');

	if (!locals.token) {
		return { user: null, notifications: [], rateLimit: { limit: 5000, remaining: 5000, reset: 0 }, streak: 0 };
	}

	try {
		const user = await getMe(locals.token);
		const [notifications, contributions] = await Promise.all([
			getNotifications(locals.token).catch(() => []),
			getContributions(locals.token, user.login).catch(() => null)
		]);

		const streak = computeStreak(contributions?.user?.contributionsCollection?.contributionCalendar);

		return {
			user,
			notifications,
			rateLimit: getRateLimit(),
			streak
		};
	} catch {
		return { user: null, notifications: [], rateLimit: { limit: 5000, remaining: 5000, reset: 0 }, streak: 0 };
	}
};
