
import { 
  TrendingItem, 
  DiscoverableItem, 
  User, 
  Message, 
  Conversation,
  World,
  Character,
  Story,
  Party,
  Post,
  Comment,
  UserCreation,
  MemeTemplate,
  SparkCardTemplate,
  SparkCard,
  Notification,
  Community,
  ShopItem
} from './types';

// --- SPARK CLASH DATA ---

export const cardTemplates: SparkCardTemplate[] = [
    {
        id: '1',
        name: 'Solar Strike',
        description: 'A blazing fast attack that burns the enemy.',
        energyCost: 1,
        type: 'Attack',
        element: 'Solar',
        rarity: 'Common',
        baseStats: { damage: 5 },
        effectType: 'Burn',
        effectValue: 3,
        price: 10
    },
    {
        id: '2',
        name: 'Terra Shield',
        description: 'Raise a wall of earth. Resists Lunar attacks.',
        energyCost: 2,
        type: 'Defense',
        element: 'Terra',
        rarity: 'Common',
        baseStats: { shield: 12 },
        effectType: 'None',
        price: 15
    },
    {
        id: '3',
        name: 'Lunar Focus',
        description: 'Channel the moon to restore health and energy.',
        energyCost: 1,
        type: 'Utility',
        element: 'Lunar',
        rarity: 'Rare',
        baseStats: { manaRecovery: 2 },
        effectType: 'Heal',
        effectValue: 5,
        price: 50
    },
    {
        id: '4',
        name: 'Solar Flare',
        description: 'Hurl a ball of fire causing massive burn.',
        energyCost: 3,
        type: 'Attack',
        element: 'Solar',
        rarity: 'Rare',
        baseStats: { damage: 15 },
        effectType: 'Burn',
        effectValue: 8,
        price: 60
    },
    {
        id: '5',
        name: 'Heavy Quake',
        description: 'A slow but devastating earth blow. Stuns the enemy.',
        energyCost: 3,
        type: 'Attack',
        element: 'Terra',
        rarity: 'Common',
        baseStats: { damage: 10 },
        effectType: 'Stun',
        effectValue: 1,
        price: 30
    },
    {
        id: '6',
        name: 'Tidal Wave',
        description: 'A flowing attack that washes away pain.',
        energyCost: 2,
        type: 'Attack',
        element: 'Lunar',
        rarity: 'Common',
        baseStats: { damage: 8 },
        effectType: 'Heal',
        effectValue: 8,
        price: 20
    },
    {
        id: '99',
        name: 'Void Singularity',
        description: 'Unleash the full power of the Void. Crushes all elements.',
        energyCost: 0,
        type: 'Ultimate',
        element: 'Void',
        rarity: 'Ultimate',
        baseStats: { damage: 50, shield: 20, manaRecovery: 1 },
        effectType: 'Stun',
        effectValue: 1,
        price: 9999
    }
];

// Helper to generate a starter inventory
const createMockCard = (id: string, templateId: string, charId: number, ownerId: number): SparkCard => ({
    id,
    templateId,
    ownerId,
    characterId: charId,
    customName: cardTemplates.find(t => t.id === templateId)?.name || 'Card'
});

// --- USER DATA ---

export const currentUser: User = {
    id: 100,
    name: 'Alex Walker',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    bio: 'Sci-fi enthusiast and world builder. Looking for a group to play cyberpunk campaigns.',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    pronouns: 'he/him',
    age: '24',
    gender: 'Male',
    nationality: 'United Kingdom',
    characterTags: ['Sci-Fi', 'Tech', 'Strategy'],
    followingIds: [103, 104],
    communityIds: [1], // Member of "The Voidwalkers"
    skynetStatus: { warningCount: 0, isMuted: false },
    isPremium: false,
    sparkClashProfile: {
        battlePower: 1250,
        sparks: 500, 
        wins: 5,
        losses: 2,
        inventory: [
            // Starter cards for Kaelen (ID 1)
            createMockCard('101', '1', 1, 100), createMockCard('102', '1', 1, 100), createMockCard('103', '6', 1, 100),
            createMockCard('104', '2', 1, 100), createMockCard('105', '2', 1, 100), createMockCard('106', '4', 1, 100),
            // Starter cards for Lyra (ID 4)
            createMockCard('201', '1', 4, 100), createMockCard('202', '3', 4, 100), createMockCard('203', '3', 4, 100),
            createMockCard('204', '2', 4, 100), createMockCard('205', '5', 4, 100), createMockCard('206', '5', 4, 100),
            // More generics to allow deck building
            createMockCard('301', '1', 1, 100), createMockCard('302', '6', 1, 100), createMockCard('303', '1', 1, 100),
            createMockCard('304', '2', 4, 100), createMockCard('305', '2', 4, 100), createMockCard('306', '3', 4, 100),
            createMockCard('307', '4', 1, 100), createMockCard('308', '5', 1, 100), createMockCard('309', '1', 1, 100),
            createMockCard('310', '2', 1, 100), createMockCard('311', '2', 1, 100), createMockCard('312', '1', 4, 100),
        ], 
        templates: ['1', '1', '2'], 
        decks: [],
    }
};

