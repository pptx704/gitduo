import { getWorkflowRuns, getWorkflows, getWorkflowRunJobs } from '$lib/api/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const token = locals.token;
	if (!token) return { runs: [], workflows: [], jobs: {}, owner: params.username, repo: params.repo, page: 1, totalCount: 0 };

	const page = parseInt(url.searchParams.get('page') ?? '1');

	const [runsData, workflowsData] = await Promise.all([
		getWorkflowRuns(token, params.username, params.repo, page, 20).catch(() => ({ total_count: 0, workflow_runs: [] })),
		getWorkflows(token, params.username, params.repo).catch(() => ({ total_count: 0, workflows: [] }))
	]);

	const jobsMap: Record<number, Awaited<ReturnType<typeof getWorkflowRunJobs>>> = {};
	const jobPromises = runsData.workflow_runs.slice(0, 5).map(async (run) => {
		try {
			const jobs = await getWorkflowRunJobs(token, params.username, params.repo, run.id);
			jobsMap[run.id] = jobs;
		} catch { /* ignore */ }
	});
	await Promise.all(jobPromises);

	return {
		runs: runsData.workflow_runs,
		workflows: workflowsData.workflows,
		jobs: jobsMap,
		owner: params.username,
		repo: params.repo,
		page,
		totalCount: runsData.total_count
	};
};
