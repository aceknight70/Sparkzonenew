import React, { useState, useRef, useEffect } from 'react';
import { Character, AgeRating, ContentWarning } from '../types';
import LightningBoltIcon from '../components/icons/LightningBoltIcon';
import CharacterAiGeneratorModal from '../components/CharacterAiGeneratorModal';
import ContentRatingSelector from '../components/ContentRatingSelector';
import { 
  Sparkles, 
  User, 
  RotateCcw, 
  Sliders, 
  Heart, 
  ShieldAlert, 
  Flame, 
  Image as ImageIcon, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Search, 
  Wand2, 
  BookOpen, 
  Eye, 
  BadgeCheck 
} from 'lucide-react';

type KeyValue = { key: string; value: string };

const FormInput: React.FC<{ id: string; label: string; placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
({ id, label, placeholder, value, onChange }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</label>
        <input 
            type="text" 
            id={id} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full bg-neutral-950 border border-violet-500/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" 
        />
    </div>
);

const FormTextarea: React.FC<{ id: string; label: string; placeholder?: string; value: string; rows?: number; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> =
({ id, label, placeholder, value, rows=3, onChange }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</label>
        <textarea 
            id={id} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            rows={rows} 
            className="w-full bg-neutral-950 border border-violet-500/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all leading-relaxed" 
        />
    </div>
);

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; rightContent?: React.ReactNode; icon: React.ReactNode }> = ({ title, children, isOpen, onToggle, rightContent, icon }) => (
    <div className="border border-violet-500/10 rounded-xl overflow-hidden bg-neutral-900/40 backdrop-blur-sm transition-all duration-300">
        <div 
            onClick={onToggle} 
            className="w-full flex justify-between items-center p-4 text-left hover:bg-violet-500/5 transition-colors cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                    {icon}
                </div>
                <div>
                    <h3 className="text-base font-bold text-neutral-100 tracking-tight">{title}</h3>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {rightContent}
                <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}>
            <div className="p-6 bg-neutral-950/20 border-t border-violet-500/5 space-y-6">
                {children}
            </div>
        </div>
    </div>
);

const defaultCharacter: Partial<Character> = {
    type: 'Character',
    name: '',
    epithet: '',
    tagline: '',
    archetypeTags: [],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1200&auto=format&fit=crop',
    appearance: '',
    physicalDetails: {
        Age: 'Unknown',
        Height: 'Unknown',
        Strength: '50',
        Agility: '50',
        Intellect: '50',
        Charisma: '50',
        Luck: '50'
    },
    personality: {
        description: '',
        traits: [
            { name: "Social Spark", value: 50, labels: ["Introverted", "Extroverted"] },
            { name: "Mind Focus", value: 50, labels: ["Logical", "Emotional"] },
            { name: "Alignment", value: 50, labels: ["Chaotic", "Orderly"] },
            { name: "Temperament", value: 50, labels: ["Serene", "Passionate"] }
        ],
        quirks: []
    },
    backstory: '',
    abilities: [],
    gallery: { images: [] },
    contentMetadata: { ageRating: 'Everyone', warnings: [] }
};

interface PresetTemplate {
    key: string;
    label: string;
    subtitle: string;
    name: string;
    epithet: string;
    tagline: string;
    archetypeTags: string[];
    appearance: string;
    description: string;
    backstory: string;
    avatarUrl: string;
    bannerUrl: string;
    age: string;
    height: string;
    strength: number;
    agility: number;
    intellect: number;
    charisma: number;
    luck: number;
    traits: { name: string; value: number; labels: [string, string] }[];
    quirks: string[];
    abilities: { name: string; description: string }[];
}

