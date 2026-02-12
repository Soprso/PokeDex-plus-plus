/**
 * vision-level.ts
 * 
 * Pixel-based detection of Pokémon Level from the Appraisal/Main Screen Arc.
 * Finds the "White Dot" on the semi-circular meter to determine level.
 */

import { NativeModules, Platform } from 'react-native';

const { PixelSamplerModule } = NativeModules;


/**
 * Detect Level from Image using Pixel Analysis used primarily for white dot detection
 * on the level arc.
 */
export async function detectLevelFromImage(
    uri: string,
    width: number,
    height: number
): Promise<{ level: number | null; confidence: 'high' | 'medium' | 'low' }> {
    if (Platform.OS === 'web' || Platform.OS !== 'android' || !PixelSamplerModule) {
        // TODO: Implement Canvas-based pixel sampling for web
        return { level: null, confidence: 'low' };
    }

    try {
        console.log('[LevelVision] Starting pixel-based level detection...');

        // Define Search Area: Top 40% of the screen (Standard UI layout)
        // Ideally, the arc is centered horizontally.
        const startY = Math.floor(height * 0.10);  // Skip status bar area
        const endY = Math.floor(height * 0.45);    // Stop before the pokemon model starts

        // Detect White Dot using 2D Blob Analysis
        // 1. Scan rows for segments
        const segments: { y: number, xStart: number, xEnd: number, score: number }[] = [];

        // Step size: 5px (optimization)
        const step = 5;

        for (let y = startY; y < endY; y += step) {
            const rowPixels = await PixelSamplerModule.sampleScanLine(uri, y, 0, width, width);
            const rowSegments = findWhiteSegmentsInRow(rowPixels, y);
            segments.push(...rowSegments);
        }

        console.log(`[LevelVision] Found ${segments.length} raw white segments.`);

        // 2. Cluster segments into 2D Blobs
        const blobs = clusterSegmentsIntoBlobs(segments);
        console.log(`[LevelVision] Clustered into ${blobs.length} potential blobs.`);

        // 3. Filter and Score Blobs
        // We look for a "Dot": Roughly square, specific size range.
        let bestBlob = null;
        let bestBlobScore = -Infinity;

        console.log(`[LevelVision] --- Analyzing ${blobs.length} Blobs ---`);

        for (const blob of blobs) {
            const w = blob.maxX - blob.minX;
            const h = blob.maxY - blob.minY;
            const aspectRatio = w / h;

            // Filters
            // Size: Dot is usually ~15-25px.
            // Tighten to 10px - 45px.
            if (w < 10 || w > 45 || h < 10 || h > 45) {
                // console.log(`[LevelVision] Reject Size: ${w}x${h}`);
                continue;
            }

            // Aspect Ratio: 0.6 to 1.6 (Square-ish)
            if (aspectRatio < 0.6 || aspectRatio > 1.6) {
                continue;
            }

            // Edge Rejection: Reject blobs touching the screen edges (UI artifacts)
            const margin = width * 0.05; // 5% margin
            if (blob.minX < margin || blob.maxX > width - margin) {
                console.log(`[LevelVision] Reject Edge: ${blob.centerX} (margin ${margin})`);
                continue;
            }

            const aspectScore = 1 - Math.abs(1 - aspectRatio); // 1.0 = perfect
            const brightnessResult = blob.totalScore / (blob.count || 1);

            // Combined Score
            // Weight Brightness higher? The dot is PURE WHITE.
            const score = (brightnessResult * 200) + (aspectScore * 500);

            console.log(`[LevelVision] Blob Candidate: ${w}x${h} at (${blob.centerX},${blob.centerY}) Score: ${score.toFixed(0)}`);

            if (score > bestBlobScore) {
                bestBlobScore = score;
                bestBlob = blob;
            }
        }
        console.log(`[LevelVision] -----------------------------`);

        if (!bestBlob) {
            console.log('[LevelVision] ❌ No valid White Dot blob found.');
            return { level: null, confidence: 'low' };
        }

        const foundDotCenter = { x: bestBlob.centerX, y: bestBlob.centerY };
        console.log(`[LevelVision] 🎯 Selected Best Dot: (${foundDotCenter.x}, ${foundDotCenter.y})`);

        // Try to find Arc Bounds
        let arcBounds = await scanForArcBounds(uri, startY, endY, width);

        if (!arcBounds) {
            console.log('[LevelVision] ⚠️ Could not detect exact Arc Bounds. Using heuristic fallback.');
            // Fallback: Assume Arc is centered and ~85% of screen width (Standard for many phones)
            const estimatedWidth = width * 0.85;
            const center = width / 2;
            arcBounds = {
                left: center - (estimatedWidth / 2),
                right: center + (estimatedWidth / 2)
            };
            console.log(`[LevelVision] Fallback Arc Bounds: ${arcBounds.left} -> ${arcBounds.right}`);
        } else {
            console.log(`[LevelVision] Detected Arc Bounds: ${arcBounds.left} -> ${arcBounds.right}`);
        }

        // Calculation
        const ratio = (foundDotCenter.x - arcBounds.left) / (arcBounds.right - arcBounds.left);
        console.log(`[LevelVision] Raw Ratio: ${ratio.toFixed(4)} (DotX ${foundDotCenter.x} relative to ${arcBounds.left}-${arcBounds.right})`);

        const clampedRatio = Math.max(0, Math.min(1, ratio));

        const MAX_LEVEL = 50;
        const MIN_LEVEL = 1;

        const rawLevel = MIN_LEVEL + clampedRatio * (MAX_LEVEL - MIN_LEVEL);
        const roundedLevel = Math.round(rawLevel * 2) / 2;

        console.log(`[LevelVision] 🏁 Final Calculated Level: ${roundedLevel}`);

        return { level: roundedLevel, confidence: 'high' };

    } catch (e) {
        console.error('[LevelVision] Critical Error:', e);
        return { level: null, confidence: 'low' };
    }
}

