import { fetchPokemonBatch, fetchPokemonList } from '@/services/pokeapi';
import type { PokemonWithNickname } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export function usePokemonData() {
    const [allPokemon, setAllPokemon] = useState<PokemonWithNickname[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 1025 });
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const loadPokemon = useCallback(async (isRefresh = false) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const list = await fetchPokemonList(controller.signal);
            const details = await fetchPokemonBatch(
                list,
                controller.signal,
                30,
                50,
                (loaded, total) => {
                    setLoadProgress({ loaded, total });
                }
            );

            // Sort by ID
            details.sort((a, b) => a.id - b.id);

            setAllPokemon(details);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            console.error('Failed to load Pokémon:', err);
            setError('Failed to load Pokémon. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadPokemon();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [loadPokemon]);

    const refetch = useCallback(() => loadPokemon(true), [loadPokemon]);

    return {
        allPokemon,
        loading,
        refreshing,
        loadProgress,
        error,
        refetch
    };
}
