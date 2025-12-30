import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScannedPokemon {
    id: string;
    name: string;
    cp: number | null;
    hp: number | null;
    level: number | null;
    iv: {
        atk: number;
        def: number;
        sta: number;
        percent: number;
    } | null;
    imageUri?: string;
    scannedAt: number;
    // OCR data
    ocr?: {
        name: string | null;
        cp: number | null;
        hp: number | null;
        levelMethod?: 'vision' | 'formula' | 'native' | null;
    };
    // Status flag
    status?: 'complete' | 'needs_review';
}

export interface UserProfile {
    trainerId: string;
    trainerName: string;
    trainerLevel: string;
    team: 'Mystic' | 'Valor' | 'Instinct' | null;
    updatedAt: number;
}

// Storage keys
const KEYS = {
    OVERLAY_PERMISSION: 'overlay_permission_granted',
    MY_POKEMON: 'my_pokemon_list',
    USER_PROFILE: 'user_profile_data',
};

// Overlay Permission
export async function getOverlayPermission(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(KEYS.OVERLAY_PERMISSION);
        return value === 'true';
    } catch (error) {
        console.error('Error getting overlay permission:', error);
        return false;
    }
}

export async function setOverlayPermission(granted: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.OVERLAY_PERMISSION, granted.toString());
    } catch (error) {
        console.error('Error setting overlay permission:', error);
    }
}

// My Pokémon
export async function getMyPokemon(): Promise<ScannedPokemon[]> {
    try {
        const value = await AsyncStorage.getItem(KEYS.MY_POKEMON);
        return value ? JSON.parse(value) : [];
    } catch (error) {
        console.error('Error getting my Pokémon:', error);
        return [];
    }
}

export async function getPokemonById(id: string): Promise<ScannedPokemon | null> {
    try {
        const list = await getMyPokemon();
        return list.find((p) => p.id === id) || null;
    } catch (error) {
        console.error('Error getting Pokémon by ID:', error);
        return null;
    }
}

export async function saveMyPokemon(list: ScannedPokemon[]): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.MY_POKEMON, JSON.stringify(list));
    } catch (error) {
        console.error('Error saving my Pokémon:', error);
    }
}

export async function addPokemon(pokemon: ScannedPokemon): Promise<void> {
    try {
        const list = await getMyPokemon();
        list.unshift(pokemon); // Add to beginning
        await saveMyPokemon(list);
    } catch (error) {
        console.error('Error adding Pokémon:', error);
    }
}

export async function deletePokemon(id: string): Promise<void> {
    try {
        const list = await getMyPokemon();
        const filtered = list.filter((p) => p.id !== id);
        await saveMyPokemon(filtered);
    } catch (error) {
        console.error('Error deleting Pokémon:', error);
    }
}

// User Profile
// User Profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) {
        console.log('[Storage] getUserProfile: No userId provided');
        return null;
    }
    try {
        const key = `${KEYS.USER_PROFILE}_${userId}`;
        console.log(`[Storage] Getting profile for key: ${key}`);
        const value = await AsyncStorage.getItem(key);
        console.log(`[Storage] Retrieved value: ${value ? 'FOUND' : 'NULL'}`);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    if (!userId) {
        console.log('[Storage] saveUserProfile: No userId provided');
        return;
    }
    try {
        const key = `${KEYS.USER_PROFILE}_${userId}`;
        console.log(`[Storage] Saving profile for key: ${key}`, JSON.stringify(profile));
        await AsyncStorage.setItem(key, JSON.stringify(profile));
        console.log('[Storage] Profile saved successfully');
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
}
