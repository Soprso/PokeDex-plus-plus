/**
 * OCR Service - Phase 6C
 * 
 * Android: Uses native ML Kit Text Recognition with refined parsing
 * iOS: Stubbed (manual input only)
 */

import { NativeModules, Platform } from 'react-native';

const { PokemonOcrModule } = NativeModules;

export interface OCRResult {
    name: string | null;
    cp: number | null;
    hp: number | null;
    iv?: {
        atk: number | null;
        def: number | null;
        sta: number | null;
    } | null;
    level?: number | null;
    barPositions?: {
        attack?: number;
        defense?: number;
        hp?: number;
    };
}

/**
 * Extract Pokémon data from screenshot
 * 
 * Android: Uses ML Kit native OCR with refined parsing
 * iOS: Returns null (manual input fallback)
 * 
 * @param uri - Image URI from image picker
 * @returns OCR results with name, CP, HP, optional IV and level
 */
export async function extractPokemonFromImage(uri: string): Promise<OCRResult> {
    // Android: Use native ML Kit OCR
    if (Platform.OS === 'android' && PokemonOcrModule) {
        try {
            const result = await PokemonOcrModule.extractFromImage(uri);
            console.log('Native OCR Result:', result);

            return {
                name: result.name || null,
                cp: result.cp || null,
                hp: result.hp || null,
                iv: result.iv || null,
                level: result.level || null,
                barPositions: result.barPositions || undefined,
            };
        } catch (error) {
            console.error('Native OCR error:', error);
            // Fall back to manual input on error
            return { name: null, cp: null, hp: null, iv: null, level: null };
        }
    }

    // iOS or fallback: Return null (manual input)
    return { name: null, cp: null, hp: null, iv: null, level: null };
}

/**
 * Parse OCR text to extract Pokémon data
 * Used by native module, kept for reference
 * 
 * @param text - Raw OCR text output
 * @returns Parsed Pokémon data
 */
export function parsePokemonText(text: string): OCRResult {
    const result: OCRResult = {
        name: null,
        cp: null,
        hp: null,
        iv: null,
        level: null,
    };

    // Clean up text (remove extra whitespace, normalize)
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Extract CP: "CP 1234" or "CP1234" or "cp 1234"
    const cpMatch = cleanText.match(/CP\s*(\d+)/i);
    if (cpMatch) {
        const cp = parseInt(cpMatch[1], 10);
        if (cp > 0 && cp <= 9999) {
            result.cp = cp;
        }
    }

    // Extract HP: "HP 123" or "HP123" or "123 / 123" (take first number)
    const hpMatch = cleanText.match(/HP\s*(\d+)(?:\s*\/\s*\d+)?/i) ||
        cleanText.match(/(\d+)\s*\/\s*\d+/);
    if (hpMatch) {
        const hp = parseInt(hpMatch[1], 10);
        if (hp > 0 && hp <= 999) {
            result.hp = hp;
        }
    }

    // Extract Name: Look for capitalized words before CP/HP
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (const line of lines) {
        // Skip lines that contain CP or HP (those are stats, not names)
        if (/CP|HP|\d+/i.test(line)) continue;

        // Look for capitalized words (Pokémon names)
        const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$/);
        if (nameMatch && nameMatch[1].length >= 3 && nameMatch[1].length <= 50) {
            result.name = nameMatch[1].trim();
            break;
        }
    }

    return result;
}

/**
 * Validate OCR result
 * 
 * @param result - OCR result to validate
 * @returns Validation errors (empty object if valid)
 */
export function validateOCRResult(result: {
    name: string | null;
    cp: number | null;
    hp: number | null;
}): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!result.name || result.name.trim() === '') {
        errors.name = 'Name is required';
    } else if (result.name.length > 50) {
        errors.name = 'Name is too long';
    }

    if (result.cp === null || result.cp <= 0) {
        errors.cp = 'CP must be greater than 0';
    } else if (result.cp > 9999) {
        errors.cp = 'CP is too high';
    }

    if (result.hp === null || result.hp <= 0) {
        errors.hp = 'HP must be greater than 0';
    } else if (result.hp > 999) {
        errors.hp = 'HP is too high';
    }

    return errors;
}
