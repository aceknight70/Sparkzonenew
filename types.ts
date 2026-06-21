
export enum Page {
    Explore,
    Workshop,
    Home,
    Messenger,
    Profile,
    Party,
    SparkClash, // New Game Page
    World, // World View Page
    Library // New Library Page
}

// --- Defense System Types ---

export type AgeRating = 'Everyone' | 'Teen' | 'Mature';

export type ContentWarning = 
    | 'Violence' 
    | 'Romance' 
    | 'Horror' 
    | 'Strong Language' 
    | 'Dark Themes' 
    | 'Politics' 
    | 'Substance Use';

export interface ContentMetadata {
    ageRating: AgeRating;
    warnings: ContentWarning[];
}

export interface UserSafetySettings {
    maxAgeRating: AgeRating; // The highest rating the user wants to see
    blockedTags: ContentWarning[]; // Specific tags the user wants to filter out
}

// --- Generic App Data ---

export interface TrendingItem {
  id: number;
  type: 'Story' | 'World';
  title: string;
  author: string;
  authorId: number;
  imageUrl: string;
  engagementScore: number;
  contentMetadata?: ContentMetadata;
}

export interface DiscoverableItem {
  id: number;
  type: 'Character' | 'World' | 'Story' | 'RP Card' | 'Community';
  title: string;
  author: string;
  authorId: number;
  imageUrl: string;
  popularityScore?: number;
  contentMetadata?: ContentMetadata;
}


// --- User & Creation Data ---

export interface User {
    id: number;
    name: string;
    avatarUrl: string;
    bio?: string;
    bannerUrl?: string;
    pronouns?: string;
    age?: string;
    gender?: string;
    nationality?: string;
    characterTags?: string[];
    followingIds?: number[];
    safetySettings?: UserSafetySettings; 
    // Skynet Data
    skynetStatus?: {
        warningCount: number;
        isMuted: boolean;
        muteExpiresAt?: string;
    };
    // Spark Clash Data
    sparkClashProfile?: SparkBattleProfile;
    // Community Data
    communityIds?: number[];
    // Billing
    isPremium?: boolean;
}

export interface UserCreation {
  id: number;
  type: 'Character' | 'World' | 'Story' | 'AI Character' | 'Meme' | 'RP Card' | 'Community';
  name: string;
  imageUrl: string;
  status: 'Draft' | 'Published' | 'Active';
  authorId: number;
  contentMetadata?: ContentMetadata; 
}

export interface CharacterConnection {
    characterId: number;
    relationship: string;
    description?: string;
}

export interface Character extends UserCreation {
    type: 'Character' | 'AI Character';
    epithet: string;
    tagline: string;
    archetypeTags: string[];
    // --- Phase 2: Blueprint ---
    appearance?: string;
    physicalDetails?: {
        [key: string]: string; // e.g., "Age": "28", "Height": "6'1\""
    };
    personality?: {
        description: string;
        traits: {
            name: string;
            value: number; // A value from 0-100 for the slider
            labels: [string, string]; // e.g., ["Introverted", "Extroverted"]
        }[];
        quirks: string[];
    };
    backstory?: string;
    abilities?: {
        name: string;
        description: string;
    }[];
    // --- Phase 3: Gallery ---
    gallery?: {
        images?: string[];
        themeSongUrl?: string;
    };
    // --- Phase 4: Connections ---
    connections?: CharacterConnection[];
    // --- Visuals ---
    bannerUrl?: string;
}

// --- Story Data ---
export interface Chapter {
    id: number;
    title: string;
    content: string;
    status: 'Draft' | 'Published';
    pageBackgrounds?: Record<number, string>; // Maps page indices (0-based) to image/GIF URLs
}

export interface StoryCharacter {
    characterId: number;
    role: string; // e.g., "Protagonist", "Antagonist"
}

export type StoryLoreCategory = string;

export interface LoreEntry {
    id: number;
    category: StoryLoreCategory;
    name: string;
    description: string;
}

export type CodexItem = 
    | { type: 'character'; data: Character }
    | { type: 'lore'; data: LoreEntry };


export interface Story extends UserCreation {
    type: 'Story';
    synopsis: string;
    genreTags: string[];
    mainCharacterIds: number[];
    chapters: Chapter[];
    cast: StoryCharacter[];
    lorebook: LoreEntry[];
    customLoreCategories?: string[];
    coAuthorIds?: number[];
    
