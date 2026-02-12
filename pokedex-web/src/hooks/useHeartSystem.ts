import type { DailyHeartTracker } from '@/types';

const MAX_DAILY_HEARTS = 3;

export function getTodayDate(): string {
    return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
}

export function calculateBuddyLevel(totalHearts: number): 0 | 1 | 2 | 3 | 4 {
    if (totalHearts >= 21) return 4; // Best Buddy
    if (totalHearts >= 11) return 3; // Ultra Buddy
    if (totalHearts >= 4) return 2;  // Great Buddy
    if (totalHearts >= 1) return 1;  // Good Buddy
    return 0; // No buddy
}

export function getHeartTracker(metadata: any): DailyHeartTracker {
    const today = getTodayDate();
    const saved = metadata?.dailyHeartTracker as DailyHeartTracker | undefined;

    // Reset if new day or no data
    if (!saved || saved.date !== today) {
        return {
            date: today,
            heartsGivenToday: 0,
            pokemonHeartedToday: [],
        };
    }

    return saved;
}

export function canGiveHeart(heartTracker: DailyHeartTracker, pokemonId: number): { can: boolean; reason?: string } {
    // Check daily limit
    if (heartTracker.heartsGivenToday >= MAX_DAILY_HEARTS) {
        return { can: false, reason: 'Daily limit reached! Come back tomorrow for more hearts.' };
    }

    // Check if already gave to this Pokemon today
    if (heartTracker.pokemonHeartedToday.includes(pokemonId)) {
        return { can: false, reason: 'You already gave a heart to this Pokémon today!' };
    }

    return { can: true };
}

export function getRemainingHearts(heartTracker: DailyHeartTracker): number {
    return Math.max(0, MAX_DAILY_HEARTS - heartTracker.heartsGivenToday);
}
