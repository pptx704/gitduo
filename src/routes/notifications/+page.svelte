<script lang="ts">
	import { PillBadge } from '$lib';
	import { CircleDot, GitPullRequest, Tag, MessageSquare, CircleCheckBig, Bell } from 'lucide-svelte';
	import type { GitHubNotification } from '$lib/api/github';

	interface Props {
		data: {
			notifications: GitHubNotification[];
		};
	}

	let { data }: Props = $props();

	let filter = $state<'all' | 'unread'>('unread');

	const unreadCount = $derived(data.notifications.filter((n) => n.unread).length);

	const filtered = $derived(
		filter === 'unread'
			? data.notifications.filter((n) => n.unread)
			: data.notifications
	);

	const typeIcons = {
		Issue: CircleDot,
		PullRequest: GitPullRequest,
		Release: Tag,
		Discussion: MessageSquare,
		CheckSuite: CircleCheckBig
	} as const;

	function reasonLabel(reason: string): string {
		const labels: Record<string, string> = {
			assign: 'Assigned',
			author: 'Author',
			comment: 'Comment',
			mention: 'Mention',
			review_requested: 'Review',
			subscribed: 'Watching',
			ci_activity: 'CI',
			manual: 'Manual'
		};
		return labels[reason] ?? reason;
	}

	function timeAgo(dateStr: string): string {
		const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	async function markRead(id: string) {
		await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
	}
</script>

<svelte:head>
	<title>Notifications — GitDuo</title>
</svelte:head>

<div class="space-y-5">
	<h1 class="text-3xl font-extrabold text-duo-text">Inbox</h1>

	<!-- Filter tabs -->
	<div class="flex gap-2">
		<button
			class="px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all"
			class:text-white={filter === 'unread'}
			class:bg-duo-gray-100={filter !== 'unread'}
			class:text-duo-gray-400={filter !== 'unread'}
			style:background={filter === 'unread' ? '#1CB0F6' : undefined}
			style:box-shadow={filter === 'unread' ? '0 3px 0 #1899D6' : undefined}
			onclick={() => filter = 'unread'}
		>
			Unread{#if unreadCount > 0}<span class="ml-1.5 text-[11px] bg-white/30 px-1.5 py-0.5 rounded-full">{unreadCount}</span>{/if}
		</button>
		<button
			class="px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all"
			class:text-white={filter === 'all'}
			class:bg-duo-gray-100={filter !== 'all'}
			class:text-duo-gray-400={filter !== 'all'}
			style:background={filter === 'all' ? '#1CB0F6' : undefined}
			style:box-shadow={filter === 'all' ? '0 3px 0 #1899D6' : undefined}
			onclick={() => filter = 'all'}
		>
			All <span class="text-[11px] opacity-70">{data.notifications.length}</span>
		</button>
	</div>

	<!-- Notification list -->
	{#if filtered.length > 0}
		<div class="space-y-2">
			{#each filtered as notif}
				{@const Icon = typeIcons[notif.subject.type as keyof typeof typeIcons] ?? Bell}
				<a
					href="/{notif.repository.full_name}"
					class="duo-card duo-card-interactive block p-4 no-underline"
					style:background={notif.unread ? 'oklch(97% 0.015 230)' : undefined}
				>
					<div class="flex items-start gap-3">
						<span class="text-duo-gray-400 mt-0.5 flex-shrink-0"><Icon size={18} strokeWidth={2.5} /></span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-0.5">
								<span class="text-xs font-bold text-duo-gray-400">{notif.repository.full_name}</span>
								<PillBadge variant="gray">{reasonLabel(notif.reason)}</PillBadge>
							</div>
							<h3 class="text-sm font-extrabold text-duo-text truncate">{notif.subject.title}</h3>
							<span class="text-xs text-duo-gray-400 font-bold mt-1">{timeAgo(notif.updated_at)}</span>
						</div>
						{#if notif.unread}
							<div class="w-2.5 h-2.5 rounded-full bg-duo-blue flex-shrink-0 mt-1.5"></div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="duo-card p-12 text-center">
			<div class="text-5xl mb-4">🎉</div>
			<h2 class="text-xl font-extrabold text-duo-text">All caught up!</h2>
			<p class="text-sm text-duo-text-light font-bold mt-1">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
		</div>
	{/if}
</div>
