import { writable, derived } from 'svelte/store';
import type { GitHubNotification } from '$lib/api/github';

export const notifications = writable<GitHubNotification[]>([]);

export const unreadCount = derived(notifications, ($n) => $n.filter((n) => n.unread).length);

export function setNotifications(list: GitHubNotification[]) {
	notifications.set(list);
}
