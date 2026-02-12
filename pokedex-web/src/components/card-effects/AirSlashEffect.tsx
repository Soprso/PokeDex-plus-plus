import { Image, StyleSheet, View } from '@/components/native';
import { GlowBorder } from './GlowBorder';

// Use import for assets
import BACKGROUND_IMAGE from '@/assets/card-effects/air-slash.jpg';

export const AirSlashEffect = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image */}
            <Image
                source={BACKGROUND_IMAGE}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Glowing Border */}
            <GlowBorder color="#87CEEB" borderWidth={2} />
        </View>
    );
};