    // Advanced world-building details for 10-section wizard
    universeRules?: string[]; // Section 3
    characterRelationships?: { charA: number; charB: number; relation: string }[]; // Section 4
    atlasPoints?: { id: number; name: string; description: string; x: number; y: number; linkType: 'chapter' | 'lore' | 'none'; linkId?: number }[]; // Section 5
    timelineEvents?: { id: number; eraName: string; date: string; description: string }[]; // Section 6
    reusableActions?: { id: number; name: string; content: string }[]; // Section 8
    scratchpad?: string; // Section 9
    collaborators?: { username: string; role: 'Writer' | 'Editor' | 'Artist' | 'Lore Keeper' }[]; // Section 10
}


// --- Messenger Data ---

export type MessageType = 'text' | 'image' | 'audio' | 'system' | 'challenge' | 'gift' | 'invite';

export interface Message {
    id: number;
    text: string;
    timestamp: string;
    senderId: number;
    character?: UserCreation; // For RP messages
    imageUrl?: string; // Attachment/Meme
    audioUrl?: string; // Voice Note
    
    // Rich Message Features
    type?: MessageType;
    metadata?: {
        amount?: number; // For Gifts
        targetId?: number; // For Invites (World/Party ID)
        targetName?: string; // For Invites
        targetType?: 'World' | 'Party' | 'Community';
        challengeId?: string; // For Spark Clash
        roll?: DiceRoll; // For Dice rolls in DM
    };
}

export interface Conversation {
    id: number;
    participant: User;
    messages: Message[];
    unreadCount?: number;
    typing?: Record<string, boolean>;
}


// --- World Data ---

export type WorldWorkshopSection = 'blueprint' | 'lorebook' | 'channels' | 'settings' | 'atlas' | 'chronicle';

export interface GroupMessage {
    id: number;
    text: string;
    timestamp: string;
    sender: WorldMember;
    character?: UserCreation; // For RP messages
    imageUrl?: string; // Attachment/Meme
    audioUrl?: string; // Voice Note
}

export interface WorldLocation {
    id: number;
    name: string;
    description: string;
    messages: GroupMessage[];
    imageUrl?: string; // Background Image
    iconUrl?: string; // Channel Icon/Profile
    themeSongUrl?: string; // Background Music for the channel
}

export interface WorldMember extends User {
    role: string;
}

export type WorldLoreCategory = 'Location' | 'Faction' | 'Item' | 'Character' | 'Event' | 'Concept';

export interface WorldLoreEntry {
    id: number;
    category: WorldLoreCategory;
    name: string;
    description: string;
    imageUrl?: string;
}

export interface WorldSystemSettings {
    diceSystem: 'd20' | 'd6-pool' | 'percentile' | 'custom';
    enableDice: boolean;
    highlightCriticals: boolean;
}

export type WorldPermission = 'manage_channels' | 'manage_lore' | 'moderate_chat' | 'invite_members' | 'manage_roles';

export interface WorldRole {
    id: number;
    name: string;
    color: string; // Hex code
    permissions: WorldPermission[];
    isDefault?: boolean;
}

export interface MapPin {
    id: number;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    label?: string;
    linkType: 'channel' | 'lore';
    linkId: number;
}

export interface TimelineEvent {
    id: number;
    title: string;
    dateLabel: string; // e.g. "Year 200", "The Awakening"
    description: string;
    imageUrl?: string;
}

export interface World extends UserCreation {
    type: 'World';
    tagline: string;
    synopsis: string;
    genreTags: string[];
    bannerUrl: string;
    mapImageUrl?: string; // The interactive atlas image
    mapPins?: MapPin[];
    timeline?: TimelineEvent[]; // The chronicle
    lorebook: WorldLoreEntry[];
    rules: string;
    members: WorldMember[];
    roles?: WorldRole[]; // New field for role management
    locations: {
        category: string;
        channels: WorldLocation[];
    }[];
    // --- Admin Settings ---
    joinPolicy?: 'Open' | 'Approval' | 'Invite';
    visibility?: 'Public' | 'Private';
    bannedWords?: string[];
    systemSettings?: WorldSystemSettings;
    welcomeMessage?: string;
    statusLabel?: 'Active' | 'Recruiting' | 'Hiatus';
    defaultChannelId?: number;
    
    // --- Blueprint Specs ---
    colorTheme?: string;
    backgroundPattern?: string;
    highConcept?: string;
    keyElements?: string[];
    defaultOcMode?: 'required' | 'optional';
    entrancePrompt?: string;
}

// --- Party Data ---

export interface DiceRoll {
    command: string; // e.g. "1d20+5"
    rolls: number[];
    modifier: number;
    total: number;
}

export interface PartyMessage {
    id: number;
    text: string;
    timestamp: string;
    sender: PartyMember;
    character?: UserCreation;
    roll?: DiceRoll;
    imageUrl?: string; // Attachment/Meme
    audioUrl?: string; // Voice Note
}

export interface PartyMember extends User {
    isHost: boolean;
}

