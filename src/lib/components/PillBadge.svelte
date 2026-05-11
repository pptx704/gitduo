<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'open' | 'closed' | 'merged' | 'draft' | 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray';
		children: Snippet;
	}

	let { variant = 'gray', children }: Props = $props();

	const styles: Record<string, string> = {
		open: 'bg-duo-green-lightest text-duo-green-darker',
		closed: 'bg-[#F0DEFF] text-duo-purple-dark',
		merged: 'bg-[#F0DEFF] text-duo-purple-dark',
		draft: 'bg-duo-gray-100 text-duo-gray-400',
		green: 'bg-duo-green-lightest text-duo-green-darker',
		blue: 'bg-duo-blue-light text-duo-blue-dark',
		orange: 'bg-[#FFECD0] text-duo-orange-dark',
		red: 'bg-[#FFE0E0] text-duo-red-dark',
		purple: 'bg-[#F0DEFF] text-duo-purple-dark',
		gray: 'bg-duo-gray-100 text-duo-gray-400'
	};
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider {styles[variant]}">
	{@render children()}
</span>
