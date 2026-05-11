export function decodeBase64Utf8(base64: string): string {
	const cleaned = base64.replace(/\n/g, '');
	const binary = atob(cleaned);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder('utf-8').decode(bytes);
}

export function timeAgo(dateStr: string): string {
	const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
	if (seconds < 60) return 'just now';
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function computeStreak(calendar: { weeks: { contributionDays: { contributionCount: number }[] }[] } | undefined): number {
	if (!calendar) return 0;
	const days = calendar.weeks.flatMap((w) => w.contributionDays).reverse();
	const startIdx = days[0]?.contributionCount === 0 ? 1 : 0;
	let count = 0;
	for (let i = startIdx; i < days.length; i++) {
		if (days[i].contributionCount > 0) count++;
		else break;
	}
	return count;
}
