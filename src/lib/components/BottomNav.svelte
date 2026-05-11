<script lang="ts">
	import { page } from '$app/state';
	import { House, Compass, Bell, User } from 'lucide-svelte';

	interface Props {
		username: string;
		unreadCount?: number;
	}

	let { username, unreadCount = 0 }: Props = $props();

	const navItems = [
		{ href: '/', icon: House, label: 'Home', badge: false },
		{ href: '/explore', icon: Compass, label: 'Explore', badge: false },
		{ href: '/notifications', icon: Bell, label: 'Inbox', badge: true },
		{ href: `/${username}`, icon: User, label: 'Profile', badge: false }
	] as const;

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="bottom-nav">
	{#each navItems as item}
		{@const Icon = item.icon}
		<a
			href={item.href}
			class="bottom-nav-item"
			class:bottom-nav-active={isActive(item.href)}
		>
			<span class="relative">
				<Icon size={22} strokeWidth={2.5} />
				{#if item.badge && unreadCount > 0}
					<span class="absolute -top-1.5 -right-2.5 bg-duo-red text-white text-[9px] font-extrabold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				{/if}
			</span>
			<span class="text-[11px] font-extrabold uppercase tracking-wider">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	.bottom-nav {
		display: none;
	}

	@media (max-width: 768px) {
		.bottom-nav {
			display: flex;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background: oklch(99% 0.005 145);
			border-top: 2px solid oklch(92% 0.01 145);
			z-index: 50;
			padding: 8px 0 max(8px, env(safe-area-inset-bottom));
		}
	}

	.bottom-nav-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		padding: 8px 0;
		color: #AFAFAF;
		text-decoration: none;
		transition: color 0.15s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.bottom-nav-active {
		color: #58CC02;
	}
</style>
