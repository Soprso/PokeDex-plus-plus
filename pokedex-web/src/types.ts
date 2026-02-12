import type { Pokemon } from '@/services/pokeapi';

export interface PokemonWithNickname extends Pokemon {
    nickname?: string;
}

// Buddy System Interfaces
export interface BuddyData {
    pokemonId: number;
    level: 0 | 1 | 2 | 3 | 4; // 0=none, 1=good, 2=great, 3=ultra, 4=best
    consecutiveDays: number;
    lastInteractionDate: string; // YYYY-MM-DD
    achievedBestBuddyDate?: string;
    // New fields
    points: number;
    dailyHearts: number; // 0-3
    lastHeartDate: string; // YYYY-MM-DD
}

export interface DailyInteraction {
    date: string; // YYYY-MM-DD
    heartsGiven: number; // 0-3
    pokemonIds: number[];
}

export interface DailyHeartTracker {
    date: string; // YYYY-MM-DD format
    heartsGivenToday: number; // 0-3
    pokemonHeartedToday: number[]; // Pokemon IDs that received hearts today
}

export interface EconomyData {
    balance: number;
    lastDailyRewardDate: string; // YYYY-MM-DD
    streak: number;
}


export interface CardEffects {
    [pokemonId: number]: string; // pokemonId -> effectId
}

export interface Inventory {
    [itemId: string]: number;
}
