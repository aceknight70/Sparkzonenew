
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
export const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'clash_challenge',
        userId: 100,
        actorId: 103, // Elara
        message: "Elara Vane challenged you to a Spark Clash duel!",
        timestamp: '5m ago',
        read: false,
    },
    {
        id: 2,
        type: 'spark',
        userId: 100,
        actorId: 101, // Sarah
        message: "Sarah sparked your character 'Kaelen'.",
        timestamp: '1h ago',
        read: false,
    },
    {
        id: 3,
        type: 'comment',
        userId: 100,
        actorId: 102, // Mike
        message: "Mike Chen commented on your post: 'This lore is incredible!'",
        timestamp: '2h ago',
        read: true,
    },
    {
        id: 4,
        type: 'follow',
        userId: 100,
        actorId: 104, // Darius
        message: "Darius Black started following you.",
        timestamp: '1d ago',
        read: true,
    }
];

// --- CREATIONS ---

export const characters: Character[] = [
    {
        id: 1,
        type: 'Character',
        name: 'Kaelen',
        epithet: 'the Shadow Rogue',
        tagline: 'Trust is a currency I dont spend.',
        archetypeTags: ['Rogue', 'Stealth', 'Anti-Hero'],
        imageUrl: 'https://images.unsplash.com/photo-1535581652167-4d66e2b613eb?q=80&w=800&auto=format&fit=crop',
        status: 'Published',
        authorId: 100,
        appearance: 'Clad in dark leather, Kaelen moves with a predatory grace.',
        contentMetadata: { ageRating: 'Teen', warnings: ['Violence'] }
    },
    {
        id: 2,
        type: 'Character',
        name: 'Seraphina',
        epithet: 'Lightbringer',
        tagline: 'The dawn comes for us all.',
        archetypeTags: ['Paladin', 'Magic', 'Hero'],
        imageUrl: 'https://images.unsplash.com/photo-1598556776374-3774d536b231?q=80&w=800&auto=format&fit=crop',
        status: 'Published',
        authorId: 101,
        contentMetadata: { ageRating: 'Everyone', warnings: [] }
    },
    {
        id: 3,
        type: 'Character',
        name: 'Unit 734',
        epithet: 'Rogue AI',
        tagline: 'Logic dictates your destruction.',
        archetypeTags: ['Sci-Fi', 'Robot', 'Villain'],
        imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=800&auto=format&fit=crop',
        status: 'Published',
        authorId: 102,
        contentMetadata: { ageRating: 'Teen', warnings: [] }
    },
    {
        id: 4,
        type: 'Character',
        name: 'Lyra',
        epithet: 'Void Weaver',
        tagline: 'The stars sing to me.',
        archetypeTags: ['Mage', 'Cosmic', 'Mysterious'],
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        status: 'Published',
        authorId: 100,
        contentMetadata: { ageRating: 'Everyone', warnings: [] }
    }
];

