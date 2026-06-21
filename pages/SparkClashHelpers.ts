// Spark Clash Helpers and Static Definitions

export interface TemplateAction {
    name: string;
    energyCost: number; // 1-10
    targeting: 'Single enemy' | 'All enemies' | 'Single ally' | 'All allies' | 'Self' | 'Front row' | 'Back row';
    effectType: 'Damage' | 'Heal' | 'Buff' | 'Debuff' | 'Shield' | 'Status';
    statusType?: 'Poison' | 'Burn' | 'Stun' | 'Taunt';
    magnitude: number;
    duration: number; // for status/buff/debuff
    cooldown: number; // 0-3
}

export type TemplateRole = 'Tank' | 'Healer' | 'Assassin' | 'Support' | 'Mage' | 'Warrior';

export type TemplateTier = 'Natural' | 'Unnatural' | 'Relic' | 'Legendary' | 'Mythic' | 'Sky' | 'Rune' | 'Cosmic';

export interface NewTemplate {
    id: string;
    name: string;
    role: TemplateRole;
    tier: TemplateTier;
    actions: TemplateAction[];
    price: number;
    flavourText: string;
    element: 'Solar' | 'Lunar' | 'Terra' | 'Void';
}

// 8 Tier Levels
export const TIER_DETAILS: Record<TemplateTier, { power: string; baseHp: number; price: number; color: string; bg: string }> = {
    Natural: { power: 'Basic', baseHp: 50, price: 100, color: 'text-gray-400 border-gray-500', bg: 'bg-gray-900/40' },
    Unnatural: { power: 'Slightly enhanced', baseHp: 60, price: 250, color: 'text-green-400 border-green-500', bg: 'bg-green-950/20' },
    Relic: { power: 'Moderate', baseHp: 70, price: 600, color: 'text-blue-400 border-blue-500', bg: 'bg-blue-950/20' },
    Legendary: { power: 'Strong', baseHp: 85, price: 1500, color: 'text-purple-400 border-purple-500', bg: 'bg-purple-950/20' },
    Mythic: { power: 'Very strong', baseHp: 100, price: 3500, color: 'text-orange-400 border-orange-500', bg: 'bg-orange-950/20' },
    Sky: { power: 'Elite', baseHp: 120, price: 7000, color: 'text-cyan-400 border-cyan-500', bg: 'bg-cyan-950/20' },
    Rune: { power: 'Near ultimate', baseHp: 140, price: 15000, color: 'text-pink-400 border-pink-500', bg: 'bg-pink-950/20' },
    Cosmic: { power: 'Game-changing', baseHp: 170, price: 30000, color: 'text-yellow-400 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]', bg: 'bg-yellow-950/20' },
};

export const ELEMENT_ICONS = {
    Solar: '🔥',
    Lunar: '🌙',
    Terra: '🌿',
    Void: '🔮'
};

export const ELEMENT_COLORS = {
    Solar: 'text-orange-400 border-orange-500/40 bg-orange-950/20',
    Lunar: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/20',
    Terra: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
    Void: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/20'
};

// Profanity filter for moves renaming
export const filterProfanity = (name: string): string => {
    const badWords = ['shit', 'fuck', 'bitch', 'asshole', 'crap', 'bastard', 'cunt', 'dick', 'cocaine', 'motherfucker', 'dumbass', 'weed', 'fag', 'retard'];
    let filtered = name.trim();
    if (!filtered) return 'Ability';
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filtered = filtered.replace(regex, '***');
    });
    return filtered;
};