const PRESET_TEMPLATES: PresetTemplate[] = [
    {
        key: 'netrunner',
        label: 'Neo-Noir Netrunner',
        subtitle: 'Sci-Fi / Hacker',
        name: 'Aegis-09',
        epithet: 'the Neon Ghost',
        tagline: 'Firewalls are just polite requests to slow down.',
        archetypeTags: ['Cyberpunk', 'Hacker', 'Rogue'],
        appearance: 'Sleek matte-black neural jackports tracer stitched behind the left ear. Draped in an oversized, holographically-shifting dark mesh trench coat that mirrors passing streetlights. Piercing slate-gray eyes that flicker with white data codes when compiling scripts.',
        description: 'Quiet and hyper-focused, yet speaks with a dripping, electronic sarcasm when interrupted. Values privacy and deep neural isolation, but maintains an unbreakable code of honor with those who have run ops together.',
        backstory: 'Born in the low-lying grid sectors, Aegis-09 spent their youth bypassing access keys for basic water hydration rigs. After accidentally revealing high-level faction telemetry details, they fled into the deeper networks, living as a freelance contractor.',
        avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1200&auto=format&fit=crop',
        age: '25',
        height: "5'9\"",
        strength: 40,
        agility: 85,
        intellect: 95,
        charisma: 60,
        luck: 70,
        traits: [
            { name: "Social Spark", value: 25, labels: ["Introverted", "Extroverted"] },
            { name: "Mind Focus", value: 90, labels: ["Logical", "Emotional"] },
            { name: "Alignment", value: 30, labels: ["Chaotic", "Orderly"] },
            { name: "Temperament", value: 35, labels: ["Serene", "Passionate"] }
        ],
        quirks: ['Refuses to enter rooms without locating secondary physical escapes', 'Only drinks ice-cold energy elixirs', 'Twitches finger in hex codes when idle'],
        abilities: [
            { name: 'Neural Overdrive', description: 'Increases processing speed by 300% for 20 seconds, allowing instant bypass of system scripts. Causes brief fatigue afterward.' },
            { name: 'Optical Hack', description: 'Blinds cybernetic lenses or optical receptors in a short field of view.' }
        ]
    },
    {
        key: 'chronomancer',
        label: 'Clockwork Alchemist',
        subtitle: 'Steampunk / Spellcaster',
        name: 'Vance Sterling',
        epithet: 'the Brass Alchemist',
        tagline: 'Time is malleable. True craftsmanship lies in bending its gears.',
        archetypeTags: ['Steampunk', 'Mage', 'Scientist'],
        appearance: 'Outfitted in copper-rimmed spectacles with spinning microscopic focus lenses. Wears an apron filled with vials of pulsing gold liquid, a brass pocketwatch ticking in irregular rhythm, and leather gloves coated in silver ash.',
        description: 'Obsessive and easily excitable by rare artifacts. Speaks rapidly, often trailing into mathematics. Though eccentric, he harbors a deep devotion to repairing broken relics of both magic and machine.',
        backstory: 'An outcast from the Clocksmith Guild who discovered that temporal chronons could be bound directly to copper alchemy. He now travels searching for broken anomalies, seeking to piece together his shattered family chronograph.',
        avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        age: '38',
        height: "6'0\"",
        strength: 55,
        agility: 60,
        intellect: 90,
        charisma: 75,
        luck: 65,
        traits: [
            { name: "Social Spark", value: 70, labels: ["Introverted", "Extroverted"] },
            { name: "Mind Focus", value: 85, labels: ["Logical", "Emotional"] },
            { name: "Alignment", value: 55, labels: ["Chaotic", "Orderly"] },
            { name: "Temperament", value: 80, labels: ["Serene", "Passionate"] }
        ],
        quirks: ['Shakes his pocketwatch violently when annoyed', 'Measures distances in paces and seconds', 'Extremely startled by unexpected thunder'],
        abilities: [
            { name: 'Chrono-Stasis Elixir', description: 'Throws a flask that releases a chemical cloud, slowing local movement within an area to 10% speed.' },
            { name: 'Rewind Gear', description: 'Triggers a brass pocket-anchor, rewinding his own coordinates to his position 5 seconds prior.' }
        ]
    },
    {
        key: 'arcanist',
        label: 'Eldritch Scholar',
        subtitle: 'Mystery / Void Magic',
        name: 'Morrigan Vance',
        epithet: 'Keeper of the Unwritten Codex',
        tagline: 'The dark of the cosmos remembers what the stars have forgotten.',
        archetypeTags: ['Fantasy', 'Wizard', 'Mystery'],
        appearance: 'Clad in tattered dark violet robes embroidered with glowing, faintly ancient constellations. A leather-bound book floats lazily at her side, tethered by purple sparks of ethereal magnetism. Her eyes shine with an unnatural pale violet mist.',
        description: 'Vigilant, serene, and deeply detached from earthly politics. She views mortal concerns as fleeting sparks, focusing entirely on preventively sealing void rifts. Speaks in poetic, ancient metaphors.',
        backstory: 'Spent a decade locked in the Forbidden Vaults of Oakhaven. After bonding with a forbidden cosmic parasite, she was exiled into the wilderness to guard the boundaries between mortal worlds and the infinite dark.',
        avatarUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=300&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        age: '32',
        height: "5'7\"",
        strength: 35,
        agility: 50,
        intellect: 98,
        charisma: 45,
        luck: 80,
        traits: [
            { name: "Social Spark", value: 15, labels: ["Introverted", "Extroverted"] },
            { name: "Mind Focus", value: 95, labels: ["Logical", "Emotional"] },
            { name: "Alignment", value: 40, labels: ["Chaotic", "Orderly"] },
            { name: "Temperament", value: 15, labels: ["Serene", "Passionate"] }
        ],
        quirks: ['Whispers back to invisible shadows', 'Cannot sleep unless surrounded by salt circles', 'Constantly smells of dried lavender and ash'],
        abilities: [
            { name: 'Runic Void Rift', description: 'Summons a tiny localized collapse, pulling objects and small structures toward its center with heavy force.' },
            { name: 'Astral Eye', description: 'Projects her consciousness into a floating cosmic eye capable of slipping through walls and seals.' }
        ]
    },
    {
        key: 'rogue',
        label: 'Whispering Blade',
        subtitle: 'Stealth / Agile Thief',
        name: 'Kaelen Thorne',
        epithet: 'the Shadow Rogue',
        tagline: 'Gold is lighter when carried by someone who knows its secret value.',
        archetypeTags: ['Rogue', 'Anti-Hero', 'Warrior'],
        appearance: 'Face half-veiled in charcoal leather. Wears high-density silken tunic straps holding twin serrated steel daggers. Moves with absolute, cat-like posture, leaving no footprints behind in wet sand.',
        description: 'Pragmatic, opportunistic, with a dry cynical wit that masks a protective heart for street urchins. Believes in self-preservation first, but stands firm once an contract is signed.',
        backstory: 'Orphaned in the grand bazaar, Kaelen rose through the ranks of the Whisper-Wind Syndicate. He eventually went solo after refusing an order to pillage a temple shelter, making them a marked target for both syndicates and city guards.',
        avatarUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        age: '24',
        height: "5'11\"",
        strength: 65,
        agility: 95,
        intellect: 75,
        charisma: 80,
        luck: 85,
        traits: [
            { name: "Social Spark", value: 40, labels: ["Introverted", "Extroverted"] },
            { name: "Mind Focus", value: 65, labels: ["Logical", "Emotional"] },
            { name: "Alignment", value: 20, labels: ["Chaotic", "Orderly"] },
            { name: "Temperament", value: 60, labels: ["Serene", "Passionate"] }
        ],
        quirks: ['Always flips a gold coin with his knuckles when thinking', 'Refuses to drink tap water', 'Only sleeps on elevated surfaces'],
        abilities: [
            { name: 'Shadow Cloak', description: 'Melds into the shadows of light, becoming virtually silent and hard to notice for brief periods.' },
            { name: 'Serpents Hook', description: 'Uses an elastic coiled grappling line to latch onto ledges or pull opponents forward.' }
        ]
    }
];

