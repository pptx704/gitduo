<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';
	import type { GitHubContent } from '$lib/api/github';
	import { formatSize } from '$lib/utils';

	interface Props {
		data: {
			file: GitHubContent | null;
			content: string | null;
			owner: string;
			repo: string;
			filePath: string;
		};
	}

	let { data }: Props = $props();

	const pathParts = $derived(data.filePath.split('/'));
	const fileName = $derived(pathParts[pathParts.length - 1]);
	const ext = $derived(fileName.split('.').pop()?.toLowerCase() ?? '');
	const lines = $derived(data.content?.split('\n') ?? []);

	const imageExts = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif']);
	const binaryExts = new Set(['pdf', 'zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar',
		'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'db', 'sqlite',
		'woff', 'woff2', 'ttf', 'otf', 'eot',
		'mp3', 'mp4', 'wav', 'ogg', 'webm', 'avi', 'mkv', 'mov',
		'psd', 'ai', 'sketch', 'fig']);

	const isImage = $derived(imageExts.has(ext));
	const isBinary = $derived(binaryExts.has(ext));
	let highlightedHtml = $state('');
	let loading = $state(true);
	let copied = $state(false);

	const langMap: Record<string, string> = {
		ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
		mjs: 'javascript', cjs: 'javascript', mts: 'typescript',
		py: 'python', pyw: 'python', pyi: 'python',
		rs: 'rust', go: 'go', rb: 'ruby', rake: 'ruby',
		java: 'java', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
		cs: 'csharp', fs: 'fsharp', fsx: 'fsharp',
		php: 'php', swift: 'swift', kt: 'kotlin', kts: 'kotlin',
		dart: 'dart', lua: 'lua', r: 'r',
		sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'bash',
		ps1: 'powershell', psm1: 'powershell',
		html: 'html', htm: 'html', xhtml: 'html',
		css: 'css', scss: 'scss', sass: 'sass', less: 'less', styl: 'stylus',
		json: 'json', jsonc: 'jsonc', json5: 'json5',
		yaml: 'yaml', yml: 'yaml', toml: 'toml', ini: 'ini',
		xml: 'xml', xsl: 'xml', xslt: 'xml', plist: 'xml',
		sql: 'sql', graphql: 'graphql', gql: 'graphql',
		md: 'markdown', mdx: 'mdx', rst: 'rst',
		svelte: 'svelte', vue: 'vue', astro: 'astro',
		ex: 'elixir', exs: 'elixir', erl: 'erlang', hrl: 'erlang',
		hs: 'haskell', ml: 'ocaml', mli: 'ocaml',
		clj: 'clojure', cljs: 'clojure', cljc: 'clojure',
		scala: 'scala', groovy: 'groovy', gradle: 'groovy',
		pl: 'perl', pm: 'perl', jl: 'julia',
		zig: 'zig', nim: 'nim', v: 'v', odin: 'odin',
		tf: 'hcl', hcl: 'hcl', nix: 'nix',
		dockerfile: 'dockerfile', makefile: 'makefile',
		cmake: 'cmake', bat: 'bat', cmd: 'bat',
		asm: 'asm', s: 'asm', wasm: 'wasm',
		proto: 'protobuf', thrift: 'thrift',
		tex: 'latex', bib: 'bibtex',
		vim: 'viml', el: 'lisp', lisp: 'lisp',
		coffee: 'coffeescript', cr: 'crystal', d: 'd',
		ada: 'ada', adb: 'ada', pas: 'pascal',
		sol: 'solidity', vy: 'vyper',
		prisma: 'prisma', hbs: 'handlebars',
		pug: 'pug', ejs: 'ejs', haml: 'haml',
		diff: 'diff', patch: 'diff',
		csv: 'csv', tsv: 'csv',
		env: 'shellscript', gitignore: 'gitignore',
		lock: 'json', snap: 'json'
	};

	function getSpecialFileName(name: string): string | null {
		const lower = name.toLowerCase();
		if (lower === 'dockerfile') return 'dockerfile';
		if (lower === 'makefile' || lower === 'gnumakefile') return 'makefile';
		if (lower === 'cmakelists.txt') return 'cmake';
		if (lower === 'jenkinsfile') return 'groovy';
		if (lower === 'vagrantfile') return 'ruby';
		if (lower === 'gemfile') return 'ruby';
		if (lower === 'rakefile') return 'ruby';
		if (lower === 'procfile') return 'shellscript';
		if (lower.startsWith('.env')) return 'shellscript';
		if (lower === '.gitignore' || lower === '.dockerignore') return 'gitignore';
		return null;
	}

	$effect(() => {
		const content = data.content;
		const curFile = data.filePath;
		const curIsImage = isImage;
		const curIsBinary = isBinary;

		highlightedHtml = '';
		loading = true;

		if (content && !curIsImage && !curIsBinary) {
			const curExt = curFile.split('/').pop()?.split('.').pop()?.toLowerCase() ?? '';
			const curFileName = curFile.split('/').pop() ?? '';

			import('shiki').then(({ codeToHtml, bundledLanguagesInfo }) => {
				const specialLang = getSpecialFileName(curFileName);
				let lang: string | null = specialLang ?? langMap[curExt] ?? null;

				if (lang) {
					const availableLangs = bundledLanguagesInfo.map((l) => [l.id, ...(l.aliases ?? [])]).flat();
					if (!availableLangs.includes(lang)) {
						lang = null;
					}
				}

				codeToHtml(content, {
					lang: lang ?? 'text',
					theme: 'github-light'
				}).then((html) => {
					if (data.filePath === curFile) {
						highlightedHtml = html;
					}
				}).catch(() => {
					highlightedHtml = '';
				}).finally(() => {
					if (data.filePath === curFile) {
						loading = false;
					}
				});
			}).catch(() => {
				highlightedHtml = '';
				loading = false;
			});
		} else {
			loading = false;
		}
	});

	async function copyContent() {
		if (data.content) {
			await navigator.clipboard.writeText(data.content);
			copied = true;
			setTimeout(() => copied = false, 2000);
		}
	}
