import { PokemonType } from '@/constants/pokemonTypes';

// API Base URL
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Types
export interface PokemonListItem {
    name: string;
    url: string;
}

export interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonListItem[];
}

export interface PokemonDetails {
    id: number;
    name: string;
    types: Array<{
        slot: number;
        type: {
            name: PokemonType;
            url: string;
        };
    }>;
    sprites: {
        other: {
            'official-artwork': {
                front_default: string | null;
                front_shiny: string | null;
            };
        };
    };
    height: number;
    weight: number;
    abilities: Array<{
        ability: {
            name: string;
            url: string;
        };
        is_hidden: boolean;
        slot: number;
    }>;
    stats: Array<{
        base_stat: number;
        effort: number;
        stat: {
            name: string;
            url: string;
        };
    }>;
}

export interface Pokemon {
    id: number;
    name: string;
    types: PokemonType[];
    imageUrl: string;
    shinyImageUrl: string;
    stats: {
        atk: number;
        def: number;
        sta: number;
    };
}

/**
 * Fetch the list of all Pokémon (up to 1025)
 */
export async function fetchPokemonList(
    signal?: AbortSignal
): Promise<PokemonListItem[]> {
    try {
        const response = await fetch(
            `${POKEAPI_BASE}/pokemon?offset=0&limit=1025`,
            { signal }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch Pokémon list: ${response.status}`);
        }

        const data: PokemonListResponse = await response.json();
        return data.results;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching Pokémon list:', error);
        throw error;
    }
}

/**
 * Fetch details for a single Pokémon
 */
export async function fetchPokemonDetails(
    url: string,
    signal?: AbortSignal
): Promise<Pokemon | null> {
    try {
        const response = await fetch(url, { signal });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`[PokeAPI] Pokémon not found: ${url}`);
                // @ts-ignore - Changing return type to include null
                return null;
            }
            throw new Error(`Failed to fetch Pokémon details: ${response.status}`);
        }

        const data: PokemonDetails = await response.json();

        // Extract ID from URL if not present
        const id = data.id;

        // Get image URL with fallback
        const imageUrl =
            data.sprites.other['official-artwork'].front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

        const shinyImageUrl =
            data.sprites.other['official-artwork'].front_shiny ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;

        // Map stats (default to 0 if missing)
        const getStat = (name: string) => data.stats.find(s => s.stat.name === name)?.base_stat || 0;

        return {
            id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            imageUrl,
            shinyImageUrl,
            stats: {
                atk: getStat('attack'),
                def: getStat('defense'),
                sta: getStat('hp'),
            },
        };
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching Pokémon details:', error);
        throw error;
    }
}

/**
 * Fetch details for multiple Pokémon in batches to avoid rate limiting
 */
export async function fetchPokemonBatch(
    items: PokemonListItem[],
    signal?: AbortSignal,
    batchSize: number = 20,
    delayMs: number = 100,
    onProgress?: (loaded: number, total: number) => void
): Promise<Pokemon[]> {
    const results: Pokemon[] = [];
    const total = items.length;

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        const batchPromises = batch.map(item =>
            fetchPokemonDetails(item.url, signal)
        );

        try {
            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter((p): p is Pokemon => p !== null);
            results.push(...validResults);

            // Report progress
            if (onProgress) {
                onProgress(results.length, total);
            }

            // Add delay between batches to avoid rate limiting
            if (i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw error;
            }
            console.error(`Error fetching batch ${i / batchSize + 1}:`, error);
            // Continue with next batch even if one fails
        }
    }

    return results;
}

/**
 * Extract Pokémon ID from URL
 */
export function getPokemonIdFromUrl(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
}

/**
 * Check if a name is likely a valid Pokémon name
 * This is a lightweight validation to filter out junk like "Hundo", "CP", etc.
 * Uses a list of known valid prefixes or simply checks if fetch details works (if we want to be strict)
 * But for synchronous checking, we might just need to rely on the fetch returning null.
 * 
 * Ideally, we should cache the full list of names on app start.
 */
// Cache for the full list
let allPokemonNames: Set<string> | null = null;
let nameFetchPromise: Promise<void> | null = null;

// Initialize the cache eagerly
export async function initializePokemonNameCache() {
    if (nameFetchPromise) return nameFetchPromise;

    nameFetchPromise = (async () => {
        try {
            console.log('[PokeAPI] Initializing name cache...');
            // Fetch all 1025+ pokemon names
            const list = await fetchPokemonList();
            allPokemonNames = new Set(list.map(p => p.name.toLowerCase()));
            console.log(`[PokeAPI] Cached ${allPokemonNames.size} names`);
        } catch (e) {
            console.error('[PokeAPI] Failed to cache names:', e);
            nameFetchPromise = null; // Retry next time
        }
    })();
    return nameFetchPromise;
}

export function isValidPokemonName(name: string): boolean {
    if (!name) return false;
    const lower = name.toLowerCase().trim();

    // If cache is ready, use it
    if (allPokemonNames) {
        return allPokemonNames.has(lower);
    }

    // Fallback if cache not ready: simple heuristic
    // (Assume valid until proven otherwise, but "Hundo" is definitely invalid)
    if (lower === 'hundo' || lower === 'cp' || lower === 'hp' || lower.startsWith('level')) {
        return false;
    }
    return true;
}
