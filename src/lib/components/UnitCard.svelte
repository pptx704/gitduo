<script lang="ts">
	import { Star, GitFork, Lock } from 'lucide-svelte';
	import { getLanguageIcon } from '$lib/lang-icons';
	import { getLanguageColor } from '$lib/lang-colors';

	interface Props {
		name: string;
		fullName: string;
		description?: string | null;
		language?: string | null;
		languageColor?: string | null;
		stars: number;
		forks: number;
		isPrivate?: boolean;
	}

	let { name, fullName, description, language, languageColor, stars, forks, isPrivate = false }: Props = $props();

	const langIcon = $derived(language ? getLanguageIcon(language) : null);
	const langColor = $derived(language ? (languageColor ?? getLanguageColor(language)) : null);
</script>

<a href="/{fullName}" class="duo-card duo-card-interactive block p-5 no-underline group">
	<div class="flex items-start justify-between gap-2 mb-2">
		<h3 class="text-base font-extrabold text-duo-text group-hover:text-duo-blue transition-colors truncate">
			{name}
		</h3>
		{#if isPrivate}
			<span class="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-duo-gray-100 text-duo-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
				<Lock size={10} strokeWidth={3} />
				Private
			</span>
		{/if}
	</div>

	{#if description}
		<p class="text-sm text-duo-text-light font-semibold line-clamp-2 mb-3">{description}</p>
	{/if}

	<div class="flex items-center gap-4 text-xs font-extrabold text-duo-gray-400">
		{#if language}
			<span class="flex items-center gap-1.5">
				{#if langIcon}
					<img src={langIcon} alt={language} class="w-4 h-4 object-contain" />
				{:else}
					<span class="w-3 h-3 rounded-full inline-block" style:background={langColor}></span>
				{/if}
				{language}
			</span>
		{/if}
		<span class="flex items-center gap-1"><Star size={13} strokeWidth={2.5} /> {stars.toLocaleString()}</span>
		<span class="flex items-center gap-1"><GitFork size={13} strokeWidth={2.5} /> {forks.toLocaleString()}</span>
	</div>
</a>
