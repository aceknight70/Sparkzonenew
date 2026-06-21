import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Story, AgeRating, ContentWarning, Character, LoreEntry, Chapter } from '../types';
import ContentRatingSelector from '../components/ContentRatingSelector';
import { characters as allCharacters } from '../mockData';

// Custom Icons for a premium glowing dashboard feel
const InfoIcon = () => <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const GameControllerIcon = () => <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4m7-2h.01M18 12h.01"/></svg>;
const MapIcon = () => <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
const ClockIcon = () => <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon = () => <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BookOpenIcon = () => <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const TrashIcon = () => <svg className="w-4 h-4 text-red-500 hover:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => <svg className={`w-5 h-5 text-gray-400 transition-transform duration-350 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>;

interface StoryCreationPageProps {
    onExit: () => void;
    onCreate: (newStory: any) => void;
    initialData?: Story;
}

const StoryCreationPage: React.FC<StoryCreationPageProps> = ({ onExit, onCreate, initialData }) => {
    // --- SECTION COLLAPSE STATES ---
    const [openSections, setOpenSections] = useState<Record<number, boolean>>({
        1: true,   // Basic Info
        2: false,  // Lore Elements
        3: false,  // Universe Rules
        4: false,  // Characters & Relations
        5: false,  // Atlas Map
        6: false,  // Timeline Timeline
        7: false,  // Themes & Genres
        8: false,  // Reusable Actions
        9: false,  // Notes
        10: false  // Collaborators
    });

    const toggleSection = (sectionId: number) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // --- FORM STATES ---
    const [title, setTitle] = useState(initialData?.name || '');
    const [synopsis, setSynopsis] = useState(initialData?.synopsis || '');
    const [coverUrl, setCoverUrl] = useState(initialData?.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop');
    const [ageRating, setAgeRating] = useState<AgeRating>(initialData?.contentMetadata?.ageRating || 'Everyone');
    const [warnings, setWarnings] = useState<ContentWarning[]>(initialData?.contentMetadata?.warnings || []);
    const [tags, setTags] = useState<string[]>(initialData?.genreTags || ['Fantasy', 'Roleplay']);
    const [newTag, setNewTag] = useState('');

    // --- SECTION 2: LORE ELEMENTS ---
    const [loreList, setLoreList] = useState<LoreEntry[]>(initialData?.lorebook || []);
    const [loreName, setLoreName] = useState('');
    const [loreCategory, setLoreCategory] = useState('Faction');
    const [loreDescription, setLoreDescription] = useState('');

    // --- SECTION 3: UNIVERSE ELEMENTS ---
    const [universeRules, setUniverseRules] = useState<string[]>(initialData?.universeRules || ['Magic requires direct skin-to-element contact.', 'FTL flight takes a heavy toll on Organic OCs unless shielded.']);
    const [newRule, setNewRule] = useState('');

    // --- SECTION 4: CHARACTERS & RELATIONS ---
    const [importedCast, setImportedCast] = useState<{ characterId: number; role: string }[]>(initialData?.cast || []);
    const [relationships, setRelationships] = useState<NonNullable<Story['characterRelationships']>>(initialData?.characterRelationships || []);
    const [selectedCastChar, setSelectedCastChar] = useState<number>(allCharacters[0]?.id || 0);
    const [selectedCastRole, setSelectedCastRole] = useState('Protagonist');
    
    // Relationship Builder states
    const [relCharA, setRelCharA] = useState<number>(0);
    const [relCharB, setRelCharB] = useState<number>(0);
    const [relationText, setRelationText] = useState('');

    // --- SECTION 5: ATLAS (Map Pins) ---
    const [atlasPoints, setAtlasPoints] = useState<NonNullable<Story['atlasPoints']>>(initialData?.atlasPoints || [
        { id: 1, name: 'Whispering Sanctum', description: 'The grand capital of elemental sorcerers.', x: 45, y: 35, linkType: 'none' },
        { id: 2, name: 'Ironhold Spires', description: 'Garrison base built deep within mountain ridges.', x: 70, y: 65, linkType: 'none' }
    ]);
    const [newPinName, setNewPinName] = useState('');
    const [newPinDescription, setNewPinDescription] = useState('');
    const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);

    // --- SECTION 6: TIMELINE ---
    const [timelineEvents, setTimelineEvents] = useState<NonNullable<Story['timelineEvents']>>(initialData?.timelineEvents || [
        { id: 1, eraName: 'Dawn Age', date: 'Circa 0 AE', description: 'The world burst open, producing floating islands called Sparks.' }
    ]);
    const [eraName, setEraName] = useState('');
    const [eraDate, setEraDate] = useState('');
    const [eraDesc, setEraDesc] = useState('');

    // --- SECTION 7: THEMES & GENRES (Checker) ---
    const availableThemes = ['Betrayal', 'Redemption', 'Mystery', 'Coming of Age', 'Power of Friendship', 'Dark Fantasy', 'Cyberpunk Tech', 'Cosmic Horror', 'Zero to Hero', 'Found Family'];
    const [selectedThemes, setSelectedThemes] = useState<string[]>(initialData?.genreTags?.filter(t => availableThemes.includes(t)) || ['Mystery']);
    const [customTheme, setCustomTheme] = useState('');

    // --- SECTION 8: SCENES/ACTIONS LIBRARY ---
    const [reusableActions, setReusableActions] = useState<NonNullable<Story['reusableActions']>>(initialData?.reusableActions || [
        { id: 1, name: 'Clash of Blades', content: 'With a deafening clash of steel, their weapons locked in a shower of brilliant sparks.' },
        { id: 2, name: 'Shadow Meld', content: 'Dipping backwards, they vanished completely into the cold surrounding shadows.' }
    ]);
    const [actionName, setActionName] = useState('');
    const [actionContent, setActionContent] = useState('');

    // --- SECTION 9: NOTES & SCRATCHPAD ---
    const [scratchpadText, setScratchpadText] = useState(initialData?.scratchpad || '# Writer Notes\n- Introduce the rival early in chapter 2.\n- Make sure magic limits are respected.');

    // --- SECTION 10: COLLABORATORS ---
    const [collaborators, setCollaborators] = useState<NonNullable<Story['collaborators']>>(initialData?.collaborators || [
        { username: 'AceKnight', role: 'Lore Keeper' }
    ]);
    const [collabUsername, setCollabUsername] = useState('');
    const [collabRole, setCollabRole] = useState<'Writer' | 'Editor' | 'Artist' | 'Lore Keeper'>('Writer');

    // Cover upload reference and notification toast
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Auto-fill coordinates for relationship dropdown triggers
    useEffect(() => {
        if (importedCast.length >= 2) {
            setRelCharA(importedCast[0].characterId);
            setRelCharB(importedCast[1].characterId);
        }
    }, [importedCast]);

    // Validation checks summary
    const validationErrors = useMemo(() => {
        const errors: string[] = [];
        if (!title.trim()) errors.push('Title is required');
        if (synopsis.length > 300) errors.push('Synopsis must be under 300 characters');
        return errors;
    }, [title, synopsis]);

    // Completion math
    const countCompletedSections = useMemo(() => {
        let count = 0;
        if (title.trim() && synopsis.trim()) count++; // section 1
        if (loreList.length > 0) count++;              // section 2
        if (universeRules.length > 0) count++;         // section 3
        if (importedCast.length > 0) count++;          // section 4
        if (atlasPoints.length > 0) count++;           // section 5
        if (timelineEvents.length > 0) count++;        // section 6
        if (selectedThemes.length > 0) count++;        // section 7
        if (reusableActions.length > 0) count++;       // section 8
        if (scratchpadText.trim().length > 10) count++; // section 9
        if (collaborators.length > 0) count++;         // section 10
        return count;
    }, [title, synopsis, loreList, universeRules, importedCast, atlasPoints, timelineEvents, selectedThemes, reusableActions, scratchpadText, collaborators]);

    // --- ACTION HANDLERS ---
    
    // Handle manual cover image upload with validation
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type (JPG, PNG, WebP)
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert("Invalid file format. Please upload JPG, PNG, or WebP images only.");
            return;
        }

        // Validate size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("File size exceeds 10MB. Please choose a smaller file.");
            return;
        }

        // Validate dimensions (max 4096x4096px)
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (img.width > 4096 || img.height > 4096) {
                    alert(`Dimensions exceed 4096x4096px (Got: ${img.width}x${img.height}px). Please select a smaller dimension image.`);
                    return;
                }
                setCoverUrl(event.target?.result as string);
                triggerToast("Cover image uploaded successfully!");
            };
            img.onerror = () => {
                alert("Failed to load image for dimension verification.");
            };
            img.src = event.target?.result as string;
        };
        reader.onerror = () => {
            alert("Failed to read the uploaded file.");
        };
        reader.readAsDataURL(file);
    };

    // Sub-tags addition
    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (t: string) => {
        setTags(tags.filter(tag => tag !== t));
    };

    // Lorebook addition
    const handleAddLore = () => {
        if (!loreName.trim()) {
            alert('Lore point requires a name/title.');
            return;
        }
        const newLore: LoreEntry = {
            id: Date.now(),
            category: loreCategory,
            name: loreName.trim(),
            description: loreDescription.trim() || 'No entry details yet.'
        };
        setLoreList([...loreList, newLore]);
        setLoreName('');
        setLoreDescription('');
        triggerToast(`Added Lore Entry: "${newLore.name}"`);
    };

    // Rules
    const handleAddRule = () => {
        if (newRule.trim()) {
            setUniverseRules([...universeRules, newRule.trim()]);
            setNewRule('');
        }
    };

    // Import OCs
    const handleImportCast = () => {
        if (importedCast.some(c => c.characterId === selectedCastChar)) {
            triggerToast("Character is already added to cast.");
            return;
        }
        setImportedCast([...importedCast, { characterId: selectedCastChar, role: selectedCastRole }]);
        triggerToast("OC Imported successfully!");
    };

    // Add Relationship Mapping
    const handleAddRelationship = () => {
        if (!relCharA || !relCharB || !relationText.trim()) {
            alert('Please select two cast characters and specify their relationship text.');
            return;
        }
        if (relCharA === relCharB) {
            alert('A character cannot have a relationship mapping with themselves.');
            return;
        }
        const updated = [...relationships, { charA: relCharA, charB: relCharB, relation: relationText.trim() }];
        setRelationships(updated);
        setRelationText('');
        triggerToast("Custom relation mapped!");
    };

    // Place Map Pin
    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        setClickCoords({ x, y });
    };

    const handleSavePin = () => {
        if (!clickCoords || !newPinName.trim()) {
            alert('Click coordinates/Pin name are missing.');
            return;
        }
        const newPin = {
            id: Date.now(),
            name: newPinName.trim(),
            description: newPinDescription.trim() || 'No description.',
            x: clickCoords.x,
            y: clickCoords.y,
            linkType: 'none' as const
        };
        setAtlasPoints([...atlasPoints, newPin]);
        setNewPinName('');
        setNewPinDescription('');
        setClickCoords(null);
        triggerToast(`Pinned location: ${newPin.name}`);
    };

    // Chrono Event
    const handleAddTimelineEvent = () => {
        if (!eraName.trim() || !eraDate.trim()) {
            alert('Era milestone name and Date identifier are required.');
            return;
        }
        const newEv = {
            id: Date.now(),
            eraName: eraName.trim(),
            date: eraDate.trim(),
            description: eraDesc.trim() || 'Key era incident.'
        };
        setTimelineEvents([...timelineEvents, newEv]);
        setEraName('');
        setEraDate('');
        setEraDesc('');
        triggerToast("Timeline event added!");
    };

    // Scene library
    const handleAddAction = () => {
        if (!actionName.trim() || !actionContent.trim()) {
            alert('Action name & body snippet are required.');
            return;
        }
        const actionObj = {
            id: Date.now(),
            name: actionName.trim(),
            content: actionContent.trim()
        };
        setReusableActions([...reusableActions, actionObj]);
        setActionName('');
        setActionContent('');
        triggerToast(`Snippet [${actionObj.name}] added to author library.`);
    };

    // Invite Collaborator
    const handleAddCollab = () => {
        if (!collabUsername.trim()) return;
        const norm = collabUsername.trim().replace(/^@/, '');
        if (collaborators.some(c => c.username.toLowerCase() === norm.toLowerCase())) {
            alert('User is already invited.');
            return;
        }
        setCollaborators([...collaborators, { username: norm, role: collabRole }]);
        setCollabUsername('');
        triggerToast(`Invitation sent to @${norm}!`);
    };

    // Submitting the story object
    const handleFormSubmit = () => {
        if (validationErrors.length > 0) {
            alert(`Please fix form errors:\n\n- ${validationErrors.join('\n- ')}`);
            return;
        }

        const assembledStoryObj = {
            ...initialData,
            type: 'Story',
            name: title.trim(),
            synopsis: synopsis.trim(),
            imageUrl: coverUrl,
            genreTags: Array.from(new Set([...tags, ...selectedThemes])),
            mainCharacterIds: importedCast.map(c => c.characterId),
            cast: importedCast,
            lorebook: loreList,
            
            // Rich Section Persistencies
            universeRules,
            characterRelationships: relationships,
            atlasPoints,
            timelineEvents,
            reusableActions,
            scratchpad: scratchpadText,
            collaborators,

            contentMetadata: {
                ageRating,
                warnings
            }
        };

        onCreate(assembledStoryObj);
        onExit();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 py-8 px-4 md:px-8 font-sans overflow-y-auto pb-32">
            
            {/* Header Area */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onExit} 
                            className="p-1 px-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-cyan-400 text-xs font-mono font-bold text-gray-400 hover:text-white"
                        >
                            ← Leave
                        </button>
                        <span className="text-[10px] bg-cyan-950 text-cyan-400 font-mono border border-cyan-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {initialData ? 'RECONFIGURING STORY' : 'NEW UNIVERSE SEED'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2 tracking-tight">
                        {initialData ? `Edit "${initialData.name}"` : 'Forge Story Universe'}
                    </h1>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        Populate the core mythos. Your roleplay characters, world rules, and atlas are mapped in these 10 collapsible chapters.
                    </p>
                </div>

                {/* Progress Circle & Save block */}
                <div className="flex items-center gap-4 bg-zinc-950/60 p-3 rounded-2xl border border-zinc-850">
                    <div className="text-right">
                        <span className="text-xs text-gray-500 block font-mono">Completed Elements</span>
                        <span className="text-base font-black text-cyan-400 font-mono">{countCompletedSections}/10 Categories</span>
                    </div>
                    <button 
                        onClick={handleFormSubmit}
                        disabled={validationErrors.length > 0}
                        className="px-5 py-3 bg-gradient-to-r from-purple-800 via-indigo-900 to-cyan-500 text-cyan-300 hover:text-white rounded-xl border border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.35)] hover:scale-[1.02] transform transition-all font-extrabold text-xs uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                    >
                        Save Story Seed
                    </button>
                </div>
            </div>

            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 bg-[#0d0d0d] border-2 border-[#00FFFF] text-[#00FFFF] text-xs font-mono font-bold px-4 py-3 rounded-full shadow-[0_0_25px_rgba(0,255,255,0.35)] animate-fadeIn">
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-4">
                
                {/* SECTION 1: BASIC INFO */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl transition-all">
                    <button 
                        onClick={() => toggleSection(1)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">1</span>
                            <span className="font-extrabold text-white text-base">Basic Info & Metabar Seeds</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {title.trim() && <span className="text-[10px] bg-green-950/80 border border-green-800/40 text-green-400 px-2 py-0.5 rounded font-mono font-bold uppercase">Ready</span>}
                            <ChevronDownIcon isOpen={openSections[1]} />
                        </div>
                    </button>

                    {openSections[1] && (
                        <div className="p-5 md:p-6 border-t border-zinc-900 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* Cover column */}
                                <div className="space-y-3">
                                    <span className="block text-xs font-bold uppercase text-gray-400">Story Jacket Art</span>
                                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 bg-cover bg-center flex flex-col justify-end p-4 group" style={{ backgroundImage: coverUrl ? `url(${coverUrl})` : 'none' }}>
                                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/90 pointer-events-none"></div>
                                         <button 
                                             type="button"
                                             onClick={() => fileInputRef.current?.click()}
                                             className="relative z-10 w-full py-2 bg-zinc-950/90 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-400 rounded-lg text-gray-300 hover:text-white font-extrabold text-[10px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                         >
                                             <svg className="w-4 h-4 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5 7.5 12m4.5-4.5V18" />
                                             </svg>
                                             <span>Upload Cover Art</span>
                                         </button>
                                     </div>
                                     <input 
                                         type="file"
                                         ref={fileInputRef}
                                         onChange={handleImageUpload}
                                         accept="image/png, image/jpeg, image/webp"
                                         className="hidden"
                                     />
                                     <p className="text-[10px] text-gray-550 text-center font-mono leading-normal pt-1">
                                         PNG, JPG, WebP • Max 10MB • Max 4096×4096 px
                                     </p>
                                </div>

                                {/* Form text column */}
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Story Title <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="The Chrono-Lock Incident"
                                            className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-white font-bold placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-xs font-bold uppercase text-gray-400">Universe Synopsis (Max 300 Chars)</label>
                                            <span className={`text-[10px] font-mono ${synopsis.length > 300 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{synopsis.length}/300</span>
                                        </div>
                                        <textarea 
                                            value={synopsis}
                                            onChange={(e) => setSynopsis(e.target.value)}
                                            placeholder="A cybernetics operative uncovers a relic that manipulates dimensional coordinates..."
                                            rows={4}
                                            className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm resize-none ${synopsis.length > 300 ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-805/80 focus:border-cyan-500'}`}
                                        />
                                    </div>

                                    {/* Built-in tags */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Faceted Tags</label>
                                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                                            {tags.map(t => (
                                                <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono rounded-full font-semibold">
                                                    #{t}
                                                    <button onClick={() => handleRemoveTag(t)} className="hover:text-white font-bold ml-1 text-red-400">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                                placeholder="Add custom Tag..."
                                                className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs rounded-lg text-white focus:outline-none"
                                            />
                                            <button onClick={handleAddTag} className="px-3 bg-zinc-800 hover:bg-zinc-700 font-bold text-xs rounded-lg text-white">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Age ratings & warning block */}
                            <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-850">
                                <ContentRatingSelector 
                                    rating={ageRating} 
                                    setRating={setAgeRating} 
                                    warnings={warnings} 
                                    setWarnings={setWarnings} 
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 2: LORE ELEMENTS */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(2)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">2</span>
                            <span className="font-extrabold text-white text-base">Lore Elements & Codexbook ({loreList.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[2]} />
                    </button>

                    {openSections[2] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4">
                            <p className="text-xs text-gray-400">Create key world-building details like Factions, Magic Systems, Historic Incidents, or relics.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-zinc-900/50 border border-zinc-850 rounded-xl">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Item Title / Name</label>
                                    <input 
                                        type="text" 
                                        value={loreName}
                                        onChange={(e) => setLoreName(e.target.value)}
                                        placeholder="The Void Crystal"
                                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs font-bold text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Category</label>
                                    <select 
                                        value={loreCategory}
                                        onChange={(e) => setLoreCategory(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-cyan-400 font-bold focus:outline-none"
                                    >
                                        <option value="Faction">Faction / Guild Group</option>
                                        <option value="Magic System">Magic / Technological System</option>
                                        <option value="Historic Incident">Historic Incident</option>
                                        <option value="Artifact">Valuable Artifact</option>
                                        <option value="Custom Mythos">Custom Mythos Category</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Entry Summary</label>
                                    <textarea 
                                        value={loreDescription}
                                        onChange={(e) => setLoreDescription(e.target.value)}
                                        placeholder="Describe the entry's history, attributes, and secret alignments."
                                        rows={2}
                                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-gray-300 focus:outline-none resize-none"
                                    />
                                    <button 
                                        onClick={handleAddLore}
                                        className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg border border-cyan-400/20 active:scale-95"
                                    >
                                        + Record in Codex
                                    </button>
                                </div>
                            </div>

                            {loreList.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                                    {loreList.map(item => (
                                        <div key={item.id} className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-lg relative group">
                                            <div className="flex justify-between items-start pr-8">
                                                <div>
                                                    <span className="text-[9px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">{item.category}</span>
                                                    <h4 className="font-bold text-white text-sm mt-1">{item.name}</h4>
                                                </div>
                                                <button 
                                                    onClick={() => setLoreList(loreList.filter(l => l.id !== item.id))}
                                                    className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-600 text-xs italic">
                                    No lore elements entered. Establish key mythos references to help co-authors.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* SECTION 3: UNIVERSE ELEMENTS */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(3)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">3</span>
                            <span className="font-extrabold text-white text-base">Universe Mechanics & Laws ({universeRules.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[3]} />
                    </button>

                    {openSections[3] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4">
                            <p className="text-xs text-gray-400">Establish the immutable rules or limitations of physics, magic, or technology that characters must conform to.</p>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
                                    placeholder="Enter physical limit (e.g., Alchemy cannot modify gold elements)..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                                />
                                <button onClick={handleAddRule} className="px-4 py-2 bg-zinc-800 hover:bg-cyan-900 text-white font-mono text-xs font-bold rounded-lg border border-zinc-700">+</button>
                            </div>

                            <ul className="space-y-2 pt-2">
                                {universeRules.map((rule, idx) => (
                                    <li key={idx} className="flex items-center gap-3 p-2.5 bg-zinc-900/20 border border-zinc-850 rounded-lg text-xs leading-relaxed">
                                        <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-full flex-shrink-0"></span>
                                        <span className="flex-grow text-gray-300">{rule}</span>
                                        <button 
                                            onClick={() => setUniverseRules(universeRules.filter((_, i) => i !== idx))}
                                            className="text-red-400 hover:text-red-300 font-bold ml-2 text-xs"
                                        >
                                            删除
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* SECTION 4: CHARACTERS & RELATIONS */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(4)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">4</span>
                            <span className="font-extrabold text-white text-base">OC Cast & Custom Relation Mapping</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[4]} />
                    </button>

                    {openSections[4] && (
                        <div className="p-5 border-t border-zinc-900 space-y-6">
                            
                            {/* Inner Block: OC importer */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-cyan-400">Import OCs / Cast Roles</h3>
                                <div className="flex flex-col sm:flex-row gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-850">
                                    <div className="flex-grow">
                                        <label className="block text-[10px] text-gray-500 font-mono mb-1">Available Character Registry</label>
                                        <select 
                                            value={selectedCastChar}
                                            onChange={(e) => setSelectedCastChar(Number(e.target.value))}
                                            className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-white font-bold focus:outline-none"
                                        >
                                            {allCharacters.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.role || 'Unspecified'})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-mono mb-1">Story Focus / Alignment Role</label>
                                        <select 
                                            value={selectedCastRole}
                                            onChange={(e) => setSelectedCastRole(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-cyan-400 font-bold focus:outline-none"
                                        >
                                            <option value="Protagonist">Protagonist (Hero)</option>
                                            <option value="Antagonist">Antagonist (Villain)</option>
                                            <option value="Deuteragonist">Deuteragonist (Co-Hero)</option>
                                            <option value="Love Interest">Love Interest</option>
                                            <option value="Supporting Character">Supporting Cast</option>
                                        </select>
                                    </div>

                                    <button 
                                        onClick={handleImportCast}
                                        className="sm:self-end px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] tracking-wider uppercase rounded-lg active:scale-95 transition-transform"
                                    >
                                        Import OC
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 py-2">
                                    {importedCast.map(c => {
                                        const charDetails = allCharacters.find(char => char.id === c.characterId);
                                        return (
                                            <div key={c.characterId} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-850 rounded-xl relative group">
                                                {charDetails?.imageUrl && (
                                                    <img src={charDetails.imageUrl} className="w-5 h-5 rounded-full object-cover border border-zinc-700" alt="" />
                                                )}
                                                <div>
                                                    <span className="text-xs font-bold text-white block">{charDetails?.name || `OC_ID_${c.characterId}`}</span>
                                                    <span className="text-[9px] text-[#00FFFF] font-mono block">{c.role}</span>
                                                </div>
                                                <button 
                                                    onClick={() => setImportedCast(importedCast.filter(item => item.characterId !== c.characterId))}
                                                    className="p-1 text-red-400 hover:bg-red-500/10 rounded ml-2"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {importedCast.length === 0 && <p className="text-xs text-gray-600 italic">No imported characters yet. Select and import above.</p>}
                                </div>
                            </div>

                            {/* Inner Block: Custom Relation Mapper */}
                            {importedCast.length >= 2 && (
                                <div className="space-y-3 pt-4 border-t border-zinc-900">
                                    <h3 className="text-xs font-bold uppercase text-purple-400">Map Custom Character Relations</h3>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-850 items-end">
                                        <div className="flex-1">
                                            <label className="block text-[10px] text-gray-500 font-mono mb-1">From OC</label>
                                            <select 
                                                value={relCharA}
                                                onChange={(e) => setRelCharA(Number(e.target.value))}
                                                className="w-full bg-zinc-1000 border border-zinc-850 p-2 text-xs rounded-lg text-white focus:outline-none"
                                            >
                                                {importedCast.map(c => {
                                                    const detail = allCharacters.find(char => char.id === c.characterId);
                                                    return <option key={c.characterId} value={c.characterId}>{detail?.name || `OC ${c.characterId}`}</option>;
                                                })}
                                            </select>
                                        </div>

                                        <p className="text-xs text-gray-500 pb-2 self-center">is the</p>

                                        <div className="flex-1">
                                            <label className="block text-[10px] text-gray-500 font-mono mb-1">Relation Alignment</label>
                                            <input 
                                                type="text"
                                                value={relationText}
                                                onChange={(e) => setRelationText(e.target.value)}
                                                placeholder="e.g., Bitter Enemy / Secret Informer"
                                                className="w-full bg-zinc-1000 border border-zinc-850 p-2 text-xs rounded-lg text-white focus:outline-none"
                                            />
                                        </div>

                                        <p className="text-xs text-gray-500 pb-2 self-center">to OC</p>

                                        <div className="flex-1">
                                            <label className="block text-[10px] text-gray-500 font-mono mb-1">Target OC</label>
                                            <select 
                                                value={relCharB}
                                                onChange={(e) => setRelCharB(Number(e.target.value))}
                                                className="w-full bg-zinc-1000 border border-zinc-850 p-2 text-xs rounded-lg text-white focus:outline-none"
                                            >
                                                {importedCast.map(c => {
                                                    const detail = allCharacters.find(char => char.id === c.characterId);
                                                    return <option key={c.characterId} value={c.characterId}>{detail?.name || `OC ${c.characterId}`}</option>;
                                                })}
                                            </select>
                                        </div>

                                        <button 
                                            onClick={handleAddRelationship}
                                            className="px-4 py-2 bg-purple-800 hover:bg-purple-750 border border-purple-500/30 text-white font-bold text-xs uppercase rounded-lg"
                                        >
                                            Map Relation
                                        </button>
                                    </div>

                                    {/* Relationships display */}
                                    <div className="space-y-1.5 pt-2">
                                        {relationships.map((rel, idx) => {
                                            const charAName = allCharacters.find(ch => ch.id === rel.charA)?.name || `Char ID ${rel.charA}`;
                                            const charBName = allCharacters.find(ch => ch.id === rel.charB)?.name || `Char ID ${rel.charB}`;
                                            return (
                                                <div key={idx} className="flex justify-between items-center text-xs p-2 bg-black/40 border border-zinc-900 rounded-lg">
                                                    <p className="text-gray-300">
                                                        <span className="font-bold text-cyan-400 font-mono">{charAName}</span>
                                                        <span className="text-gray-500 italic mx-2">is {rel.relation} to</span>
                                                        <span className="font-bold text-purple-400 font-mono">{charBName}</span>
                                                    </p>
                                                    <button 
                                                        onClick={() => setRelationships(relationships.filter((_, i) => i !== idx))}
                                                        className="text-red-400 text-xs px-2 hover:bg-red-500/10 rounded"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* SECTION 5: ATLAS */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(5)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">5</span>
                            <span className="font-extrabold text-white text-base">Universe Atlas & Interactive Map ({atlasPoints.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[5]} />
                    </button>

                    {openSections[5] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4">
                            <p className="text-xs text-gray-400">Click anywhere on the visual coordinate map card grid below to designate geographic plot points or hubs.</p>
                            
                            {/* Visual Map represent */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* Coordinates click arena */}
                                <div className="md:col-span-2">
                                    <div 
                                        onClick={handleMapClick}
                                        className="relative w-full aspect-[16/10] rounded-xl border border-dashed border-cyan-500/30 bg-gradient-to-tr from-cyan-950/40 via-zinc-950 to-purple-950/20 cursor-crosshair overflow-hidden overflow-y-hidden"
                                    >
                                        <div className="absolute inset-0 bg-noise opacity-[0.02]"></div>
                                        <div className="absolute top-2 left-2 text-[10px] text-cyan-400/50 font-mono">[ Visual Sector Map Projection ]</div>
                                        
                                        {/* Placed Pins */}
                                        {atlasPoints.map(pin => (
                                            <div 
                                                key={pin.id}
                                                className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                                                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                                                title={pin.name}
                                            >
                                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white animate-pulse shadow-[0_0_12px_#10b981]"></div>
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 text-white border border-zinc-800 rounded px-2 py-1 text-[10px] whitespace-nowrap hidden group-hover/pin:block z-30 pointer-events-none shadow-lg">
                                                    <span className="font-bold font-mono">{pin.name}</span>
                                                    <span className="text-gray-500 block leading-none">{pin.x}X, {pin.y}Y</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pending Click */}
                                        {clickCoords && (
                                            <div 
                                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                                style={{ left: `${clickCoords.x}%`, top: `${clickCoords.y}%` }}
                                            >
                                                <div className="w-5 h-5 rounded-full bg-cyan-400 border border-white animate-ping"></div>
                                                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white absolute top-0.5 left-0.5"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form to save pin on click */}
                                <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                                    <h4 className="text-xs font-bold uppercase text-white font-mono">Designate Sector Pin</h4>
                                    {clickCoords ? (
                                        <div className="space-y-3">
                                            <span className="block text-[10px] text-cyan-400 font-mono">Coordinates: {clickCoords.x}% X / {clickCoords.y}% Y</span>
                                            
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-mono mb-1">Pin Name</label>
                                                <input 
                                                    type="text"
                                                    value={newPinName}
                                                    onChange={(e) => setNewPinName(e.target.value)}
                                                    placeholder="The Whispering Sanctum"
                                                    className="w-full bg-zinc-950 text-xs border border-zinc-800 p-2 rounded text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-mono mb-1">Description</label>
                                                <textarea
                                                    value={newPinDescription}
                                                    onChange={(e) => setNewPinDescription(e.target.value)}
                                                    placeholder="Brief incident lore/chapter linking info..."
                                                    rows={2}
                                                    className="w-full bg-zinc-950 text-xs border border-zinc-800 p-2 rounded text-gray-300 resize-none"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={handleSavePin} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 font-bold text-[10px] uppercase rounded">Confirm Pin</button>
                                                <button onClick={() => setClickCoords(null)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 font-bold text-[10px] uppercase rounded">Reset</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 leading-relaxed italic py-4 text-center">
                                            Please tap on the coordinate grid map to the left to spawn a positioning marker.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Pins List */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                                {atlasPoints.map(pin => (
                                    <div key={pin.id} className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl relative group">
                                        <h5 className="font-bold text-white text-xs">{pin.name}</h5>
                                        <p className="text-[10px] text-cyan-400 font-mono mt-0.5">X: {pin.x}%, Y: {pin.y}%</p>
                                        <p className="text-[10.5px] text-gray-400 mt-1.5 line-clamp-2 leading-tight">{pin.description}</p>
                                        <button 
                                            onClick={() => setAtlasPoints(atlasPoints.filter(p => p.id !== pin.id))}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-400 text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 6: TIMELINE */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(6)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">6</span>
                            <span className="font-extrabold text-white text-base">Universe Chronicle & Timeline Lines ({timelineEvents.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[6]} />
                    </button>

                    {openSections[6] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4">
                            <p className="text-xs text-gray-400">Map historical era milestones or chronological incidents to support non-linear chapter structures.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">Era Name / Title</label>
                                    <input 
                                        type="text" 
                                        value={eraName}
                                        onChange={(e) => setEraName(e.target.value)}
                                        placeholder="The Great Splinter"
                                        className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-xs text-white uppercase font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">Time identifier / Date</label>
                                    <input 
                                        type="text" 
                                        value={eraDate}
                                        onChange={(e) => setEraDate(e.target.value)}
                                        placeholder="e.g., Year 84 AE / Epoch 3"
                                        className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-xs text-amber-400 font-mono font-bold"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-[10px] text-gray-500 mb-1">Milestone Description</label>
                                    <textarea 
                                        value={eraDesc}
                                        onChange={(e) => setEraDesc(e.target.value)}
                                        placeholder="The planetary shield collapsed, exposing major capital cities..."
                                        rows={2}
                                        className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-xs text-gray-300 resize-none"
                                    />
                                    <button 
                                        onClick={handleAddTimelineEvent}
                                        className="mt-3 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-mono text-[10px] font-bold rounded"
                                    >
                                        + Record Era Node
                                    </button>
                                </div>
                            </div>

                            {/* Render chronologies */}
                            <div className="space-y-3 pt-3 border-l border-zinc-800 pl-4 ml-2">
                                {timelineEvents.map(ev => (
                                    <div key={ev.id} className="relative group p-3 bg-zinc-900/20 border border-zinc-850 rounded-lg">
                                        <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-amber-500 border border-black z-10"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] text-amber-400 font-mono font-bold block">{ev.date}</span>
                                                <h5 className="font-extrabold text-white text-xs mt-0.5">{ev.eraName}</h5>
                                            </div>
                                            <button 
                                                onClick={() => setTimelineEvents(timelineEvents.filter(item => item.id !== ev.id))}
                                                className="text-red-500 hover:bg-red-500/10 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{ev.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 7: THEMES & GENRES */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(7)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">7</span>
                            <span className="font-extrabold text-white text-base">Key Story Themes & Motivations</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[7]} />
                    </button>

                    {openSections[7] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4 font-mono">
                            <p className="text-xs text-gray-400">Mark themes active under this story to allow targeted matching within reader discover boards.</p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1.5">
                                {availableThemes.map(themeName => {
                                    const active = selectedThemes.includes(themeName);
                                    return (
                                        <button 
                                            key={themeName}
                                            onClick={() => {
                                                if (active) setSelectedThemes(selectedThemes.filter(t => t !== themeName));
                                                else setSelectedThemes([...selectedThemes, themeName]);
                                            }}
                                            className={`p-2 bg-zinc-900/60 border rounded-lg text-left text-xs transition-colors select-none ${active ? 'border-purple-500 text-purple-300 bg-purple-950/30 font-bold' : 'border-zinc-850 text-gray-400 hover:border-zinc-700'}`}
                                        >
                                            {active ? '●' : '○'} {themeName}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2 items-center pt-2">
                                <input 
                                    type="text"
                                    value={customTheme}
                                    onChange={(e) => setCustomTheme(e.target.value)}
                                    placeholder="Or type custom theme..."
                                    className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white focus:outline-none"
                                />
                                <button 
                                    onClick={() => {
                                        if (customTheme.trim() && !selectedThemes.includes(customTheme.trim())) {
                                            setSelectedThemes([...selectedThemes, customTheme.trim()]);
                                            setCustomTheme('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg"
                                >
                                    + Add Custom Theme
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 8: SCENES / ACTIONS LIBRARY */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(8)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">8</span>
                            <span className="font-extrabold text-white text-base">Reusable Scene Snippet Expressions ({reusableActions.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[8]} />
                    </button>

                    {openSections[8] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4">
                            <p className="text-xs text-gray-400">Pre-compile reusable actions or fighting block movements for quick insertion with 1 click during late writing sessions.</p>
                            
                            <div className="space-y-3 p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-mono mb-1">Shortcut Trigger Term</label>
                                        <input 
                                            type="text" 
                                            value={actionName}
                                            onChange={(e) => setActionName(e.target.value)}
                                            placeholder="Dodge maneuvers / Laser blast"
                                            className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded text-white font-bold"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-mono mb-1">Expression Snippet Body Content</label>
                                    <textarea 
                                        value={actionContent}
                                        onChange={(e) => setActionContent(e.target.value)}
                                        placeholder="With supersonic speed, they twisted sideways, pivoting precisely to divert the rushing energy spear..."
                                        rows={3}
                                        className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs text-gray-300 rounded resize-none"
                                    />
                                    <button 
                                        onClick={handleAddAction}
                                        className="mt-2 px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white font-mono text-[10px] font-bold rounded"
                                    >
                                        + Record Action Preset
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                {reusableActions.map(act => (
                                    <div key={act.id} className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl relative group flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] text-cyan-400 font-mono font-bold leading-none bg-cyan-950 border border-cyan-850 px-2 py-0.5 rounded-full">{act.name}</span>
                                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">"{act.content}"</p>
                                        </div>
                                        <button 
                                            onClick={() => setReusableActions(reusableActions.filter(a => a.id !== act.id))}
                                            className="text-red-500 hover:text-red-400 text-xs px-2"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 9: NOTES & PRIVATE SCRATCHPAD */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(9)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">9</span>
                            <span className="font-extrabold text-white text-base">Private Scrapbook & Writer Scratchpad</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[9]} />
                    </button>

                    {openSections[9] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4">
                            <p className="text-xs text-gray-400">Jot down draft targets, outline plots, or character arc plans. Only visible to author and appointed collaborators.</p>
                            <textarea 
                                value={scratchpadText}
                                onChange={(e) => setScratchpadText(e.target.value)}
                                rows={6}
                                className="w-full bg-zinc-900 border border-zinc-850 p-4 text-xs font-mono text-gray-300 rounded-xl leading-relaxed focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    )}
                </div>

                {/* SECTION 10: COLLABORATORS */}
                <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                    <button 
                        onClick={() => toggleSection(10)}
                        className="w-full flex items-center justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-cyan-400 bg-cyan-950/50 w-6 h-6 rounded-md flex items-center justify-center border border-cyan-800/30">10</span>
                            <span className="font-extrabold text-white text-base">Story Overseers & Collaborators ({collaborators.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections[10]} />
                    </button>

                    {openSections[10] && (
                        <div className="p-5 border-t border-zinc-900 space-y-4">
                            <p className="text-xs text-gray-400">Invite additional authors to edit story parameters and chapters. Assign specific production roles.</p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] text-gray-500 font-mono mb-1">Invited Username</label>
                                    <input 
                                        type="text" 
                                        value={collabUsername}
                                        onChange={(e) => setCollabUsername(e.target.value)}
                                        placeholder="e.g., AceKnight / StoryCraft"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-[10px] text-gray-500 font-mono mb-1">Designated Role</label>
                                    <select 
                                        value={collabRole}
                                        onChange={(e) => setCollabRole(e.target.value as any)}
                                        className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs text-cyan-400 font-bold rounded focus:outline-none"
                                    >
                                        <option value="Writer">Writer (Write chapters)</option>
                                        <option value="Editor">Editor (Refactor & Check)</option>
                                        <option value="Artist">Artist (Visual curation)</option>
                                        <option value="Lore Keeper">Lore Keeper (Update codexbook)</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={handleAddCollab}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/20 rounded text-xs font-mono font-bold text-white uppercase active:scale-95 transition-transform"
                                >
                                    Invite
                                </button>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                {collaborators.map(c => (
                                    <div key={c.username} className="flex justify-between items-center bg-zinc-900/40 p-2 border border-zinc-850 rounded-xl">
                                        <div className="text-xs flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                                            <span className="font-extrabold text-white">@{c.username}</span>
                                            <span className="text-[10px] text-purple-400 font-mono bg-purple-950/60 border border-purple-800/30 px-2 py-0.5 rounded ml-2 uppercase font-bold">{c.role}</span>
                                        </div>
                                        <button 
                                            onClick={() => setCollaborators(collaborators.filter(item => item.username !== c.username))}
                                            className="text-red-500 hover:text-red-400 text-xs px-2"
                                        >
                                            Revoke Invitation
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Sticky Floating Save footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 border-t border-zinc-900 backdrop-blur-md z-40 flex items-center justify-between max-w-4xl mx-auto rounded-t-3xl shadow-2xl">
                <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold block">Status Checklist</span>
                    {validationErrors.length > 0 ? (
                        <span className="text-xs text-red-400 font-bold">● Form needs required parameters</span>
                    ) : (
                        <span className="text-xs text-green-400 font-bold">● Story seed is valid for publish</span>
                    )}
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={onExit}
                        className="px-4 py-2 bg-zinc-900 text-gray-300 font-bold text-xs uppercase rounded-xl hover:bg-zinc-800 active:scale-95"
                    >
                        Discard Changes
                    </button>
                    <button 
                        onClick={handleFormSubmit}
                        disabled={validationErrors.length > 0}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#00ffff] to-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all outline-none"
                    >
                        Save Story Seed
                    </button>
                </div>
            </div>

        </div>
    );
};

export default StoryCreationPage;
