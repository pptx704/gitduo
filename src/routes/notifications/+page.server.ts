import { getNotifications } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const token = locals.token;
	if (!token) return { notifications: [] };

	const notifications = await getNotifications(token, true).catch(() => []);
	return { notifications };
};
