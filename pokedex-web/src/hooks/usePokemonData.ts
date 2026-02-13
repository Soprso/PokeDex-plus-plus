import { fetchPokemonBatch, fetchPokemonList } from '@/services/pokeapi';
import type { PokemonWithNickname } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export function usePokemonData() {
    console.log('usePokemonData: Hook initialized');
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
                setAllPokemon([]); // FORCE skeleton on initial load
            }
            console.log('usePokemonData: fetching started', { isRefresh });
            setError(null);

            const list = await fetchPokemonList(controller.signal);

            // 1. Fetch first 30 Pokemon immediately to hide skeleton faster
            const initialBatchLinks = list.slice(0, 30);
            const initialDetails = await fetchPokemonBatch(
                initialBatchLinks,
                controller.signal,
                30,
                0 // No delay for first batch
            );

            // Sort and set initial results
            initialDetails.sort((a, b) => a.id - b.id);
            setAllPokemon(initialDetails);
            setLoading(false); // Hide skeleton now

            // 2. Fetch the remaining Pokemon in background
            const remainingLinks = list.slice(30);
            console.log('usePokemonData: fetching remaining in background', remainingLinks.length);

            await fetchPokemonBatch(
                remainingLinks,
                controller.signal,
                50, // Larger background batches
                100,
                (loadedInBatch) => {
                    // Update progress
                    setLoadProgress({
                        loaded: 30 + loadedInBatch,
                        total: list.length
                    });
                },
                (newlyFetched: PokemonWithNickname[]) => {
                    // Progressive Update - update state as more batches arrive
                    setAllPokemon(prev => {
                        const updated = [...prev, ...newlyFetched];
                        return updated.sort((a, b) => a.id - b.id);
                    });
                }
            );

            console.log('usePokemonData: Background fetching complete');
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
