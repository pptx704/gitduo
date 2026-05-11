<script lang="ts">
	import { MessageCircle } from 'lucide-svelte';

	interface Props {
		number: number;
		title: string;
		state: 'open' | 'closed' | 'merged';
		draft?: boolean;
		author: string;
		authorAvatar: string;
		createdAt: string;
		commentCount: number;
		labels?: { name: string; color: string }[];
		href: string;
		type?: 'issue' | 'pr';
	}

	let { number, title, state, draft = false, author, authorAvatar, createdAt, commentCount, labels = [], href, type = 'issue' }: Props = $props();

	const stateLabels: Record<string, string> = {
		open: 'Open',
		closed: 'Closed',
		merged: 'Merged'
	};

	const stateColors: Record<string, { bg: string; text: string }> = {
		open: { bg: '#D7FFB8', text: '#3B8700' },
		closed: { bg: '#F0DEFF', text: '#A568CC' },
		merged: { bg: '#F0DEFF', text: '#A568CC' }
	};

	const stateEmoji: Record<string, string> = {
		open: '🟢',
		closed: '🟣',
		merged: '🟣'
	};

	const stateBg: Record<string, string> = {
		open: 'oklch(98% 0.02 145)',
		closed: 'oklch(97% 0.02 310)',
		merged: 'oklch(97% 0.02 310)'
	};

	function timeAgo(dateStr: string): string {
		const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<a
	{href}
	class="duo-card duo-card-interactive block p-4 no-underline overflow-hidden"
	style:background={stateBg[state]}
>
	<div class="flex items-start gap-3">
		<span class="text-base flex-shrink-0 mt-0.5">{stateEmoji[state]}</span>
		<img src={authorAvatar} alt={author} class="w-8 h-8 rounded-full flex-shrink-0 mt-0.5" />
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 flex-wrap mb-1">
				<span class="text-xs font-bold text-duo-gray-400">#{number}</span>
				<span
					class="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
					style:background={stateColors[state].bg}
					style:color={stateColors[state].text}
				>
					{draft ? 'Draft' : stateLabels[state]}
				</span>
			</div>
			<h3 class="text-sm font-extrabold text-duo-text truncate">{title}</h3>
			<div class="flex items-center gap-3 mt-2 flex-wrap">
				{#each labels as label}
					<span
						class="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
						style:background="#{label.color}22"
						style:color="#{label.color}"
					>{label.name}</span>
				{/each}
				<span class="text-xs text-duo-gray-400 font-semibold">{timeAgo(createdAt)}</span>
				{#if commentCount > 0}
					<span class="text-xs text-duo-gray-400 font-semibold flex items-center gap-1"><MessageCircle size={12} strokeWidth={2.5} /> {commentCount}</span>
				{/if}
			</div>
		</div>
	</div>
</a>
