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
): Promise<Pokemon> {
    try {
        const response = await fetch(url, { signal });

        if (!response.ok) {
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

        return {
            id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            imageUrl,
            shinyImageUrl,
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
            results.push(...batchResults);

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