// All Available Card Templates in Spark Clash Shop & Gacha
export const staticTemplates: NewTemplate[] = [
    {
        id: 'paladin_t',
        name: 'Paladin Vanguard',
        role: 'Tank',
        tier: 'Natural',
        price: 100,
        flavourText: 'A sturdy warrior who stands at the frontline of history.',
        element: 'Solar',
        actions: [
            { name: 'Sturdy Shield', energyCost: 2, targeting: 'Self', effectType: 'Shield', magnitude: 15, duration: 2, cooldown: 0 },
            { name: 'Shield Slam', energyCost: 3, targeting: 'Front row', effectType: 'Damage', magnitude: 12, duration: 0, cooldown: 1 },
            { name: 'Taunting Cry', energyCost: 1, targeting: 'Single enemy', effectType: 'Status', statusType: 'Taunt', magnitude: 0, duration: 2, cooldown: 2 }
        ]
    },
    {
        id: 'cler_t',
        name: 'Acolyte Cleric',
        role: 'Healer',
        tier: 'Natural',
        price: 100,
        flavourText: 'Flickering divine light heals the broken.',
        element: 'Lunar',
        actions: [
            { name: 'Lesser Healing', energyCost: 2, targeting: 'Single ally', effectType: 'Heal', magnitude: 12, duration: 0, cooldown: 0 },
            { name: 'Holy Shielding', energyCost: 3, targeting: 'All allies', effectType: 'Shield', magnitude: 10, duration: 2, cooldown: 2 },
            { name: 'Aura of Guard', energyCost: 1, targeting: 'Single ally', effectType: 'Buff', magnitude: 10, duration: 2, cooldown: 1 }
        ]
    },
    {
        id: 'pyro_t',
        name: 'Pyromancer Mage',
        role: 'Mage',
        tier: 'Unnatural',
        price: 250,
        flavourText: 'Unstable plasma bursts consuming the tactical field.',
        element: 'Solar',
        actions: [
            { name: 'Flame Strike', energyCost: 3, targeting: 'Single enemy', effectType: 'Damage', magnitude: 18, duration: 0, cooldown: 0 },
            { name: 'Ignition Stance', energyCost: 2, targeting: 'Single enemy', effectType: 'Status', statusType: 'Burn', magnitude: 5, duration: 3, cooldown: 1 },
            { name: 'Fire Blast', energyCost: 5, targeting: 'Front row', effectType: 'Damage', magnitude: 22, duration: 0, cooldown: 2 }
        ]
    },
    {
        id: 'ninja_t',
        name: 'Shadow Shinobi',
        role: 'Assassin',
        tier: 'Relic',
        price: 600,
        flavourText: 'Silent movements, target acquired inside the shadows.',
        element: 'Void',
        actions: [
            { name: 'Shadow Pierce', energyCost: 3, targeting: 'Back row', effectType: 'Damage', magnitude: 25, duration: 0, cooldown: 1 },
            { name: 'Poison Dagger', energyCost: 2, targeting: 'Single enemy', effectType: 'Status', statusType: 'Poison', magnitude: 6, duration: 3, cooldown: 1 },
            { name: 'Vanish Ward', energyCost: 2, targeting: 'Self', effectType: 'Shield', magnitude: 18, duration: 2, cooldown: 2 }
        ]
    },
    {
        id: 'skir_t',
        name: 'Desert Duelist',
        role: 'Warrior',
        tier: 'Legendary',
        price: 1500,
        flavourText: 'An agile battlefield specialist wielding twin curved blades.',
        element: 'Terra',
        actions: [
            { name: 'Swift Slash', energyCost: 2, targeting: 'Single enemy', effectType: 'Damage', magnitude: 20, duration: 0, cooldown: 0 },
            { name: 'Cleaving Fury', energyCost: 4, targeting: 'Front row', effectType: 'Damage', magnitude: 25, duration: 0, cooldown: 1 },
            { name: 'Adrenaline Boost', energyCost: 3, targeting: 'Self', effectType: 'Buff', magnitude: 30, duration: 2, cooldown: 2 }
        ]
    },
    {
        id: 'bard_t',
        name: 'Harmonic Virtuoso',
        role: 'Support',
        tier: 'Mythic',
        price: 3500,
        flavourText: 'Melodies that bind ally wounds and shatter opposing guards.',
        element: 'Lunar',
        actions: [
            { name: 'Mending Hymn', energyCost: 3, targeting: 'Single ally', effectType: 'Heal', magnitude: 30, duration: 0, cooldown: 0 },
            { name: 'Valor Symphony', energyCost: 4, targeting: 'All allies', effectType: 'Buff', magnitude: 25, duration: 3, cooldown: 2 },
            { name: 'Dissonant chord', energyCost: 3, targeting: 'All enemies', effectType: 'Debuff', magnitude: 15, duration: 2, cooldown: 2 }
        ]
    },
    {
        id: 'skylord_t',
        name: 'Skyward Archon',
        role: 'Mage',
        tier: 'Sky',
        price: 7000,
        flavourText: 'High sovereign control raining light beams of cosmic justice.',
        element: 'Solar',
        actions: [
            { name: 'Heavenly Starfall', energyCost: 5, targeting: 'All enemies', effectType: 'Damage', magnitude: 28, duration: 0, cooldown: 2 },
            { name: 'Stardust Stun', energyCost: 3, targeting: 'Single enemy', effectType: 'Status', statusType: 'Stun', magnitude: 0, duration: 1, cooldown: 2 },
            { name: 'Cosmic Flare', energyCost: 4, targeting: 'Back row', effectType: 'Damage', magnitude: 32, duration: 0, cooldown: 1 }
        ]
    },
    {
        id: 'rune_t',
        name: 'Runeblade Desolator',
        role: 'Warrior',
        tier: 'Rune',
        price: 15000,
        flavourText: 'Cursed inscriptions of pure void energy feed on standard matter.',
        element: 'Void',
        actions: [
            { name: 'Runic Cataclysm', energyCost: 5, targeting: 'All enemies', effectType: 'Damage', magnitude: 35, duration: 0, cooldown: 2 },
            { name: 'Void Decimation', energyCost: 4, targeting: 'Front row', effectType: 'Damage', magnitude: 40, duration: 0, cooldown: 1 },
            { name: 'Ancient Inscription', energyCost: 3, targeting: 'Self', effectType: 'Buff', magnitude: 45, duration: 3, cooldown: 3 }
        ]
    },
    {
        id: 'cosmic_t',
        name: 'Chronos Singularity',
        role: 'Support',
        tier: 'Cosmic',
        price: 30000,
        flavourText: 'Mastery over the fourth dimension. Reversing timelines at will.',
        element: 'Void',
        actions: [
            { name: 'Temporal Collapse', energyCost: 6, targeting: 'All enemies', effectType: 'Damage', magnitude: 45, duration: 0, cooldown: 2 },
            { name: 'Nullify Sphere', energyCost: 3, targeting: 'All allies', effectType: 'Shield', magnitude: 35, duration: 2, cooldown: 3 },
            { name: 'Aether Regeneration', energyCost: 4, targeting: 'All allies', effectType: 'Heal', magnitude: 30, duration: 0, cooldown: 2 }
        ]
    }
];

