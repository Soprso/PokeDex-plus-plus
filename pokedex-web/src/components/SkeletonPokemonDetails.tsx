import { Dimensions, StyleSheet, View } from '@/components/native';

const { width } = Dimensions.get('window');

export default function SkeletonPokemonDetails() {
    return (
        <View style={styles.container}>
            {/* Hero Section Skeleton */}
            <View style={styles.heroSkeleton}>
                <View style={styles.imageSkeleton} />
                <View style={styles.nameSkeleton} />
                <View style={styles.idSkeleton} />
                <View style={styles.typesSkeleton}>
                    <View style={styles.typeBadgeSkeleton} />
                    <View style={styles.typeBadgeSkeleton} />
                </View>
            </View>

            {/* About Section Skeleton */}
            <View style={styles.section}>
                <View style={styles.sectionTitleSkeleton} />
                <View style={styles.textLineSkeleton} />
                <View style={styles.textLineSkeleton} />
                <View style={styles.textLineSkeleton} />
            </View>

            {/* Stats Section Skeleton */}
            <View style={styles.section}>
                <View style={styles.sectionTitleSkeleton} />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} style={styles.statRowSkeleton}>
                        <View style={styles.statNameSkeleton} />
                        <View style={styles.statBarSkeleton} />
                        <View style={styles.statValueSkeleton} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    } as any,
    heroSkeleton: {
        paddingTop: 60,
        paddingBottom: 24,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    } as any,
    imageSkeleton: {
        width: width * 0.6,
        height: 200,
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        marginBottom: 20,
    } as any,
    nameSkeleton: {
        width: 180,
        height: 32,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 8,
    } as any,
    idSkeleton: {
        width: 60,
        height: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        marginBottom: 12,
    } as any,
    typesSkeleton: {
        flexDirection: 'row',
        gap: 10,
    } as any,
    typeBadgeSkeleton: {
        width: 80,
        height: 28,
        backgroundColor: '#e0e0e0',
        borderRadius: 14,
    } as any,
    section: {
        padding: 20,
    } as any,
    sectionTitleSkeleton: {
        width: 140,
        height: 24,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        marginBottom: 16,
    } as any,
    textLineSkeleton: {
        width: '100%',
        height: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 8,
    } as any,
    statRowSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    } as any,
    statNameSkeleton: {
        width: 90,
        height: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    } as any,
    statBarSkeleton: {
        flex: 1,
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginHorizontal: 8,
    } as any,
    statValueSkeleton: {
        width: 40,
        height: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    } as any,
});
