<script lang="ts">
	interface FileEntry {
		name: string;
		path: string;
		type: 'file' | 'dir';
		size?: number;
	}

	interface Props {
		items: FileEntry[];
		basePath: string;
		ref?: string;
		activeFile?: string;
	}

	let { items, basePath, ref, activeFile }: Props = $props();

	const sorted = $derived([
		...items.filter((i) => i.type === 'dir').sort((a, b) => a.name.localeCompare(b.name)),
		...items.filter((i) => i.type === 'file').sort((a, b) => a.name.localeCompare(b.name))
	]);

	function fileIcon(name: string): string {
		const lower = name.toLowerCase();
		if (lower === 'dockerfile') return '🐳';
		if (lower === 'makefile' || lower === 'cmakelists.txt') return '🔧';
		if (lower === 'license' || lower === 'license.md') return '⚖️';
		if (lower.startsWith('.env')) return '🔐';
		if (lower === '.gitignore' || lower === '.dockerignore') return '🙈';
		if (lower === 'readme.md' || lower === 'readme') return '📖';
		if (lower === 'package.json' || lower === 'cargo.toml' || lower === 'go.mod' || lower === 'gemfile' || lower === 'requirements.txt' || lower === 'pyproject.toml') return '📦';

		const ext = name.split('.').pop()?.toLowerCase() ?? '';
		const icons: Record<string, string> = {
			ts: '🔷', tsx: '🔷', mts: '🔷',
			js: '🟨', jsx: '🟨', mjs: '🟨', cjs: '🟨',
			py: '🐍', pyi: '🐍',
			rs: '🦀', go: '🐹', rb: '💎',
			java: '☕', kt: '🟣', scala: '🔴', groovy: '🐸',
			cs: '🟢', fs: '🔵',
			swift: '🍎', dart: '🎯',
			c: '⚙️', cpp: '⚙️', cc: '⚙️', h: '⚙️', hpp: '⚙️',
			ex: '💧', exs: '💧', erl: '📡',
			hs: '🟪', ml: '🐫', clj: '🟢',
			lua: '🌙', r: '📊', jl: '🟣',
			zig: '⚡', nim: '👑', v: '🔷', odin: '🔵',
			php: '🐘', pl: '🐪',
			sol: '💎', vy: '🐍',
			md: '📝', mdx: '📝', rst: '📝', txt: '📄',
			json: '📋', jsonc: '📋', json5: '📋',
			yml: '⚙️', yaml: '⚙️', toml: '⚙️', ini: '⚙️', cfg: '⚙️',
			xml: '📰', xsl: '📰',
			css: '🎨', scss: '🎨', sass: '🎨', less: '🎨', styl: '🎨',
			html: '🌐', htm: '🌐',
			svelte: '🔶', vue: '💚', astro: '🚀',
			svg: '🖼️', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', webp: '🖼️', ico: '🖼️',
			pdf: '📕',
			lock: '🔒',
			sh: '🐚', bash: '🐚', zsh: '🐚',
			sql: '🗃️', graphql: '🔗', gql: '🔗',
			tf: '🏗️', hcl: '🏗️', nix: '❄️',
			env: '🔐',
			test: '🧪', spec: '🧪',
			woff: '🔤', woff2: '🔤', ttf: '🔤', otf: '🔤',
			mp3: '🎵', wav: '🎵', ogg: '🎵',
			mp4: '🎬', webm: '🎬', mov: '🎬',
			zip: '🗜️', tar: '🗜️', gz: '🗜️', rar: '🗜️',
			diff: '🔀', patch: '🔀'
		};
		return icons[ext] ?? '📄';
	}

	function formatSize(bytes: number | undefined): string {
		if (!bytes) return '';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function buildHref(item: FileEntry): string {
		const prefix = item.type === 'dir' ? 'tree' : 'blob';
		const base = `${basePath}/${prefix}/${item.path}`;
		if (ref) return `${base}?ref=${ref}`;
		return base;
	}
</script>

<div class="divide-y divide-duo-gray-100">
	{#each sorted as item}
		{@const isActive = activeFile === item.path}
		<a
			href={buildHref(item)}
			class="flex items-center gap-3 px-4 py-2.5 hover:bg-duo-snow transition-colors no-underline group"
			class:active-file={isActive}
		>
			<span class="text-sm flex-shrink-0">
				{item.type === 'dir' ? '📁' : fileIcon(item.name)}
			</span>
			<span class="text-sm font-bold truncate transition-colors flex-1"
				class:text-duo-green={isActive}
				class:font-extrabold={isActive}
				class:text-duo-text={!isActive}
				class:group-hover:text-duo-blue={!isActive}
			>
				{item.name}
			</span>
			{#if item.type === 'file' && item.size}
				<span class="text-[11px] font-bold text-duo-gray-300 flex-shrink-0">{formatSize(item.size)}</span>
			{/if}
		</a>
	{/each}
</div>

<style>
	.active-file {
		background: oklch(97% 0.02 145);
		border-left: 3px solid #58CC02;
		padding-left: 13px;
	}
</style>