export const allUsers: User[] = [
    currentUser,
    {
        id: 101,
        name: 'Sarah Jenkins',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        sparkClashProfile: { battlePower: 2400, sparks: 0, wins: 20, losses: 5, inventory: [], templates: [], decks: [] }
    },
    {
        id: 102,
        name: 'Mike Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
        sparkClashProfile: { battlePower: 800, sparks: 0, wins: 1, losses: 8, inventory: [], templates: [], decks: [] }
    },
    {
        id: 103,
        name: 'Elara Vane',
        avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200&auto=format&fit=crop',
        sparkClashProfile: { battlePower: 3100, sparks: 0, wins: 50, losses: 10, inventory: [], templates: [], decks: [] }
    },
    {
        id: 104,
        name: 'Darius Black',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
        sparkClashProfile: { battlePower: 1800, sparks: 0, wins: 15, losses: 15, inventory: [], templates: [], decks: [] }
    }
];

// --- SHOP ITEMS ---
export const shopItems: ShopItem[] = [
    {
        id: 'bundle_1',
        type: 'bundle',
        name: 'Handful of Sparks',
        description: 'Perfect for a quick boost.',
        price: 0.99,
        currencyAmount: 100,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/272/272525.png'
    },
    {
        id: 'bundle_2',
        type: 'bundle',
        name: 'Pouch of Sparks',
        description: 'The standard adventurer\'s choice.',
        price: 4.99,
        currencyAmount: 550,
        highlight: true,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/2904/2904973.png'
    },
    {
        id: 'bundle_3',
        type: 'bundle',
        name: 'Chest of Sparks',
        description: 'Stock up for the long haul.',
        price: 9.99,
        currencyAmount: 1200,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3014/3014736.png'
    },
    {
        id: 'sub_1',
        type: 'subscription',
        name: 'Spark Premium',
        description: 'The ultimate creator experience.',
        price: 9.99,
        perks: [
            '1,000 Sparks Monthly Allowance',
            'Unlimited AI Text Generation',
            'Priority Image Generation',
            'Gold Profile Badge & Name Color',
            'Create Unlimited Worlds & Characters'
        ]
    },
    {
        id: 'cosm_1',
        type: 'cosmetic',
        name: 'Neon Cyberpunk Profile',
        description: 'A glowing animated profile frame and background.',
        price: 500, // Sparks
        imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=200&auto=format&fit=crop'
    },
    {
        id: 'cosm_2',
        type: 'cosmetic',
        name: 'Golden Dragon Dice',
        description: 'Special particle effects for your dice rolls.',
        price: 300, // Sparks
        imageUrl: 'https://images.unsplash.com/photo-1595757816291-ab4c1cba0fc2?q=80&w=200&auto=format&fit=crop'
    },
    {
        id: 'gift_1',
        type: 'cosmetic',
        name: 'Gift: Nitro Boost',
        description: 'Send 200 Sparks to a friend.',
        price: 250, // Sparks
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/4213/4213958.png'
    },
    {
        id: 'tool_1',
        type: 'tool',
        name: 'Party Pack: Disco',
        description: 'Unlocks dynamic lighting effects for Party Stages.',
        price: 150, // Sparks
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop'
    }
];

// --- NOTIFICATIONS ---
export const mockNotifications: Notification[] = [];

// --- CREATIONS ---

export const characters: Character[] = [];

export const worlds: World[] = [];

export const stories: Story[] = [];

export const parties: Party[] = [];

// --- COMMUNITIES ---

export const communities: Community[] = [];

// --- SOCIAL DATA ---

export const conversations: Conversation[] = [];

export const posts: Post[] = [];

export const comments: Comment[] = [];

export const memeTemplates: MemeTemplate[] = [
    { id: '1', name: 'Drake', imageUrl: 'https://i.imgflip.com/30b1gx.jpg' },
    { id: '2', name: 'Two Buttons', imageUrl: 'https://i.imgflip.com/1g8my4.jpg' },
    { id: '3', name: 'Distracted Boyfriend', imageUrl: 'https://i.imgflip.com/1ur9b0.jpg' }
];

export const trendingData: TrendingItem[] = [];

export const discoverableItems: DiscoverableItem[] = [];

export const initialUserCreations: UserCreation[] = [];
