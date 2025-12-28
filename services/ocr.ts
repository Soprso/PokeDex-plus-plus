/**
 * OCR Service - Phase 5F/5G
 * 
 * CRITICAL BLOCKER IDENTIFIED:
 * Tesseract.js requires Web Workers which are NOT available in React Native/Expo.
 * Error: "Property 'Worker' doesn't exist"
 * 
 * OPTIONS:
 * 1. Keep stub (current approach) - manual input only
 * 2. Use native OCR via dev client (ML Kit/Vision) - requires native code
 * 3. Use cloud OCR API (Google Vision, AWS Textract) - requires API keys
 * 
 * Current implementation: STUB (manual input fallback)
 */

export interface OCRResult {
    name: string | null;
    cp: number | null;
    hp: number | null;
}

/**
 * Extract Pokémon data from screenshot
 * 
 * CURRENTLY STUBBED - Returns null for all fields
 * Real OCR requires either:
 * - Native module (dev client)
 * - Cloud API (costs money)
 * 
 * @param uri - Image URI from image picker
 * @returns OCR results with name, CP, HP (or null if not detected)
 */
export async function extractPokemonFromImage(uri: string): Promise<OCRResult> {
    // Tesseract.js DOES NOT WORK in React Native/Expo
    // Web Workers are not available

    // Return null for all fields - user will use manual input
    return {
        name: null,
        cp: null,
        hp: null,
    };
}

/**
 * Parse OCR text to extract Pokémon data
 * Ready for when real OCR is integrated
 * 
 * @param text - Raw OCR text output
 * @returns Parsed Pokémon data
 */
export function parsePokemonText(text: string): OCRResult {
    const result: OCRResult = {
        name: null,
        cp: null,
        hp: null,
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
