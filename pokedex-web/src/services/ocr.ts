import Tesseract from 'tesseract.js';
import { initializePokemonNameCache, isValidPokemonName } from './pokeapi';

export interface OCRResult {
    name: string | null;
    cp: number | null;
    hp: number | null;
    iv?: {
        atk: number | null;
        def: number | null;
        sta: number | null;
        percent?: number;
    } | null;
    level?: number | null;
    levelMethod?: 'vision' | 'formula' | 'native' | null;
    barPositions?: {
        attack?: number;
        defense?: number;
        hp?: number;
    };
}

/**
 * Extract Pokémon data from screenshot
 * 
 * Web: Uses Tesseract.js
 * 
 * @param uri - Image URI from image picker
 * @returns OCR results with name, CP, HP
 */
export async function extractPokemonFromImage(uri: string): Promise<OCRResult> {
    // Ensure cache is warming up
    initializePokemonNameCache();

    console.log('[OCR] Starting Tesseract.js analysis for:', uri);

    try {
        const result = await Tesseract.recognize(
            uri,
            'eng',
            {
                logger: m => console.log('[OCR Progress]', m)
            }
        );

        console.log('[OCR] Tesseract finished. Confidence:', result.data.confidence);
        console.log('[OCR] Text:', result.data.text);

        const parsed = parsePokemonText(result.data.text);

        // Validate name against PokeAPI cache
        if (parsed.name && !isValidPokemonName(parsed.name)) {
            console.warn(`[OCR] Rejected invalid name: "${parsed.name}"`);
            parsed.name = null;
        }

        return parsed;

    } catch (error) {
        console.error('[OCR] Tesseract error:', error);
        return { name: null, cp: null, hp: null, iv: null, level: null, levelMethod: null };
    }
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
        levelMethod: null,
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
