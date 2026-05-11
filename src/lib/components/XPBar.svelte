<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		current: number;
		max: number;
		label?: string;
		color?: 'green' | 'blue' | 'orange' | 'purple' | 'gold';
		size?: 'sm' | 'md';
	}

	let { current, max, label, color = 'green', size = 'md' }: Props = $props();

	const pct = $derived(Math.min((current / max) * 100, 100));

	const colors: Record<string, { bar: string; bg: string }> = {
		green: { bar: '#58CC02', bg: '#D7FFB8' },
		blue: { bar: '#1CB0F6', bg: '#DDF4FF' },
		orange: { bar: '#FF9600', bg: '#FFECD0' },
		purple: { bar: '#CE82FF', bg: '#F0DEFF' },
		gold: { bar: '#FFC800', bg: '#FFF4CC' }
	};
</script>

<div class="w-full">
	{#if label}
		<div class="flex justify-between items-center mb-1.5">
			<span class="text-xs font-extrabold uppercase tracking-wider text-duo-gray-400">{label}</span>
			<span class="text-xs font-extrabold text-duo-gray-400">{current}/{max}</span>
		</div>
	{/if}
	<div
		class="rounded-full overflow-hidden relative"
		class:h-3={size === 'sm'}
		class:h-5={size === 'md'}
		style:background={colors[color].bg}
	>
		<div
			class="h-full rounded-full relative overflow-hidden transition-all duration-700 ease-out"
			style:width="{pct}%"
			style:background={colors[color].bar}
			style:animation="xp-fill 1s ease-out"
		>
			<div class="absolute inset-0 opacity-30" style="background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)"></div>
		</div>
	</div>
</div>
