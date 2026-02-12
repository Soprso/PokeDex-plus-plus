/**
 * Level Calculation Service
 * 
 * Determines Pokémon level using:
 * 1. Meter inference (Method 1 - Primary)
 * 2. CP Formula Inversion (Method 2 - Fallback)
 */

// Official CPM (Combat Power Multiplier) Table
// Source: Game Master / Gampress
export const CPM_TABLE: Record<number, number> = {
    1: 0.094, 1.5: 0.135137432,
    2: 0.16639787, 2.5: 0.192650919,
    3: 0.21573247, 3.5: 0.236572661,
    4: 0.25572005, 4.5: 0.273530381,
    5: 0.29024988, 5.5: 0.306057377,
    6: 0.3210876, 6.5: 0.335445036,
    7: 0.34921268, 7.5: 0.362457751,
    8: 0.37523559, 8.5: 0.387592406,
    9: 0.39956728, 9.5: 0.411193551,
    10: 0.42250001, 10.5: 0.432926419,
    11: 0.44310755, 11.5: 0.453059958,
    12: 0.46279839, 12.5: 0.472336083,
    13: 0.48168495, 13.5: 0.4908558,
    14: 0.49985844, 14.5: 0.508701765,
    15: 0.51739395, 15.5: 0.525942511,
    16: 0.53435433, 16.5: 0.542635767,
    17: 0.55079269, 17.5: 0.558830576,
    18: 0.56675452, 18.5: 0.574569153,
    19: 0.58227891, 19.5: 0.589887917,
    20: 0.59740001, 20.5: 0.604818814,
    21: 0.61215729, 21.5: 0.619399365,
    22: 0.62656713, 22.5: 0.633644533,
    23: 0.64065295, 23.5: 0.647576426,
    24: 0.65443563, 24.5: 0.661214806,
    25: 0.667934, 25.5: 0.674577537,
    26: 0.68116492, 26.5: 0.687680648,
    27: 0.69414365, 27.5: 0.700538679,
    28: 0.70688421, 28.5: 0.713164996,
    29: 0.71939909, 29.5: 0.725571552,
    30: 0.7317, 30.5: 0.734741009,
    31: 0.73776948, 31.5: 0.740785574,
    32: 0.74378943, 32.5: 0.746781211,
    33: 0.74976104, 33.5: 0.752729087,
    34: 0.75568551, 34.5: 0.758630378,
    35: 0.76156384, 35.5: 0.764486065,
    36: 0.76739717, 36.5: 0.770297266,
    37: 0.7731865, 37.5: 0.776064962,
    38: 0.77893275, 38.5: 0.781790055,
    39: 0.78463697, 39.5: 0.787473578,
    40: 0.7903, 40.5: 0.792803968,
    41: 0.79530001, 41.5: 0.79780001,
    42: 0.8003, 42.5: 0.80279999,
    43: 0.8053, 43.5: 0.8078,
    44: 0.81029999, 44.5: 0.81279998,
    45: 0.81529999, 45.5: 0.81779999,
    46: 0.82030001, 46.5: 0.82279999,
    47: 0.82530001, 47.5: 0.82780001,
    48: 0.83030001, 48.5: 0.83279999,
    49: 0.83530001, 49.5: 0.83780001,
    50: 0.84029999, 50.5: 0.84279999,
    51: 0.84529999, // Best Buddy
};

interface BaseStats {
    atk: number;
    def: number;
    sta: number;
}

interface IVs {
    atk: number;
    def: number;
    sta: number;
}

/**
 * Calculate Level using CP Formula (Method 2)
 * CP = floor((Attack * sqrt(Defense) * sqrt(Stamina) * CPM^2) / 10)
 */
export function calculateLevel(
    observedCP: number,
    baseStats: BaseStats,
    ivs: IVs
): number | null {
    if (!observedCP || !baseStats || !ivs) return null;

    const atk = baseStats.atk + ivs.atk;
    const def = baseStats.def + ivs.def;
    const sta = baseStats.sta + ivs.sta;

    // Debug input
    console.log(`[LevelCalc] Input - CP: ${observedCP}, Stats: ${JSON.stringify(baseStats)}, IVs: ${JSON.stringify(ivs)}`);

    let bestMatch: number | null = null;
    let minDiff = Infinity;

    // Sort levels to ensure iteration order (1 -> 51)
    const levels = Object.keys(CPM_TABLE)
        .map(k => parseFloat(k))
        .sort((a, b) => a - b);

    for (const level of levels) {
        const cpm = CPM_TABLE[level];

        const computedCP = Math.floor(
            (atk * Math.sqrt(def) * Math.sqrt(sta) * cpm * cpm) / 10
        );

        // Ensure CP is at least 10
        const finalCP = Math.max(10, computedCP);

        const diff = Math.abs(finalCP - observedCP);

        // Debug key points (e.g. L20, L30, L40, L50)
        if (level % 10 === 0 || level === 51) {
            console.log(`[LevelCalc] L${level} (CPM ${cpm}): CalcCP ${finalCP} vs ObsCP ${observedCP} (Diff ${diff})`);
        }

        if (diff < minDiff) {
            minDiff = diff;
            bestMatch = level;
        }

        // If we found an exact match, verify it's not just a low-level coincidence?
        // Actually, pure sort order prefers lower levels in case of ties if checking < minDiff (since minDiff doesn't update on tie).
        // That's what we want (lowest valid level).
    }

    console.log(`[LevelCalc] Best Match: ${bestMatch} (Diff ${minDiff})`);
    return bestMatch;
}