</script>

<svelte:head>
	<title>{data.filePath} — {data.owner}/{data.repo} — GitDuo</title>
</svelte:head>

<div class="space-y-4">
	<!-- Breadcrumb -->
	<div class="flex items-center gap-1.5 text-sm font-bold flex-wrap">
		<a href="/{data.owner}/{data.repo}" class="text-duo-blue hover:underline no-underline">{data.owner}/{data.repo}</a>
		{#each pathParts as part, i}
			<span class="text-duo-gray-300">/</span>
			{#if i === pathParts.length - 1}
				<span class="text-duo-text font-extrabold">{part}</span>
			{:else}
				<a
					href="/{data.owner}/{data.repo}/tree/{pathParts.slice(0, i + 1).join('/')}"
					class="text-duo-blue hover:underline no-underline"
				>{part}</a>
			{/if}
		{/each}
	</div>

	<!-- File content -->
	<div class="duo-card overflow-hidden">
		<div class="flex items-center justify-between px-4 py-3 border-b-2 border-duo-gray-100 bg-duo-snow">
			<div class="flex items-center gap-2">
				<span class="text-sm font-extrabold text-duo-text">{fileName}</span>
				{#if data.file}
					<span class="text-xs font-bold text-duo-gray-400">{formatSize(data.file.size)}</span>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				{#if !isImage && !isBinary}
					<span class="text-xs font-bold text-duo-gray-400">{lines.length} lines</span>
					<button class="text-duo-gray-400 hover:text-duo-green transition-colors" onclick={copyContent} aria-label="Copy file contents">
						{#if copied}
							<Check size={14} strokeWidth={2.5} class="text-duo-green" />
						{:else}
							<Copy size={14} strokeWidth={2.5} />
						{/if}
					</button>
				{/if}
				{#if data.file?.download_url}
					<a
						href={data.file.download_url}
						class="text-xs font-bold text-duo-blue no-underline hover:underline"
						target="_blank"
						rel="noopener"
					>
						Raw
					</a>
				{/if}
			</div>
		</div>

		{#if isImage && data.file?.download_url}
			<div class="p-8 flex items-center justify-center bg-[repeating-conic-gradient(#f7f7f7_0%_25%,#fff_0%_50%)_0_0/20px_20px]">
				<img
					src={data.file.download_url}
					alt={fileName}
					class="max-w-full max-h-[600px] object-contain"
				/>
			</div>
		{:else if isBinary}
			<div class="p-12 text-center">
				<div class="text-4xl mb-3">📦</div>
				<p class="text-sm font-bold text-duo-gray-400">Binary file — not displayed</p>
				{#if data.file?.download_url}
					<a
						href={data.file.download_url}
						class="inline-block mt-3 duo-btn duo-btn-blue text-sm px-5 py-2 no-underline"
						target="_blank"
						rel="noopener"
					>
						Download
					</a>
				{/if}
			</div>
		{:else if loading}
			<div class="p-8 text-center text-duo-gray-400 font-bold">Loading...</div>
		{:else if highlightedHtml}
			<div class="code-container">
				{@html highlightedHtml}
			</div>
		{:else if data.content}
			<div class="code-container">
				<table class="code-table">
					<tbody>
						{#each lines as line, i}
							<tr class="hover:bg-duo-snow/50">
								<td class="line-num">{i + 1}</td>
								<td class="line-code"><pre>{line}</pre></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="p-12 text-center">
				<div class="text-4xl mb-3">🤷</div>
				<p class="text-sm font-bold text-duo-gray-400">Unable to display this file</p>
				{#if data.file?.download_url}
					<a
						href={data.file.download_url}
						class="inline-block mt-3 text-sm font-bold text-duo-blue no-underline hover:underline"
						target="_blank"
						rel="noopener"
					>
						Download raw file
					</a>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.code-container {
		overflow-x: auto;
		font-size: 13px;
		line-height: 1.6;
	}

	.code-container :global(pre) {
		margin: 0;
		padding: 16px;
		background: white !important;
	}

	.code-container :global(code) {
		font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro', ui-monospace, monospace;
		font-size: 13px;
	}

	.code-table {
		width: 100%;
		border-collapse: collapse;
	}

	.line-num {
		padding: 0 16px 0 20px;
		text-align: right;
		color: #AFAFAF;
		font-size: 12px;
		user-select: none;
		white-space: nowrap;
		border-right: 1px solid #E5E5E5;
		vertical-align: top;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
	}

	.line-code {
		padding: 0 16px;
		white-space: pre;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
	}

	.line-code pre {
		margin: 0;
		background: none;
		padding: 0;
	}
</style>
