export type ShopItemCategory = 'normal' | 'legendary' | 'mythical';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ShopItemCategory;
    type: 'consumable' | 'effect';
    image?: any; // Placeholder for require()
}

export const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'extra_love',
        name: 'Extra Love',
        description: 'Pink glow and floating hearts background.',
        price: 200,
        category: 'legendary',
        type: 'effect',
    },
    {
        id: 'effect_neon_cyber',
        name: 'Neon Cyber',
        description: 'A futuristic glitch effect for your card.',
        price: 200,
        category: 'legendary',
        type: 'effect',
    },
    {
        id: 'effect_ghostly_mist',
        name: 'Ghostly Mist',
        description: 'Spooky fog that swirls around your Pokemon.',
        price: 200,
        category: 'legendary',
        type: 'effect',
    },
    {
        id: 'effect_golden_glory',
        name: 'Golden Glory',
        description: 'The ultimate status symbol. Pure gold.',
        price: 1000,
        category: 'mythical',
        type: 'effect',
    },
    {
        id: 'effect_icy_wind',
        name: 'Icy Wind',
        description: 'Chilling winds and falling snow.',
        price: 200,
        category: 'legendary',
        type: 'effect',
    },
    {
        id: 'effect_magma_storm',
        name: 'Magma Storm',
        description: 'Raging fire and molten lava border.',
        price: 200,
        category: 'legendary',
        type: 'effect',
    },
    {
        id: 'effect_frenzy_plant',
        name: 'Frenzy Plant',
        description: 'Unleash the power of nature!',
        price: 200,
        category: 'legendary',
        type: 'effect',
    },
    {
        id: 'effect_bubble_beam',
        name: 'Bubble Beam',
        description: 'Surrounded by bubbles and an aqua glow.',
        price: 200,
        category: 'legendary',
        type: 'effect',
    },
];
