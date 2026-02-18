export type ShopItemCategory = 'normal' | 'legendary' | 'mythical';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ShopItemCategory;
    type: 'consumable' | 'effect' | 'frame';
    currency?: 'coins' | 'usd'; // Default to 'coins'
    rewardAmount?: number; // For coin bundles
    image?: any; // Placeholder for require()
    localPrices?: Record<string, number>; // Specific prices for different currencies (e.g. INR: 80)
}

export const SHOP_ITEMS: ShopItem[] = [
    // ... existing items ...
    {
        id: 'frame_gold',
        name: 'Gold Frame',
        description: 'A luxurious golden frame for your card.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_diamond',
        name: 'Diamond Frame',
        description: 'A platinum frame with sparkling diamond corners.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_fire',
        name: 'Fire Frame',
        description: 'A blazing frame — flames erupt from the top of your card.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_ice',
        name: 'Ice Frost Frame',
        description: 'Crystalline ice shards grow from the edges with a frozen cracked-glass border.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_electric',
        name: 'Electric Frame',
        description: 'Lightning bolts arc around the border with crackling spark bursts at the corners.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_void',
        name: 'Void Frame',
        description: 'A swirling dark vortex border with glitch distortion. Shadow Pokémon vibes.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_water',
        name: 'Water Frame',
        description: 'Animated waves crash at the bottom with bubbles rising along the sides.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_poison',
        name: 'Poison Frame',
        description: 'Toxic green slime drips from the top edge with a sickly purple-green glow.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_rainbow',
        name: 'Rainbow Frame',
        description: 'A prismatic rainbow shimmer with golden star particles orbiting your card.',
        price: 1000,
        category: 'mythical',
        type: 'frame',
    },
    {
        id: 'frame_eclipse',
        name: 'Eclipse Frame',
        description: 'A dark sun eclipse crowns the top with a glowing corona and rotating rays.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'frame_nature',
        name: 'Nature Frame',
        description: 'Animated vines and leaves grow along the border with blooming corner flowers.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },

    {
        id: 'frame_neon',
        name: 'Neon Frame',
        description: 'A pulsating neon green border.',
        price: 200,
        category: 'normal',
        type: 'frame',
    },
    {
        id: 'extra_love',
        name: 'Extra Love',
        description: 'Pink glow and floating hearts background.',
        price: 200,
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'effect_neon_cyber',
        name: 'Neon Cyber',
        description: 'A futuristic glitch effect for your card.',
        price: 200,
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'effect_ghostly_mist',
        name: 'Ghostly Mist',
        description: 'Spooky fog that swirls around your Pokemon.',
        price: 200,
        category: 'normal',
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
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'effect_magma_storm',
        name: 'Magma Storm',
        description: 'Raging fire and molten lava border.',
        price: 200,
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'effect_frenzy_plant',
        name: 'Frenzy Plant',
        description: 'Unleash the power of nature!',
        price: 200,
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'effect_bubble_beam',
        name: 'Bubble Beam',
        description: 'Surrounded by bubbles and an aqua glow.',
        price: 200,
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'effect_air_slash',
        name: 'Air Slash',
        description: 'Soar through the skies with a blue glow.',
        price: 200,
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'effect_rock_tomb',
        name: 'Rock Tomb',
        description: 'Sand particles flowing across a rocky landscape.',
        price: 200,
        category: 'normal',
        type: 'effect',
    },
    {
        id: 'buddy_interaction',
        name: 'Buddy Interaction',
        description: 'Get +1 Buddy Interaction for today.',
        price: 200,
        category: 'normal',
        type: 'consumable',
    },
    // Coin Bundles
    {
        id: 'coins_small',
        name: 'Handful of Coins',
        description: '1,000 Dex Coins to start your journey.',
        price: 5.00,
        category: 'normal',
        type: 'consumable',
        currency: 'usd',
        rewardAmount: 1000,
    },
    {
        id: 'coins_medium',
        name: 'Sack of Coins',
        description: '2,000 Dex Coins. Great value!',
        price: 10.00,
        category: 'normal',
        type: 'consumable',
        currency: 'usd',
        rewardAmount: 2000,
    },
    {
        id: 'coins_large',
        name: 'Chest of Coins',
        description: '10,000 Dex Coins. For the serious collector.',
        price: 25.00,
        category: 'mythical', // Stylistic choice for highest tier
        type: 'consumable',
        currency: 'usd',
        rewardAmount: 10000,
    },
    {
        id: 'coins_stack',
        name: 'A Stack of Coins',
        description: '200 Dex Coins. A quick boost!',
        price: 0.96,
        category: 'normal',
        type: 'consumable',
        currency: 'usd',
        rewardAmount: 200,
        localPrices: {
            'INR': 80
        }
    },
];
