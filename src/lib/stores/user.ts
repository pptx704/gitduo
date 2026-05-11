import { writable } from 'svelte/store';
import type { GitHubUser } from '$lib/api/github';

export const currentUser = writable<GitHubUser | null>(null);

export function setCurrentUser(user: GitHubUser) {
	currentUser.set(user);
}

export function clearCurrentUser() {
	currentUser.set(null);
}
