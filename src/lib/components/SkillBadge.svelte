<script lang="ts">
	import { getLanguageIcon } from '$lib/lang-icons';
	import { getLanguageColor } from '$lib/lang-colors';

	interface Props {
		language: string;
		percentage: number;
		color?: string;
	}

	let { language, percentage, color }: Props = $props();

	const iconUrl = $derived(getLanguageIcon(language));
	const barColor = $derived(color ?? getLanguageColor(language));
</script>

<div class="duo-card p-3 flex items-center gap-3 min-w-0">
	<div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
		{#if iconUrl}
			<img src={iconUrl} alt={language} class="w-7 h-7 object-contain" />
		{:else}
			<span class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold" style:background={barColor}>
				{language.slice(0, 2)}
			</span>
		{/if}
	</div>
	<div class="flex-1 min-w-0">
		<div class="text-sm font-extrabold truncate">{language}</div>
		<div class="h-2 rounded-full bg-duo-gray-100 mt-1 overflow-hidden">
			<div
				class="h-full rounded-full transition-all duration-700 ease-out"
				style:width="{percentage}%"
				style:background={barColor}
				style:animation="xp-fill 1s ease-out"
			></div>
		</div>
	</div>
	<div class="text-xs font-extrabold text-duo-gray-400 flex-shrink-0">{Math.round(percentage)}%</div>
</div>
