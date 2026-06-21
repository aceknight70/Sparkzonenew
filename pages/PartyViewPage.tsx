
import React, { useRef, useEffect, useState } from 'react';
import { Party, PartyMessage, DiceRoll, PartyMember, UserCreation, User, Character } from '../types';
import { currentUser, characters as allCharacters } from '../mockData';
import UserAvatar from '../components/UserAvatar';
import CharacterSelectorModal from '../components/CharacterSelectorModal';
import MemePicker from '../components/MemePicker';
import MemeCreationPage from './MemeCreationPage';
import ShareButton from '../components/ShareButton';
import { GoogleGenAI, Modality } from '@google/genai';

// --- ICONS ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;
const PaperAirplaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.995 9.995 0 0010 12c-2.31 0-4.438.784-6.131-2.095z" /></svg>;
const DiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M14.5 3.5a.5.5 0 01.5.5v12a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5h9zM10 6a1 1 0 100-2 1 1 0 000 2zm-3 3a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-3 3a1 1 0 100-2 1 1 0 000 2z" /></svg>;
const MessageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 2.444 1.206 4.634 3.09 5.982.257.185.334.502.213.766l-1.06 1.768a.75.75 0 001.28.766l1.23-2.05a.75.75 0 01.62-.358 10.42 10.42 0 002.83 0 .75.75 0 01.62.358l1.23 2.05a.75.75 0 001.28-.766l-1.06-1.768a.75.75 0 01.213-.766A7.96 7.96 0 0018 9c0-3.866-3.582-7-8-7z" clipRule="evenodd" /></svg>;
const FaceSmileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>;
const MicrophoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" /><path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>;
const CloudArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-cyan-400 animate-bounce"><path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-pulse text-yellow-400"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.84 2.84l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.84 2.84l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.84-2.84l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.84-2.84l.813-2.846A.75.75 0 019 4.5zM18 9.75a.75.75 0 01.721.544l.63 2.199a2.25 2.25 0 001.705 1.705l2.199.63a.75.75 0 010 1.442l-2.199.63a2.25 2.25 0 00-1.705 1.705l-.63 2.199a.75.75 0 01-1.442 0l-.63-2.199a2.25 2.25 0 00-1.705-1.705l-2.199-.63a.75.75 0 010-1.442l2.199-.63a2.25 2.25 0 001.705-1.705l.63-2.199A.75.75 0 0118 9.75z" clipRule="evenodd" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 2c-2.21 0-4 1.79-4 4v2.25A2.25 2.25 0 008.25 10.5h3.5A2.25 2.25 0 0014 8.25V6c0-2.21-1.79-4-4-4zm-2.5 4a2.5 2.5 0 015 0v2.25a.75.75 0 01-.75.75h-3.5a.75.75 0 01-.75-.75V6z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 13a5.5 5.5 0 00-5.5 5.5v.5h11v-.5A5.5 5.5 0 0010 13z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>;
// New Icons for Live/Theatre
const SpeakerWaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.805l-1.067 3.557a3.003 3.003 0 003.003 3.003h1.666l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z" /></svg>; // Muted style for simplicity
const ArrowsPointingOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3.75 3.75a.75.75 0 01.75-.75h5.25a.75.75 0 010 1.5H5.25v4.5a.75.75 0 01-1.5 0v-5.25zm16.5 0a.75.75 0 00-.75-.75h-5.25a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-5.25zm0 16.5a.75.75 0 01-.75.75h-5.25a.75.75 0 010-1.5h4.5v-4.5a.75.75 0 011.5 0v5.25zm-16.5 0a.75.75 0 00.75.75h5.25a.75.75 0 000-1.5h-4.5v-4.5a.75.75 0 00-1.5 0v5.25z" clipRule="evenodd" /></svg>;
const Cog6ToothIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" /></svg>;
const SignalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>;
const VideoCameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" /></svg>;

// --- Stage Components ---
const PushpinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <line x1="12" y1="17" x2="12" y2="22"></line>
        <path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.33-2.91A2 2 0 0 1 15.65 10V5a1 1 0 0 0-1-1h-5.3a1 1 0 0 0-1 1v5a2 2 0 0 1-.58 1.09l-2.33 2.91a2 2 0 0 0-.44 1.24z"></path>
    </svg>
);

