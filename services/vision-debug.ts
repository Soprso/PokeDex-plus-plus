/**
 * Vision Debug Service - Phase 7B
 * 
 * Visual debugging + IV calculation from pixel data
 * Console logging only - no UI or storage
 */

import { NativeModules, Platform } from 'react-native';

const { PixelSamplerModule } = NativeModules;

// Debug flag - set to false to disable all vision debugging
export const DEBUG_VISION = true;

// IV Panel region (percent-based coordinates)
export const IV_PANEL = {
    top: 0.55,      // 55% from top
    height: 0.22,   // 22% of image height
    left: 0.1,      // 10% from left
    width: 0.8,     // 80% of image width
};

// Bar regions (relative to IV_PANEL)
export const ATTACK_BAR = {
    relativeTop: 0.00,   // Top of panel
    height: 0.28,        // 28% of panel height
};

export const DEFENSE_BAR = {
    relativeTop: 0.36,   // 36% down in panel
    height: 0.28,        // 28% of panel height
};

export const HP_BAR = {
    relativeTop: 0.72,   // 72% down in panel
    height: 0.28,        // 28% of panel height
};

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface BarRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IVResult {
    atk: number;
    def: number;
    sta: number;
}

/**
 * Calculate absolute bar regions from image dimensions
 */
export function calculateBarRegions(dimensions: ImageDimensions): {
    attack: BarRegion;
    defense: BarRegion;
    hp: BarRegion;
    panel: BarRegion;
} {
    const { width, height } = dimensions;

    const panelX = width * IV_PANEL.left;
    const panelY = height * IV_PANEL.top;
    const panelWidth = width * IV_PANEL.width;
    const panelHeight = height * IV_PANEL.height;

    const barWidth = panelWidth;
    const barX = panelX;

    const attackY = panelY + (panelHeight * ATTACK_BAR.relativeTop);
    const attackHeight = panelHeight * ATTACK_BAR.height;

    const defenseY = panelY + (panelHeight * DEFENSE_BAR.relativeTop);
    const defenseHeight = panelHeight * DEFENSE_BAR.height;

    const hpY = panelY + (panelHeight * HP_BAR.relativeTop);
    const hpHeight = panelHeight * HP_BAR.height;

    return {
        panel: { x: panelX, y: panelY, width: panelWidth, height: panelHeight },
        attack: { x: barX, y: attackY, width: barWidth, height: attackHeight },
        defense: { x: barX, y: defenseY, width: barWidth, height: defenseHeight },
        hp: { x: barX, y: hpY, width: barWidth, height: hpHeight },
    };
}

/**
 * Calculate scan line Y position (50% height of bar)
 */
export function getScanLineY(bar: BarRegion): number {
    return bar.y + (bar.height * 0.5);
}

/**
 * Convert RGB to luminance
 */