export const getLeagueAndIcon = (bp: number): { league: string; icon: string; nextThreshold: number; color: string } => {
    if (bp < 1100) return { league: 'Bronze V', icon: '🥉', nextThreshold: 1100, color: 'text-amber-700' };
    if (bp < 1300) return { league: 'Silver IV', icon: '🥈', nextThreshold: 1300, color: 'text-slate-400' };
    if (bp < 1600) return { league: 'Gold III', icon: '🥇', nextThreshold: 1600, color: 'text-yellow-500' };
    if (bp < 2000) return { league: 'Platinum II', icon: '💎', nextThreshold: 2000, color: 'text-cyan-400' };
    if (bp < 2500) return { league: 'Diamond I', icon: '🔷', nextThreshold: 2500, color: 'text-blue-400' };
    if (bp < 3000) return { league: 'Master', icon: '👑', nextThreshold: 3000, color: 'text-purple-400' };
    if (bp < 3500) return { league: 'Grandmaster', icon: '⚡', nextThreshold: 3500, color: 'text-red-400 animate-pulse' };
    return { league: 'Cosmic Overlord', icon: '🌌', nextThreshold: 99999, color: 'text-yellow-400 font-extrabold animate-bounce' };
};

// Gacha rolls based on the pack
export const drawGacha = (packType: 'Spark' | 'Relic' | 'Legendary' | 'Cosmic'): NewTemplate => {
    const list = [...staticTemplates];
    let pool: NewTemplate[] = [];

    if (packType === 'Spark') {
        // Natural (70%), Unnatural (30%)
        pool = list.filter(t => t.tier === 'Natural' || t.tier === 'Unnatural');
    } else if (packType === 'Relic') {
        // Relic (50%), Legendary (35%), Mythic (15%)
        pool = list.filter(t => t.tier === 'Relic' || t.tier === 'Legendary' || t.tier === 'Mythic');
    } else if (packType === 'Legendary') {
        // Legendary (45%), Mythic (35%), Sky (15%), Rune (5%)
        pool = list.filter(t => t.tier === 'Legendary' || t.tier === 'Mythic' || t.tier === 'Sky' || t.tier === 'Rune');
    } else {
        // Cosmic Pack: Mythic (40%), Sky (30%), Rune (20%), Cosmic (10%)
        pool = list.filter(t => t.tier === 'Mythic' || t.tier === 'Sky' || t.tier === 'Rune' || t.tier === 'Cosmic');
    }

    if (pool.length === 0) pool = [staticTemplates[0]];
    const randomIdx = Math.floor(Math.random() * pool.length);
    return pool[randomIdx];
};

// Crafting: combine 3 of same tier to get 1 random of next high tier
export const listNextTier = (tier: TemplateTier): TemplateTier | null => {
    const tiers: TemplateTier[] = ['Natural', 'Unnatural', 'Relic', 'Legendary', 'Mythic', 'Sky', 'Rune', 'Cosmic'];
    const idx = tiers.indexOf(tier);
    if (idx === -1 || idx === tiers.length - 1) return null;
    return tiers[idx + 1];
};

export const rollCraftResult = (nextTier: TemplateTier): NewTemplate => {
    const matching = staticTemplates.filter(t => t.tier === nextTier);
    if (matching.length > 0) {
        return matching[Math.floor(Math.random() * matching.length)];
    }
    return staticTemplates[Math.floor(Math.random() * staticTemplates.length)];
};
