import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return { owner: params.username, repo: params.repo };
};
