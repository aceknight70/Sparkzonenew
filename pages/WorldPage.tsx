import React, { useState, useEffect } from 'react';
import { World, WorldLocation, UserCreation, User, TimelineEvent, WorldLoreEntry } from '../types';
import { copyToClipboard } from '../utils';
import GroupChatView from '../components/GroupChatView';
import WorldSidebar from '../components/WorldSidebar';
import WorldMapView from '../components/WorldMapView';
import WorldTimelineView from '../components/WorldTimelineView';
import WorldSettingsSection from '../components/WorldSettingsSection';
import UserAvatar from '../components/UserAvatar';

// Icons
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.505 2.375A.75.75 0 014 2h12a2 2 0 012 2v8a2 2 0 01-2 2H5.162l-2.36 2.066A.75.75 0 011.5 15.5v-11a2 2 0 012-2.125z" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.995 9.995 0 0010 12c-2.31 0-4.438.784-6.131-2.095z" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008.068-.031c.142-.066.361-.17.65-.32a22.253 22.253 0 002.766-1.637l.035-.025.07-.052C15.932 15.657 18 12.855 18 9c0-4.418-3.582-8-8-8S2 4.582 2 9c0 3.855 2.068 6.657 4.101 8.24l.07.052.035.025a22.253 22.253 0 002.766 1.637l.068.031.018.008.006.003zm.31-7.933a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" /></svg>;
const ClipboardDocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>;
const Cog6ToothIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.28l1.383 1.382 1.966-1.966a.75.75 0 111.06 1.06l-1.965 1.967 1.382 1.382h.28a.75.75 0 010 1.5h-.28l-1.382 1.382 1.966 1.966a.75.75 0 01-1.06 1.061l-1.967-1.967-1.382 1.383v.28a.75.75 0 01-1.5 0v-.28l-1.382-1.383-1.966 1.967a.75.75 0 01-1.061-1.06l1.967-1.967-1.382-1.382h-.28a.75.75 0 010-1.5h.28l1.383-1.382-1.967-1.966a.75.75 0 111.06-1.06l1.966 1.966 1.383-1.382V2.75A.75.75 0 0110 2z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5z" clipRule="evenodd" /></svg>;

interface WorldPageProps {
    world: World;
    onExit: () => void;
    onSendGroupMessage: (worldId: number, locationId: number, text: string, character?: UserCreation, imageUrl?: string) => void;
    onDeleteGroupMessage?: (worldId: number, locationId: number, messageId: number) => void;
    userCreations: UserCreation[];
    onStartConversation: (userId: number) => void;
    currentUser: User;
    onSaveMeme?: (meme: { name: string, imageUrl: string }) => void;
    onPlayMusic?: (url: string | null) => void;
    onJoinWorld?: (worldId: number) => void;
    activeLocationId?: number | null;
    onSelectLocationId?: (id: number | null) => void;
    onEditWorld?: (worldId: number) => void;
}

// 6 Core tabs
type MemberTab = 'CHAT' | 'LORE' | 'PEOPLE' | 'MAP' | 'LOG' | 'ADMIN';

// Local timeline events representing sessions & activity
interface LiveSession {
    id: number;
    title: string;
    date: string;
    description: string;
    stageMode: 'Theatre of the Mind' | 'Grid VTT' | 'Soundscape Sandbox';
    participantLimit: number;
    attendees: string[]; // member names
}