// Art Library selections
const ART_PRESETS = [
    { name: 'Cyberpunk Red', avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300', banner: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1200' },
    { name: 'Cosmic Mysticism', avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=300', banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200' },
    { name: 'Midnight Clockwork', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300', banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200' },
    { name: 'Classic Dark Rogue', avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300', banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200' },
    { name: 'Golden Champion', avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300', banner: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1200' }
];

const SEARCH_SUGGESTIONS = ['Cyberpunk', 'Wizard', 'Knight', 'Assassin', 'Dragon', 'Robot', 'Paladin', 'Vampire', 'Monk', 'Fairy'];

const CharacterCreationPage: React.FC<CharacterCreationPageProps> = ({ characterToEdit, onExit, onSave }) => {
    const isEditing = !!characterToEdit;
    
    // We synchronize the local states with the character object
    const [character, setCharacter] = useState<Partial<Character>>(() => {
        if (characterToEdit) {
            return {
                ...defaultCharacter,
                ...characterToEdit,
                physicalDetails: { ...defaultCharacter.physicalDetails, ...characterToEdit.physicalDetails },
                personality: {
                    ...defaultCharacter.personality,
                    ...characterToEdit.personality,
                    traits: characterToEdit.personality?.traits?.length 
                        ? characterToEdit.personality.traits 
                        : defaultCharacter.personality!.traits,
                    quirks: characterToEdit.personality?.quirks || []
                }
            };
        }
        return JSON.parse(JSON.stringify(defaultCharacter));
    });

    const [openSections, setOpenSections] = useState<string[]>(['spark', 'blueprint', 'abilities']);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    
    // Stat & sliders states derived from character details
    const getPhysicalVal = (key: string, def: string) => character.physicalDetails?.[key] || def;
    
    const [ageVal, setAgeVal] = useState(() => getPhysicalVal('Age', 'Unknown'));
    const [heightVal, setHeightVal] = useState(() => getPhysicalVal('Height', 'Unknown'));

    const [strength, setStrength] = useState(() => parseInt(getPhysicalVal('Strength', '50')));
    const [agility, setAgility] = useState(() => parseInt(getPhysicalVal('Agility', '50')));
    const [intellect, setIntellect] = useState(() => parseInt(getPhysicalVal('Intellect', '50')));
    const [charisma, setCharisma] = useState(() => parseInt(getPhysicalVal('Charisma', '50')));
    const [luck, setLuck] = useState(() => parseInt(getPhysicalVal('Luck', '50')));

    const [personalityTraits, setPersonalityTraits] = useState(() => {
        return character.personality?.traits || defaultCharacter.personality!.traits;
    });

    // Custom quirks input
    const [newQuirkText, setNewQuirkText] = useState('');

    // Dynamic Image selector & search elixirs
    const [unsplashSearch, setUnsplashSearch] = useState('');
    const [isSearchingImage, setIsSearchingImage] = useState(false);
    const [searchResults, setSearchResults] = useState<{ id: string; url: string }[]>([]);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // --- Tag Inputs ---
    const [currentArchetypeTag, setCurrentArchetypeTag] = useState('');
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    
    const commonArchetypes = [
        'Hero', 'Villain', 'Anti-Hero', 'Rogue', 'Mage', 'Warrior', 'Healer', 
        'Support', 'Tank', 'Leader', 'Sidekick', 'Mentor', 'Chosen One', 
        'Rebel', 'Explorer', 'Scientist', 'Detective', 'Classics', 'Cybernetic',
        'Demon', 'Angel', 'Android', 'Spellsword', 'Noble', 'Cleric', 'Alchemist',
        'Cyberpunk', 'Steampunk', 'Sci-Fi', 'Fantasy', 'Horror', 'Noir', 'Space Opera'
    ];

    const filteredArchetypes = currentArchetypeTag 
        ? commonArchetypes.filter(t => 
            t.toLowerCase().includes(currentArchetypeTag.toLowerCase()) && 
            !(character.archetypeTags || []).includes(t)
          )
        : [];

    const handleNestedChange = <T,>(section: keyof Character, field: keyof T, value: any) => {
        setCharacter(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value,
            }
        }));
    };
    
    // --- Section Toggling ---
    const toggleSection = (sectionName: string) => {
        setOpenSections(prev => 
            prev.includes(sectionName)
                ? prev.filter(s => s !== sectionName)
                : [...prev, sectionName]
        );
    };

    // Preset Selection trigger
    const handleApplyPreset = (preset: PresetTemplate) => {
        setCharacter(prev => ({
            ...prev,
            name: preset.name,
            epithet: preset.epithet,
            tagline: preset.tagline,
            archetypeTags: preset.archetypeTags,
            appearance: preset.appearance,
            backstory: preset.backstory,
            imageUrl: preset.avatarUrl,
            bannerUrl: preset.bannerUrl,
            abilities: preset.abilities,
            personality: {
                description: preset.description,
                traits: preset.traits,
                quirks: preset.quirks
            }
        }));
        
        // Update sliders states in sync
        setAgeVal(preset.age);
        setHeightVal(preset.height);
        setStrength(preset.strength);
        setAgility(preset.agility);
        setIntellect(preset.intellect);
        setCharisma(preset.charisma);
        setLuck(preset.luck);
        setPersonalityTraits(preset.traits);
    };

    // On Image search
    const handleSearchUnsplash = async (term: string) => {
        if (!term.trim()) return;
        setIsSearchingImage(true);
        try {
            // Unsplash dynamic search simulation with very high-quality curated collection IDs
            const searchTerms = encodeURIComponent(term);
            const results = Array.from({ length: 12 }).map((_, i) => ({
                id: `${term}-${i}`,
                url: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567)}?q=80&w=400&h=400&fit=crop&sig=${term}-${i}`
            }));
            // Provide visual placeholder results
            setSearchResults(results);
        } catch (e) {
            console.error("Image search fail", e);
        } finally {
            setIsSearchingImage(false);
        }
    };

    // AI generated fully packed data handler
    const handleAiGenerate = (data: any) => {
        setCharacter(prev => ({
            ...prev,
            name: data.name,
            epithet: data.epithet,
            tagline: data.tagline,
            archetypeTags: data.archetypeTags,
            appearance: data.appearance,
            backstory: data.backstory,
            abilities: data.abilities,
            personality: {
                description: data.personality.description,
                traits: data.personality.traits,
                quirks: data.personality.quirks
            }
        }));

        const pDetails = data.physicalDetails;
        setAgeVal(pDetails.Age || 'Unknown');
        setHeightVal(pDetails.Height || 'Unknown');
        setStrength(parseInt(pDetails.Strength) || 50);
        setAgility(parseInt(pDetails.Agility) || 50);
        setIntellect(parseInt(pDetails.Intellect) || 50);
        setCharisma(parseInt(pDetails.Charisma) || 50);
        setLuck(parseInt(pDetails.Luck) || 50);
        
        if (data.personality?.traits) {
            setPersonalityTraits(data.personality.traits);
        }
    };

    // --- Tag Handlers ---
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = currentArchetypeTag.trim();
            if (value && !(character.archetypeTags || []).includes(value)) {
                setCharacter(p => ({ ...p, archetypeTags: [...(p.archetypeTags || []), value] }));
            }
            setCurrentArchetypeTag('');
            setShowTagSuggestions(false);
        }
    };

    const addTag = (tag: string) => {
        setCharacter(p => ({ ...p, archetypeTags: [...(p.archetypeTags || []), tag] }));
        setCurrentArchetypeTag('');
        setShowTagSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
         setCharacter(p => ({...p, archetypeTags: (p.archetypeTags || []).filter(tag => tag !== tagToRemove)}));
    };

    // --- Quirks local handlers ---
    const handleAddQuirk = () => {
        const text = newQuirkText.trim();
        if (!text) return;
        const currentQuirks = character.personality?.quirks || [];
        if (!currentQuirks.includes(text)) {
            handleNestedChange('personality', 'quirks', [...currentQuirks, text]);
        }
        setNewQuirkText('');
    };

    const handleRemoveQuirk = (quirk: string) => {
        const currentQuirks = character.personality?.quirks || [];
        handleNestedChange('personality', 'quirks', currentQuirks.filter(q => q !== quirk));
    };

    // --- Image Upload Helpers ---
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                if (target === 'avatar') {
                    setCharacter(prev => ({ ...prev, imageUrl: reader.result as string }));
                } else if (target === 'banner') {
                    setCharacter(prev => ({ ...prev, bannerUrl: reader.result as string }));
                }
            }
        };
        reader.readAsDataURL(file);
    };

    // Trait sliders interactive updater
    const handleTraitSliderChange = (name: string, value: number) => {
        const updated = personalityTraits.map(t => {
            if (t.name === name) {
                return { ...t, value };
            }
            return t;
        });
        setPersonalityTraits(updated);
        handleNestedChange('personality', 'traits', updated);
    };

    // Final Saving trigger
    const handleSave = () => {
        if (!character.name?.trim()) {
            alert("Character name is required.");
            // Focus or scroll to top
            toggleSection('spark');
            return;
        }
        
        // Build final packed details
        const finalCharacterData = {
            ...character,
            status: isEditing ? character.status : 'Active',
            physicalDetails: {
                Age: ageVal,
                Height: heightVal,
                Strength: strength.toString(),
                Agility: agility.toString(),
                Intellect: intellect.toString(),
                Charisma: charisma.toString(),
                Luck: luck.toString()
            },
            personality: {
                ...character.personality,
                description: character.personality?.description || '',
                traits: personalityTraits,
                quirks: character.personality?.quirks || []
            }
        };

        onSave(finalCharacterData as Character);
    };

    return (
        <div id="character-creation-workshop" className="min-h-screen container mx-auto px-4 py-8 animate-fadeIn h-full overflow-y-auto pb-24 md:pb-12 bg-[#050505] text-neutral-200">
             
             {/* Header */}
             <div className="flex items-center justify-between mb-8 pb-4 border-b border-violet-500/10">
                <div className="flex items-center gap-3">
                    <button onClick={onExit} className="p-2.5 rounded-full hover:bg-neutral-800 transition-colors border border-violet-500/5 text-neutral-400 hover:text-white cursor-pointer" aria-label="Cancel and back">
                        <ArrowLeftIcon />
                    </button>
                    <div>
                        <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold font-mono">Original Character Creator</div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{isEditing ? `Refit ${character.name}` : 'Forge a Legend'}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsAiModalOpen(true)}
                        className="px-4 py-2.5 flex items-center gap-2 text-xs font-black text-neutral-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:scale-105 transition-all cursor-pointer"
                        title="Fully create profile with AI"
                    >
                        <LightningBoltIcon className="w-4 h-4 text-neutral-950 animate-pulse" />
                        Spark with Gemini AI
                    </button>
                </div>
            </div>

            {/* MAIN WORKSPACE GRID */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                
                {/* LEFT PROFILE SHEET (VISUAL IDENTIFICATION) */}
                <div className="space-y-6 lg:col-span-1">
                    
                    {/* Presets Starter section */}
                    <div className="p-4 bg-neutral-900/60 border border-violet-500/10 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                                <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> Inspired Presets
                            </h2>
                            <span className="text-[10px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded-full font-bold">New</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                            Click a template below to instantly load a fully furnished, professionally designed custom RPG stats sheet!
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESET_TEMPLATES.map(p => (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => handleApplyPreset(p)}
                                    className="bg-neutral-950/60 border border-violet-500/10 hover:border-cyan-400/50 p-2.5 rounded-lg text-left transition-all hover:bg-neutral-950 cursor-pointer flex flex-col justify-between group shadow-sm min-h-[72px]"
                                >
                                    <div className="font-extrabold text-xs text-neutral-100 group-hover:text-cyan-400 leading-snug truncate">
                                        {p.label}
                                    </div>
                                    <div className="text-[9px] text-neutral-500 truncate mt-1">
                                        {p.subtitle}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AVATAR & BANNER SHEEP */}
                    <div className="bg-neutral-900/40 border border-violet-500/10 rounded-xl overflow-hidden shadow-xl">
                        
                        {/* Banner Frame */}
                        <div className="relative h-32 bg-neutral-950 w-full overflow-hidden group/banner">
                            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                            {character.bannerUrl ? (
                                <img src={character.bannerUrl} alt="Banner preset" className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/30 to-black flex items-center justify-center text-xs text-neutral-600">
                                    No custom banner selected
                                </div>
                            )}
                            <div 
                                onClick={() => bannerInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover/banner:opacity-100 flex items-center justify-center transition-all cursor-pointer text-xs font-bold text-white uppercase gap-1"
                            >
                                <ImageIcon className="w-4 h-4"/> Choose Banner
                            </div>
                        </div>

                        {/* Profile Identity Details */}
                        <div className="p-5 pt-0 relative flex flex-col items-center text-center">
                            
                            {/* Avatar circle */}
                            <div className="relative -mt-12 group/avatar z-10">
                                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                                <div className="w-24 h-24 rounded-full border-4 border-[#050505] bg-neutral-900 overflow-hidden cursor-pointer relative shadow-lg">
                                    <img src={character.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200'} alt="Avatar art" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                        <Wand2 className="w-5 h-5 text-neutral-100" />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 bg-violet-600 hover:bg-violet-500 p-1.5 rounded-full text-white shadow-md border border-neutral-900 cursor-pointer focus:outline-none"
                                    title="Upload custom image"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Name Showcase */}
                            <div className="mt-3">
                                <h3 className="text-lg font-black text-white hover:text-cyan-400 transition-colors">
                                    {character.name || 'Unnamed Legend'}
                                </h3>
                                <p className="text-xs text-gray-400 font-mono italic mt-0.5 min-h-[16px]">
                                    {character.epithet || 'no title recorded'}
                                </p>
                            </div>

                            <p className="text-xs text-neutral-500 leading-relaxed px-2 mt-2 h-10 select-none overflow-hidden text-ellipsis line-clamp-2">
                                {character.tagline ? `"${character.tagline}"` : 'Choose a tagline to stand out.'}
                            </p>
                        </div>
                    </div>

                    {/* MOODBOARD ART SELECTION PANELS */}
                    <div className="bg-neutral-900/40 border border-violet-500/10 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                                <PaletteIcon /> Visual Art Library
                            </h3>
                            <span className="text-[10px] text-gray-500">Fast Setup</span>
                        </div>

                        {/* Search library */}
                        <form onSubmit={(e) => { e.preventDefault(); handleSearchUnsplash(unsplashSearch); }} className="relative">
                            <input 
                                type="text"
                                placeholder="Search e.g. Elven rogue, Cyberpunk..."
                                value={unsplashSearch}
                                onChange={(e) => setUnsplashSearch(e.target.value)}
                                className="w-full bg-neutral-950 border border-violet-500/10 rounded-lg py-2 pl-3 pr-10 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                            />
                            <button 
                                type="submit" 
                                className="absolute right-1 top-1 p-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 hover:text-violet-300 rounded-md cursor-pointer h-7 w-7 flex items-center justify-center border border-violet-500/10"
                            >
                                <Search className="w-3.5 h-3.5" />
                            </button>
                        </form>

                        {/* Search results or curated presets list */}
                        {searchResults.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-neutral-500">
                                    <span>Web results:</span>
                                    <button onClick={() => setSearchResults([])} className="text-violet-400 hover:underline">Reset</button>
                                </div>
                                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                    {searchResults.map((res) => (
                                        <button
                                            key={res.id}
                                            onClick={() => setCharacter(p => ({ ...p, imageUrl: res.url }))}
                                            className="h-14 bg-neutral-950 rounded-lg overflow-hidden border border-violet-500/5 hover:border-cyan-500 transition-all cursor-pointer relative"
                                        >
                                            <img src={res.url} alt="Search result" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Search Category terms tags */}
                                <div className="flex flex-wrap gap-1">
                                    {SEARCH_SUGGESTIONS.map(term => (
                                        <button
                                            key={term}
                                            type="button"
                                            onClick={() => { setUnsplashSearch(term); handleSearchUnsplash(term); }}
                                            className="text-[9px] font-bold bg-neutral-950 border border-violet-500/5 text-neutral-400 hover:text-white px-2 py-1 rounded-md cursor-pointer hover:border-cyan-500/30"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>

                                {/* Curated beautiful pairs */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Curated Art Pairs:</div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {ART_PRESETS.map((art) => (
                                            <button
                                                key={art.name}
                                                type="button"
                                                onClick={() => setCharacter(p => ({ ...p, imageUrl: art.avatar, bannerUrl: art.banner }))}
                                                className="w-full flex items-center gap-3 p-1.5 bg-neutral-950/40 rounded-lg hover:bg-neutral-950 border border-violet-500/5 hover:border-cyan-500/40 transition-all text-left group cursor-pointer"
                                            >
                                                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                                    <img src={art.avatar} alt={art.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[11px] font-black text-neutral-300 group-hover:text-cyan-400 transition-colors truncate">
                                                        {art.name}
                                                    </div>
                                                    <div className="text-[9px] text-neutral-500 truncate mt-0.5">
                                                        Apply banner & avatar pair
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT DETAILED BUILDER SHEET (FORM CONTENT) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* CORE IDENTITY DETAILS PANEL */}
                    <div className="bg-neutral-900/20 border border-violet-500/10 p-5 rounded-xl space-y-5">
                        <div className="flex items-center gap-2 text-sm font-black text-neutral-100 pb-2 border-b border-violet-500/10">
                            <User className="w-4 h-4 text-violet-400" /> Essential Details
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormInput 
                                id="name" 
                                label="Legendary Name" 
                                placeholder="e.g., Vance Sterling, Aegis-09" 
                                value={character.name || ''} 
                                onChange={(e) => setCharacter(p => ({ ...p, name: e.target.value }))} 
                            />
                            <FormInput 
                                id="epithet" 
                                label="Epithet / Title / Call-sign" 
                                placeholder="e.g., the Brass Alchemist" 
                                value={character.epithet || ''} 
                                onChange={(e) => setCharacter(p => ({ ...p, epithet: e.target.value }))} 
                            />
                        </div>
                        <FormTextarea 
                            id="tagline" 
                            label="Tagline / Key Philosophy / One-liner" 
                            placeholder="e.g., Trust is a currency I do not spend lightly." 
                            value={character.tagline || ''} 
                            rows={2} 
                            onChange={(e) => setCharacter(p => ({ ...p, tagline: e.target.value }))} 
                        />

                        {/* Archetype Tags */}
                        <div className="space-y-1.5 pt-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Identify Tags / Archetypes</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {character.archetypeTags?.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-violet-500/10 text-violet-300 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-500/20">
                                        {tag}
                                        <button 
                                            type="button" 
                                            onClick={() => removeTag(tag)} 
                                            className="text-violet-400 hover:text-white cursor-pointer ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-violet-500/20"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={currentArchetypeTag} 
                                    onChange={(e) => { setCurrentArchetypeTag(e.target.value); setShowTagSuggestions(true); }} 
                                    onKeyDown={handleTagKeyDown}
                                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                                    placeholder="Type archetype and press Space/Enter, e.g., Hero, Spellsword..." 
                                    className="w-full bg-neutral-950 border border-violet-500/10 rounded-lg py-2 px-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
                                />
                                {showTagSuggestions && filteredArchetypes.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-850 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                                        {filteredArchetypes.map(tag => (
                                            <button 
                                                key={tag} 
                                                type="button" 
                                                onClick={() => addTag(tag)} 
                                                className="block w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-850 hover:text-cyan-400"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION BLOCKS */}
                    <div className="space-y-4">
                        
                        {/* 1. BLUEPRINT (Vitals & Physical attributes / Backstory) */}
                        <AccordionItem 
                            title="Blueprint & Vitals" 
                            isOpen={openSections.includes('blueprint')} 
                            onToggle={() => toggleSection('blueprint')} 
                            rightContent={<span className="text-[10px] px-2 py-0.5 roundedbg font-mono bg-cyan-500/10 text-cyan-400 font-bold tracking-widest uppercase">Attributes Setup</span>}
                            icon={<Sliders className="w-4 h-4" />}
                        >
                            <div className="space-y-6">
                                
                                {/* Basic Physical parameters */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput 
                                        id="age" 
                                        label="Age / Span of Life" 
                                        placeholder="e.g., 28, 400, Unknown" 
                                        value={ageVal} 
                                        onChange={(e) => setAgeVal(e.target.value)} 
                                    />
                                    <FormInput 
                                        id="height" 
                                        label="Height / Stature" 
                                        placeholder="e.g., 5'11, 180 cm" 
                                        value={heightVal} 
                                        onChange={(e) => setHeightVal(e.target.value)} 
                                    />
                                </div>

                                {/* RPG Core Stats */}
                                <div className="space-y-4 p-4 rounded-xl bg-neutral-950/60 border border-violet-500/5">
                                    <div className="text-xs font-bold uppercase tracking-widest text-[#9c27b0] flex items-center gap-1 border-b border-violet-500/10 pb-2 mb-3">
                                        <BadgeCheck className="w-4 h-4" /> Attributes (RPG parameters)
                                    </div>

                                    {/* Strength slider */}
                                    <div>
                                        <div className="flex justify-between text-xs font-medium mb-1.5">
                                            <span className="text-neutral-400">Strength (Physical Power/Stamina)</span>
                                            <span className="font-bold text-cyan-400 text-sm">{strength}</span>
                                        </div>
                                        <input 
                                            type="range" min="10" max="100" value={strength} 
                                            onChange={(e) => setStrength(parseInt(e.target.value))} 
                                            className="w-full accent-cyan-500 bg-neutral-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Agility slider */}
                                    <div>
                                        <div className="flex justify-between text-xs font-medium mb-1.5">
                                            <span className="text-neutral-400">Agility (Coordination & Reflexes)</span>
                                            <span className="font-bold text-cyan-400 text-sm">{agility}</span>
                                        </div>
                                        <input 
                                            type="range" min="10" max="100" value={agility} 
                                            onChange={(e) => setAgility(parseInt(e.target.value))} 
                                            className="w-full accent-cyan-500 bg-neutral-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Intellect slider */}
                                    <div>
                                        <div className="flex justify-between text-xs font-medium mb-1.5">
                                            <span className="text-neutral-400">Intellect (Cognition & Magical Focus)</span>
                                            <span className="font-bold text-cyan-400 text-sm">{intellect}</span>
                                        </div>
                                        <input 
                                            type="range" min="10" max="100" value={intellect} 
                                            onChange={(e) => setIntellect(parseInt(e.target.value))} 
                                            className="w-full accent-cyan-500 bg-neutral-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Charisma slider */}
                                    <div>
                                        <div className="flex justify-between text-xs font-medium mb-1.5">
                                            <span className="text-neutral-400">Charisma (Banter & Presence)</span>
                                            <span className="font-bold text-cyan-400 text-sm">{charisma}</span>
                                        </div>
                                        <input 
                                            type="range" min="10" max="100" value={charisma} 
                                            onChange={(e) => setCharisma(parseInt(e.target.value))} 
                                            className="w-full accent-cyan-500 bg-neutral-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Luck slider */}
                                    <div>
                                        <div className="flex justify-between text-xs font-medium mb-1.5">
                                            <span className="text-neutral-400">Luck (Chance & Critical Fate)</span>
                                            <span className="font-bold text-cyan-400 text-sm">{luck}</span>
                                        </div>
                                        <input 
                                            type="range" min="10" max="100" value={luck} 
                                            onChange={(e) => setLuck(parseInt(e.target.value))} 
                                            className="w-full accent-cyan-500 bg-neutral-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <FormTextarea 
                                    id="appearanceDesc" 
                                    label="Appearance Narrative" 
                                    placeholder="Describe their visage, clothing, accessories, posture, and distinctive birthmarks..." 
                                    value={character.appearance || ''} 
                                    rows={3} 
                                    onChange={(e) => setCharacter(p => ({ ...p, appearance: e.target.value }))} 
                                />

                                <FormTextarea 
                                    id="backstory" 
                                    label="Backstory & Historical Lineage" 
                                    placeholder="Tell the story of how they were born, their critical choices, secrets, and current struggles..." 
                                    value={character.backstory || ''} 
                                    rows={5} 
                                    onChange={(e) => setCharacter(p => ({ ...p, backstory: e.target.value }))} 
                                />
                            </div>
                        </AccordionItem>

                        {/* 2. THE SPARK (Personality, Sliders & Quirks) */}
                        <AccordionItem 
                            title="The Spark & Personality" 
                            isOpen={openSections.includes('spark')} 
                            onToggle={() => toggleSection('spark')} 
                            icon={<Heart className="w-4 h-4 text-rose-400" />}
                        >
                            <div className="space-y-6">
                                <FormTextarea 
                                    id="personalityDesc" 
                                    label="Personality Blueprint Summary" 
                                    placeholder="How do they handle pressure, grief, success, and interactions with friends?" 
                                    value={character.personality?.description || ''} 
                                    rows={3} 
                                    onChange={(e) => handleNestedChange('personality', 'description', e.target.value)} 
                                />

                                {/* Complex Personality sliders */}
                                <div className="space-y-4 p-4 rounded-xl bg-neutral-950/60 border border-violet-500/5">
                                    <div className="text-xs font-bold uppercase tracking-widest text-[#f44336] flex items-center gap-1 border-b border-violet-500/10 pb-2 mb-3">
                                        <Wand2 className="w-4 h-4" /> Personality Trait Sliders
                                    </div>

                                    {personalityTraits.map(trait => (
                                        <div key={trait.name} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs font-bold font-mono">
                                                <span className={`text-${trait.value <= 40 ? 'white font-extrabold' : 'neutral-500'}`}>{trait.labels[0]}</span>
                                                <span className="text-cyan-400 italic font-sans font-black">{trait.name}</span>
                                                <span className={`text-${trait.value >= 60 ? 'white font-extrabold' : 'neutral-500'}`}>{trait.labels[1]}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" value={trait.value} 
                                                onChange={(e) => handleTraitSliderChange(trait.name, parseInt(e.target.value))} 
                                                className="w-full accent-cyan-500 bg-neutral-900 h-1 bg-violet-600/10"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Quirks and Habits list */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Compelling Quirks / Habits</label>
                                    
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Add quirky habit e.g., Flips gold coin, Refuses to enter vaults..." 
                                            value={newQuirkText}
                                            onChange={(e) => setNewQuirkText(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuirk(); } }}
                                            className="flex-1 bg-neutral-950 border border-violet-500/10 rounded-lg py-2 px-3 text-xs text-neutral-200"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleAddQuirk}
                                            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {(character.personality?.quirks || []).map(quirk => (
                                            <span key={quirk} className="flex items-center gap-1.5 bg-neutral-950 border border-violet-500/10 text-neutral-300 text-xs px-3 py-1 rounded-full">
                                                {quirk}
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveQuirk(quirk)} 
                                                    className="text-neutral-500 hover:text-red-400 cursor-pointer text-[10px]"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* 3. ABILITIES & TRADES PANEL */}
                        <AccordionItem 
                            title="Signature Abilities" 
                            isOpen={openSections.includes('abilities')} 
                            onToggle={() => toggleSection('abilities')} 
                            icon={<Flame className="w-4 h-4 text-amber-400" />}
                        >
                            <div className="space-y-4">
                                {character.abilities?.map((ability, index) => (
                                    <div key={index} className="bg-neutral-950/60 p-4 rounded-xl border border-violet-500/5 relative group space-y-3">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newAbilities = character.abilities?.filter((_, i) => i !== index);
                                                setCharacter(p => ({ ...p, abilities: newAbilities }));
                                            }} 
                                            className="absolute top-3 right-3 text-neutral-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold font-mono uppercase text-gray-500">Ability {index + 1}</span>
                                            <input 
                                                type="text" 
                                                value={ability.name} 
                                                onChange={(e) => {
                                                    const newAbilities = [...(character.abilities || [])];
                                                    newAbilities[index].name = e.target.value;
                                                    setCharacter(p => ({ ...p, abilities: newAbilities }));
                                                }}
                                                placeholder="e.g., Shadow Cloak" 
                                                className="w-full bg-transparent text-white font-extrabold text-sm border-b border-violet-500/10 focus:border-cyan-500/50 outline-none pb-1" 
                                            />
                                        </div>
                                        <textarea 
                                            value={ability.description} 
                                            onChange={(e) => {
                                                const newAbilities = [...(character.abilities || [])];
                                                newAbilities[index].description = e.target.value;
                                                setCharacter(p => ({ ...p, abilities: newAbilities }));
                                            }}
                                            placeholder="Describe what the ability does in active role-play..." 
                                            rows={2} 
                                            className="w-full bg-transparent text-xs text-neutral-400 resize-none focus:outline-none leading-relaxed" 
                                        />
                                    </div>
                                ))}

                                <button 
                                    type="button" 
                                    onClick={() => setCharacter(p => ({ ...p, abilities: [...(p.abilities || []), { name: '', description: '' }] }))}
                                    className="w-full py-2.5 border border-dashed border-violet-500/20 text-neutral-400 rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-neutral-900/10"
                                >
                                    <Plus className="w-4 h-4" /> Add Custom Ability
                                </button>
                            </div>
                        </AccordionItem>

                        {/* 4. DEFENSE SYSTEM (Safety controls) */}
                        <AccordionItem 
                            title="Defense System & Safety Rating" 
                            isOpen={openSections.includes('defense')} 
                            onToggle={() => toggleSection('defense')} 
                            icon={<ShieldAlert className="w-4 h-4 text-cyan-400" />}
                        >
                            <ContentRatingSelector 
                                rating={character.contentMetadata?.ageRating || 'Everyone'} 
                                setRating={(r) => handleNestedChange('contentMetadata', 'ageRating', r)}
                                warnings={character.contentMetadata?.warnings || []}
                                setWarnings={(w) => handleNestedChange('contentMetadata', 'warnings', w)}
                            />
                        </AccordionItem>
                    </div>
                </div>
            </div>

            {/* STICKY CONTROL CONTROL ACTION PANEL */}
            <div className="mt-10 border-t border-violet-500/10 pt-6 flex justify-end gap-3 max-w-6xl mx-auto">
                <button 
                    onClick={onExit} 
                    className="px-6 py-2.5 text-xs font-extrabold text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                    Cancel Workshop
                </button>
                <button 
                    onClick={handleSave} 
                    className="px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-neutral-900 font-black rounded-lg shadow-lg shadow-cyan-400/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-xs"
                >
                    {isEditing ? 'Confirm & Save Changes' : 'Draft Complete - Ignite OC'}
                </button>
            </div>

            <CharacterAiGeneratorModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
                onGenerate={handleAiGenerate} 
            />
        </div>
    );
};

// Simple inline icons to guarantee build succeed
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-violet-400"><path d="M12 2.25a9.75 9.75 0 00-9.75 9.75c0 1.05.85 1.9 1.9 1.9h1.12a.63.63 0 01.44.18c.11.12.18.28.18.45 0 .2-.08.38-.22.51l-1.07 1.07a1.88 1.88 0 00-.55 1.33c0 .5.2.98.55 1.33A9.75 9.75 0 1012 2.25zm-4.59 5.8a1.35 1.35 0 111.9 1.9 1.35 1.35 0 01-1.9-1.9zm5.3-.6a1.35 1.35 0 111.91 1.9 1.35 1.35 0 01-1.91-1.9zm4.24 3.64a1.35 1.35 0 111.9 1.9 1.35 1.35 0 01-1.9-1.9z" /></svg>;

interface CharacterCreationPageProps {
    characterToEdit?: Character;
    onExit: () => void;
    onSave: (characterData: Omit<Character, 'id' | 'status'> | Character) => void;
}

export default CharacterCreationPage;
