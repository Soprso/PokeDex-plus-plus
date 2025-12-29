import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import ImageDebugOverlay from '../debug/ImageDebugOverlay';

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
            <View style={styles.imageContainer}>
                <ImageDebugOverlay imageUri={data.imageUri} barPositions={data.barPositions} />
                {data.iv && (
                    <View style={styles.ivBadge}>
                        <Text style={styles.ivBadgeText}>{data.iv.percent}%</Text>
                    </View>
                )}
            </View>

            {/* Name Header */}
            <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{data.name || 'Unknown Pokémon'}</Text>
            </View>

            {/* Stats Card - 3 Column Layout */}
            <View style={styles.statsCard}>
                <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>CP</Text>
                    <Text style={data.cp ? styles.statValue : styles.statPlaceholder}>
                        {data.cp ?? '—'}
                    </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>HP</Text>
                    <Text style={data.hp ? styles.statValue : styles.statPlaceholder}>
                        {data.hp ?? '—'}
                    </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>Level</Text>
                    <Text style={data.level ? styles.statValue : styles.statPlaceholder}>
                        {data.level ?? '—'}
                    </Text>
                </View>
            </View>

            {/* IV Section */}
            <View style={styles.ivCard}>
                <Text style={styles.ivCardTitle}>Individual Values</Text>

                {data.iv ? (
                    <>
                        <View style={styles.ivRow}>
                            <Text style={styles.ivLabel}>Attack</Text>
                            <Text style={styles.ivValue}>{data.iv.atk}/15</Text>
                        </View>

                        <View style={styles.ivRow}>
                            <Text style={styles.ivLabel}>Defense</Text>
                            <Text style={styles.ivValue}>{data.iv.def}/15</Text>
                        </View>

                        <View style={styles.ivRow}>
                            <Text style={styles.ivLabel}>Stamina</Text>
                            <Text style={styles.ivValue}>{data.iv.sta}/15</Text>
                        </View>

                        <View style={styles.ivPercentContainer}>
                            <Text style={styles.ivPercentLabel}>Total IV</Text>
                            <Text style={styles.ivPercentValue}>{data.iv.percent}%</Text>
                        </View>
                    </>
                ) : (
                    <View style={styles.ivPlaceholder}>
                        <Ionicons name="information-circle-outline" size={32} color="#ccc" />
                        <Text style={styles.ivPlaceholderText}>IV data not available</Text>
                    </View>
                )}
            </View>

            {/* Meta Info */}
            {data.scannedAt && (
                <View style={styles.metaContainer}>
                    <Text style={styles.metaText}>
                        Scanned on {new Date(data.scannedAt).toLocaleDateString()}
                    </Text>
                </View>
            )}

            {/* Action Slot */}
            {children && <View style={styles.actionsContainer}>{children}</View>}
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
    ivRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    ivLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },
    ivValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    ivPercentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
    },
    ivPercentLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    ivPercentValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4CAF50',
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
