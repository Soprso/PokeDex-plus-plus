export const REGIONS = [
    { name: "Kanto", offset: 0, limit: 151 },
    { name: "Johto", offset: 151, limit: 100 },
    { name: "Hoenn", offset: 251, limit: 135 },
    { name: "Sinnoh", offset: 386, limit: 107 },
    { name: "Unova", offset: 493, limit: 156 },
    { name: "Kalos", offset: 649, limit: 72 },
    { name: "Alola", offset: 721, limit: 88 },
    { name: "Galar", offset: 809, limit: 96 },
    { name: "Paldea", offset: 905, limit: 120 },
] as const;

export type Region = typeof REGIONS[number];
