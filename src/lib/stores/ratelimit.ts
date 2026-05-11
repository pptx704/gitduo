import { writable } from 'svelte/store';

interface RateLimitState {
	limit: number;
	remaining: number;
	reset: number;
}

export const rateLimit = writable<RateLimitState>({
	limit: 5000,
	remaining: 5000,
	reset: 0
});

export function updateRateLimit(state: RateLimitState) {
	rateLimit.set(state);
}
