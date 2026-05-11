export interface XPInputs {
	commits: number;
	prsOpened: number;
	publicRepos: number;
	starsReceived: number;
	followers: number;
	languageSkills?: number;
}

export type Tier = 'Novice' | 'Contributor' | 'Maintainer' | 'Legend';

export interface TierInfo {
	name: Tier;
	color: 'green' | 'blue' | 'purple' | 'gold';
	minLevel: number;
	maxLevel: number;
	cssColor: string;
}

export interface LevelInfo {
	level: number;
	currentXP: number;
	levelXP: number;
	levelMax: number;
	tier: Tier;
	tierInfo: TierInfo;
	nextLevel: number | null;
	progressPct: number;
}

const XP_WEIGHTS = {
	commits: 3,
	prsOpened: 20,
	publicRepos: 50,
	starsReceived: 5,
	followers: 8
} as const;

const TIER_MAP: Record<Tier, TierInfo> = {
	Novice:      { name: 'Novice',      color: 'green',  minLevel: 1,  maxLevel: 15,  cssColor: '#58CC02' },
	Contributor: { name: 'Contributor', color: 'blue',   minLevel: 16, maxLevel: 40,  cssColor: '#1CB0F6' },
	Maintainer:  { name: 'Maintainer',  color: 'purple', minLevel: 41, maxLevel: 79,  cssColor: '#CE82FF' },
	Legend:      { name: 'Legend',      color: 'gold',   minLevel: 80, maxLevel: 100, cssColor: '#FFC800' },
};

// Compute level thresholds with power-law curve scaled to ~50,000 XP for level 100
const rawGaps = Array.from({ length: 100 }, (_, i) => (i + 1) ** 1.8);
const rawSum = rawGaps.reduce((a, b) => a + b, 0);
const K = 50000 / rawSum;

const THRESHOLDS: number[] = [0];
for (let n = 0; n < 100; n++) {
	THRESHOLDS.push(THRESHOLDS[n] + Math.ceil(K * rawGaps[n]));
}

export const XP_MAX = THRESHOLDS[100];

export function calculateXP(inputs: XPInputs): number {
	return (
		inputs.commits * XP_WEIGHTS.commits +
		inputs.prsOpened * XP_WEIGHTS.prsOpened +
		inputs.publicRepos * XP_WEIGHTS.publicRepos +
		inputs.starsReceived * XP_WEIGHTS.starsReceived +
		inputs.followers * XP_WEIGHTS.followers +
		(inputs.languageSkills ?? 0) * 50
	);
}

export function getTierForLevel(level: number): Tier {
	if (level >= 80) return 'Legend';
	if (level >= 41) return 'Maintainer';
	if (level >= 16) return 'Contributor';
	return 'Novice';
}

export function getTierInfo(tier: Tier): TierInfo {
	return TIER_MAP[tier];
}

export function getLevelInfo(xp: number): LevelInfo {
	// Level 1 starts at 0 XP. Level n+1 starts at THRESHOLDS[n].
	let level = 1;
	for (let n = 1; n <= 100; n++) {
		if (xp >= THRESHOLDS[n]) {
			level = n + 1;
		} else {
			break;
		}
	}
	if (level > 100) level = 100;

	const floorXP = THRESHOLDS[level - 1];
	const ceilXP = level < 100 ? THRESHOLDS[level] : THRESHOLDS[100];
	const levelMax = ceilXP - floorXP;
	const levelXP = level >= 100 ? levelMax : Math.min(xp - floorXP, levelMax);
	const progressPct = levelMax > 0 ? Math.min((levelXP / levelMax) * 100, 100) : 100;

	const tier = getTierForLevel(level);

	return {
		level,
		currentXP: xp,
		levelXP,
		levelMax,
		tier,
		tierInfo: TIER_MAP[tier],
		nextLevel: level < 100 ? level + 1 : null,
		progressPct
	};
}

export function computePlayerLevel(inputs: XPInputs): LevelInfo {
	return getLevelInfo(calculateXP(inputs));
}
