import { StyleSheet, Text, View } from '@/components/native';
import { Ionicons } from '@/components/native/Icons';
import ImageDebugOverlay from '../debug/ImageDebugOverlay';
import IVBar from './IVBar';

// Helper to get color for Total IV%
const getIVColor = (percent: number) => {
    if (percent >= 90) return '#4CAF50'; // Green
    if (percent >= 70) return '#FF9800'; // Orange/Yellow
    return '#FF3B30'; // Red
};
export type PokemonDisplayData = {
    name: string | null;
    cp: number | null;
    hp: number | null;
    level: number | null;
    iv: {
        atk: number;
        def: number;
        sta: number;
        percent: number;
    } | null;
    imageUri: string;
    barPositions?: {
        attack?: number;
        defense?: number;
        hp?: number;
    };
    scannedAt?: number;
};

interface PokemonDetailViewProps {
    data: PokemonDisplayData;
    children?: React.ReactNode;
}

export default function PokemonDetailView({ data, children }: PokemonDetailViewProps) {
    return (
        <>
            {/* Screenshot Preview */}
            <View style={styles.imageContainer as any}>
                <ImageDebugOverlay imageUri={data.imageUri} barPositions={data.barPositions} />
                {data.iv && (
                    <View style={styles.ivBadge as any}>
                        <Text style={styles.ivBadgeText as any}>{data.iv.percent}%</Text>
                    </View>
                )}
            </View>

            {/* Name Header */}
            <View style={styles.nameContainer as any}>
                <Text style={styles.nameText as any}>{data.name || 'Unknown Pokémon'}</Text>
            </View>

            {/* Stats Card - 3 Column Layout */}
            <View style={styles.statsCard as any}>
                <View style={styles.statColumn as any}>
                    <Text style={styles.statLabel as any}>CP</Text>
                    <Text style={(data.cp ? styles.statValue : styles.statPlaceholder) as any}>
                        {data.cp ?? '—'}
                    </Text>
                </View>

                <View style={styles.statDivider as any} />

                <View style={styles.statColumn as any}>
                    <Text style={styles.statLabel as any}>Level</Text>
                    <Text style={(data.level ? styles.statValue : styles.statPlaceholder) as any}>
                        {data.level ? `Lv. ${data.level}` : '—'}
                    </Text>
                </View>

                <View style={styles.statDivider as any} />

                <View style={styles.statColumn as any}>
                    <Text style={styles.statLabel as any}>HP</Text>
                    <Text style={(data.hp ? styles.statValue : styles.statPlaceholder) as any}>
                        {data.hp ?? '—'}
                    </Text>
                </View>
            </View>

            {/* IV Section */}
            <View style={styles.ivCard as any}>
                <View style={styles.ivHeader as any}>
                    <Text style={styles.ivCardTitle as any}>Individual Values</Text>
                    {data.iv && (
                        <View style={[styles.ivTotalBadge, { backgroundColor: getIVColor(data.iv.percent) }] as any}>
                            <Text style={styles.ivTotalText as any}>{data.iv.percent}%</Text>
                        </View>
                    )}
                </View>

                {data.iv ? (
                    <>
                        <IVBar value={data.iv.atk} label="Attack" />
                        <View style={styles.spacer as any} />
                        <IVBar value={data.iv.def} label="Defense" />
                        <View style={styles.spacer as any} />
                        <IVBar value={data.iv.sta} label="HP" />
                    </>
                ) : (
                    <View style={styles.ivPlaceholder as any}>
                        <Ionicons name="information-circle-outline" size={32} color="#ccc" />
                        <Text style={styles.ivPlaceholderText as any}>IV data not available</Text>
                    </View>
                )}
            </View>

            {/* Meta Info */}
            {data.scannedAt && (
                <View style={styles.metaContainer as any}>
                    <Text style={styles.metaText as any}>
                        Scanned on {new Date(data.scannedAt).toLocaleDateString()}
                    </Text>
                </View>
            )}

            {/* Action Slot */}
            {children && <View style={styles.actionsContainer as any}>{children}</View>}
        </>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 400,
    },
    ivBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    ivBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    nameContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    nameText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    statColumn: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 12,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    statPlaceholder: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ccc',
    },
    ivCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    ivCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    ivHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    ivTotalBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ivTotalText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    spacer: {
        height: 12,
    },
    ivPlaceholder: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    ivPlaceholderText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    metaContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
    },
    actionsContainer: {
        marginHorizontal: 16,
        marginBottom: 32,
    },
});
