import { StyleSheet, View } from '@/components/native';
import React from 'react';

// Import individual effect components
import BugEffect from './type-effects/BugEffect';
import DarkEffect from './type-effects/DarkEffect';
import DragonEffect from './type-effects/DragonEffect';
import ElectricEffect from './type-effects/ElectricEffect';
import FairyEffect from './type-effects/FairyEffect';
import FightingEffect from './type-effects/FightingEffect';
import FireEffect from './type-effects/FireEffect';
import FlyingEffect from './type-effects/FlyingEffect';
import GhostEffect from './type-effects/GhostEffect';
import GrassEffect from './type-effects/GrassEffect';
import GroundEffect from './type-effects/GroundEffect';
import IceEffect from './type-effects/IceEffect';
import NormalEffect from './type-effects/NormalEffect';
import PoisonEffect from './type-effects/PoisonEffect';
import PsychicEffect from './type-effects/PsychicEffect';
import RockEffect from './type-effects/RockEffect';
import SteelEffect from './type-effects/SteelEffect';
import WaterEffect from './type-effects/WaterEffect';

interface TypeEffectOverlayProps {
    type: string;
}

const TYPE_EFFECT_MAP: Record<string, React.ComponentType> = {
    water: WaterEffect,
    fire: FireEffect,
    grass: GrassEffect,
    electric: ElectricEffect,
    flying: FlyingEffect,
    rock: RockEffect,
    ground: GroundEffect,
    ice: IceEffect,
    psychic: PsychicEffect,
    ghost: GhostEffect,
    dragon: DragonEffect,
    dark: DarkEffect,
    steel: SteelEffect,
    fairy: FairyEffect,
    poison: PoisonEffect,
    bug: BugEffect,
    fighting: FightingEffect,
    normal: NormalEffect,
};

export default function TypeEffectOverlay({ type }: TypeEffectOverlayProps) {
    const EffectComponent = TYPE_EFFECT_MAP[type.toLowerCase()];

    if (!EffectComponent) {
        return null;
    }

    return (
        <View style={styles.container} pointerEvents="none">
            <EffectComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
});