function rgbToLuminance(r: number, g: number, b: number): number {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate fill ratio from pixel array
 */
function calculateFillRatio(pixels: number[][]): {
    ratio: number;
    filled: number;
    total: number;
    minLum: number;
    maxLum: number;
} {
    if (pixels.length === 0) {
        return { ratio: 0, filled: 0, total: 0, minLum: 0, maxLum: 0 };
    }

    // Convert to luminance
    const luminances = pixels.map(([r, g, b]) => rgbToLuminance(r, g, b));

    // Find min/max
    const minLum = Math.min(...luminances);
    const maxLum = Math.max(...luminances);

    // Calculate threshold
    const threshold = (minLum + maxLum) / 2;

    // Count filled pixels
    const filled = luminances.filter(lum => lum > threshold).length;
    const total = luminances.length;
    const ratio = filled / total;

    return { ratio, filled, total, minLum, maxLum };
}

/**
 * Convert fill ratio to IV value (0-15)
 */
function ratioToIV(ratio: number): number {
    const iv = Math.round(ratio * 15);
    return Math.max(0, Math.min(15, iv));
}

/**
 * Sample pixels along a horizontal scan line
 */
export async function sampleScanLine(
    imageUri: string,
    y: number,
    startX: number,
    endX: number,
    sampleCount: number = 200
): Promise<number[][]> {
    if (!DEBUG_VISION || Platform.OS !== 'android' || !PixelSamplerModule) {
        return [];
    }

    try {
        const pixels = await PixelSamplerModule.sampleScanLine(
            imageUri,
            Math.round(y),
            Math.round(startX),
            Math.round(endX),
            sampleCount
        );
        return pixels;
    } catch (error) {
        console.error('[VISION DEBUG] Pixel sampling error:', error);
        return [];
    }
}

/**
 * Detect bar track from pixel array using color-based horizontal run detection
 * Phase 7E - Track Isolation (ignores text/icons)
 */
function detectBarTrack(pixels: number[][]): {
    trackStartX: number | null;
    trackEndX: number | null;
    trackWidth: number;
    candidates: Array<{ start: number; end: number; width: number; avgColor: string }>;
} {
    if (pixels.length === 0) {
        return {
            trackStartX: null,
            trackEndX: null,
            trackWidth: 0,
            candidates: [],
        };
    }

    const MIN_TRACK_WIDTH = 80; // Minimum width for valid IV bar track
    const COLOR_TOLERANCE = 30; // RGB delta tolerance for color similarity

    // Find continuous runs of similar-colored pixels
    const runs: Array<{ start: number; end: number; width: number; avgColor: string }> = [];
    let runStart = 0;
    let runColors: number[][] = [pixels[0]];

    for (let i = 1; i < pixels.length; i++) {
        const [r1, g1, b1] = pixels[i - 1];
        const [r2, g2, b2] = pixels[i];

        // Calculate color delta
        const deltaR = Math.abs(r2 - r1);
        const deltaG = Math.abs(g2 - g1);
        const deltaB = Math.abs(b2 - b1);
        const maxDelta = Math.max(deltaR, deltaG, deltaB);

        // Check if pixel is similar to previous (continuous run)
        if (maxDelta < COLOR_TOLERANCE) {
            runColors.push(pixels[i]);
        } else {
            // Run ended - save if long enough
            const runWidth = i - runStart;
            if (runWidth >= MIN_TRACK_WIDTH) {
                // Calculate average color
                const avgR = Math.round(runColors.reduce((sum, [r]) => sum + r, 0) / runColors.length);
                const avgG = Math.round(runColors.reduce((sum, [, g]) => sum + g, 0) / runColors.length);
                const avgB = Math.round(runColors.reduce((sum, [, , b]) => sum + b, 0) / runColors.length);
                const avgColor = `rgb(${avgR},${avgG},${avgB})`;

                runs.push({
                    start: runStart,
                    end: i - 1,
                    width: runWidth,
                    avgColor,
                });
            }

            // Start new run
            runStart = i;
            runColors = [pixels[i]];
        }
    }

    // Check final run
    const finalWidth = pixels.length - runStart;
    if (finalWidth >= MIN_TRACK_WIDTH) {
        const avgR = Math.round(runColors.reduce((sum, [r]) => sum + r, 0) / runColors.length);
        const avgG = Math.round(runColors.reduce((sum, [, g]) => sum + g, 0) / runColors.length);
        const avgB = Math.round(runColors.reduce((sum, [, , b]) => sum + b, 0) / runColors.length);
        const avgColor = `rgb(${avgR},${avgG},${avgB})`;

        runs.push({
            start: runStart,
            end: pixels.length - 1,
            width: finalWidth,
            avgColor,
        });
    }

    // Select best track candidate (longest run)
    let bestTrack = runs.length > 0 ? runs.reduce((best, current) =>
        current.width > best.width ? current : best
    ) : null;

    return {
        trackStartX: bestTrack?.start ?? null,
        trackEndX: bestTrack?.end ?? null,
        trackWidth: bestTrack?.width ?? 0,
        candidates: runs,
    };
}

/**
 * Detect bar edges from pixel array
 * Phase 7D - Edge Detection (DEPRECATED - kept for reference)
 */
function detectBarEdges(pixels: number[][]): {
    barStartX: number | null;
    barEndX: number | null;
    barWidth: number;
    detectedEdges: number[];
    edgeDeltas: number[];
} {
    if (pixels.length === 0) {
        return {
            barStartX: null,
            barEndX: null,
            barWidth: 0,
            detectedEdges: [],
            edgeDeltas: [],
        };
    }

    const EDGE_THRESHOLD = 25;
    const edges: number[] = [];
    const deltas: number[] = [];

    // Calculate max RGB value for each pixel (simpler than luminance for edge detection)
    const pixelValues = pixels.map(([r, g, b]) => Math.max(r, g, b));

    // Detect edges by finding sharp transitions
    for (let i = 1; i < pixelValues.length; i++) {
        const delta = Math.abs(pixelValues[i] - pixelValues[i - 1]);

        if (delta > EDGE_THRESHOLD) {
            edges.push(i);
            deltas.push(delta);
        }
    }

    // First edge = bar start, last edge = bar end
    const barStartX = edges.length > 0 ? edges[0] : null;
    const barEndX = edges.length > 0 ? edges[edges.length - 1] : null;
    const barWidth = barStartX !== null && barEndX !== null ? barEndX - barStartX : 0;

    return {
        barStartX,
        barEndX,
        barWidth,
        detectedEdges: edges,
        edgeDeltas: deltas,
    };
}

/**
 * Detect horizontal bar boundaries (startX and endX)
 * Sweeps left to right looking for color transitions
 */
function detectBarBounds(pixels: number[][]): { startX: number; endX: number } | null {
    if (pixels.length < 50) return null;

    const EDGE_THRESHOLD = 30; // Color delta threshold for edge detection
    const deltas: number[] = [];

    // Calculate color deltas between consecutive pixels
    for (let i = 1; i < pixels.length; i++) {
        const [r1, g1, b1] = pixels[i - 1];
        const [r2, g2, b2] = pixels[i];

        const deltaR = Math.abs(r2 - r1);
        const deltaG = Math.abs(g2 - g1);
        const deltaB = Math.abs(b2 - b1);
        const totalDelta = deltaR + deltaG + deltaB;

        deltas.push(totalDelta);
    }

    // Find edges (strong color transitions)
    const edges: number[] = [];
    for (let i = 0; i < deltas.length; i++) {
        if (deltas[i] > EDGE_THRESHOLD) {
            edges.push(i);
        }
    }

    // DEBUG: Log all detected edges
    console.log(`[BAR BOUNDS DEBUG] Found ${edges.length} edges:`, edges.slice(0, 10));

    // Need at least 2 edges (start and end of bar)
    if (edges.length < 2) return null;

    // Group edges that are close together (within 5px) - these are likely the same transition
    const groupedEdges: number[] = [];
    let currentGroup = [edges[0]];

    for (let i = 1; i < edges.length; i++) {
        if (edges[i] - edges[i - 1] <= 5) {
            currentGroup.push(edges[i]);
        } else {
            // Take the middle of the group
            groupedEdges.push(Math.floor(currentGroup.reduce((a, b) => a + b, 0) / currentGroup.length));
            currentGroup = [edges[i]];
        }
    }
    // Don't forget the last group
    groupedEdges.push(Math.floor(currentGroup.reduce((a, b) => a + b, 0) / currentGroup.length));

    console.log(`[BAR BOUNDS DEBUG] Grouped edges:`, groupedEdges);

    if (groupedEdges.length < 2) return null;

    // First grouped edge = bar start, second grouped edge = bar end
    // This should capture the bar track from background→bar to bar→background
    const startX = groupedEdges[0];
    const endX = groupedEdges[groupedEdges.length - 1];

    console.log(`[BAR BOUNDS DEBUG] Using bounds: X ${startX} → ${endX} (${endX - startX}px)`);

    // Sanity check: bar should be at least 80px wide
    if (endX - startX < 80) return null;

    return { startX, endX };
}

/**
 * Sample all IV bars and calculate IVs using OCR-anchored positions
 */
export async function sampleIVBars(
    imageUri: string,
    dimensions: ImageDimensions,
    barPositions?: { attack?: number; defense?: number; hp?: number }
): Promise<IVResult | null> {
    if (!DEBUG_VISION) {
        return null;
    }

    // If no bar positions provided, fall back to percentage-based (legacy)
    if (!barPositions || !barPositions.attack || !barPositions.defense || !barPositions.hp) {
        console.log('[IV DEBUG] No OCR bar positions available, using fallback percentages');
        const regions = calculateBarRegions(dimensions);
        const attackScanY = getScanLineY(regions.attack);
        const defenseScanY = getScanLineY(regions.defense);
        const hpScanY = getScanLineY(regions.hp);

        const attackPixels = await sampleScanLine(imageUri, attackScanY, 0, dimensions.width, 200);
        const defensePixels = await sampleScanLine(imageUri, defenseScanY, 0, dimensions.width, 200);
        const hpPixels = await sampleScanLine(imageUri, hpScanY, 0, dimensions.width, 200);

        const attackIV = detectSegmentedIV(attackPixels, 'Attack');
        const defenseIV = detectSegmentedIV(defensePixels, 'Defense');
        const hpIV = detectSegmentedIV(hpPixels, 'HP');

        logIVResults(attackIV, defenseIV, hpIV, attackPixels, defensePixels, hpPixels);
        return { atk: attackIV, def: defenseIV, sta: hpIV };
    }

    // Use OCR-anchored bar positions
    console.log('[IV DEBUG] Using OCR-anchored bar positions:');
    console.log(`  Attack bar at Y: ${barPositions.attack}`);
    console.log(`  Defense bar at Y: ${barPositions.defense}`);
    console.log(`  HP bar at Y: ${barPositions.hp}`);
    console.log('');

    // Sample full width first to detect bar boundaries
    const attackPixelsFull = await sampleScanLine(imageUri, barPositions.attack, 0, dimensions.width, 400);
    const defensePixelsFull = await sampleScanLine(imageUri, barPositions.defense, 0, dimensions.width, 400);
    const hpPixelsFull = await sampleScanLine(imageUri, barPositions.hp, 0, dimensions.width, 400);

    // Detect bar boundaries
    const attackBounds = detectBarBounds(attackPixelsFull);
    const defenseBounds = detectBarBounds(defensePixelsFull);
    const hpBounds = detectBarBounds(hpPixelsFull);

    console.log('[IV DEBUG] Detected bar boundaries:');
    if (attackBounds) {
        console.log(`  Attack: X ${attackBounds.startX} → ${attackBounds.endX} (width: ${attackBounds.endX - attackBounds.startX}px)`);
    } else {
        console.log('  Attack: BOUNDS NOT DETECTED');
    }
    if (defenseBounds) {
        console.log(`  Defense: X ${defenseBounds.startX} → ${defenseBounds.endX} (width: ${defenseBounds.endX - defenseBounds.startX}px)`);
    } else {
        console.log('  Defense: BOUNDS NOT DETECTED');
    }
    if (hpBounds) {
        console.log(`  HP: X ${hpBounds.startX} → ${hpBounds.endX} (width: ${hpBounds.endX - hpBounds.startX}px)`);
    } else {
        console.log('  HP: BOUNDS NOT DETECTED');
    }
    console.log('');

    // Extract only the bar region pixels
    const attackPixels = attackBounds ? attackPixelsFull.slice(attackBounds.startX, attackBounds.endX) : [];
    const defensePixels = defenseBounds ? defensePixelsFull.slice(defenseBounds.startX, defenseBounds.endX) : [];
    const hpPixels = hpBounds ? hpPixelsFull.slice(hpBounds.startX, hpBounds.endX) : [];

    // Calculate IVs using segmented detection
    const attackIV = detectSegmentedIV(attackPixels, 'Attack');
    const defenseIV = detectSegmentedIV(defensePixels, 'Defense');
    const hpIV = detectSegmentedIV(hpPixels, 'HP');

    logIVResults(attackIV, defenseIV, hpIV, attackPixels, defensePixels, hpPixels);

    return {
        atk: attackIV,
        def: defenseIV,
        sta: hpIV,
    };
}

/**
 * Log IV results with debug information
 */
function logIVResults(
    attackIV: number,
    defenseIV: number,
    hpIV: number,
    attackPixels: number[][],
    defensePixels: number[][],
    hpPixels: number[][]
) {
    // DEBUG: Show sample pixels
    console.log('[DEBUG] Pixel Samples:');
    if (attackPixels.length > 0) {
        const sample = attackPixels.slice(0, 10);
        console.log(`Attack (first 10 pixels): ${sample.map(([r, g, b]) => `rgb(${r},${g},${b})`).join(', ')}`);
    }
    if (defensePixels.length > 0) {
        const sample = defensePixels.slice(0, 10);
        console.log(`Defense (first 10 pixels): ${sample.map(([r, g, b]) => `rgb(${r},${g},${b})`).join(', ')}`);
    }
    if (hpPixels.length > 0) {
        const sample = hpPixels.slice(0, 10);
        console.log(`HP (first 10 pixels): ${sample.map(([r, g, b]) => `rgb(${r},${g},${b})`).join(', ')}`);
    }
    console.log('');

    // SIMPLE, CLEAR LOGGING
    console.log('═══════════════════════════════════════');
    console.log('🔍 POKÉMON IV DETECTION RESULTS');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log(`⚔️  ATTACK:  ${attackIV}/15`);
    console.log(`🛡️  DEFENSE: ${defenseIV}/15`);
    console.log(`❤️  HP:      ${hpIV}/15`);
    console.log('');
    console.log(`📊 TOTAL IV: ${attackIV + defenseIV + hpIV}/45 (${Math.round((attackIV + defenseIV + hpIV) / 45 * 100)}%)`);
    console.log('═══════════════════════════════════════');
    console.log('');
}


/**
 * Detect IV by finding the right-most filled (orange) pixel
 * Scans right-to-left to handle segment gaps correctly
/**
 * Detect IV by finding the right-most filled (orange) pixel
 * Scans right-to-left to handle segment gaps correctly
 */
function detectSegmentedIV(pixels: number[][], statName: string): number {
    if (pixels.length < 30) return 0;

    // Sample last 10 pixels to see what we're looking at
    const lastPixels = pixels.slice(-10);
    console.log(`[IV CALC DEBUG] Last 10 pixels: ${lastPixels.map(([r, g, b]) => `rgb(${r},${g},${b})`).join(', ')}`);

    // Sample middle pixels
    const midStart = Math.floor(pixels.length / 2) - 5;
    const midPixels = pixels.slice(midStart, midStart + 10);
    console.log(`[IV CALC DEBUG] Middle 10 pixels: ${midPixels.map(([r, g, b]) => `rgb(${r},${g},${b})`).join(', ')}`);

    // Scan from RIGHT to LEFT to find the end of the filled bar
    // This avoids getting tricked by segment gaps (white spaces) which happen early in the bar
    let lastFilledIndex = 0;

    for (let i = pixels.length - 1; i >= 0; i--) {
        const [r, g, b] = pixels[i];

        // Strict Check: High Saturation (>60) AND Red Dominant (>Blue+50)
        // This filters out the faint glow at the end of the bar
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        const isRedDominant = r > b + 50;

        if (maxDiff > 60 && isRedDominant) {
            lastFilledIndex = i;
            console.log(`[IV CALC DEBUG] Found last filled pixel at ${i}, color: rgb(${r},${g},${b}), maxDiff: ${maxDiff}, R-B: ${r - b}`);
            break;
        }
    }

    // ADJUSTMENT: The detected bar bounds consistently include ~44px of "pre-bar" content (icons/padding) on the left.
    // We trim this effectively by subtracting it from both the filled index and total length.
    const LEFT_TRIM = 44;

    // Calculate effective total length first
    const effectiveTotalLength = Math.max(1, pixels.length - LEFT_TRIM);

    // DYNAMIC EDGE BUFFER (Resolution Independent)
    // 2.5% is the sweet spot:
    // - ~7-8px for High Res (Fixes Yamper Def glow)
    // - ~3px for Low Res (Preserves Cubchoo)
    const calculatedBuffer = Math.floor(effectiveTotalLength * 0.025);
    const EDGE_BUFFER = Math.max(2, calculatedBuffer);

    const effectiveFilledLength = Math.max(0, lastFilledIndex - LEFT_TRIM - EDGE_BUFFER);

    const fillRatio = effectiveFilledLength / effectiveTotalLength;

    console.log(`[IV CALC DEBUG] Len: ${effectiveTotalLength}px | Buffer: ${EDGE_BUFFER}px | Filled: ${effectiveFilledLength}px | Ratio: ${fillRatio.toFixed(3)}`);

    // ----------- ADAPTIVE RATIO ROUNDING (PHASE 7F) -----------
    // "Surgical Accuracy": Variable Bias
    // Low IVs have disproportionate glow/noise -> Strict Bias (0.05)
    // High IVs lose valid pixels to buffer -> Generous Bias (0.35)

    let bias: number;
    let iv: number;
    let method: string;

    if (fillRatio < 0.03) {
        iv = 0;
        method = 'force_zero (ratio < 0.03)';
    } else if (fillRatio > 0.97) {
        iv = 15;
        method = 'force_max (ratio > 0.97)';
    } else {
        // Variable Bias Threshold
        if (fillRatio < 0.40) {
            bias = 0.05; // Strict for low bars (prevents 2->3 jump)
        } else {
            bias = 0.35; // Generous for mid/high bars (restores 14->13 drop)
        }

        const raw = (fillRatio * 15) + bias;
        iv = Math.floor(raw);
        method = `floor(ratio*15 + ${bias})`;
    }

    // Safety clamp (0-15)
    iv = Math.max(0, Math.min(15, iv));

    // REQUIRED VERIFICATION LOG
    console.log(`[IV TUNE] stat=${statName} ratio=${fillRatio.toFixed(3)} rawIV=${(fillRatio * 15).toFixed(2)} roundedIV=${iv} method=${method}`);

    return iv;
}
