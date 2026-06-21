import React, { useState } from 'react';
import { Party } from '../types';
import { copyToClipboard } from '../utils';

interface PartyPageProps {
    parties: Party[];
    onSelectParty: (partyId: number) => void;
    onCreateParty: () => void;
    onEditParty: (partyId: number) => void;
}

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const SparkHeartIcon = ({ liked }: { liked: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={liked ? "#FF007F" : "none"} stroke={liked ? "#FF007F" : "currentColor"} strokeWidth="2.5" className={`w-6 h-6 transition-transform duration-200 ${liked ? 'scale-125' : 'hover:scale-110'}`}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 hover:scale-110 transition-transform"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 hover:text-red-400 transition-colors"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

// Mode Icons
const DiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="1.5" fill="currentColor"></circle><circle cx="8" cy="8" r="1" fill="currentColor"></circle><circle cx="16" cy="16" r="1" fill="currentColor"></circle></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const CinemaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>;

const PartyPage: React.FC<PartyPageProps> = ({ parties, onSelectParty, onCreateParty, onEditParty }) => {
    // Local dynamic like registry
    const [likes, setLikes] = useState<Record<number, number>>({});
    const [likedSet, setLikedSet] = useState<Set<number>>(new Set());
    const [revealDetailsId, setRevealDetailsId] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleLike = (e: React.MouseEvent, partyId: number) => {
        e.stopPropagation();
        const fresh = new Set(likedSet);
        let increment = 1;
        if (fresh.has(partyId)) {
            fresh.delete(partyId);
            increment = -1;
        } else {
            fresh.add(partyId);
        }
        setLikedSet(fresh);
        setLikes(prev => ({
            ...prev,
            [partyId]: (prev[partyId] || 0) + increment
        }));
    };

    const handleShare = (e: React.MouseEvent, party: Party) => {
        e.stopPropagation();
        // Fallback clipboard logic via utility
        copyToClipboard(`${window.location.origin}/party/${party.id}`)
            .then((success) => {
                if (success) {
                    triggerToast(`Invite link to "${party.name}" copied!`);
                } else {
                    triggerToast(`Room URL: /party/${party.id}`);
                }
            })
            .catch(() => triggerToast(`Room URL: /party/${party.id}`));
    };

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'tabletop': return <DiceIcon />;
            case 'theatre': return <CinemaIcon />;
            default: return <ChatIcon />;
        }
    };

    const toggleDetails = (id: number) => {
        setRevealDetailsId(prev => prev === id ? null : id);
    };

    return (
        <div className="relative h-full w-full bg-black select-none overflow-hidden flex flex-col justify-between">
            {/* Action Bar / Floating Top Ribbon */}
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                <div className="px-4 py-2 bg-black/50 border border-cyan-500/25 rounded-full backdrop-blur-md">
                    <span className="text-sm font-extrabold text-[#00FFFF] uppercase tracking-widest drop-shadow-[0_0_8px_cyan]">
                        Party Hub
                    </span>
                </div>
                <button 
                    onClick={onCreateParty}
                    className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-[#00FFFF] hover:bg-[#22d3ee] active:scale-95 text-black font-extrabold text-xs tracking-wider rounded-full shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all uppercase"
                >
                    <PlusIcon />
                    <span>Create Room</span>
                </button>
            </div>

            {toastMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#111111] border-2 border-[#00FFFF] text-[#00FFFF] text-xs font-bold px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.4)] animate-fadeIn">
                    <span>{toastMessage}</span>
                </div>
            )}

            {parties.length > 0 ? (
                // Vertical scrolling container with CSS Snap-y Snap-Mandatory
                <div className="flex-grow w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide md:scrollbar-default relative">
                    {parties.map(party => {
                        const host = party.members.find(m => m.isHost)?.name || 'GameMaster';
                        const isLiked = likedSet.has(party.id);
                        const likeCount = (party.members.length * 3) + (likes[party.id] || 0);
                        const listMode = party.stage?.mode || 'social';
                        const showDetailedInfo = revealDetailsId === party.id;

                        return (
                            <div 
                                key={party.id}
                                className="w-full h-full snap-start relative flex-shrink-0 flex flex-col justify-end overflow-hidden"
                            >
                                {/* 1. Full cover back banner */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={party.imageUrl} 
                                        className="w-full h-full object-cover select-none pointer-events-none" 
                                        alt={party.name} 
                                    />
                                    {/* Black and cyan vignette overlays for contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/10"></div>
                                    {/* Glassmorphism visual subtle glow */}
                                    <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>
                                </div>

                                {/* 2. Double container (Detail Layer on Left, Side Actions on Right) */}
                                <div className="relative z-10 p-6 pb-20 md:pb-8 flex justify-between items-end gap-6 w-full max-w-7xl mx-auto">
                                    
                                    {/* LEFT: Room Details Panel */}
                                    <div className="flex-grow max-w-lg text-left select-text relative">
                                        
                                        {/* Expandable/Slide-out slide detail block (Representing Swipe Left reveal) */}
                                        <div className={`transition-all duration-300 overflow-hidden ${showDetailedInfo ? 'max-h-72 mb-4 opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-4'}`}>
                                            <div className="p-4 bg-black/75 border border-[#00FFFF]/20 rounded-xl backdrop-blur-md mb-2">
                                                <h4 className="text-[#00FFFF] font-bold text-xs tracking-widest uppercase mb-1.5">Description & Format</h4>
                                                <p className="text-gray-300 text-xs leading-relaxed">{party.description}</p>
                                                {party.genreTags && party.genreTags.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {party.genreTags.map(t => (
                                                            <span key={t} className="text-[10px] bg-cyan-950/45 border border-cyan-500/25 text-[#00FFFF] px-2 py-0.5 rounded-full font-mono font-medium">
                                                                #{t}
                                                            </span>
                                                        ))}
                                                        {party.rpFormat && (
                                                            <span className="text-[10px] bg-purple-950/45 border border-purple-500/25 text-purple-300 px-2 py-0.5 rounded-full font-mono font-medium">
                                                                {party.rpFormat} Format
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Edit Room Trigger if they want to edit their own room */}
                                                {party.authorId === 100 && (
                                                    <button 
                                                        onClick={() => onEditParty(party.id)}
                                                        className="mt-3 inline-block text-xs text-[#00FFFF] underline decoration-dotted hover:text-cyan-300 pointer-events-auto"
                                                    >
                                                        Modify Room Settings
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Standard Overlay Content */}
                                        <div className="pointer-events-auto">
                                            {/* Room name */}
                                            <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight leading-tight filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                                {party.name}
                                            </h2>

                                            {/* Host Username & Tag */}
                                            <p className="text-sm text-gray-300 mt-1 cursor-pointer font-bold filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                                Host: <span className="text-cyan-400">@{host}</span>
                                            </p>

                                            {/* Indicators block: Participant and Mode icons */}
                                            <div className="mt-3 flex items-center gap-3">
                                                {/* Mode Icon */}
                                                <div className="flex items-center gap-1.5 bg-black/60 border border-[#00FFFF]/20 px-2.5 py-1 rounded-full text-xs text-white">
                                                    {getModeIcon(listMode)}
                                                    <span className="font-mono text-[10px] capitalize font-bold">{listMode}</span>
                                                </div>

                                                {/* Count Badge */}
                                                <div className="flex items-center gap-1 bg-black/60 border border-zinc-800 px-2.5 py-1 rounded-full text-xs text-slate-300 font-mono">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-[#00FFFF]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                                    <span className="font-bold text-[#00FFFF]">{party.members.length}</span>
                                                    <span className="text-gray-500 font-bold">/20</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* RIGHT: Floating Side Interaction Panel */}
                                    <div className="flex flex-col items-center gap-5 pb-2 pointer-events-auto">
                                        
                                        {/* Join Button */}
                                        <button 
                                            onClick={() => onSelectParty(party.id)}
                                            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-800 via-indigo-900 to-cyan-500 text-[#00FFFF] flex items-center justify-center border-2 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.4)] active:scale-95 transition-transform"
                                            title="Join Room Details"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                        </button>
                                        <span className="text-[10px] font-extrabold text-[#00FFFF] font-mono tracking-wider -mt-3.5">JOIN</span>

                                        {/* Like Button */}
                                        <div className="flex flex-col items-center">
                                            <button 
                                                onClick={(e) => handleLike(e, party.id)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${isLiked ? 'bg-[#FF007F]/10 border-[#FF007F] text-[#FF007F]' : 'bg-black/50 border-zinc-700 text-white hover:text-red-400'}`}
                                            >
                                                <SparkHeartIcon liked={isLiked} />
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-300 font-mono mt-1">{likeCount}</span>
                                        </div>

                                        {/* Info Trigger (Toggle swipe left details panel) */}
                                        <div className="flex flex-col items-center">
                                            <button 
                                                onClick={() => toggleDetails(party.id)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${showDetailedInfo ? 'bg-cyan-500/10 border-[#00FFFF] text-[#00FFFF]' : 'bg-black/50 border-zinc-700 text-white'}`}
                                            >
                                                <InfoIcon />
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-300 font-mono mt-1">INFO</span>
                                        </div>

                                        {/* Share Button */}
                                        <div className="flex flex-col items-center">
                                            <button 
                                                onClick={(e) => handleShare(e, party)}
                                                className="w-12 h-12 rounded-full bg-black/50 border border-zinc-700 text-white flex items-center justify-center"
                                            >
                                                <ShareIcon />
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-300 font-mono mt-1">SHARE</span>
                                        </div>

                                        {/* Report Block */}
                                        <div className="flex flex-col items-center">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); triggerToast("Reported. Sent to moderators queue."); }}
                                                className="w-12 h-12 rounded-full bg-black/50 border border-zinc-700 text-white/75 hover:text-red-400 flex items-center justify-center"
                                                title="Report Room"
                                            >
                                                <FlagIcon />
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-400 font-mono mt-1">FLAG</span>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 h-80 z-10 text-center">
                    <p className="text-gray-400 text-sm">No live public rooms in Party Hub currently.</p>
                    <button 
                        onClick={onCreateParty}
                        className="mt-4 px-6 py-2 bg-cyan-500 text-white text-xs font-bold uppercase rounded-full"
                    >
                        Be the First Host
                    </button>
                </div>
            )}
        </div>
    );
};

export default PartyPage;
