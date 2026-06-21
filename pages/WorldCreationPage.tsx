import React, { useState } from 'react';
import { World, AgeRating, ContentWarning, WorldLocation } from '../types';
import ContentRatingSelector from '../components/ContentRatingSelector';

// --- Icons ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;
const PhotoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-500"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-cyan-400"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.1-.115 4.532c-.02.82.87 1.467 1.581 1.028l3.961-2.454 3.96 2.454c.712.439 1.602-.207 1.582-1.028l-.115-4.532 3.6-3.1c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>;
const AdjustmentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.24 6.8a.8.8 0 01.8-.8h13.92a.8.8 0 110 1.6H3.04a.8.8 0 01-.8-.8zm0 5.2a.8.8 0 01.8-.8h13.92a.8.8 0 110 1.6H3.04a.8.8 0 01-.8-.8z" clipRule="evenodd" /></svg>;

const presetCovers = [
  { name: 'Cosmic Void', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop' },
  { name: 'Fantasy Kingdom', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop' },
  { name: 'Cyber Neon', url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=800&auto=format&fit=crop' },
  { name: 'Ancient Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop' }
];

interface WorldCreationPageProps {
    onExit: () => void;
    onCreate: (newWorld: any) => void;
}

const WorldCreationPage: React.FC<WorldCreationPageProps> = ({ onExit, onCreate }) => {
    const [currentStep, setCurrentStep] = useState(1);

    // --- State values for Wizard ---
    // Step 1: Core Config
    const [name, setName] = useState('');
    const [tagline, setTagline] = useState('');
    const [synopsis, setSynopsis] = useState('');
    const [coverUrl, setCoverUrl] = useState(presetCovers[0].url);
    const [tags, setTags] = useState<string[]>(['Fantasy', 'Action']);
    const [currentTag, setCurrentTag] = useState('');

    // Step 2: Entrance & Intro
    const [welcomeMessage, setWelcomeMessage] = useState('Welcome adventurer, we have been waiting for your return to this land.');
    const [rules, setRules] = useState('1. Respect other roleplayers. 2. Mark OOC chat comments with brackets. 3. No godmodding.');
    const [entrancePrompt, setEntrancePrompt] = useState('Briefly describe your character idea or what role you wish to play in Aethelgard.');

    // Step 3: Blueprint Aesthetics & Mechanisms
    const [colorTheme, setColorTheme] = useState('royal'); // royal, emerald, steampunk, gothic, neon, cosmic
    const [backgroundPattern, setBackgroundPattern] = useState('nebula'); // nebula, lattice, leather, gothic, cyber
    const [highConcept, setHighConcept] = useState('A land divided by unstable raw magical storms, where sky islands float over a sunken mechanical deep.');
    const [keyElements, setKeyElements] = useState<string[]>(['Floating islands', 'Raw storm energy', 'Duskpunk Airships']);
    const [currentKeyElement, setCurrentKeyElement] = useState('');
    const [defaultOcMode, setDefaultOcMode] = useState<'required' | 'optional'>('required');

    // Step 4: Security Classification
    const [ageRating, setAgeRating] = useState<AgeRating>('Everyone');
    const [warnings, setWarnings] = useState<ContentWarning[]>([]);

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = currentTag.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleElementKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = currentKeyElement.trim();
            if (val && !keyElements.includes(val)) {
                setKeyElements([...keyElements, val]);
            }
            setCurrentKeyElement('');
        }
    };

    const removeKeyElement = (el: string) => {
        setKeyElements(keyElements.filter(item => item !== el));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setCoverUrl(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        if (currentStep === 1 && !name.trim()) {
            alert("World name is required.");
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleCreate = () => {
        // Construct some rich pre-filled functional channels based on selected genre & color theme
        const channelCategories = [
            {
                category: "WELCOME & INTRO",
                channels: [
                    {
                        id: 100,
                        name: "welcome-lobby",
                        description: "New member entrance requests and prompts are verified here.",
                        messages: [
                            {
                                id: 1,
                                text: `System Bulletin: Welcome to ${name}! Rule summary: ${rules}`,
                                timestamp: "12:00 PM",
                                sender: { id: 0, name: "Oracle Guide", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" }
                            }
                        ],
                        imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
                        iconUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
                    }
                ]
            },
            {
                category: "ACTIVE PLAY SPACES",
                channels: [
                    {
                        id: 101,
                        name: "the-town-square",
                        description: "The bustling core of active RP. State your business.",
                        messages: [],
                        imageUrl: coverUrl,
                        iconUrl: coverUrl
                    },
                    {
                        id: 102,
                        name: "whispering-tavern",
                        description: "Grab a drink and share stories of past adventures.",
                        messages: [],
                        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
                        iconUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100"
                    }
                ]
            }
        ];

        onCreate({
            name,
            tagline,
            synopsis,
            genreTags: tags,
            authorId: 0, // Handled by MainApp
            imageUrl: coverUrl,
            bannerUrl: coverUrl,
            welcomeMessage,
            rules,
            entrancePrompt,
            colorTheme,
            backgroundPattern,
            highConcept,
            keyElements,
            defaultOcMode,
            lorebook: [],
            members: [], // Welcomes current member first in MainApp
            locations: channelCategories,
            mapPins: [],
            timeline: [],
            contentMetadata: {
                ageRating,
                warnings
            }
        });
    };

    return (
        <div className="min-h-screen bg-neutral-950 bg-gradient-to-br from-neutral-950 via-[#0a0520] to-neutral-900 border-t border-violet-500/20 px-4 py-8 md:px-8 text-neutral-100 font-sans">
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={onExit} className="p-2 sm:p-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors" aria-label="Cancel">
                        <ArrowLeftIcon />
                    </button>
                    <div>
                        <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider mb-0.5">Workshop Blueprint</div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Your World</h1>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="hidden md:flex items-center gap-3 text-xs font-semibold uppercase tracking-wider font-mono">
                    {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${currentStep === idx ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30' : currentStep > idx ? 'bg-neutral-900 border-neutral-800 text-emerald-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}>
                                {currentStep > idx ? '✓' : idx}
                            </span>
                            <span className={currentStep === idx ? 'text-neutral-100' : 'text-neutral-500'}>
                                {idx === 1 ? 'Identity' : idx === 2 ? 'Entrance' : idx === 3 ? 'Aesthetic' : 'Safety'}
                            </span>
                            {idx < 4 && <span className="text-neutral-700">|</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Stage Indicator for Mobile */}
            <div className="md:hidden flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-lg p-3 mb-6 text-sm">
                <span className="text-neutral-400">Step {currentStep} of 4:</span>
                <span className="text-cyan-400 font-bold font-mono">
                    {currentStep === 1 ? 'Identity' : currentStep === 2 ? 'Entrance' : currentStep === 3 ? 'Aesthetics' : 'Safety'}
                </span>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden max-w-4xl mx-auto min-h-[500px] flex flex-col justify-between">
                
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* STEP 1: CORE IDENTITY */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                                <SparklesIcon /> Identity & Core Lore
                            </h2>
                            <p className="text-sm text-neutral-400">Flesh out the name and deep synopsis that defines the main premise of your RP world.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">World Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Aethelgard: The Floating Realm"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Catchy Tagline</label>
                                <input
                                    type="text"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    placeholder="e.g., Where airships reign and raw magic rains."
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Synopsis & Deep Introduction</label>
                                <textarea
                                    value={synopsis}
                                    onChange={(e) => setSynopsis(e.target.value)}
                                    placeholder="Describe the conflicts, technology, magic systems, setting details, and overall vibe."
                                    rows={5}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Genre Tags</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold px-3 py-1.5 rounded-full">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="text-neutral-400 hover:text-white transition-colors" type="button">
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Add tagline (e.g. Cyberpunk, Medieval) & press Enter/Comma"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            {/* Cover Selector */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Choose Cover Art</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {presetCovers.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setCoverUrl(preset.url)}
                                            className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${coverUrl === preset.url ? 'border-cyan-400 scale-[1.03] ring-4 ring-cyan-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                                            <span className="absolute bottom-1 left-2 pr-2 text-[10px] font-bold text-white bg-black/60 rounded px-1.5 py-0.5">{preset.name}</span>
                                        </button>
                                    ))}
                                    <label className="aspect-video bg-neutral-950 border border-dashed border-neutral-700 hover:border-cyan-500 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                                        <PhotoIcon />
                                        <span className="text-[10px] text-neutral-500 group-hover:text-cyan-400 font-bold mt-1">Custom Image</span>
                                        <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: ENTRANCE & INTRO */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                                <SparklesIcon /> Onboarding & Gating Protocols
                            </h2>
                            <p className="text-sm text-neutral-400">Configure what users see when first discovering or joining Aethelgard.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Guild Welcome Transmission</label>
                                <textarea
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    placeholder="Enter automatic welcome text shown when members open the lobby."
                                    rows={4}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">The Creed (Rules & Canon Summaries)</label>
                                <textarea
                                    value={rules}
                                    onChange={(e) => setRules(e.target.value)}
                                    placeholder="Set key rules for OCs, behaviors, and interaction formats."
                                    rows={4}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Entrance Prompt Gating</label>
                                <textarea
                                    value={entrancePrompt}
                                    onChange={(e) => setEntrancePrompt(e.target.value)}
                                    placeholder="e.g., Name your species and summarize how your character will enter the Capital City."
                                    rows={3}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none font-medium"
                                />
                                <p className="text-[11px] text-neutral-500 mt-1">Members must reply to this prompt before their character receives validation to roleplay.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: AESTHETICS & MECHANICS */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                                <AdjustmentsIcon /> World Aesthetic & Mechanics
                            </h2>
                            <p className="text-sm text-neutral-400">Establish the theme accents, pattern branding, and default role-playing systems.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Color Selector */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Color Paradigm Theme</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                    {[
                                        { id: 'royal', label: 'Royal', color: 'bg-indigo-600', text: 'text-indigo-400' },
                                        { id: 'emerald', label: 'Emerald', color: 'bg-emerald-600', text: 'text-emerald-400' },
                                        { id: 'steampunk', label: 'Steampunk', color: 'bg-amber-600', text: 'text-amber-400' },
                                        { id: 'gothic', label: 'Gothic', color: 'bg-rose-700', text: 'text-rose-400' },
                                        { id: 'neon', label: 'Neon Cyber', color: 'bg-cyan-600', text: 'text-cyan-400' },
                                        { id: 'cosmic', label: 'Cosmic Void', color: 'bg-slate-600', text: 'text-slate-400' }
                                    ].map(theme => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={() => setColorTheme(theme.id)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${colorTheme === theme.id ? 'bg-neutral-800 border-neutral-700 ring-2 ring-cyan-500' : 'bg-neutral-950 border-neutral-800 opacity-75 hover:opacity-100'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full mb-1.5 ${theme.color}`} />
                                            <span className={`text-[10px] font-bold ${theme.text}`}>{theme.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Background pattern */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Ambient Background Pattern</label>
                                <select
                                    value={backgroundPattern}
                                    onChange={(e) => setBackgroundPattern(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-white text-sm"
                                >
                                    <option value="nebula">Constellation Spark Nebula</option>
                                    <option value="lattice">Futuristic Gridded Lattice</option>
                                    <option value="leather">Steampunk Distressed Leather</option>
                                    <option value="gothic">Baroque Gothic Damask</option>
                                    <option value="cyber">Anodized Dark Cyber-mesh</option>
                                </select>
                            </div>

                            {/* Key Elements */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">High Concept Elements (e.g. Power systems, Factions)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {keyElements.map(el => (
                                        <span key={el} className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs px-3 py-1.5 rounded-full">
                                            {el}
                                            <button onClick={() => removeKeyElement(el)} className="text-neutral-400 hover:text-white" type="button">✕</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={currentKeyElement}
                                    onChange={(e) => setCurrentKeyElement(e.target.value)}
                                    onKeyDown={handleElementKeyDown}
                                    placeholder="Type a signature element (e.g. Magic crystals) and press Enter"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            {/* Default OC Gating mode */}
                            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4">
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Default OC Mode</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setDefaultOcMode('required')}
                                        className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${defaultOcMode === 'required' ? 'bg-cyan-500/10 border-cyan-500/60 text-white' : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'}`}
                                    >
                                        <span className="font-bold text-sm block">🎭 Character Required</span>
                                        <span className="text-[10px] text-neutral-400 mt-1">Members cannot post in play channels without active character selection.</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDefaultOcMode('optional')}
                                        className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${defaultOcMode === 'optional' ? 'bg-cyan-500/10 border-cyan-500/60 text-white' : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'}`}
                                    >
                                        <span className="font-bold text-sm block">💬 Freeform Chat</span>
                                        <span className="text-[10px] text-neutral-400 mt-1">OOC chat is allowed everywhere. Ideal for storytelling playrooms.</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: RATINGS & WARNINGS */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                                <AdjustmentsIcon /> World Safety Protocols
                            </h2>
                            <p className="text-sm text-neutral-400">Classify the emotional, visual, and thematic boundaries of your story space.</p>
                        </div>

                        <div className="flex-grow flex flex-col justify-center">
                            <ContentRatingSelector 
                                rating={ageRating} 
                                setRating={setAgeRating} 
                                warnings={warnings} 
                                setWarnings={setWarnings}
                                title="Safety Standards (Ratings & Triggers)"
                            />
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex justify-between items-center pt-6 mt-8 border-t border-neutral-800/80">
                    <button
                        type="button"
                        onClick={currentStep === 1 ? onExit : handlePrev}
                        className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all hover:bg-neutral-800 text-sm font-semibold"
                    >
                        {currentStep === 1 ? 'Cancel' : 'Previous Step'}
                    </button>

                    <button
                        type="button"
                        onClick={currentStep === 4 ? handleCreate : handleNext}
                        className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all duration-250 text-sm"
                    >
                        {currentStep === 4 ? 'Initialize World Blueprint' : 'Proceed Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorldCreationPage;