const SocialStage: React.FC<{ party: Party; onUpdateParty?: (updated: Party) => void; isHost: boolean }> = ({ party, onUpdateParty, isHost }) => {
    const [imageUrlInput, setImageUrlInput] = useState('');

    const handleAddImage = () => {
        if (!imageUrlInput.trim()) return;
        const currentImages = party.stage.social?.sharedImages || [];
        if (onUpdateParty) {
            onUpdateParty({
                ...party,
                stage: {
                    ...party.stage,
                    social: {
                        ...party.stage.social,
                        sharedImages: [...currentImages, imageUrlInput.trim()]
                    }
                }
            });
        }
        setImageUrlInput('');
    };

    const handleClearBoard = () => {
        if (onUpdateParty) {
            onUpdateParty({
                ...party,
                stage: {
                    ...party.stage,
                    social: {
                        ...party.stage.social,
                        sharedImages: []
                    }
                }
            });
        }
    };

    const handleDropBoard = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const currentImages = party.stage.social?.sharedImages || [];
                    if (onUpdateParty) {
                        onUpdateParty({
                            ...party,
                            stage: {
                                ...party.stage,
                                social: {
                                    ...party.stage.social,
                                    sharedImages: [...currentImages, reader.result]
                                }
                            }
                        });
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div 
            className="w-full h-full bg-slate-950/90 flex flex-col justify-between"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropBoard}
        >
            {/* Header bar */}
            <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <span className="p-2 bg-violet-600 rounded text-white"><PhotoIcon /></span>
                    <div>
                        <h3 className="text-white font-bold text-base md:text-lg">Cosmic Moodboard</h3>
                        <p className="text-xs text-gray-400">Collaborative references, artwork, and setting vibes</p>
                    </div>
                </div>
                {isHost && (party.stage.social?.sharedImages?.length || 0) > 0 && (
                    <button 
                        onClick={handleClearBoard}
                        className="px-3 py-1 bg-red-950/45 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white rounded text-xs font-semibold transition font-mono"
                    >
                        Clear Board
                    </button>
                )}
            </div>

            {/* Mood Board Grid */}
            <div className="flex-grow p-6 overflow-y-auto min-h-0 flex items-center justify-center">
                {party.stage.social?.sharedImages && party.stage.social.sharedImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-4xl max-h-full items-start">
                        {party.stage.social.sharedImages.map((img, i) => (
                            <div key={i} className="aspect-video bg-black/45 rounded-xl overflow-hidden border border-violet-500/30 hover:border-cyan-400 group relative shadow-lg hover:scale-[1.01] transition-all">
                                <img src={img} className="w-full h-full object-cover" alt="Moodboard vibe" referrerPolicy="no-referrer" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/80 opacity-0 group-hover:opacity-100 p-2 flex justify-center transition-all">
                                    <button 
                                        onClick={() => {
                                            const filtered = (party.stage.social?.sharedImages || []).filter((_, idx) => idx !== i);
                                            if (onUpdateParty) {
                                                onUpdateParty({
                                                    ...party,
                                                    stage: {
                                                        ...party.stage,
                                                        social: { ...party.stage.social, sharedImages: filtered }
                                                    }
                                                });
                                            }
                                        }}
                                        className="py-1 px-3 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold transition"
                                    >
                                        Remove Pin
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center max-w-sm p-6 border-2 border-dashed border-gray-800 rounded-2xl bg-black/10">
                        <PhotoIcon />
                        <h4 className="mt-4 font-bold text-gray-300">Moodboard is Empty</h4>
                        <p className="text-xs text-gray-500 mt-2 font-mono">Drag & drop images here, or paste deep links below. You can also pin memes directly from the chat menu!</p>
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-gray-950/80 border-t border-violet-500/20 flex gap-2 shrink-0">
                <input 
                    type="text" 
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                    placeholder="Paste image URL to pin onto Board..." 
                    className="flex-grow bg-black/50 border border-violet-500/20 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none placeholder:text-gray-600 font-mono"
                />
                <button 
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] whitespace-nowrap"
                >
                    Pin Vibe
                </button>
            </div>
        </div>
    );
};

const TheatreStage: React.FC<{ party: Party; onUpdateParty?: (updated: Party) => void; isHost: boolean }> = ({ party, onUpdateParty, isHost }) => {
    const [isPlaying, setIsPlaying] = useState(party.stage.theatre?.isPlaying || false);
    const [progress, setProgress] = useState(party.stage.theatre?.progress || 0);
    const [queueInput, setQueueInput] = useState('');
    const videoUrl = party.stage.theatre?.videoUrl || '';

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(videoUrl);

    const handlePlayPause = () => {
        const nextState = !isPlaying;
        setIsPlaying(nextState);
        if (onUpdateParty) {
            onUpdateParty({
                ...party,
                stage: {
                    ...party.stage,
                    theatre: {
                        ...party.stage.theatre,
                        videoUrl,
                        isPlaying: nextState,
                        progress
                    }
                }
            });
        }
    };

    const handleUrlSubmit = () => {
        if (!queueInput.trim()) return;
        if (onUpdateParty) {
            onUpdateParty({
                ...party,
                stage: {
                    ...party.stage,
                    theatre: {
                        ...party.stage.theatre,
                        videoUrl: queueInput.trim(),
                        isPlaying: true,
                        progress: 0
                    }
                }
            });
        }
        setQueueInput('');
    };

    return (
        <div className="w-full h-full bg-[#070709] flex flex-col justify-between">
            {/* Header/Title Bar */}
            <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-600/20 text-white">
                        <PlayIcon />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base md:text-lg leading-tight">
                            {videoId ? "Theatre Stream: Sync Active" : "No Active Stream"}
                        </h3>
                        {videoId && (
                            <p className="text-xs text-gray-400">Stream synced automatically among {party.members.length} viewers</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Screen */}
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
                    {videoId ? (
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&controls=1`} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-zinc-950/60">
                            <SignalIcon />
                            <p className="mt-3 text-sm font-semibold">Ready for Cinema Watchparty</p>
                            <p className="text-xs text-gray-600 mt-1">Paste a video URL below to stream it to other members</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Queue/Input */}
            <div className="p-4 bg-[#0a0a0d] border-t border-white/5 flex gap-2 shrink-0">
                <input 
                    type="text" 
                    value={queueInput}
                    onChange={(e) => setQueueInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="Paste YouTube watch URL or video ID..." 
                    className="flex-grow bg-black/60 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none placeholder:text-gray-600"
                />
                <button 
                    onClick={handleUrlSubmit}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                >
                    Start Stream
                </button>
            </div>
        </div>
    );
};

const DraggableToken: React.FC<{ character: Character, initialPos: {x: number, y: number} }> = ({ character, initialPos }) => {
    const [pos, setPos] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        // Calculate offset from the top-left of the token to the mouse pointer
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        offset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const parent = document.getElementById('tabletop-area');
            if (!parent) return;
            const parentRect = parent.getBoundingClientRect();
            
            // Calculate new position relative to parent in percentage
            let newX = ((e.clientX - parentRect.left - offset.current.x) / parentRect.width) * 100;
            let newY = ((e.clientY - parentRect.top - offset.current.y) / parentRect.height) * 100;

            // Constrain
            newX = Math.max(0, Math.min(newX, 95)); // Assuming 5% token width
            newY = Math.max(0, Math.min(newY, 95));

            setPos({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div 
            className="absolute w-[8%] aspect-square rounded-full border-2 border-cyan-400 shadow-[0_0_10px_cyan] cursor-grab active:cursor-grabbing overflow-hidden z-10 transition-transform active:scale-110"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onMouseDown={handleMouseDown}
            title={character.name}
        >
            <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover pointer-events-none" />
        </div>
    );
};

const TabletopStage: React.FC<{ party: Party; onUpdateParty?: (updated: Party) => void; isHost: boolean }> = ({ party, onUpdateParty, isHost }) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [mapInputUrl, setMapInputUrl] = useState('');
    const [showControls, setShowControls] = useState(false);

    const pinnedChars = (party.stage.tabletop?.pinnedCharacterIds || [])
        .map(id => allCharacters.find(c => c.id === id))
        .filter(Boolean);

    const handleAddToken = (charId: number) => {
        const currentPins = party.stage.tabletop?.pinnedCharacterIds || [];
        if (!currentPins.includes(charId)) {
            const nextPins = [...currentPins, charId];
            if (onUpdateParty) {
                onUpdateParty({
                    ...party,
                    stage: {
                        ...party.stage,
                        tabletop: {
                            ...party.stage.tabletop,
                            mapUrl: party.stage.tabletop?.mapUrl || null,
                            pinnedCharacterIds: nextPins
                        }
                    }
                });
            }
        }
        setIsSelectorOpen(false);
    };

    const handleClearTokens = () => {
        if (onUpdateParty) {
            onUpdateParty({
                ...party,
                stage: {
                    ...party.stage,
                    tabletop: {
                        ...party.stage.tabletop,
                        pinnedCharacterIds: []
                    }
                }
            });
        }
    };

    const handleMapSubmit = () => {
        if (!mapInputUrl.trim()) return;
        if (onUpdateParty) {
            onUpdateParty({
                ...party,
                stage: {
                    ...party.stage,
                    tabletop: {
                        ...party.stage.tabletop,
                        mapUrl: mapInputUrl.trim(),
                        pinnedCharacterIds: party.stage.tabletop?.pinnedCharacterIds || []
                    }
                }
            });
        }
        setMapInputUrl('');
        setShowControls(false);
    };

    return (
        <div 
            id="tabletop-area"
            className="w-full h-full bg-cover bg-center bg-slate-950 relative overflow-hidden flex flex-col justify-between"
            style={party.stage.tabletop?.mapUrl ? { backgroundImage: `url(${party.stage.tabletop?.mapUrl})` } : {}}
        >
            {/* Top Toolbar overlay */}
            <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-start pointer-events-none">
                <div className="flex gap-2 pointer-events-auto bg-black/75 border border-[#00FFFF]/20 rounded-full backdrop-blur-md px-4 py-2 text-xs text-white font-mono shadow-[0_0_10px_rgba(0,255,255,0.15)]">
                    <MapIcon />
                    <span className="font-bold text-[#00FFFF]">GRID STAGE</span>
                </div>

                <div className="flex flex-col gap-2 pointer-events-auto items-end">
                    <button 
                        onClick={() => setShowControls(!showControls)}
                        className="bg-black/80 border border-cyan-500/30 text-cyan-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold font-mono transition backdrop-blur shadow-md"
                    >
                        {showControls ? 'GM Panel' : 'GM Tools'}
                    </button>

                    {showControls && (
                        <div className="bg-black/95 border border-cyan-500/30 p-4 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-3 min-w-[240px] animate-fadeIn text-left">
                            <h4 className="text-[#00FFFF] text-xs font-bold uppercase tracking-wider font-mono border-b border-gray-800 pb-1.5">Game Master Panel</h4>
                            
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Set Battle Map URL</label>
                                <div className="flex gap-1.5">
                                    <input 
                                        type="text" 
                                        value={mapInputUrl}
                                        onChange={(e) => setMapInputUrl(e.target.value)}
                                        placeholder="Paste map image url..."
                                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white flex-grow focus:border-[#00FFFF] outline-none font-mono"
                                    />
                                    <button 
                                        onClick={handleMapSubmit}
                                        className="px-2 py-1 bg-[#00FFFF]/20 hover:bg-[#00FFFF] text-[#00FFFF] hover:text-black rounded text-xs font-bold transition font-mono border border-cyan-500/20"
                                    >
                                        SET
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1 border-t border-gray-900 mt-1">
                                <button 
                                    onClick={() => setIsSelectorOpen(true)}
                                    className="flex-grow py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-bold font-mono transition"
                                >
                                    + Spawn Token
                                </button>
                                <button 
                                    onClick={handleClearTokens}
                                    className="px-2.5 py-1 bg-red-950/40 border border-red-500/20 hover:bg-red-900 text-red-100 hover:text-white rounded text-xs font-bold font-mono transition"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!party.stage.tabletop?.mapUrl && (
                <div className="w-full h-full bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <MapIcon className="w-16 h-16 opacity-30 text-[#00FFFF] animate-pulse" />
                    <h3 className="mt-4 font-bold text-gray-300">Tactical Tabletop Board</h3>
                    <p className="text-xs text-gray-500 max-w-sm mt-1">Spawn character tokens and drag them across your grids in real-time combat.</p>
                    <button 
                        onClick={() => setShowControls(true)}
                        className="mt-4 px-4 py-1.5 bg-black hover:bg-none border border-cyan-500/40 text-cyan-400 rounded-full text-xs font-bold font-mono tracking-wider transition uppercase"
                    >
                        Upload Battle Map
                    </button>
                </div>
            )}
            
            {/* Tokens Layer */}
            {pinnedChars.map((char, index) => {
                const initialPos = { x: 15 + (index * 11), y: 30 + (index * 6) };
                return <DraggableToken key={char!.id} character={char!} initialPos={initialPos} />;
            })}

            {isSelectorOpen && (
                <CharacterSelectorModal 
                    isOpen={isSelectorOpen}
                    onClose={() => setIsSelectorOpen(false)}
                    onSelect={handleAddToken}
                    characters={allCharacters}
                    currentUser={currentUser}
                    selectedId={-1}
                />
            )}
        </div>
    );
};

const LiveStage: React.FC<{ party: Party }> = ({ party }) => {
    const isHost = party.hostId === currentUser.id;
    const [isLive, setIsLive] = useState(false);
    const [viewerCount, setViewerCount] = useState(party.members.length + Math.floor(Math.random() * 50));
    const videoRef = useRef<HTMLVideoElement>(null);

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsLive(true);
        } catch(e) {
            console.error(e);
            alert("Camera access denied or unavailable.");
        }
    };

    return (
        <div className="w-full h-full bg-[#0e0e10] flex flex-col justify-between">
            {/* Main Stage Content */}
            <div className="flex-grow flex flex-col relative min-h-0">
                <div className="flex-grow relative bg-black flex items-center justify-center group">
                    {isLive ? (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900/60">
                            <div className="w-20 h-20 rounded-full bg-gray-800/85 flex items-center justify-center mb-4 animate-pulse text-[#00FFFF]">
                                <SignalIcon />
                            </div>
                            <p className="text-sm font-semibold text-gray-300">{isHost ? "Ready to Broadcast?" : "Stream Offline"}</p>
                        </div>
                    )}

                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
                        <div className="flex justify-between items-start w-full">
                            {isLive && (
                                <div className="flex items-center gap-3">
                                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider animate-pulse font-mono">
                                        LIVE
                                    </span>
                                    <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-white text-xs font-semibold backdrop-blur-sm">
                                        <UsersIcon /> {viewerCount}
                                    </div>
                                </div>
                            )}
                            <div className="pointer-events-auto ml-auto">
                                {isHost && !isLive && (
                                    <button 
                                        onClick={startStream}
                                        className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs flex items-center gap-2 transition"
                                    >
                                        <VideoCameraIcon /> Go Live
                                    </button>
                                )}
                                {isHost && isLive && (
                                    <button 
                                        onClick={() => setIsLive(false)}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs transition"
                                    >
                                        End Stream
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stream Metadata Bar */}
            <div className="p-4 bg-[#18181b] border-t border-white/5 flex items-center gap-4 shrink-0 z-10">
                <div className="relative">
                    <UserAvatar src={party.members.find(m => m.isHost)?.avatarUrl} size="10" className="ring-2 ring-violet-500" />
                    {isLive && <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 rounded font-mono">LIVE</span>}
                </div>
                <div className="flex-grow min-w-0">
                    <h2 className="text-white font-bold text-base truncate">{party.name}</h2>
                    <p className="text-gray-400 text-xs flex items-center gap-1.5">
                        <span className="text-violet-400 font-semibold">{party.members.find(m => m.isHost)?.name}</span>
                        <span>•</span>
                        <span>Streaming / RP Session</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Chat Components ---
const DiceRollResult: React.FC<{ roll: DiceRoll }> = ({ roll }) => (
    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-2 mt-1 shadow-md font-mono">
        <div className="flex items-center gap-2 text-xs text-cyan-300 font-semibold">
            <DiceIcon />
            <span>{roll.command}</span>
            <span className="text-gray-500">→</span>
            <span>[{roll.rolls.join(', ')}] {roll.modifier >= 0 ? '+' : '-'} {Math.abs(roll.modifier)}</span>
        </div>
        <div className="text-center font-bold text-base text-white mt-1 filter drop-shadow-[0_0_8px_cyan]">
            Total: {roll.total}
        </div>
    </div>
);

const ChatMessage: React.FC<{ 
    message: PartyMessage; 
    onDelete?: () => void;
    onPinToMoodboard?: (url: string) => void;
    showPinOption?: boolean;
}> = ({ message, onDelete, onPinToMoodboard, showPinOption }) => {
    const isOwnMessage = message.sender.id === currentUser.id;
    return (
        <div className="flex items-start gap-3 group">
            <UserAvatar src={message.character?.imageUrl || message.sender.avatarUrl} size="10" />
            <div className="flex-grow min-w-0">
                <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2 min-w-0">
                        <p className="font-bold text-white truncate text-sm">{message.character?.name || message.sender.name}</p>
                        <p className="text-[10px] text-gray-500 flex-shrink-0">{message.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {message.imageUrl && showPinOption && onPinToMoodboard && (
                            <button 
                                onClick={() => onPinToMoodboard(message.imageUrl!)} 
                                className="text-gray-400 hover:text-[#00FFFF] transition-colors" 
                                title="Pin to Moodboard"
                            >
                                <PushpinIcon />
                            </button>
                        )}
                        {isOwnMessage && onDelete && (
                            <button onClick={onDelete} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                                <TrashIcon />
                            </button>
                        )}
                    </div>
                </div>
                {message.imageUrl && (
                    <div className="mt-1 mb-1 rounded-lg overflow-hidden border border-white/10 max-w-sm">
                        <img src={message.imageUrl} alt="Attachment" className="w-full h-auto block" />
                    </div>
                )}
                {message.audioUrl && (
                    <div className="mt-1 mb-1">
                        <audio controls src={message.audioUrl} className="h-8 max-w-xs" />
                    </div>
                )}
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{message.text}</p>
                {message.roll && <DiceRollResult roll={message.roll} />}
            </div>
        </div>
    );
};

interface PartyViewPageProps {
    party: Party;
    onExit: () => void;
    onSendMessage: (partyId: number, text: string, character?: UserCreation, imageUrl?: string, audioUrl?: string) => void;
    onDeleteMessage?: (partyId: number, messageId: number) => void;
    userCreations: UserCreation[];
    onStartConversation: (userId: number) => void;
    currentUser: User;
    onSaveMeme?: (meme: { name: string, imageUrl: string }) => void;
    onUpdateParty?: (updatedParty: Party) => void;
}

const PartyViewPage: React.FC<PartyViewPageProps> = ({ party, onExit, onSendMessage, onDeleteMessage, userCreations, onStartConversation, currentUser, onSaveMeme, onUpdateParty }) => {
    const [message, setMessage] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedVoiceId, setSelectedVoiceId] = useState<number>(currentUser.id);
    const [showMembers, setShowMembers] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [isImagining, setIsImagining] = useState(false);
    const [notes, setNotes] = useState(party.notes || "Add session notes here...");
    const [showDicePicker, setShowDicePicker] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handlePinToMoodboard = (imageUrl: string) => {
        const currentImages = party.stage.social?.sharedImages || [];
        if (!currentImages.includes(imageUrl) && onUpdateParty) {
            onUpdateParty({
                ...party,
                stage: {
                    ...party.stage,
                    social: {
                        ...party.stage.social,
                        sharedImages: [...currentImages, imageUrl]
                    }
                }
            });
            triggerToast("Pinned vibe to Board!");
        } else {
            triggerToast("Already pinned to Board!");
        }
    };
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Media State
    const [showMemePicker, setShowMemePicker] = useState(false);
    const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
    const [isCreatingMeme, setIsCreatingMeme] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [party.chat]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`; // Limit initial auto-growth before scroll
        }
    }, [message]);
    
    const userCharacters = userCreations.filter(c => c.type === 'Character' || c.type === 'AI Character') as UserCreation[];
    
    const selectedVoice = selectedVoiceId === currentUser.id
        ? { ...currentUser, name: 'You', epithet: 'Yourself', imageUrl: currentUser.avatarUrl }
        : userCharacters.find(c => c.id === selectedVoiceId);

    const handleSendMessage = () => {
        if (!message.trim() && !selectedMeme) return;
        
        // CHECK FOR COMMANDS
        if (message.trim().startsWith('/imagine ')) {
            handleAiImagine(message.trim().substring(9));
            setMessage('');
            return;
        }

        const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
        onSendMessage(party.id, message, character, selectedMeme || undefined);
        setMessage('');
        setSelectedMeme(null);
    };

    const handleAiImagine = async (prompt: string) => {
        if (!prompt) return;
        setIsImagining(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: `Generate a fantasy roleplay scene: ${prompt}` }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
                    onSendMessage(party.id, `Imagined: ${prompt}`, character, imageUrl);
                    break;
                }
            }
        } catch (e) {
            console.error("AI Generation failed", e);
            alert("Failed to generate image. Please try again.");
        } finally {
            setIsImagining(false);
        }
    };

    const handleMemeCreated = (meme: { name: string, imageUrl: string }) => {
        if (onSaveMeme) {
            onSaveMeme(meme);
            setSelectedMeme(meme.imageUrl);
        }
        setIsCreatingMeme(false);
    };

    // --- Drag & Drop Handlers ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setSelectedMeme(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Voice Recording Handlers ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blob);
                const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
                onSendMessage(party.id, '', character, undefined, audioUrl);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    const renderStage = () => {
        const isHost = party.hostId === currentUser.id;
        switch (party.stage.mode) {
            case 'social': return <SocialStage party={party} onUpdateParty={onUpdateParty} isHost={isHost} />;
            case 'theatre': return <TheatreStage party={party} onUpdateParty={onUpdateParty} isHost={isHost} />;
            case 'tabletop': return <TabletopStage party={party} onUpdateParty={onUpdateParty} isHost={isHost} />;
            case 'live': return <LiveStage party={party} />;
            default: return <div className="w-full h-full bg-gray-900 flex items-center justify-center"><p>Loading Stage...</p></div>;
        }
    };

    return (
        <div className="flex h-full w-full bg-black text-gray-100 font-sans pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 transition-all">
            <main className="flex-1 flex flex-col min-w-0 h-full">
                {renderStage()}
            </main>

            <aside 
                className="w-full md:w-96 flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-l border-violet-500/30 flex flex-col h-full relative"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 z-50 bg-cyan-900/80 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-cyan-400 border-dashed m-4 rounded-2xl animate-pulse">
                        <CloudArrowUpIcon />
                        <h2 className="text-2xl font-bold text-white mt-4">Drop to Upload</h2>
                    </div>
                )}

                <header className="p-3 border-b border-violet-500/30 flex justify-between items-center flex-shrink-0 bg-gray-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-2 min-w-0">
                        <button onClick={onExit} className="p-1 rounded-md text-gray-400 hover:text-white" title="Exit Party"><ArrowLeftIcon /></button>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-white truncate">{party.name}</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowMembers(s => !s)} className={`flex items-center gap-1 text-xs ${showMembers ? 'text-cyan-400' : 'text-gray-400'} hover:text-cyan-300`}>
                                    <UsersIcon className="w-3 h-3" /> 
                                    {party.members.length}
                                </button>
                                <button onClick={() => setShowNotes(s => !s)} className={`flex items-center gap-1 text-xs ${showNotes ? 'text-cyan-400' : 'text-gray-400'} hover:text-cyan-300`}>
                                    <ClipboardIcon className="w-3 h-3" />
                                    Notes
                                </button>
                            </div>
                        </div>
                    </div>
                    <ShareButton 
                        title={`Join ${party.name}`}
                        text={`Join the party "${party.name}" on Spark Zone!`}
                        className="text-gray-400 hover:text-white"
                        iconOnly
                        showLabel={false}
                    />
                </header>
                
                {/* Collapsible Members Section */}
                {showMembers && (
                    <div className="p-3 border-b border-violet-500/30 flex-shrink-0 bg-black/20 animate-fadeIn">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Party Members</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {party.members.map(member => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserAvatar src={member.avatarUrl} size="8" />
                                        <span className={`text-sm font-semibold ${member.isHost ? 'text-cyan-400' : 'text-white'}`}>{member.name}</span>
                                    </div>
                                    {member.id !== currentUser.id && (
                                        <button onClick={() => onStartConversation(member.id)} className="p-1 rounded-full text-gray-400 hover:bg-violet-500/20 hover:text-cyan-400" aria-label={`Message ${member.name}`}>
                                            <MessageIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Collapsible Notes Section */}
                {showNotes && (
                    <div className="p-3 border-b border-violet-500/30 flex-shrink-0 bg-black/20 h-40 animate-fadeIn flex flex-col">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Session Notes</h3>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            className="w-full flex-grow bg-gray-900/50 border border-gray-700 rounded p-2 text-sm text-gray-300 resize-none focus:outline-none focus:border-cyan-500"
                            placeholder="Keep track of quests and clues..."
                        />
                    </div>
                )}
                
                <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-6 pb-20">
                    {party.chat.map(msg => (
                        <ChatMessage 
                            key={msg.id} 
                            message={msg} 
                            onDelete={onDeleteMessage ? () => onDeleteMessage(party.id, msg.id) : undefined} 
                            onPinToMoodboard={handlePinToMoodboard}
                            showPinOption={party.stage.mode === 'social'}
                        />
                    ))}
                    {isImagining && (
                        <div className="flex justify-center p-4">
                            <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-full px-4 py-2 flex items-center gap-2 text-cyan-300 text-sm animate-pulse">
                                <SparklesIcon />
                                <span>Imagining scene...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Glass Capsule Style */}
                <div className="absolute bottom-0 left-0 w-full p-4 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-10">
                    {/* Staging Area for Meme */}
                    {selectedMeme && (
                        <div className="mb-3 relative inline-block animate-fadeIn">
                            <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)] max-w-[150px]">
                                <img src={selectedMeme} alt="Selected meme" className="w-full h-auto" />
                                <button 
                                    onClick={() => setSelectedMeme(null)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                >
                                    <XMarkIcon />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-end gap-2 bg-gray-900/90 border border-violet-500/30 rounded-2xl p-2 shadow-2xl backdrop-blur-xl relative focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                        <button onClick={() => setIsSelectorOpen(true)} className="flex-shrink-0 self-center rounded-full ring-2 ring-transparent hover:ring-cyan-400 transition-all" title="Select Character">
                            <UserAvatar src={selectedVoice?.imageUrl} size="10" />
                        </button>
                        
                        {isRecording ? (
                            <div className="flex-grow flex items-center justify-between px-4 bg-red-900/20 rounded-lg h-10 animate-pulse">
                                <div className="flex items-center gap-2 text-red-400 font-mono font-bold">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {formatTime(recordingTime)}
                                </div>
                                <button onClick={stopRecording} className="text-red-400 hover:text-white p-1">
                                    <StopIcon />
                                </button>
                            </div>
                        ) : (
                            <textarea 
                                ref={textareaRef} 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                placeholder={message.startsWith('/') ? "Enter prompt..." : "Type a message or /roll..."} 
                                className="w-full bg-transparent text-gray-200 focus:outline-none resize-none max-h-[200px] overflow-y-auto py-3 px-2 leading-relaxed" 
                                rows={1}
                                enterKeyHint="enter"
                            />
                        )}

                        {/* Dice Roll Button */}
                        <div className="relative self-center">
                            <button 
                                onClick={() => setShowDicePicker(!showDicePicker)} 
                                className={`p-2 transition-colors rounded-full ${showDicePicker ? 'text-[#00FFFF] bg-[#00FFFF]/10' : 'text-gray-400 hover:text-[#00FFFF]'}`}
                                title="Dice Quick Roller"
                            >
                                <DiceIcon />
                            </button>
                            {showDicePicker && (
                                <div className="absolute bottom-12 right-0 bg-[#0e0e12] border border-[#00FFFF]/30 p-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-2 z-50 min-w-[140px] animate-fadeIn">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-1 mb-1 font-mono">DICE ROLLER</h4>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].map(die => (
                                            <button 
                                                key={die}
                                                onClick={() => {
                                                    const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
                                                    onSendMessage(party.id, `/roll 1${die}`, character);
                                                    setShowDicePicker(false);
                                                }}
                                                className="px-2 py-1 bg-violet-950/40 hover:bg-violet-600 border border-violet-500/10 hover:border-transparent text-violet-300 hover:text-white text-xs font-semibold rounded font-mono transition-all"
                                            >
                                                {die.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setMessage('/roll 1d20+5');
                                            setShowDicePicker(false);
                                        }}
                                        className="text-[9px] text-[#00FFFF] hover:underline mt-1 font-mono block text-left"
                                    >
                                        Custom Formula...
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Meme Button */}
                        <div className="relative self-center">
                            <button 
                                onClick={() => setShowMemePicker(!showMemePicker)} 
                                className={`p-2 transition-colors rounded-full ${showMemePicker ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400'}`}
                                title="Add Meme"
                            >
                                <FaceSmileIcon />
                            </button>
                            {showMemePicker && (
                                <MemePicker 
                                    userCreations={userCreations} 
                                    onSelect={(url) => { setSelectedMeme(url); setShowMemePicker(false); }} 
                                    onClose={() => setShowMemePicker(false)}
                                    onCreateNew={() => { setShowMemePicker(false); setIsCreatingMeme(true); }}
                                />
                            )}
                        </div>

                        {/* Send/Record Button */}
                        {message.trim() || selectedMeme ? (
                            <button onClick={handleSendMessage} className="p-2 text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500 rounded-full transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] self-end pb-2">
                                {message.startsWith('/imagine') ? <SparklesIcon /> : <PaperAirplaneIcon />}
                            </button>
                        ) : (
                            !isRecording && (
                                <button onClick={startRecording} className="p-2 text-gray-400 hover:text-red-400 transition-colors self-center" title="Record Voice Note">
                                    <MicrophoneIcon />
                                </button>
                            )
                        )}
                    </div>
                </div>
            </aside>
            
            {isSelectorOpen && (
                <CharacterSelectorModal
                    isOpen={isSelectorOpen}
                    onClose={() => setIsSelectorOpen(false)}
                    characters={userCharacters}
                    currentUser={currentUser}
                    selectedId={selectedVoiceId}
                    onSelect={(id) => {
                        setSelectedVoiceId(id);
                        setIsSelectorOpen(false);
                    }}
                />
            )}

            {isCreatingMeme && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <div className="w-full h-full md:h-[90vh] md:w-[90vw] md:rounded-xl overflow-hidden relative">
                        <MemeCreationPage 
                            onExit={() => setIsCreatingMeme(false)} 
                            onSave={handleMemeCreated}
                        />
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0f] border border-cyan-400/40 text-cyan-300 font-bold py-2 px-4 rounded-full shadow-2xl backdrop-blur-md animate-fadeIn text-xs font-mono flex items-center gap-1.5 border-glow">
                    <span>⚡</span> {toastMessage}
                </div>
            )}
        </div>
    );
};

export default PartyViewPage;