const WorldPage: React.FC<WorldPageProps> = ({ 
    world, 
    onExit, 
    onSendGroupMessage, 
    onDeleteGroupMessage, 
    userCreations, 
    onStartConversation, 
    currentUser, 
    onSaveMeme, 
    onPlayMusic, 
    onJoinWorld,
    activeLocationId: propActiveLocationId,
    onSelectLocationId,
    onEditWorld
}) => {
    // Current World object stored in local state for seamless mutations (moderation, settings, comments, live events)
    const [localWorld, setLocalWorld] = useState<World>(world);
    const [activeTab, setActiveTab] = useState<MemberTab>('CHAT');
    
    // Channels Active State - Controlled or fallback to local
    const [localActiveLocationId, setLocalActiveLocationId] = useState<number | null>(null);
    const activeLocationId = propActiveLocationId !== undefined ? propActiveLocationId : localActiveLocationId;
    const setActiveLocationId = (id: number | null) => {
        if (onSelectLocationId) {
            onSelectLocationId(id);
        } else {
            setLocalActiveLocationId(id);
        }
    };
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Welcome Hub Interactive States
    const [isRulesExpanded, setIsRulesExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // --- State: LORE Comments Discossion ---
    const [selectedLoreEntry, setSelectedLoreEntry] = useState<WorldLoreEntry | null>(localWorld.lorebook?.[0] || null);
    const [loreComments, setLoreComments] = useState<Record<number, { id: number; author: string; avatar: string; text: string; time: string }[]>>({
        1: [
            { id: 1, author: 'Eldrin the Mage', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', text: 'This magical system could lead to interesting visual phenomena in roleplay scenes!', time: '10 mins ago' }
        ]
    });
    const [newCommentText, setNewCommentText] = useState('');

    // --- State: PEOPLE Moderation ---
    const [mutedMemberIds, setMutedMemberIds] = useState<number[]>([]);
    const [bannedMemberNames, setBannedMemberNames] = useState<string[]>(['TrollKing99']);
    const [reports, setReports] = useState<string[]>([
        'Inhabitant Syra reported a message in #the-town-square: "Disrespectful OOC language"'
    ]);

    // --- State: LOG Activity feed & Scheduled Events ---
    const [activities, setActivities] = useState<string[]>([
        'Ragnar Ironheart has requested entrance to the lobby.',
        'Oracle Guide updated World Codex: Added "The Great Cataclysm" timeline.',
        'Lore entry created under Factions: The Silver Syndicate.'
    ]);

    const [liveEvents, setLiveEvents] = useState<LiveSession[]>([
        {
            id: 201,
            title: 'Live Campaign: Arrival at Hollow Gate',
            date: 'Tomorrow, 7:00 PM UTC',
            description: 'We will host a live theatrical roleplaying session exploring the sunken metal structures.',
            stageMode: 'Theatre of the Mind',
            participantLimit: 6,
            attendees: [currentUser.name, 'Eldrin the Mage']
        },
        {
            id: 202,
            title: 'Tactical Combat: Arena of Stars',
            date: 'Next Saturday, 4:00 PM UTC',
            description: 'Action scene testing our custom stats cards and initiative rolls.',
            stageMode: 'Grid VTT',
            participantLimit: 4,
            attendees: ['Garrick the Rogue']
        }
    ]);

    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');
    const [newEventStage, setNewEventStage] = useState<'Theatre of the Mind' | 'Grid VTT' | 'Soundscape Sandbox'>('Theatre of the Mind');
    const [newEventLimit, setNewEventLimit] = useState(5);

    // --- State: ADMIN custom channel and Slow Mode ---
    const [slowModeSeconds, setSlowModeSeconds] = useState<Record<number, number>>({});
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');

    const [unreadLocationIds, setUnreadLocationIds] = useState<number[]>([]);

    const [inviteCopied, setInviteCopied] = useState(false);

    // Sync state
    useEffect(() => {
        setLocalWorld(world);
        if (world?.locations) {
            const allChannels = world.locations.flatMap(cat => cat.channels);
            if (allChannels.length > 1) {
                setUnreadLocationIds([allChannels[1].id]);
            }
        }
    }, [world]);

    const isMember = localWorld.members.some(m => String(m.id) === String(currentUser.id));
    const isAdmin = String(currentUser.id) === String(localWorld.authorId) || localWorld.members.some(m => String(m.id) === String(currentUser.id) && m.role === 'Creator');

    const activeLocation = activeLocationId != null
        ? localWorld.locations.flatMap(cat => cat.channels).find(chan => chan.id === activeLocationId)
        : null;

    // Functions
    const handleSelectLocation = (location: WorldLocation | { id: null; name: string }) => {
        setActiveLocationId(location.id);
        setActiveTab('CHAT');
        if (location.id !== null && onPlayMusic && (location as WorldLocation).themeSongUrl) {
            onPlayMusic((location as WorldLocation).themeSongUrl);
        }
    };

    const handleSendMessageProxy = (
        worldId: number, 
        locationId: number, 
        text: string, 
        character?: UserCreation, 
        imageUrl?: string, 
        audioUrl?: string
    ) => {
        const isMuted = mutedMemberIds.includes(currentUser.id);
        if (isMuted) {
            alert("❌ You are temporarily muted from roleplaying in this world's channels by administrators.");
            return;
        }

        const slowTime = slowModeSeconds[locationId] || 0;
        if (slowTime > 0) {
            console.log(`Slow Mode Active: ${slowTime}s`);
        }

        onSendGroupMessage(worldId, locationId, text, character, imageUrl);
    };

    const handleAddComment = (entryId: number) => {
        if (!newCommentText.trim()) return;
        const newCom = {
            id: Date.now(),
            author: currentUser.name,
            avatar: currentUser.avatarUrl,
            text: newCommentText.trim(),
            time: 'Just now'
        };
        setLoreComments(prev => ({
            ...prev,
            [entryId]: [...(prev[entryId] || []), newCom]
        }));
        setNewCommentText('');
    };

    const handleJoinEvent = (eventId: number) => {
        setLiveEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                const hasJoined = e.attendees.includes(currentUser.name);
                if (hasJoined) {
                    return { ...e, attendees: e.attendees.filter(name => name !== currentUser.name) };
                } else {
                    if (e.attendees.length >= e.participantLimit) {
                        alert("❌ This event has reached its player limit!");
                        return e;
                    }
                    return { ...e, attendees: [...e.attendees, currentUser.name] };
                }
            }
            return e;
        }));
    };

    const handleCreateLiveEvent = () => {
        if (!newEventTitle || !newEventDate) {
            alert("Title and Scheduled Date are required!");
            return;
        }
        const created: LiveSession = {
            id: Date.now(),
            title: newEventTitle,
            date: newEventDate,
            description: newEventDesc || 'No description provided.',
            stageMode: newEventStage,
            participantLimit: newEventLimit,
            attendees: [currentUser.name]
        };
        setLiveEvents([created, ...liveEvents]);
        setNewEventTitle('');
        setNewEventDate('');
        setNewEventDesc('');
        alert("✨ Session Event scheduled! Added to Chronicles Log feed.");
    };

    // Member Controls
    const muteMember = (memberId: number) => {
        if (mutedMemberIds.includes(memberId)) {
            setMutedMemberIds(prev => prev.filter(id => id !== memberId));
            setActivities([`Member was unmuted by administrator.`, ...activities]);
        } else {
            setMutedMemberIds(prev => [...prev, memberId]);
            setActivities([`Member was muted by administrator.`, ...activities]);
        }
    };

    const kickMember = (memberId: number) => {
        const mem = localWorld.members.find(m => m.id === memberId);
        if (!mem) return;
        if (confirm(`Are you sure you want to kick ${mem.name}?`)) {
            setLocalWorld(prev => ({
                ...prev,
                members: prev.members.filter(m => m.id !== memberId)
            }));
            setActivities([`${mem.name} was kicked from the world.`, ...activities]);
        }
    };

    const banMember = (memberId: number) => {
        const mem = localWorld.members.find(m => m.id === memberId);
        if (!mem) return;
        if (confirm(`Ban ${mem.name} dynamically?`)) {
            setBannedMemberNames(p => [...p, mem.name]);
            setLocalWorld(prev => ({
                ...prev,
                members: prev.members.filter(m => m.id !== memberId)
            }));
            setActivities([`${mem.name} was permanently banned by moderator.`, ...activities]);
        }
    };

    const handleCopyInvite = () => {
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
    };

    const handleCreateChannelAdmin = () => {
        if (!newChannelName) return;
        const cleanName = newChannelName.toLowerCase().replace(/\s+/g, '-');
        const defaultCategory = localWorld.locations?.[0]?.category || "PLAY PLACES";
        const newChan: WorldLocation = {
            id: Date.now(),
            name: cleanName,
            description: newChannelDesc || "No description provided.",
            messages: []
        };
        
        setLocalWorld(prev => {
            const locs = [...prev.locations];
            if (locs.length > 0) {
                locs[0] = {
                    ...locs[0],
                    channels: [...locs[0].channels, newChan]
                };
            }
            return { ...prev, locations: locs };
        });

        setActivities([`New channel #${cleanName} created.`, ...activities]);
        setNewChannelName('');
        setNewChannelDesc('');
        alert(`Success! Created channel #${cleanName}.`);
    };

    return (
        <div className="relative flex flex-col h-screen w-full bg-neutral-950 bg-gradient-to-tr from-neutral-950 via-[#030114] to-neutral-900 text-gray-100 font-sans overflow-hidden">
            
            {/* Elegant Header & Global Tab Selection */}
            <header className={`flex-col md:flex-row md:items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-violet-500/20 backdrop-blur-xl z-30 shrink-0 gap-3 ${
                activeLocation ? 'hidden md:flex' : 'flex'
            }`}>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onExit} 
                        className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 rounded-full text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                    >
                        ← Main
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <h1 className="text-lg font-extrabold text-white tracking-tight">{localWorld.name}</h1>
                        </div>
                        <p className="text-[11px] text-gray-400 capitalize hidden sm:block font-mono tracking-wider">
                            Vibe Theme: <span className="text-cyan-400 font-bold">{localWorld.colorTheme || 'Default Arcane'}</span>
                        </p>
                    </div>
                </div>

                {/* Tabs Hub */}
                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                    {[
                        { id: 'CHAT', label: 'Chat', icon: <ChatIcon /> },
                        { id: 'LORE', label: 'Lore', icon: <BookOpenIcon /> },
                        { id: 'PEOPLE', label: 'People', icon: <UsersIcon /> },
                        { id: 'MAP', label: 'Map', icon: <MapIcon /> },
                        { id: 'LOG', label: 'Log', icon: <ClipboardDocumentIcon /> },
                        ...(isAdmin ? [{ id: 'ADMIN', label: 'Admin', icon: <Cog6ToothIcon /> }] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 ring-2 ring-cyan-400/10' : 'text-neutral-400 hover:text-neutral-200 border border-transparent'}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            {/* Main Area */}
            <div className="flex-1 flex min-h-0 relative">

                {/* TAB: CHAT (Splits screen into WorldSidebar + ChatRoom) */}
                {activeTab === 'CHAT' && (
                    <div className="flex-1 flex min-w-0 h-full bg-neutral-950">
                        <aside 
                            className={`shrink-0 h-full bg-neutral-900/20 border-r border-violet-500/10 ${
                                activeLocation 
                                    ? 'hidden md:block md:w-80' 
                                    : 'w-full md:w-80'
                            } ${!isSidebarVisible ? 'md:hidden' : ''}`}
                        >
                            <WorldSidebar
                                world={localWorld}
                                activeLocationId={activeLocationId ?? -1}
                                onSelectLocation={handleSelectLocation}
                                onExit={onExit}
                                onStartConversation={onStartConversation}
                                currentUser={currentUser}
                                onShowAtlas={() => setActiveTab('MAP')}
                                onShowTimeline={() => setActiveTab('LOG')}
                                onJoinWorld={onJoinWorld}
                            />
                        </aside>

                        <section 
                            className={`flex flex-col min-w-0 h-full relative ${
                                activeLocation ? 'flex-1 w-full' : 'hidden md:flex md:flex-1'
                            }`}
                        >
                            {/* Toggle Sidebar Button */}
                            <button 
                                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                                className="absolute top-4 left-4 z-40 hidden md:block bg-neutral-900/60 hover:bg-neutral-900 backdrop-blur-md border border-neutral-800 text-xs text-cyan-400 px-2.5 py-1 rounded-full font-bold shadow-lg"
                            >
                                {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
                            </button>

                            {activeLocation ? (
                                <GroupChatView 
                                    key={activeLocation.id} 
                                    location={activeLocation} 
                                    world={localWorld}
                                    onBack={() => setActiveLocationId(null)}
                                    onSendMessage={handleSendMessageProxy}
                                    onDeleteMessage={onDeleteGroupMessage}
                                    userCreations={userCreations}
                                    onSaveMeme={onSaveMeme}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col h-full overflow-y-auto bg-neutral-950 text-gray-100 relative scrollbar-thin select-none pb-28">
                                    {/* World Header/Banner */}
                                    <div 
                                        className="relative w-full h-48 md:h-60 bg-cover bg-center flex flex-col justify-end p-4 md:p-6 shrink-0"
                                        style={{ backgroundImage: `url(${localWorld.bannerUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80'})` }}
                                    >
                                        {/* Gradient Overlay for high-contrast text rendering */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"></div>
                                        
                                        {/* Header Title and Controls */}
                                        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2 py-0.5 text-[9px] font-mono font-black tracking-widest uppercase bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 rounded">
                                                        {(localWorld.contentMetadata?.ageRating || 'TEEN').toUpperCase()} • {(localWorld.genreTags?.[0] || 'RP WORLD').toUpperCase()}
                                                    </span>
                                                    {localWorld.statusLabel && (
                                                        <span className="px-2 py-0.5 text-[9px] font-mono leading-none tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                                                            {localWorld.statusLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 id="world-detail-title" className="text-2xl md:text-3.5xl font-extrabold text-white tracking-tight drop-shadow-md">
                                                    {localWorld.name}
                                                </h2>
                                                <div className="flex items-center gap-2 text-xs text-cyan-400/80 font-mono">
                                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block"></span>
                                                    <span>{Math.floor(localWorld.members.length / 2) + 1} online</span>
                                                    <span className="text-gray-600">•</span>
                                                    <span>{localWorld.members.length} total members</span>
                                                </div>
                                            </div>

                                            {/* Three-Dot Option Menu & Administrative Settings Hook */}
                                            <div className="flex items-center gap-2 self-start md:self-end">
                                                {isAdmin && onEditWorld && (
                                                    <button 
                                                        id="world-workshop-shortcut"
                                                        onClick={() => onEditWorld(localWorld.id)}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-[11px] font-black tracking-wider uppercase text-white rounded-lg flex items-center gap-1.5 shadow-md shadow-violet-950/40 border border-violet-500/30 font-sans cursor-pointer transition-all hover:scale-[1.03]"
                                                        title="Edit full world blueprint"
                                                    >
                                                        <span>✏️ Edit Blueprint</span>
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button 
                                                        id="admin-settings-shortcut"
                                                        onClick={() => setActiveTab('ADMIN')}
                                                        className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-gray-400 hover:text-cyan-400 transition-all cursor-pointer h-10 w-10 flex items-center justify-center"
                                                        title="Admin Dashboard Settings"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a6.723 6.723 0 010 .255c-.008.378.137.75.43.99l1.004.831a1.125 1.125 0 01.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.37.491l-1.216-.456c-.356-.133-.752-.072-1.076.124-.072.044-.146.087-.22.128-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.83c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.831a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    </button>
                                                )}

                                                <div className="relative">
                                                    <button 
                                                        id="three-dots-world-menu"
                                                        onClick={() => setShowMenu(!showMenu)}
                                                        className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-gray-400 hover:text-cyan-400 transition-all cursor-pointer h-10 w-10 flex items-center justify-center animate-pulse"
                                                        aria-label="Options Menu"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                                                    </button>

                                                    {showMenu && (
                                                        <div id="world-dropdown-menu" className="absolute right-0 bottom-12 mb-2 w-48 bg-neutral-900 border border-neutral-850 rounded-xl shadow-2xl p-1 z-50 animate-fadeIn">
                                                            <button 
                                                                onClick={async () => {
                                                                    setShowMenu(false);
                                                                    const copied = await copyToClipboard(window.location.href);
                                                                    if (copied) {
                                                                        setToastMessage('📢 Invite link copied to clipboard!');
                                                                    } else {
                                                                        setToastMessage('❌ Failed to copy invite link.');
                                                                    }
                                                                    setTimeout(() => setToastMessage(''), 3000);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer"
                                                            >
                                                                🔗 Copy Invite Link
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setShowMenu(false);
                                                                    setToastMessage('⚠️ This world has been reported for evaluation.');
                                                                    setTimeout(() => setToastMessage(''), 3000);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer"
                                                            >
                                                                🚩 Report World
                                                            </button>
                                                            {isMember && (
                                                                <button 
                                                                    onClick={() => {
                                                                        setShowMenu(false);
                                                                        if (confirm("Are you sure you want to leave this world?")) {
                                                                            onExit();
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-rose-950/20 rounded-lg flex items-center gap-2 cursor-pointer border-t border-neutral-800 mt-1"
                                                                >
                                                                    🚪 Leave World
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Notification Toast */}
                                    {toastMessage && (
                                        <div id="welcome-floating-toast" className="fixed top-20 right-4 z-[100] bg-cyan-950 border border-cyan-500/60 text-cyan-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-slideIn">
                                            <span className="text-cyan-400">✨</span>
                                            {toastMessage}
                                        </div>
                                    )}

                                    {/* Scrollable Core Welcome Body Grid */}
                                    <div className="px-4 py-6 md:px-8 space-y-6 max-w-3xl mx-auto w-full">
                                        
                                        {/* Oracle System Welcome Card */}
                                        <div id="oracle-guide-banner" className="bg-neutral-900 border border-cyan-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                            {/* Glowing gradient background border effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"></div>
                                            
                                            <div className="relative flex gap-4">
                                                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
                                                    📢
                                                </div>
                                                <div className="space-y-1.5 flex-1 select-text">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">Oracle System Bulletin</span>
                                                    </div>
                                                    <h3 className="text-base font-bold text-white leading-snug">
                                                        Welcome to {localWorld.name}
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans">
                                                        {localWorld.welcomeMessage || localWorld.synopsis || "Welcome voyager! You have successfully established interface connection with our system core. Synchronize credentials, align with standard world rules/protocols, and request portal entrance below."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rules Accordion Section (Multi-line bullet-proof layout) */}
                                        <div id="rules-collapsible-card" className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-750 transition-all">
                                            {/* Accordion Trigger */}
                                            <button 
                                                onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                                                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 focus:outline-none cursor-pointer"
                                                style={{ minHeight: '44px' }}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-cyan-400 text-sm">📜</span>
                                                        <span className="font-bold text-sm text-white tracking-wide">Rules of the Realm</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                                                        {isRulesExpanded 
                                                            ? "Review the protocols of conduct and play standards."
                                                            : `Preview: "${localWorld.rules?.split(/[.\n]+/)[0] || 'Respect co-players.'}"`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 text-cyan-400">
                                                    <span className="text-[10px] font-bold font-mono tracking-wide bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                                                        {isRulesExpanded ? "COLLAPSE" : "EXPAND ALL"}
                                                    </span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 transform transition-transform duration-200 ${isRulesExpanded ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                                </div>
                                            </button>

                                            {/* Accordion Content */}
                                            {isRulesExpanded && (
                                                <div className="px-5 pb-5 pt-1 border-t border-neutral-800 bg-neutral-950/40 select-text">
                                                    <ul className="space-y-3.5 mt-2">
                                                        {(localWorld.rules ? localWorld.rules.split('\n') : ["Respect your fellow roleplayers and collaborators at all times.", "Collaborative storytelling is our core value – no godmodding/powergaming.", "Check content warnings and labels prior to commencing active play scenes."]).map((rule, idx) => {
                                                            const cleanRule = rule.trim().replace(/^[\d+.\-\s•*]+/, '');
                                                            if (!cleanRule) return null;
                                                            return (
                                                                <li key={idx} className="flex gap-3 text-xs md:text-sm text-neutral-300">
                                                                    <span className="text-cyan-400 font-mono font-bold shrink-0 mt-0.5">0{idx+1}.</span>
                                                                    <p className="leading-relaxed font-sans">{cleanRule}</p>
                                                                </li>
                                                             );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Play Spaces / Channel Navigation Area */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between pb-1 border-b border-neutral-900">
                                                <h4 className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                                                    Active Play Spaces
                                                </h4>
                                                <span className="text-[10px] font-mono text-gray-500 font-medium">
                                                    {localWorld.locations.flatMap(l => l.channels).length} channels available
                                                </span>
                                            </div>

                                            {isMember ? (
                                                /* Show real channel cards for members in vertical stack */
                                                <div id="play-spaces-list" className="grid grid-cols-1 gap-3">
                                                    {localWorld.locations.flatMap(l => l.channels).map((channel, cIdx) => {
                                                        const isVoice = channel.name.toLowerCase().includes('voice') || channel.name.toLowerCase().includes('tavern') || channel.name.toLowerCase().includes('lounge') || channel.name.toLowerCase().includes('square') || cIdx === 1;
                                                        return (
                                                            <button
                                                                key={channel.id}
                                                                onClick={() => {
                                                                    handleSelectLocation(channel);
                                                                    setUnreadLocationIds(prev => prev.filter(x => x !== channel.id));
                                                                }}
                                                                className="w-full text-left bg-neutral-900 border border-neutral-850 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 flex items-center justify-between gap-4 group cursor-pointer relative overflow-hidden"
                                                                style={{ minHeight: '52px' }}
                                                            >
                                                                <div className="flex items-center gap-3.5 min-w-0">
                                                                    <div className="w-10 h-10 rounded-lg bg-neutral-950 flex items-center justify-center text-cyan-400 shrink-0 text-base font-bold border border-neutral-850">
                                                                        {isVoice ? "🔊" : "💬"}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                                                                                #{channel.name}
                                                                            </span>
                                                                            {isVoice && (
                                                                                <span className="px-1.5 py-0.5 text-[8px] font-black font-mono bg-cyan-950 text-cyan-400 rounded border border-cyan-500/20">VOICE</span>
                                                                            )}
                                                                            {unreadLocationIds.includes(channel.id) && (
                                                                                <span className="w-2 h-2 rounded-full bg-[#00FFFF] inline-block animate-pulse shadow-[0_0_8px_#00FFFF]" title="New messages"></span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-neutral-400 truncate mt-0.5 font-sans">
                                                                            {channel.description || "Enter play space to view active storytelling threads."}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {isVoice ? (
                                                                        <span className="text-[11px] font-mono font-semibold text-cyan-400/90 whitespace-nowrap bg-cyan-950/20 px-2.5 py-1 rounded-full border border-cyan-500/10">
                                                                            ⚡ 4 active OCs
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
                                                                            {Date.now() % 5 + 1}m ago
                                                                        </span>
                                                                    )}
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                /* Non-members see a blurred preview list with prompt/overlay */
                                                <div className="space-y-3 relative">
                                                    <div className="grid grid-cols-1 gap-3 saturate-50 opacity-45 blur-[1px] pointer-events-none select-none">
                                                        {localWorld.locations.flatMap(l => l.channels).slice(0, 3).map((channel, cIdx) => (
                                                            <div key={channel.id || cIdx} className="w-full bg-neutral-900 border border-neutral-850 rounded-xl p-4 flex items-center justify-between gap-4">
                                                                <div className="flex items-center gap-3.5 min-w-0">
                                                                    <div className="w-10 h-10 rounded-lg bg-neutral-950 flex items-center justify-center text-gray-600 shrink-0 text-base font-bold">
                                                                        💬
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="text-sm font-bold text-neutral-500 truncate inline-block">
                                                                            #{channel.name}
                                                                        </span>
                                                                        <p className="text-xs text-neutral-600 truncate mt-0.5">
                                                                            {channel.description || "Play space locks until registered."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-4 h-4 text-neutral-700">🔒</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Centralised Join Call To Action Button (Meets Apple touch targets HIG) */}
                                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                                        <div className="bg-neutral-900/95 border border-cyan-500/50 rounded-xl p-6 text-center shadow-xl space-y-4 max-w-sm w-full select-none animate-fadeIn backdrop-blur-sm">
                                                            <div className="text-3xl text-cyan-400">🔒</div>
                                                            <div className="space-y-1">
                                                                <h4 className="font-extrabold text-white text-sm">Join World to View Channels</h4>
                                                                <p className="text-xs text-gray-400 leading-normal font-sans">
                                                                    You must request entrance or join to participate in active roleplays and read chronologies.
                                                                </p>
                                                            </div>
                                                            <button
                                                                id="request-entrance-primary"
                                                                onClick={() => {
                                                                    if (onJoinWorld) {
                                                                        onJoinWorld(localWorld.id);
                                                                    }
                                                                    // Dynamic update helper
                                                                    setLocalWorld(prev => {
                                                                        if (prev.members.some(m => m.id === currentUser.id)) return prev;
                                                                        return {
                                                                            ...prev,
                                                                            members: [...prev.members, { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl, role: 'Standard Adventurer' }]
                                                                        };
                                                                    });
                                                                    setToastMessage("✨ Entrance granted! Welcome to the realm.");
                                                                    setTimeout(() => setToastMessage(''), 3000);
                                                                }}
                                                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-neutral-950 font-black text-xs uppercase rounded-lg shadow-lg shadow-cyan-400/10 hover:from-cyan-400 hover:to-cyan-500 transition-all cursor-pointer h-11 flex items-center justify-center gap-1.5"
                                                            >
                                                                <span>⚡ Request Entrance</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Dynamic Command Tips Area */}
                                        <div className="pt-4 text-center border-t border-neutral-900 font-mono text-[10px] text-gray-500">
                                            💡 Tip: Use <span className="text-cyan-400/80">/roll d20</span> or <span className="text-cyan-400/80">/roll 2d6+3</span> in any active chat room to roll complex dice equations dynamically.
                                        </div>
                                    </div>

                                    {/* BOTTOM FLOATING STICKY ACTION BAR */}
                                    <div id="sticky-bottom-actions" className="fixed bottom-4 left-4 right-4 z-40 bg-neutral-950/95 border border-cyan-500/30 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(6,182,212,0.18)] max-w-md mx-auto py-2.5 px-6 flex items-center justify-around gap-2">
                                        <button 
                                            id="quick-action-chat-hub"
                                            onClick={() => {
                                                const firstChannel = localWorld.locations?.[0]?.channels?.[0];
                                                if (firstChannel) {
                                                    if (isMember) {
                                                        handleSelectLocation(firstChannel);
                                                    } else {
                                                        setToastMessage("🔒 Please join the world first to view active chats!");
                                                        setTimeout(() => setToastMessage(''), 3000);
                                                    }
                                                }
                                            }}
                                            className="flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 font-mono text-[10px] leading-none transition-colors px-4 py-1.5 cursor-pointer max-h-12"
                                            style={{ minWidth: '60px', minHeight: '40px' }}
                                        >
                                            <span className="text-base select-none">💬</span>
                                            <span className="font-bold">Chat</span>
                                        </button>
                                        
                                        <button 
                                            id="quick-action-preview-hub"
                                            onClick={() => {
                                                if (!isMember) {
                                                    setIsPreviewMode(true);
                                                    setLocalWorld(prev => ({
                                                        ...prev,
                                                        members: [...prev.members, { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl, role: 'Standard Adventurer' }]
                                                    }));
                                                    setToastMessage("👁 Preview Access Granted (Read-Only Mode)!");
                                                    setTimeout(() => setToastMessage(''), 4000);
                                                } else {
                                                    setToastMessage("✔️ You are already fully synchronized as a member!");
                                                    setTimeout(() => setToastMessage(''), 3000);
                                                }
                                            }}
                                            className="flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 font-mono text-[10px] leading-none transition-colors px-4 py-1.5 cursor-pointer max-h-12"
                                            style={{ minWidth: '60px', minHeight: '40px' }}
                                        >
                                            <span className="text-base select-none">👁</span>
                                            <span className="font-bold">Preview</span>
                                        </button>

                                        <button 
                                            id="quick-action-invite-hub"
                                            onClick={async () => {
                                                const copied = await copyToClipboard(window.location.href);
                                                if (copied) {
                                                    setToastMessage('📢 Invite copied to clipboard!');
                                                } else {
                                                    setToastMessage('❌ Failed to copy invite.');
                                                }
                                                setTimeout(() => setToastMessage(''), 3000);
                                            }}
                                            className="flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 font-mono text-[10px] leading-none transition-colors px-4 py-1.5 cursor-pointer max-h-12"
                                            style={{ minWidth: '60px', minHeight: '40px' }}
                                        >
                                            <span className="text-base select-none">📢</span>
                                            <span className="font-bold">Invite</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* TAB: LORE (Browsing Wiki + Discussion Comments) */}
                {activeTab === 'LORE' && (
                    <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 animate-fadeIn">
                        {/* Categories & Entries Sidebar */}
                        <div className="w-full md:w-80 bg-neutral-900/20 border-r border-violet-500/10 p-5 overflow-y-auto shrink-0 space-y-4">
                            <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                                <BookOpenIcon /> World Wiki
                            </h2>
                            <p className="text-xs text-neutral-400">Read structured Lore Entries sorted into categorized Lore Boards.</p>
                            
                            {localWorld.lorebook && localWorld.lorebook.length > 0 ? (
                                <div className="space-y-4 pt-2">
                                    {Array.from(new Set(localWorld.lorebook.map(l => l.category))).map(catName => (
                                        <div key={catName} className="space-y-1.5">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{catName}</h4>
                                            {localWorld.lorebook.filter(l => l.category === catName).map(entry => (
                                                <button
                                                    key={entry.id}
                                                    onClick={() => { setSelectedLoreEntry(entry); }}
                                                    className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold border transition-all ${selectedLoreEntry?.id === entry.id ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-neutral-950/20 border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/40'}`}
                                                >
                                                    {entry.name}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-500 italic">No entries configured in the Lorebook yet. Use administrative channels to write custom lore.</p>
                            )}
                        </div>

                        {/* Selected Entry Detail Column */}
                        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 md:p-10 space-y-8 bg-neutral-950/20">
                            {selectedLoreEntry ? (
                                <div className="max-w-3xl space-y-6">
                                    <div>
                                        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">{selectedLoreEntry.category}</span>
                                        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">{selectedLoreEntry.name}</h1>
                                    </div>

                                    {/* Cover Image */}
                                    <div className="rounded-2xl overflow-hidden border border-neutral-800 aspect-video max-h-80 shadow-2xl relative">
                                        <img 
                                            src={selectedLoreEntry.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80'} 
                                            alt={selectedLoreEntry.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent"></div>
                                    </div>

                                    {/* Text Description */}
                                    <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl">
                                        <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap">{selectedLoreEntry.description}</p>
                                    </div>

                                    {/* Comments Discussion Section */}
                                    <div className="border-t border-violet-500/10 pt-6 space-y-4">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Discussion Comments ({loreComments[selectedLoreEntry.id]?.length || 0})</h3>
                                        <div className="space-y-3">
                                            {(loreComments[selectedLoreEntry.id] || []).map(com => (
                                                <div key={com.id} className="flex gap-3 bg-neutral-900/20 border border-neutral-800/40 p-3 rounded-lg text-xs leading-relaxed">
                                                    <UserAvatar src={com.avatar} size="6" />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-white">{com.author}</span>
                                                            <span className="text-[10px] text-gray-500 font-mono">{com.time}</span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm">{com.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(loreComments[selectedLoreEntry.id] || []).length === 0 && (
                                                <p className="text-xs text-neutral-500 italic">No comments posted yet. Spark the debate about this wiki entry.</p>
                                            )}
                                        </div>

                                        {/* Write Comment Form */}
                                        <div className="flex gap-2 pt-2">
                                            <input 
                                                value={newCommentText} 
                                                onChange={e => setNewCommentText(e.target.value)}
                                                placeholder="Write a comment about this lore..."
                                                className="flex-grow bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                                            />
                                            <button 
                                                onClick={() => handleAddComment(selectedLoreEntry.id)}
                                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white rounded-lg"
                                            >
                                                Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    Select we-wiki entry to read canon lore details.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: PEOPLE (Members, online status, admin kick/ban/mute/roles) */}
                {activeTab === 'PEOPLE' && (
                    <div className="flex-grow flex flex-col md:flex-row h-full min-h-0 animate-fadeIn p-6 md:p-8 gap-6 overflow-y-auto">
                        {/* Member List */}
                        <div className="flex-1 bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 space-y-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-white">World Inhabitants</h2>
                                <p className="text-xs text-neutral-400">All registered users, their selected OCs, and online presence status.</p>
                            </div>

                            <div className="space-y-4">
                                {localWorld.members && localWorld.members.length > 0 ? (
                                    localWorld.members.map(member => {
                                        const isMuted = mutedMemberIds.includes(member.id);
                                        return (
                                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <UserAvatar src={member.avatarUrl} size="10" />
                                                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-950"></span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold text-white text-sm">{member.name}</span>
                                                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded font-mono">{member.role}</span>
                                                            {isMuted && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono">MUTED</span>}
                                                        </div>
                                                        <p className="text-xs text-neutral-400 font-mono mt-0.5">Active OC: <span className="text-neutral-200">Kaelen Valerius (Noble Sorcerer)</span></p>
                                                    </div>
                                                </div>

                                                {/* Admin Controls */}
                                                {isAdmin && member.id !== currentUser.id && (
                                                    <div className="flex items-center gap-1">
                                                        <button 
                                                            onClick={() => muteMember(member.id)}
                                                            className={`px-2.5 py-1 text-xs font-bold rounded ${isMuted ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-600/20 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-600/30'}`}
                                                        >
                                                            {isMuted ? 'Unmute' : 'Mute'}
                                                        </button>
                                                        <button 
                                                            onClick={() => kickMember(member.id)}
                                                            className="px-2.5 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 text-xs font-bold rounded border border-red-500/20"
                                                        >
                                                            Kick
                                                        </button>
                                                        <button 
                                                            onClick={() => banMember(member.id)}
                                                            className="px-2.5 py-1 bg-neutral-950 text-gray-500 hover:text-white text-xs font-bold rounded border border-neutral-800"
                                                        >
                                                            Ban
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex gap-3 bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl items-center">
                                        <UserAvatar src={currentUser.avatarUrl} size="10" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-white text-sm">{currentUser.name}</span>
                                                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded font-mono">Creator</span>
                                            </div>
                                            <p className="text-xs text-neutral-400 mt-0.5">Lobby administrator. Waiting for members to cross the entrance prompt.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Roles breakdown sidebar */}
                        <div className="w-full md:w-80 bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 space-y-4 shrink-0">
                            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono">Role Breakdown</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between p-2.5 bg-neutral-900/40 rounded-lg">
                                    <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Admins
                                    </span>
                                    <span className="font-bold text-white">1</span>
                                </div>
                                <div className="flex justify-between p-2.5 bg-neutral-900/40 rounded-lg">
                                    <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span> Lore Keepers
                                    </span>
                                    <span className="font-bold text-white">2</span>
                                </div>
                                <div className="flex justify-between p-2.5 bg-neutral-900/40 rounded-lg">
                                    <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Standard Adventurers
                                    </span>
                                    <span className="font-bold text-white">8</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: MAP (Atlas) */}
                {activeTab === 'MAP' && (
                    <div className="flex-1 flex flex-col h-full min-h-0 animate-fadeIn">
                        <div className="p-4 bg-neutral-900/40 border-b border-violet-500/10 gap-2 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-lg font-bold text-white">Interactive Map (Atlas)</h2>
                                <p className="text-xs text-neutral-400">Browse mapped coordinates. Clicking pins routes directly to playrooms or timeline canon.</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden relative">
                            <WorldMapView world={localWorld} onSelectLocation={handleSelectLocation} />
                        </div>
                    </div>
                )}

                {/* TAB: LOG (Timeline/Chronicle & Upcoming Sessions Events) */}
                {activeTab === 'LOG' && (
                    <div className="flex-grow flex flex-col lg:flex-row h-full min-h-0 animate-fadeIn p-6 md:p-8 gap-6 overflow-y-auto">
                        
                        {/* Upcoming Session Campaigns */}
                        <div className="flex-1 bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 space-y-6">
                            <div>
                                <h2 className="text-lg font-extrabold text-white">Upcoming live Session Events</h2>
                                <p className="text-xs text-neutral-400">Participate in live Campaign events with RSVP tracking and specific Stage requirements.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {liveEvents.map(event => {
                                    const rsvpd = event.attendees.includes(currentUser.name);
                                    return (
                                        <div key={event.id} className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl relative flex flex-col justify-between h-56 hover:border-cyan-500/40 transition-colors">
                                            <div>
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <span className="text-[10px] font-mono bg-violet-500/10 text-violet-400 font-bold px-2 py-0.5 rounded border border-violet-500/10">
                                                        {event.stageMode}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-bold">
                                                        👥 {event.attendees.length}/{event.participantLimit} Players
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-white mb-1">{event.title}</h3>
                                                <div className="text-xs text-cyan-400 font-mono mb-2">{event.date}</div>
                                                <p className="text-xs text-gray-400 leading-tight line-clamp-3">{event.description}</p>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-neutral-800/80">
                                                {/* RSVP Button */}
                                                <button
                                                    onClick={() => handleJoinEvent(event.id)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${rsvpd ? 'bg-cyan-500 text-neutral-950 font-bold' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'}`}
                                                >
                                                    {rsvpd ? '✓ RSVP Registered' : 'RSVP to Session'}
                                                </button>
                                                <span className="text-[10px] text-gray-500 italic truncate max-w-[120px]">
                                                    Attending: {event.attendees.length > 0 ? event.attendees.join(', ') : 'None yet'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Chronology Activities Feed */}
                            <div className="border-t border-violet-500/10 pt-6 space-y-3">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Activity Log Timeline</h3>
                                <div className="space-y-2">
                                    {activities.map((act, index) => (
                                        <div key={index} className="p-3 bg-neutral-900/20 border border-neutral-850 rounded-lg text-xs flex items-center justify-between text-neutral-300">
                                            <span>🕰️ {act}</span>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Real-time update</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Chronicle Timeline */}
                        <div className="w-full lg:w-[450px] bg-neutral-900/20 border-l border-neutral-800 shrink-0 h-full flex flex-col min-h-0 overflow-y-auto">
                            <WorldTimelineView world={localWorld} />
                        </div>
                    </div>
                )}

                {/* TAB: ADMIN Dashboard (Visible only to administrators) */}
                {activeTab === 'ADMIN' && (
                    <div className="flex-grow flex flex-col lg:flex-row h-full min-h-0 animate-fadeIn p-6 md:p-8 gap-6 overflow-y-auto">
                        
                        {/* Administration controls */}
                        <div className="flex-grow space-y-6">
                            <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-white">Lobby Sharing & Access Gating</h3>
                                <p className="text-xs text-neutral-400">Invite codes generated to access world creation buffers.</p>
                                
                                <div className="flex gap-2">
                                    <input 
                                        readOnly 
                                        value={`https://sparkzone.ai/worlds/invite/${localWorld.id}`} 
                                        className="bg-neutral-950 border border-neutral-800 text-xs text-cyan-400 font-mono px-3 py-2 rounded-lg flex-grow focus:outline-none"
                                    />
                                    <button 
                                        onClick={handleCopyInvite}
                                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold rounded-lg transition-colors"
                                    >
                                        {inviteCopied ? 'Copied✓' : 'Copy Invite'}
                                    </button>
                                </div>
                            </div>

                            {/* Interactive Room & Text Channel Creator + Slow Mode config */}
                            <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-white">Create Direct Playrooms</h3>
                                <p className="text-xs text-neutral-400">Build flat list channels, each configured with specific background themes.</p>

                                <div className="space-y-3">
                                    <input 
                                        placeholder="Channel Name (e.g. ancient-ruins)" 
                                        value={newChannelName}
                                        onChange={e => setNewChannelName(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-lg text-white"
                                    />
                                    <textarea 
                                        placeholder="Channel description & prompt rules..." 
                                        value={newChannelDesc}
                                        onChange={e => setNewChannelDesc(e.target.value)}
                                        rows={2}
                                        className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-lg text-white resize-none"
                                    />

                                    <button 
                                        onClick={handleCreateChannelAdmin}
                                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-extrabold text-white rounded-lg shadow-lg"
                                    >
                                        Spawn Direct Channel
                                    </button>
                                </div>

                                {/* Configure Slow-Mode on existing channels */}
                                <div className="pt-4 border-t border-neutral-800/80 space-y-2">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">Slow-Mode Tuning</h4>
                                    <div className="space-y-2">
                                        {localWorld.locations.flatMap(cat => cat.channels).slice(0, 3).map(chan => {
                                            const activeSlow = slowModeSeconds[chan.id] || 0;
                                            return (
                                                <div key={chan.id} className="flex items-center justify-between p-2.5 bg-neutral-950/40 border border-neutral-850 rounded-lg text-xs">
                                                    <span>#{chan.name}</span>
                                                    <select 
                                                        value={activeSlow}
                                                        onChange={e => setSlowModeSeconds({ ...slowModeSeconds, [chan.id]: parseInt(e.target.value) })}
                                                        className="bg-neutral-900 border border-neutral-800 text-[11px] rounded px-2 py-1 text-cyan-400 font-bold"
                                                    >
                                                        <option value={0}>Slow Mode Off</option>
                                                        <option value={5}>5 seconds</option>
                                                        <option value={15}>15 seconds</option>
                                                        <option value={30}>30 seconds</option>
                                                        <option value={60}>1 minute</option>
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Moderation Reports, Ban log */}
                            <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-white">Direct Moderation Alerts Feed</h3>
                                <div className="space-y-2">
                                    {reports.map((rep, idx) => (
                                        <div key={idx} className="p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 rounded-lg flex justify-between items-center">
                                            <span>🚨 {rep}</span>
                                            <button 
                                                onClick={() => setReports(prev => prev.filter((_, i) => i !== idx))}
                                                className="text-[10px] text-rose-500 hover:text-white"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    ))}
                                    {reports.length === 0 && (
                                        <p className="text-xs text-neutral-500 italic">No reports filed currently. Lounge lobby is green!</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <h4 className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest font-mono">Ban List Logs</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {bannedMemberNames.map(name => (
                                            <span key={name} className="bg-neutral-950 text-neutral-400 font-mono text-[10px] px-2.5 py-1 rounded border border-neutral-800">
                                                🚫 {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Event Builder */}
                            <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-white">Host Live Roleplaying Session Event</h3>
                                
                                <div className="space-y-3">
                                    <input 
                                        placeholder="Event Title (e.g. Expedition to deep caverns)" 
                                        value={newEventTitle}
                                        onChange={e => setNewEventTitle(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-lg text-white"
                                    />
                                    <input 
                                        placeholder="Date & Time (e.g. Monday, 8:00 PM UTC)" 
                                        value={newEventDate}
                                        onChange={e => setNewEventDate(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-lg text-white"
                                    />
                                    <textarea 
                                        placeholder="Summarize the rules of engagement..." 
                                        value={newEventDesc}
                                        onChange={e => setNewEventDesc(e.target.value)}
                                        rows={2}
                                        className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-lg text-white resize-none"
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Stage Mode</label>
                                            <select
                                                value={newEventStage}
                                                onChange={e => setNewEventStage(e.target.value as any)}
                                                className="w-full bg-neutral-950 border border-neutral-800 text-[11px] rounded px-2.5 py-1.5 text-white"
                                            >
                                                <option value="Theatre of the Mind">Theatre of Mind</option>
                                                <option value="Grid VTT">Grid VTT Board</option>
                                                <option value="Soundscape Sandbox">Soundscape Sandbox</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Participant Limit</label>
                                            <input 
                                                type="number" 
                                                value={newEventLimit}
                                                onChange={e => setNewEventLimit(parseInt(e.target.value) || 2)}
                                                className="w-full bg-neutral-950 border border-neutral-800 text-[11px] rounded px-2.5 py-1.5 text-white"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleCreateLiveEvent}
                                        className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white rounded-lg shadow-lg"
                                    >
                                        Schedule Upcoming Event
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Interactive administration configurations mapping settings */}
                        <div className="w-full lg:w-[480px] shrink-0 space-y-4">
                            <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl h-full overflow-hidden">
                                <WorldSettingsSection worldData={localWorld} setWorldData={setLocalWorld} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Conditional Join Overlay */}
            {!isMember && onJoinWorld && (
                <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                    <button 
                        onClick={() => onJoinWorld(localWorld.id)}
                        className="pointer-events-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-black py-3 px-8 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.4)] transform hover:scale-105 transition-all flex items-center gap-2 animate-pulse text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>
                        <span>Request Entrance to {localWorld.name}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorldPage;
