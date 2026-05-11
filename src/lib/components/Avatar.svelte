<script lang="ts">
	interface Props {
		src?: string | null;
		username?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}

	let { src, username = '', size = 'md' }: Props = $props();

	const initials = $derived(username.slice(0, 2).toUpperCase());

	const sizes: Record<string, string> = {
		sm: 'w-8 h-8 text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-16 h-16 text-xl',
		xl: 'w-24 h-24 text-3xl'
	};
</script>

{#if src}
	<img
		{src}
		alt={username}
		class="rounded-full object-cover border-2 border-duo-green {sizes[size]}"
	/>
{:else}
	<div class="rounded-full bg-duo-green-lightest text-duo-green-dark font-extrabold flex items-center justify-center border-2 border-duo-green {sizes[size]}">
		{initials || '👤'}
	</div>
{/if}
