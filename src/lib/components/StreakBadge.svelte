<script lang="ts">
	interface Props {
		count: number;
		size?: 'sm' | 'md' | 'lg';
	}

	let { count, size = 'md' }: Props = $props();
</script>

<div
	class="inline-flex items-center gap-1.5 font-extrabold"
	class:text-sm={size === 'sm'}
	class:text-lg={size === 'md'}
	class:text-2xl={size === 'lg'}
>
	<span class="animate-flame inline-block" class:text-base={size === 'sm'} class:text-xl={size === 'md'} class:text-3xl={size === 'lg'}>🔥</span>
	<span class="text-duo-orange">{count}</span>
</div>
