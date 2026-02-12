export const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];

import bugIcon from '@/assets/type-icons/bug.png';
import darkIcon from '@/assets/type-icons/dark.png';
import dragonIcon from '@/assets/type-icons/dragon.png';
import electricIcon from '@/assets/type-icons/electric.png';
import fairyIcon from '@/assets/type-icons/fairy.png';
import fightingIcon from '@/assets/type-icons/fighting.png';
import fireIcon from '@/assets/type-icons/fire.png';
import flyingIcon from '@/assets/type-icons/flying.png';
import ghostIcon from '@/assets/type-icons/ghost.png';
import grassIcon from '@/assets/type-icons/grass.png';
import groundIcon from '@/assets/type-icons/ground.png';
import iceIcon from '@/assets/type-icons/ice.png';
import normalIcon from '@/assets/type-icons/normal.png';
import poisonIcon from '@/assets/type-icons/poison.png';
import psychicIcon from '@/assets/type-icons/psychic.png';
import rockIcon from '@/assets/type-icons/rock.png';
import steelIcon from '@/assets/type-icons/steel.png';
import waterIcon from '@/assets/type-icons/water.png';

export const TYPE_ICONS: Record<PokemonType, any> = {
    normal: normalIcon,
    fire: fireIcon,
    water: waterIcon,
    electric: electricIcon,
    grass: grassIcon,
    ice: iceIcon,
    fighting: fightingIcon,
    poison: poisonIcon,
    ground: groundIcon,
    flying: flyingIcon,
    psychic: psychicIcon,
    bug: bugIcon,
    rock: rockIcon,
    ghost: ghostIcon,
    dragon: dragonIcon,
    dark: darkIcon,
    steel: steelIcon,
    fairy: fairyIcon,
};

// Type colors for card backgrounds
export const TYPE_COLORS: Record<PokemonType, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
};

import bgBug from '@/assets/type-backgrounds/bg_bug.png';
import bgDark from '@/assets/type-backgrounds/bg_dark.png';
import bgDefault from '@/assets/type-backgrounds/bg_default.png';
import bgDragon from '@/assets/type-backgrounds/bg_dragon.png';
import bgElectric from '@/assets/type-backgrounds/bg_electric.png';
import bgFairy from '@/assets/type-backgrounds/bg_fairy.png';
import bgFighting from '@/assets/type-backgrounds/bg_fighting.png';
import bgFire from '@/assets/type-backgrounds/bg_fire.png';
import bgFlying from '@/assets/type-backgrounds/bg_flying.png';
import bgGhost from '@/assets/type-backgrounds/bg_ghost.png';
import bgGrass from '@/assets/type-backgrounds/bg_grass.png';
import bgGround from '@/assets/type-backgrounds/bg_ground.png';
import bgIce from '@/assets/type-backgrounds/bg_ice.png';
import bgNormal from '@/assets/type-backgrounds/bg_normal.png';
import bgPoison from '@/assets/type-backgrounds/bg_poison.png';
import bgPsychic from '@/assets/type-backgrounds/bg_psychic.png';
import bgRock from '@/assets/type-backgrounds/bg_rock.png';
import bgSteel from '@/assets/type-backgrounds/bg_steel.png';
import bgWater from '@/assets/type-backgrounds/bg_water.png';

export const TYPE_BACKGROUNDS: Record<string, any> = {
    normal: bgNormal,
    fire: bgFire,
    water: bgWater,
    electric: bgElectric,
    grass: bgGrass,
    ice: bgIce,
    fighting: bgFighting,
    poison: bgPoison,
    ground: bgGround,
    flying: bgFlying,
    psychic: bgPsychic,
    bug: bgBug,
    rock: bgRock,
    ghost: bgGhost,
    dragon: bgDragon,
    dark: bgDark,
    steel: bgSteel,
    fairy: bgFairy,
    default: bgDefault,
};