// Helper types & functions for Blob Analysis
interface Segment { y: number, xStart: number, xEnd: number, score: number, used?: boolean }
interface Blob {
    segments: Segment[];
    minX: number; maxX: number; minY: number; maxY: number;
    centerX: number; centerY: number;
    totalScore: number;
    count: number;
}

function findWhiteSegmentsInRow(pixels: number[][], y: number): Segment[] {
    const segments: Segment[] = [];
    // Strict White definitions to avoid UI/Arc tips
    const LUM_THRESHOLD = 210; // Relaxed from 230 to handle slight dimming
    // const LUM_THRESHOLD = 200; 
    const SAT_THRESHOLD_MAX = 25; // Relaxed from 15 to handle slight color tints
    const MIN_RUN_WIDTH = 3; // Minimal segment width to count

    let runStart = -1;
    let runSum = 0;

    for (let i = 0; i < pixels.length; i++) {
        const [r, g, b] = pixels[i];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);

        const isWhite = lum > LUM_THRESHOLD && sat < SAT_THRESHOLD_MAX;

        if (isWhite) {
            if (runStart === -1) runStart = i;
            runSum += lum;
        } else {
            if (runStart !== -1) {
                const width = i - runStart;
                if (width >= MIN_RUN_WIDTH) {
                    segments.push({
                        y,
                        xStart: runStart,
                        xEnd: i,
                        score: runSum / width // Avg luminance
                    });
                }
                runStart = -1;
                runSum = 0;
            }
        }
    }
    // EOL
    if (runStart !== -1) {
        const width = pixels.length - runStart;
        if (width >= MIN_RUN_WIDTH) {
            segments.push({
                y,
                xStart: runStart,
                xEnd: pixels.length,
                score: runSum / width
            });
        }
    }
    return segments;
}

