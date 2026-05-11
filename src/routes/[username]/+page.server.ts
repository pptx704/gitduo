import { getProfile, getUserRepos, getMyRepos, getContributions, getPinnedRepos, getMe } from '$lib/api/github';
import type { GitHubRepo, PinnedRepo } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const token = locals.token;
	if (!token) return { profile: null, repos: [], contributions: null, languages: {}, pinnedRepos: [], isOwnProfile: false };

	const [profile, me, contributions, pinnedResult] = await Promise.all([
		getProfile(token, params.username),
		getMe(token).catch(() => null),
		getContributions(token, params.username).catch(() => null),
		getPinnedRepos(token, params.username).catch(() => null)
	]);

	const isOwnProfile = me?.login === params.username;

	const allRepos: GitHubRepo[] = [];
	let page = 1;
	const perPage = 100;
	while (true) {
		const fetchFn = isOwnProfile ? getMyRepos : getUserRepos;
		const args: [string, number, number] = isOwnProfile
			? [token, page, perPage]
			: [token, page, perPage];
		const batch = isOwnProfile
			? await getMyRepos(token, page, perPage).catch(() => [])
			: await getUserRepos(token, params.username, page, perPage).catch(() => []);
		allRepos.push(...batch);
		if (batch.length < perPage) break;
		page++;
		if (page > 5) break;
	}

	// For own profile, filter to owned repos only (getMyRepos includes collaborator repos)
	const ownedRepos = isOwnProfile
		? allRepos.filter((r) => r.owner.login === params.username)
		: allRepos;

	const langCounts: Record<string, number> = {};
	for (const repo of ownedRepos) {
		if (repo.language) {
			langCounts[repo.language] = (langCounts[repo.language] ?? 0) + 1;
		}
	}

	const pinnedRepos = pinnedResult?.user?.pinnedItems?.nodes ?? [];

	return { profile, repos: ownedRepos, contributions, languages: langCounts, pinnedRepos, isOwnProfile };
};
