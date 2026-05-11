<script lang="ts">
	interface Props {
		remaining: number;
		limit: number;
	}

	let { remaining, limit }: Props = $props();

	const pct = $derived(Math.round((remaining / limit) * 100));
	const barColor = $derived(pct > 50 ? '#58CC02' : pct > 20 ? '#FF9600' : '#FF4B4B');
</script>

<div class="px-4 py-3">
	<div class="flex justify-between items-center mb-1">
		<span class="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray-400">API</span>
		<span class="text-[11px] font-extrabold text-duo-gray-400">{remaining.toLocaleString()}/{limit.toLocaleString()}</span>
	</div>
	<div class="h-1.5 rounded-full bg-duo-gray-100 overflow-hidden">
		<div
			class="h-full rounded-full transition-all duration-500"
			style:width="{pct}%"
			style:background={barColor}
		></div>
	</div>
</div>