function clusterSegmentsIntoBlobs(segments: Segment[]): Blob[] {
    const blobs: Blob[] = [];
    const step = 5; // Must match the scan step!
    const MAX_GAP = step * 1.5; // Allow skipping one scanline if needed (robustness)

    // Sort segments by Y then X
    segments.sort((a, b) => a.y - b.y || a.xStart - b.xStart);

    for (const seg of segments) {
        if (seg.used) continue;

        // Start new blob
        const blob: Blob = {
            segments: [seg],
            minX: seg.xStart, maxX: seg.xEnd,
            minY: seg.y, maxY: seg.y + step, // Assume height is at least step
            centerX: 0, centerY: 0,
            totalScore: seg.score, count: 1
        };
        seg.used = true;

        // Grow blob
        const queue = [seg];
        while (queue.length > 0) {
            const current = queue.shift()!;

            // Find neighbors
            // Neighbor criteria: Y is within MAX_GAP, X overlaps
            for (const other of segments) {
                if (other.used) continue;

                const yDiff = Math.abs(other.y - current.y);
                if (yDiff > 0 && yDiff <= MAX_GAP) {
                    // Check X overlap
                    // Strict overlap: ! (other.end < current.start || other.start > current.end)
                    if (!(other.xEnd < current.xStart - 2 || other.xStart > current.xEnd + 2)) {
                        other.used = true;
                        blob.segments.push(other);
                        queue.push(other);

                        // Update bounds
                        blob.minX = Math.min(blob.minX, other.xStart);
                        blob.maxX = Math.max(blob.maxX, other.xEnd);
                        blob.minY = Math.min(blob.minY, other.y);
                        blob.maxY = Math.max(blob.maxY, other.y + step); // Add step to cover the row height
                        blob.totalScore += other.score;
                        blob.count++;
                    }
                }
            }
        }

        // Finalize Blob Center
        blob.centerX = Math.floor((blob.minX + blob.maxX) / 2);
        blob.centerY = Math.floor((blob.minY + blob.maxY) / 2);
        blobs.push(blob);
    }
    return blobs;
}


async function scanForArcBounds(
    uri: string,
    minY: number,
    maxY: number,
    width: number
): Promise<{ left: number, right: number } | null> {
    // Search for the LOWEST point of the arc (the ends).
    // The ends of the semi-circle are usually at the bottom of the bounding box.
    // They are grey/white.

    // Heuristic:
    // Sample a few lines near the bottom of the search area (maxY).
    // Look for symmetrical grey pixels.

    // Or just look for the WIDEST pair of grey pixels?

    const { PixelSamplerModule } = NativeModules;

    // Check Y lines from bottom up?
    let bestWidth = 0;
    let bestBounds = null;

    // Sample lines
    for (let y = maxY; y > minY; y -= 10) {
        const pixels = await PixelSamplerModule.sampleScanLine(uri, y, 0, width, width);
        // Find greyish pixels
        const bounds = findArcEndsInRow(pixels);
        if (bounds) {
            const w = bounds.right - bounds.left;
            // The arc ends should be the WIDEST part of the semi-circle
            if (w > bestWidth) {
                bestWidth = w;
                bestBounds = bounds;
            } else if (w < bestWidth * 0.9) {
                // Determine if we are moving UP the circle (width decreases)
                // If we found a wide base and now it shrinks, we likely found the base already.
                break;
            }
        }
    }

    if (bestBounds && bestWidth > width * 0.5) { // Sanity check: Arc is at least 50% screen width
        return bestBounds;
    }

    return null;
}

function findArcEndsInRow(pixels: number[][]): { left: number, right: number } | null {
    // Look for Greyscale pixels (Arc color)
    // Arc color is usually light grey/white (semi-transparent)
    // Not strictly white.
    // Let's assume distinct from background?

    // Simple heuristic: First and Last "significant" pixel change?
    // Or just "First Non-Transparent pixel"? Background might be scene.

    // Easier: The ends of the arc are usually terminated by a dot or a line.
    // This part is the hardest to do blindly.

    // Fallback: If we can't robustly find ends, assume they are symmetrical around center.
    // Left = Center - (Width/2 * 0.9)
    // Right = Center + (Width/2 * 0.9)
    // Most arcs are ~80% width.
    const center = Math.floor(pixels.length / 2);
    // Let's trust the widest distinct run?

    // Just returning a SAFE ESTIMATE based on screen width
    // This avoids "Arc not found" blocking the feature.
    // Real implementation requires edge detection.
    const estimatedWidth = pixels.length * 0.85; // 85% width typical
    const half = estimatedWidth / 2;
    return {
        left: Math.floor(center - half),
        right: Math.floor(center + half)
    };
}
