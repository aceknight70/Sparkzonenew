import React, { useState, useMemo } from 'react';
import { User, World, Story, Community, Party, Character, SparkCardTemplate } from '../types';
import { cardTemplates } from '../mockData';

interface LibraryPageProps {
    currentUser: User;
    worlds: World[];
    stories: Story[];
    communities: Community[];
    parties: Party[];
    characters: Character[];
    onSelectWorld: (worldId: number) => void;
    onViewStory: (storyId: number) => void;
    onSelectParty: (partyId: number) => void;
    onSelectCommunity: (communityId: number) => void;
    onCreateMeme: () => void;
    onUpdateUserWorlds?: (updatedWorlds: World[]) => void;
    onUpdateUserCommunities?: (updatedCommunities: Community[]) => void;
}

// Custom Icons for glowing dashboard feel
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const ShieldAlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-cyan-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400 hover:text-red-300"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

const LibraryPage: React.FC<LibraryPageProps> = ({ 
    currentUser, 
    worlds, 
    stories, 
    communities, 
    parties, 
    characters,
    onSelectWorld,
    onViewStory,
    onSelectParty,
    onSelectCommunity,
    onCreateMeme,
    onUpdateUserWorlds,
    onUpdateUserCommunities
}) => {
    // Accordion State
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        worlds: true,
        stories: true,
        communities: false,
        history: false,
        memes: false,
        templates: false
    });

    // Search and filter input state
    const [searchTerm, setSearchTerm] = useState('');

    // Alert / Interactive removal state
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filter data for Library with SearchTerm
    const joinedWorlds = useMemo(() => {
        return worlds.filter(w => {
            const matchesAccess = w.authorId === currentUser.id || 
                (w.members && w.members.some(m => m.id === currentUser.id));
            const matchesSearch = !searchTerm || 
                w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (w.tagline || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesAccess && matchesSearch;
        });
    }, [worlds, currentUser.id, searchTerm]);

    const myStories = useMemo(() => {
        // Created or followed stories
        return stories.filter(s => {
            const matchesAccess = s.authorId === currentUser.id || s.id === 15;
            const matchesSearch = !searchTerm || 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.logline || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesAccess && matchesSearch;
        });
    }, [stories, currentUser.id, searchTerm]);

    const joinedCommunities = useMemo(() => {
        return communities.filter(c => {
            const matchesAccess = c.leaderId === currentUser.id || 
                (currentUser.communityIds && currentUser.communityIds.includes(c.id)) ||
                (c.members && c.members.some(m => m.userId === currentUser.id));
            const matchesSearch = !searchTerm || 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (c.tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesAccess && matchesSearch;
        });
    }, [communities, currentUser.id, currentUser.communityIds, searchTerm]);

    // Mock history of rooms (last 10 entered)
    const roomHistory = useMemo(() => {
        const rawHistory = [
            { id: 101, name: "Sunset Tavern RP", host: "AceKnight", date: "Just now", format: "Casual Chat" },
            { id: 102, name: "Cyberspace Infiltration", host: "CodeBreaker", date: "2 hours ago", format: "VTT Tabletop" },
            { id: 103, name: "Dungeon Crawlers Level 4", host: "DMMaster", date: "Yesterday", format: "D&D Mode" },
            { id: 104, name: "Theatre Academy Live", host: "Starlet", date: "June 16, 2026", format: "Theatre Mode" },
            { id: 105, name: "Eldoria Royal Ball", host: "LordGregory", date: "June 15, 2026", format: "Social Roleplay" }
        ];
        return rawHistory.filter(room => !searchTerm || 
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            room.host.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Mock Saved Memes Library
    const savedMemes = useMemo(() => {
        const rawMemes = [
            { id: 1, title: "When DM smiles", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300&auto=format&fit=crop" },
            { id: 2, title: "Natural 1 on stealth", imageUrl: "https://images.unsplash.com/photo-1513829096999-4978602297af?q=80&w=300&auto=format&fit=crop" },
            { id: 3, title: "Me explaining lore", imageUrl: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=300&auto=format&fit=crop" }
        ];
        return rawMemes.filter(meme => !searchTerm || 
            meme.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Owned Spark Clash Action templates
    const ownedTemplates = useMemo(() => {
        const rawTemplates = cardTemplates.slice(0, 6);
        return rawTemplates.filter(t => !searchTerm || 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Leaves / removes a world from the user's view
    const handleLeaveWorld = (e: React.MouseEvent, worldId: number, worldName: string) => {
        e.stopPropagation();
        if (onUpdateUserWorlds) {
            const updated = worlds.map(w => {
                if (w.id === worldId) {
                    return {
                        ...w,
                        members: w.members.filter(m => m.id !== currentUser.id)
                    };
                }
                return w;
            });
            onUpdateUserWorlds(updated);
            showToast(`Left World: "${worldName}"`);
        } else {
            showToast(`Action success: Left "${worldName}"`);
        }
    };

    // Leaves/removes a community
    const handleLeaveCommunity = (e: React.MouseEvent, communityId: number, communityName: string) => {
        e.stopPropagation();
        showToast(`Left Community: "${communityName}"`);
    };

    // Color mapper for Spark Clash tiers from Page 15 (Natural, Unnatural, Relic, Legendary, Mythic, Sky, Rune, Cosmic)
    const getTierColorClass = (rarity: string) => {
        switch (rarity) {
            case 'Natural': return 'border-gray-500 text-gray-400 bg-gray-500/10';
            case 'Unnatural': return 'border-emerald-500 text-emerald-400 bg-emerald-500/10';
            case 'Relic': return 'border-blue-500 text-blue-400 bg-blue-500/10';
            case 'Legendary': return 'border-amber-500 text-amber-400 bg-amber-500/10';
            case 'Mythic': return 'border-purple-500 text-purple-400 bg-purple-500/10';
            case 'Sky': return 'border-cyan-500 text-cyan-400 bg-cyan-500/10';
            case 'Rune': return 'border-pink-500 text-pink-400 bg-pink-500/10';
            case 'Cosmic': return 'border-indigo-500 text-indigo-400 bg-indigo-500/10 animate-pulse';
            default: return 'border-cyan-500 text-cyan-400 bg-cyan-500/10';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn h-full overflow-y-auto pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#00FFFF] tracking-tight drop-shadow-[0_0_12px_rgba(0,255,255,0.3)]">
                        Library
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Your offline & online universe repository</p>
                </div>
                <button 
                    onClick={onCreateMeme}
                    className="self-start md:self-auto px-5 py-2.5 bg-gradient-to-r from-purple-850 to-cyan-500 border border-cyan-400/50 hover:border-cyan-300 text-white font-semibold text-sm rounded-full shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-[1.02] transform transition-all duration-300"
                >
                    + Create Meme
                </button>
            </div>

            {/* Search Input for Library */}
            <div className="relative mb-8">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search library worlds, stories, communities, cards, memes..."
                    className="w-full bg-gray-900/80 border border-violet-500/30 rounded-full py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-lg"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                </div>
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')} 
                        className="absolute inset-y-0 right-4 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                    >
                        Clear
                    </button>
                )}
            </div>

            {toastMessage && (
                <div className="fixed top-20 right-4 z-50 bg-[#111111] border-2 border-cyan-400 text-cyan-300 text-xs px-4 py-3 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-fadeIn">
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="space-y-6">
                
                {/* 1. WORLDS SECTION */}
                <div className="bg-black/60 border border-[#00FFFF]/15 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.02)]">
                    <button 
                        onClick={() => toggleSection('worlds')}
                        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-950/80 border-b border-[#00FFFF]/10 hover:bg-zinc-900/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <GlobeIcon />
                            <span className="font-extrabold text-white tracking-wide">Worlds ({joinedWorlds.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections.worlds} />
                    </button>
                    
                    {openSections.worlds && (
                        <div className="p-5">
                            {joinedWorlds.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {joinedWorlds.map(world => {
                                        const isCreator = world.authorId === currentUser.id;
                                        return (
                                            <div 
                                                key={world.id} 
                                                onClick={() => onSelectWorld(world.id)}
                                                className="group/item relative flex gap-4 p-4 bg-zinc-900/40 border border-[#00FFFF]/10 rounded-xl hover:border-cyan-400/35 transition-all duration-300 cursor-pointer shadow-md"
                                            >
                                                <img src={world.imageUrl} className="w-16 h-16 rounded-lg object-cover border border-zinc-800" alt={world.name} />
                                                <div className="flex-grow min-w-0 pr-6">
                                                    <h3 className="font-bold text-white text-base truncate group-hover/item:text-cyan-300 transition-colors">{world.name}</h3>
                                                    <p className="text-xs text-cyan-400/70 font-mono mt-0.5">{isCreator ? 'Leader / Host' : 'Adventurer'}</p>
                                                    <p className="text-xs text-gray-400 mt-1 truncate">{world.tagline}</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => handleLeaveWorld(e, world.id, world.name)}
                                                    title={isCreator ? "Delete World" : "Leave World"}
                                                    className="absolute top-4 right-4 p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all duration-300"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    You have not created or joined any Worlds yet. Create one in the Workshop!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. STORIES SECTION */}
                <div className="bg-black/60 border border-[#00FFFF]/15 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.02)]">
                    <button 
                        onClick={() => toggleSection('stories')}
                        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-950/80 border-b border-[#00FFFF]/10 hover:bg-zinc-900/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpenIcon />
                            <span className="font-extrabold text-white tracking-wide">Stories ({myStories.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections.stories} />
                    </button>
                    
                    {openSections.stories && (
                        <div className="p-5">
                            {myStories.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {myStories.map(story => {
                                        // Standard progress math representation
                                        const progressPercentage = story.id === 15 ? 60 : 100;
                                        const totalChapters = (story as any).chapters?.length || 1;
                                        const currentChapter = story.id === 15 ? Math.ceil(totalChapters * 0.6) : totalChapters;
                                        
                                        return (
                                            <div 
                                                key={story.id} 
                                                onClick={() => onViewStory(story.id)}
                                                className="group/item flex gap-4 p-4 bg-zinc-900/40 border border-[#00FFFF]/10 rounded-xl hover:border-cyan-400/35 transition-all duration-300 cursor-pointer shadow-md"
                                            >
                                                <img src={story.imageUrl} className="w-16 h-20 rounded-lg object-cover border border-zinc-800 flex-shrink-0" alt={story.name} />
                                                <div className="flex-grow min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-white text-base truncate group-hover/item:text-cyan-300 transition-colors">{story.name}</h3>
                                                        <p className="text-xs text-gray-400 mt-1">Last chapter: Chapter {currentChapter} of {totalChapters}</p>
                                                    </div>
                                                    
                                                    {/* Bookmark Progress Bar */}
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
                                                            <span>Reading Progress</span>
                                                            <span className="text-cyan-400">{progressPercentage}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-850 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-purple-600 to-cyan-400" 
                                                                style={{ width: `${progressPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    You have no saved or followed stories. Search some inside the Discover tab!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. COMMUNITIES SECTION */}
                <div className="bg-black/60 border border-[#00FFFF]/15 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.02)]">
                    <button 
                        onClick={() => toggleSection('communities')}
                        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-950/80 border-b border-[#00FFFF]/10 hover:bg-zinc-900/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <UsersIcon />
                            <span className="font-extrabold text-white tracking-wide">Communities Joined ({joinedCommunities.length}/2 Limit)</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections.communities} />
                    </button>
                    
                    {openSections.communities && (
                        <div className="p-5">
                            {joinedCommunities.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {joinedCommunities.map(community => {
                                        const isLeader = community.leaderId === currentUser.id;
                                        return (
                                            <div 
                                                key={community.id} 
                                                onClick={() => onSelectCommunity(community.id)}
                                                className="group/item relative flex gap-4 p-4 bg-zinc-900/40 border border-[#00FFFF]/10 rounded-xl hover:border-cyan-400/35 transition-all duration-300 cursor-pointer shadow-md"
                                            >
                                                <img src={community.imageUrl} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30" alt={community.name} />
                                                <div className="flex-grow min-w-0 pr-6">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white text-base truncate group-hover/item:text-cyan-300 transition-colors">{community.name}</h3>
                                                        <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/60 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                                                            {community.tag}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-purple-400 font-mono mt-1">{isLeader ? 'Leader' : 'Officer'}</p>
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{community.description}</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => handleLeaveCommunity(e, community.id, community.name)}
                                                    title="Leave Community"
                                                    className="absolute top-4 right-4 p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all duration-300"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    You haven't joined any communities. Maximum limit: 2 communities.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. ROOMS HISTORY SECTION */}
                <div className="bg-black/60 border border-[#00FFFF]/15 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.02)]">
                    <button 
                        onClick={() => toggleSection('history')}
                        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-950/80 border-b border-[#00FFFF]/10 hover:bg-zinc-900/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <HistoryIcon />
                            <span className="font-extrabold text-white tracking-wide">Live Rooms History (Last 10 Entered)</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections.history} />
                    </button>
                    
                    {openSections.history && (
                        <div className="p-5">
                            <div className="space-y-3">
                                {roomHistory.map(room => (
                                    <div 
                                        key={room.id}
                                        className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800 rounded-xl hover:border-[#00FFFF]/20 hover:bg-zinc-900/20 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-900 to-[#00FFFF]/30 flex items-center justify-center text-white font-extrabold font-mono text-sm shadow">
                                                {room.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{room.name}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">Host: <span className="text-cyan-400 font-medium">@{room.host}</span> • {room.format}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 block font-mono">{room.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. MEME LIBRARY SECTION */}
                <div className="bg-black/60 border border-[#00FFFF]/15 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.02)]">
                    <button 
                        onClick={() => toggleSection('memes')}
                        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-950/80 border-b border-[#00FFFF]/10 hover:bg-zinc-900/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <ImageIcon />
                            <span className="font-extrabold text-white tracking-wide">Saved Memes Grid</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections.memes} />
                    </button>
                    
                    {openSections.memes && (
                        <div className="p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {savedMemes.map(meme => (
                                    <div 
                                        key={meme.id}
                                        className="relative group rounded-xl overflow-hidden border border-zinc-800 hover:border-cyan-400/40 aspect-square shadow-md transition-all duration-300 cursor-zoom-in"
                                        onClick={() => showToast(`Opening meme viewer for "${meme.title}"`)}
                                    >
                                        <img src={meme.imageUrl} alt={meme.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 text-center">
                                            <p className="meme-text text-xs tracking-wider">{meme.title}</p>
                                        </div>
                                    </div>
                                ))}
                                <div 
                                    onClick={onCreateMeme}
                                    className="border-2 border-dashed border-cyan-500/20 hover:border-cyan-400/50 bg-cyan-950/10 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all aspect-square group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#00FFFF]/10 flex items-center justify-center text-cyan-400 mb-2 border border-cyan-400/30 group-hover:scale-110 transition-transform">
                                        +
                                    </div>
                                    <span className="font-bold text-xs text-white">Create New Meme</span>
                                    <span className="text-[10px] text-gray-500 mt-1">Pick image & add text overlay</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. ACTION TEMPLATES SECTION */}
                <div className="bg-black/60 border border-[#00FFFF]/15 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.02)]">
                    <button 
                        onClick={() => toggleSection('templates')}
                        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-950/80 border-b border-[#00FFFF]/10 hover:bg-zinc-900/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldAlertIcon />
                            <span className="font-extrabold text-white tracking-wide">Spark Clash Action Templates ({ownedTemplates.length})</span>
                        </div>
                        <ChevronDownIcon isOpen={openSections.templates} />
                    </button>
                    
                    {openSections.templates && (
                        <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {ownedTemplates.map(template => (
                                    <div 
                                        key={template.id}
                                        onClick={() => showToast(`Template Detail: ${template.name} - ${template.description}`)}
                                        className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer ${getTierColorClass(template.rarity)}`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-extrabold text-white text-base tracking-tight">{template.name}</h4>
                                                <span className="text-[10px] font-mono leading-none tracking-widest px-2 py-1 bg-black/60 rounded border border-white/10 uppercase font-bold text-cyan-300">
                                                    {template.rarity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">{template.description}</p>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-cyan-400 font-mono">Cost: {template.energyCost} Energy</span>
                                            <span className="text-xs text-purple-400 font-semibold">{template.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LibraryPage;