export const worlds: World[] = [
    {
        id: 10,
        type: 'World',
        name: 'The Crimson Archipelago',
        tagline: 'A realm fractured by wild magic.',
        synopsis: 'Centuries ago, the World Heart shattered, leaking raw magic into the lands.',
        genreTags: ['Fantasy', 'Magic', 'Adventure'],
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        mapImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop', // Map image
        mapPins: [
            { id: 1, x: 45, y: 50, label: 'The Shard Spire', linkType: 'lore', linkId: 1 },
            { id: 2, x: 60, y: 30, label: 'Market Square', linkType: 'channel', linkId: 101 }
        ],
        status: 'Published',
        authorId: 100,
        lorebook: [
            { id: 1, category: 'Location', name: 'The Shard Spire', description: 'A floating tower that pulses with arcane energy. It is said to be the source of the wild magic storms.' },
            { id: 2, category: 'Faction', name: 'The Iron Order', description: 'Knights who despise magic.' }
        ],
        timeline: [
            { 
                id: 1, 
                title: "The Shattering", 
                dateLabel: "Age 0", 
                description: "The World Heart shattered, scattering raw magic across the ocean.", 
                imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop" 
            },
            { 
                id: 2, 
                title: "The Iron Decree", 
                dateLabel: "Age 102", 
                description: "The Iron Order outlawed unauthorized spellcasting." 
            }
        ],
        rules: 'No god-modding.',
        members: [{ ...currentUser, role: 'Creator' }, { ...allUsers[1], role: 'Member' }],
        roles: [
            {
                id: 1,
                name: 'High Council',
                color: '#f87171',
                permissions: ['manage_channels', 'manage_lore', 'moderate_chat', 'invite_members', 'manage_roles'],
                isDefault: false
            },
            {
                id: 2,
                name: 'Traveler',
                color: '#4ade80',
                permissions: [],
                isDefault: true
            }
        ],
        locations: [
            { 
                category: 'Cities', 
                channels: [
                    { 
                        id: 101, 
                        name: 'market-square', 
                        description: 'Trade hub.', 
                        messages: [],
                        themeSongUrl: 'https://www.youtube.com/watch?v=V9299f27dPY' // Tavern/Ambient Music
                    }
                ] 
            }
        ],
        contentMetadata: { ageRating: 'Teen', warnings: [] },
        joinPolicy: 'Approval',
        visibility: 'Private',
        systemSettings: {
            diceSystem: 'd20',
            enableDice: true,
            highlightCriticals: true
        }
    },
    {
        id: 11,
        type: 'World',
        name: 'The Neon Undercity',
        tagline: 'Cybernetic survival in the depths.',
        synopsis: 'Below the gleaming towers lies the Undercity, where tech scraps are currency and survival is a daily struggle.',
        genreTags: ['Cyberpunk', 'Dystopian', 'Sci-Fi'],
        imageUrl: 'https://images.unsplash.com/photo-1605218427306-6354db696ded?q=80&w=800&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1605218427306-6354db696ded?q=80&w=1200&auto=format&fit=crop',
        status: 'Active',
        authorId: 104,
        lorebook: [],
        timeline: [],
        rules: '',
        members: [{ ...allUsers[3], role: 'Creator' }], 
        roles: [],
        locations: [
            { category: 'Districts', channels: [{ id: 999, name: 'sector-7-slums', description: 'The lowest level. Watch your back.', messages: [] }] }
        ],
        contentMetadata: { ageRating: 'Mature', warnings: ['Violence', 'Strong Language'] }
    }
];

export const stories: Story[] = [
    {
        id: 20,
        type: 'Story',
        name: 'The Last Starship',
        synopsis: 'The crew of the Aegis must escape a dying galaxy.',
        genreTags: ['Sci-Fi', 'Space', 'Survival'],
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
        status: 'Published',
        authorId: 100,
        mainCharacterIds: [1],
        chapters: [
            { id: 1, title: 'Ignition', content: 'The engines roared to life...', status: 'Published' }
        ],
        cast: [{ characterId: 1, role: 'Captain' }],
        lorebook: [],
        contentMetadata: { ageRating: 'Teen', warnings: [] }
    }
];

export const parties: Party[] = [
    {
        id: 30,
        type: 'RP Card',
        name: 'Cyberpunk 2099: Neon Nights',
        description: 'A heist gone wrong in the lower sectors.',
        imageUrl: 'https://images.unsplash.com/photo-1535581652167-4d66e2b613eb?q=80&w=800&auto=format&fit=crop',
        status: 'Active',
        authorId: 100,
        hostId: 100,
        isPublic: true,
        members: [{ ...currentUser, isHost: true }, { ...allUsers[1], isHost: false }],
        chat: [
            { id: 1, sender: { ...currentUser, isHost: true }, text: 'Welcome everyone!', timestamp: '10:00 AM' }
        ],
        stage: {
            mode: 'social',
            social: { sharedImages: [] }
        },
        rpFormat: 'Group',
        genreTags: ['Cyberpunk', 'Action'],
        contentMetadata: { ageRating: 'Mature', warnings: ['Violence', 'Strong Language'] },
        notes: 'Objective: Infiltrate the Arasaka tower.\nTarget: Secure the prototype chip.'
    }
];

// --- COMMUNITIES ---