export interface Party extends UserCreation {
    type: 'RP Card';
    description: string;
    hostId: number;
    isPublic: boolean;
    members: PartyMember[];
    chat: PartyMessage[];
    stage: {
        mode: 'social' | 'theatre' | 'tabletop' | 'live';
        social?: {
            sharedImages: string[]; // URLs for mood board
            musicUrl?: string;
        };
        theatre?: {
            videoUrl: string;
            isPlaying: boolean;
            progress: number;
        };
        tabletop?: {
            mapUrl: string | null;
            pinnedCharacterIds: number[];
        };
    };
    // Discovery Metadata
    rpFormat?: 'Group' | '1x1' | 'Open';
    genreTags?: string[];
    rules?: string;
    castingCall?: string[]; // e.g. ["Healer needed", "Antagonist"]
    notes?: string; // Shared scratchpad
}

// --- Community / Clan Data ---

export type CommunityRole = 'Leader' | 'Officer' | 'Member';

export interface CommunityMember {
    userId: number;
    role: CommunityRole;
    joinedAt: string;
}

export interface Community extends UserCreation {
    type: 'Community';
    tag: string; // e.g. [VOID]
    description: string;
    bannerUrl: string;
    level: number;
    xp: number;
    members: CommunityMember[];
    showcase: UserCreation[]; // Shared gallery of creations
    feed: Post[]; // Internal community posts
    tags: string[]; // e.g., "Sci-Fi", "Casual", "Hardcore"
    isPublic: boolean;
    leaderId?: number;
}

// --- Feed Data ---

export interface Post {
    id: number;
    author: User;
    character?: UserCreation; // If posted as a character
    timestamp: string;
    content: string;
    media?: {
        type: 'image' | 'video';
        url: string;
    };
    sparks: number;
    sparkedBy: number[]; // User IDs who sparked
    comments: number;
}

export interface Comment {
    id: number;
    postId: number;
    author: User;
    character?: UserCreation;
    timestamp: string;
    content: string;
    sparks: number;
    sparkedBy: number[];
}

// --- Meme Data ---
export interface MemeTemplate {
    id: string;
    name: string;
    imageUrl: string;
}

// --- Spark Clash (Mini-Game) Types ---

export type SparkCardRarity = 'Common' | 'Rare' | 'Epic' | 'Ultimate';
export type SparkCardType = 'Attack' | 'Defense' | 'Utility' | 'Ultimate';
export type SparkElement = 'Solar' | 'Lunar' | 'Terra' | 'Void'; // Strategy Update
export type SparkEffectType = 'Burn' | 'Stun' | 'Heal' | 'Draw' | 'None'; // Strategy Update

export interface SparkCardTemplate {
    id: string;
    name: string;
    description: string;
    energyCost: number; // 1-5
    type: SparkCardType;
    element: SparkElement; // Strategy Update
    rarity: SparkCardRarity;
    baseStats?: {
        damage?: number;
        shield?: number;
        healing?: number;
        manaRecovery?: number; // Restores player energy
    };
    effectType?: SparkEffectType; // Strategy update: Status effects
    effectValue?: number; // e.g., Burn 3 damage per turn
    price: number; // Cost in Sparks
}

export interface SparkCard {
    id: string; // Unique instance ID
    templateId: string;
    ownerId: number;
    characterId: number; // The OC this card is bound to
    customName?: string; // "Kaelen's Shadow Strike"
    customFlavorText?: string;
    customImageUrl?: string;
}

export interface SparkDeck {
    id: string;
    name: string;
    cardIds: string[]; // Array of SparkCard IDs (Must be 24)
}

export interface SparkBattleProfile {
    battlePower: number; // Ranking (ELO)
    sparks: number; // Currency
    wins: number;
    losses: number;
    inventory: SparkCard[]; // All created cards
    templates: string[]; // IDs of purchased templates (Inventory of blanks)
    decks: SparkDeck[];
    activeDeckId?: string;
}

// --- Billing Types ---
export interface ShopItem {
    id: string;
    type: 'bundle' | 'subscription' | 'cosmetic' | 'tool';
    name: string;
    description: string;
    price: number;
    currencyAmount?: number; // For bundles
    perks?: string[]; // For subscriptions
    highlight?: boolean; // "Best Value" label
    imageUrl?: string;
}

// --- Notifications ---

export type NotificationType = 'spark' | 'comment' | 'follow' | 'system' | 'clash_challenge';

export interface Notification {
    id: number;
    type: NotificationType;
    userId: number; // Recipient
    actorId?: number; // Who triggered it
    message: string;
    timestamp: string;
    read: boolean;
    link?: string; // Optional route hint
    data?: any; // Context data (e.g., postId)
}
