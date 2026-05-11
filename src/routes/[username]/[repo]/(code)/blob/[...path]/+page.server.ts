import { getRepoContents } from '$lib/api/github';
import { decodeBase64Utf8 } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const token = locals.token;
	if (!token) return { file: null, content: null, owner: params.username, repo: params.repo, filePath: params.path };

	const ref = url.searchParams.get('ref') ?? undefined;

	try {
		const file = await getRepoContents(token, params.username, params.repo, params.path, ref);

		let content: string | null = null;

		if (!Array.isArray(file) && file.content) {
			try {
				content = decodeBase64Utf8(file.content);
			} catch {
				content = null;
			}
		}

		return {
			file: Array.isArray(file) ? null : file,
			content,
			owner: params.username,
			repo: params.repo,
			filePath: params.path
		};
	} catch {
		return { file: null, content: null, owner: params.username, repo: params.repo, filePath: params.path };
	}
};
