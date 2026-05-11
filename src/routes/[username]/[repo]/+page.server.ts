import {
	getRepoContents,
	getRepoBranches,
	getRepoReadme,
	getRepoLanguages,
	getRepoCommits,
	getRepoReleases,
	getRepoContributors
} from '$lib/api/github';
import { decodeBase64Utf8 } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const token = locals.token;
	if (!token)
		return {
			contents: [],
			branches: [],
			readmeContent: null,
			languages: {},
			lastCommit: null,
			releaseCount: 0,
			contributors: [],
			currentRef: null
		};

	const ref = url.searchParams.get('ref') ?? undefined;

	const [contents, branches, readme, languages, commits, releases, contributors] =
		await Promise.all([
			getRepoContents(token, params.username, params.repo, '', ref).catch(() => []),
			getRepoBranches(token, params.username, params.repo).catch(() => []),
			getRepoReadme(token, params.username, params.repo).catch(() => null),
			getRepoLanguages(token, params.username, params.repo).catch(() => ({})),
			getRepoCommits(token, params.username, params.repo, 1, 1).catch(() => []),
			getRepoReleases(token, params.username, params.repo, 1, 1).catch(() => []),
			getRepoContributors(token, params.username, params.repo, 1, 10).catch(() => [])
		]);

	let readmeContent: string | null = null;
	if (readme && readme.content) {
		readmeContent = decodeBase64Utf8(readme.content);
	}

	return {
		contents: Array.isArray(contents) ? contents : [contents],
		branches,
		readmeContent,
		languages,
		lastCommit: commits[0] ?? null,
		releaseCount: releases.length,
		contributors,
		currentRef: ref ?? null
	};
};
