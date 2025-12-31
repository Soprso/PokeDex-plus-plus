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
        description: 'Grant one extra heart interaction today!',
        price: 200,
        category: 'normal',
        type: 'consumable',
    },
    {
        id: 'effect_neon_cyber',
        name: 'Neon Cyber',
        description: 'A futuristic glitch effect for your card.',
        price: 500,
        category: 'legendary',
        type: 'effect',
    },
    {
        id: 'effect_ghostly_mist',
        name: 'Ghostly Mist',
        description: 'Spooky fog that swirls around your Pokemon.',
        price: 750,
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
];
