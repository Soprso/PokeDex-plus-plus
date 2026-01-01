import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { GlowBorder } from './GlowBorder';

const BACKGROUND_IMAGE = require('@/assets/card-effects/air-slash.jpg');

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

const styles = StyleSheet.create({});
