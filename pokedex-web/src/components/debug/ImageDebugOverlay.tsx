import { Image, StyleSheet, View } from '@/components/native';
import { useEffect, useState } from 'react';
import {
    calculateBarRegions,
    DEBUG_VISION,
    getScanLineY,
    sampleIVBars,
    type ImageDimensions
} from '../../services/vision-debug';

interface ImageDebugOverlayProps {
    imageUri: string;
    onDimensionsReady?: (dimensions: ImageDimensions) => void;
    barPositions?: { attack?: number; defense?: number; hp?: number };
}

export default function ImageDebugOverlay({ imageUri, onDimensionsReady, barPositions }: ImageDebugOverlayProps) {
    const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);

    useEffect(() => {
        // Get image dimensions
        // For web, we can create an Image object to get dimensions
        const img = new window.Image();
        img.onload = () => {
            const dims = { width: img.width, height: img.height };
            setDimensions(dims);
            onDimensionsReady?.(dims);

            // Trigger IV sampling for debugging
            if (DEBUG_VISION) {
                sampleIVBars(imageUri, dims, barPositions);
            }
        };
        img.onerror = (err) => {
            console.error('Failed to get image dimensions:', err);
        };
        img.src = imageUri;
    }, [imageUri, barPositions]);

    if (!DEBUG_VISION || !dimensions) {
        // Just show the image without overlay
        return (
            <View style={styles.container}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            </View>
        );
    }

    const regions = calculateBarRegions(dimensions);

    // Calculate scan line positions
    const attackScanY = getScanLineY(regions.attack);
    const defenseScanY = getScanLineY(regions.defense);
    const hpScanY = getScanLineY(regions.hp);

    return (
        <View style={styles.container}>
            {/* Base image */}
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

            {/* Debug overlay */}
            <View style={styles.overlayContainer}>
                <svg width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Attack bar overlay (red) */}
                    <rect
                        x={regions.attack.x}
                        y={regions.attack.y}
                        width={regions.attack.width}
                        height={regions.attack.height}
                        fill="red"
                        opacity={0.2}
                    />

                    {/* Defense bar overlay (blue) */}
                    <rect
                        x={regions.defense.x}
                        y={regions.defense.y}
                        width={regions.defense.width}
                        height={regions.defense.height}
                        fill="blue"
                        opacity={0.2}
                    />

                    {/* HP bar overlay (green) */}
                    <rect
                        x={regions.hp.x}
                        y={regions.hp.y}
                        width={regions.hp.width}
                        height={regions.hp.height}
                        fill="green"
                        opacity={0.2}
                    />

                    {/* Attack scan line (yellow) */}
                    <line
                        x1={regions.attack.x}
                        y1={attackScanY}
                        x2={regions.attack.x + regions.attack.width}
                        y2={attackScanY}
                        stroke="yellow"
                        strokeWidth={2}
                        opacity={1}
                    />

                    {/* Defense scan line (yellow) */}
                    <line
                        x1={regions.defense.x}
                        y1={defenseScanY}
                        x2={regions.defense.x + regions.defense.width}
                        y2={defenseScanY}
                        stroke="yellow"
                        strokeWidth={2}
                        opacity={1}
                    />

                    {/* HP scan line (yellow) */}
                    <line
                        x1={regions.hp.x}
                        y1={hpScanY}
                        x2={regions.hp.x + regions.hp.width}
                        y2={hpScanY}
                        stroke="yellow"
                        strokeWidth={2}
                        opacity={1}
                    />
                </svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
        aspectRatio: 9 / 16, // Typical phone screenshot ratio
        backgroundColor: '#000',
    } as any,
    image: {
        width: '100%',
        height: '100%',
    } as any,
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    } as any,
    svg: {
        position: 'absolute',
        top: 0,
        left: 0,
    } as any,
});