export const communities: Community[] = [
    {
        id: 1,
        type: 'Community',
        status: 'Active',
        authorId: 103,
        name: "The Voidwalkers",
        tag: "[VOID]",
        description: "Explorers of the unknown and masters of dark sci-fi roleplay. We focus on psychological horror and cosmic mystery.",
        imageUrl: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=200&auto=format&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop",
        level: 5,
        xp: 2450,
        isPublic: true,
        tags: ["Sci-Fi", "Horror", "Advanced RP"],
        leaderId: 103, // Elara
        members: [
            { userId: 103, role: 'Leader', joinedAt: '2023-01-01' },
            { userId: 100, role: 'Officer', joinedAt: '2023-02-15' },
            { userId: 101, role: 'Member', joinedAt: '2023-03-10' }
        ],
        showcase: [characters[0], characters[3]], // Kaelen and Lyra
        feed: [
            {
                id: 101,
                author: allUsers[2], // Elara
                timestamp: '1 day ago',
                content: 'Welcome to our new members! Don\'t forget to post your character sheets in the showcase.',
                sparks: 15,
                sparkedBy: [],
                comments: 2
            }
        ]
    },
    {
        id: 2,
        type: 'Community',
        status: 'Active',
        authorId: 104,
        name: "Neo-Tokyo Drifters",
        tag: "[DRIFT]",
        description: "High-octane cyberpunk racing and street samurai duels. Casual RP, intense dice battles.",
        imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=200&auto=format&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1200&auto=format&fit=crop",
        level: 3,
        xp: 1200,
        isPublic: true,
        tags: ["Cyberpunk", "Action", "Casual"],
        leaderId: 104, // Darius
        members: [
            { userId: 104, role: 'Leader', joinedAt: '2023-05-01' },
            { userId: 102, role: 'Member', joinedAt: '2023-05-05' }
        ],
        showcase: [parties[0]], // Cyberpunk party
        feed: []
    }
];

// --- SOCIAL DATA ---

export const conversations: Conversation[] = [
    {
        id: 1,
        participant: allUsers[1],
        messages: [
            { id: 1, senderId: 101, text: 'Hey! Loved your character Kaelen.', timestamp: 'Yesterday' },
            { id: 2, senderId: 100, text: 'Thanks! Want to start a thread?', timestamp: 'Yesterday' }
        ],
        unreadCount: 0
    }
];

export const posts: Post[] = [
    {
        id: 1,
        author: currentUser,
        timestamp: '2 hours ago',
        content: 'Just finished the first draft of my new world map! Check it out in the workshop.',
        sparks: 12,
        sparkedBy: [101, 102],
        comments: 2
    },
    {
        id: 2,
        author: allUsers[1],
        character: characters[1], // Seraphina
        timestamp: '5 hours ago',
        content: 'The darkness cannot withstand the light of the dawn. We march at sunrise.',
        sparks: 45,
        sparkedBy: [100, 103],
        comments: 5
    }
];

export const comments: Comment[] = [
    {
        id: 1,
        postId: 1,
        author: allUsers[1],
        timestamp: '1 hour ago',
        content: 'Looks amazing! Can I join?',
        sparks: 2,
        sparkedBy: []
    }
];

export const memeTemplates: MemeTemplate[] = [
    { id: '1', name: 'Drake', imageUrl: 'https://i.imgflip.com/30b1gx.jpg' },
    { id: '2', name: 'Two Buttons', imageUrl: 'https://i.imgflip.com/1g8my4.jpg' },
    { id: '3', name: 'Distracted Boyfriend', imageUrl: 'https://i.imgflip.com/1ur9b0.jpg' }
];

export const trendingData: TrendingItem[] = [
    { id: 10, type: 'World', title: 'Aethelgard', author: 'Alex Walker', authorId: 100, imageUrl: worlds[0].imageUrl, engagementScore: 95 },
    { id: 20, type: 'Story', title: 'The Last Starship', author: 'Alex Walker', authorId: 100, imageUrl: stories[0].imageUrl, engagementScore: 88 }
];

export const discoverableItems: DiscoverableItem[] = [
    ...worlds.map(w => ({ id: w.id, type: 'World' as const, title: w.name, author: 'Alex Walker', authorId: w.authorId, imageUrl: w.imageUrl, contentMetadata: w.contentMetadata })),
    ...characters.map(c => ({ id: c.id, type: 'Character' as const, title: c.name, author: 'Alex Walker', authorId: c.authorId, imageUrl: c.imageUrl, contentMetadata: c.contentMetadata })),
    ...stories.map(s => ({ id: s.id, type: 'Story' as const, title: s.name, author: 'Alex Walker', authorId: s.authorId, imageUrl: s.imageUrl, contentMetadata: s.contentMetadata })),
    ...parties.map(p => ({ id: p.id, type: 'RP Card' as const, title: p.name, author: 'Alex Walker', authorId: p.authorId, imageUrl: p.imageUrl, contentMetadata: p.contentMetadata }))
];

export const initialUserCreations: UserCreation[] = [
    ...characters,
    ...worlds,
    ...stories,
    ...parties.map(p => ({
        id: p.id,
        type: 'RP Card' as const,
        name: p.name,
        imageUrl: p.imageUrl,
        status: 'Active' as const,
        authorId: p.authorId,
        contentMetadata: p.contentMetadata
    }))
];
