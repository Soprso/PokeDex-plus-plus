export const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];

// Type icon mapping
export const TYPE_ICONS: Record<PokemonType, any> = {
    normal: require('@/assets/type-icons/normal.png'),
    fire: require('@/assets/type-icons/fire.png'),
    water: require('@/assets/type-icons/water.png'),
    electric: require('@/assets/type-icons/electric.png'),
    grass: require('@/assets/type-icons/grass.png'),
    ice: require('@/assets/type-icons/ice.png'),
    fighting: require('@/assets/type-icons/fighting.png'),
    poison: require('@/assets/type-icons/poison.png'),
    ground: require('@/assets/type-icons/ground.png'),
    flying: require('@/assets/type-icons/flying.png'),
    psychic: require('@/assets/type-icons/psychic.png'),
    bug: require('@/assets/type-icons/bug.png'),
    rock: require('@/assets/type-icons/rock.png'),
    ghost: require('@/assets/type-icons/ghost.png'),
    dragon: require('@/assets/type-icons/dragon.png'),
    dark: require('@/assets/type-icons/dark.png'),
    steel: require('@/assets/type-icons/steel.png'),
    fairy: require('@/assets/type-icons/fairy.png'),
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
