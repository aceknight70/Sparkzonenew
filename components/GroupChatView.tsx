
import React, { useEffect, useRef, useState } from 'react';
import { currentUser } from '../mockData';
import { WorldLocation, World, UserCreation } from '../types';
import GroupMessageBubble from './GroupMessageBubble';
import UserAvatar from './UserAvatar';
import CharacterSelectorModal from './CharacterSelectorModal';
import MemePicker from './MemePicker';
import MemeCreationPage from '../pages/MemeCreationPage';
import { GoogleGenAI, Modality } from '@google/genai';

const PaperAirplaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;
const FaceSmileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>;
const MicrophoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" /><path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>;
const CloudArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-cyan-400 animate-bounce"><path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-pulse text-yellow-400"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.84 2.84l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.84 2.84l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.84-2.84l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.84-2.84l.813-2.846A.75.75 0 019 4.5zM18 9.75a.75.75 0 01.721.544l.63 2.199a2.25 2.25 0 001.705 1.705l2.199.63a.75.75 0 010 1.442l-2.199.63a2.25 2.25 0 00-1.705 1.705l-.63 2.199a.75.75 0 01-1.442 0l-.63-2.199a2.25 2.25 0 00-1.705-1.705l-2.199-.63a.75.75 0 010-1.442l2.199-.63a2.25 2.25 0 001.705-1.705l.63-2.199A.75.75 0 0118 9.75z" clipRule="evenodd" /></svg>;

interface GroupChatViewProps {
    location: WorldLocation;
    world: World;
    onBack?: () => void;
    onSendMessage: (worldId: number, locationId: number, text: string, character?: UserCreation, imageUrl?: string, audioUrl?: string) => void;
    onDeleteMessage?: (worldId: number, locationId: number, messageId: number) => void;
    userCreations: UserCreation[];
    onSaveMeme?: (meme: { name: string, imageUrl: string }) => void;
}

const ROLEPLAY_SPARKS = [
    "A strange, glowing mist starts to crawl along the ground...",
    "Suddenly, you hear a mysterious whisper echoing in your mind...",
    "A wild, glittering pixie appears and hovers near your face!",
    "The ground beneath you lightly trembles, followed by a soft hum...",
    "An enigmatic stranger in a dark cloak watches silently from the corner...",
    "A shooting star streaks across the sky, flashing a violet light...",
    "A sudden gust of wind blows, carrying the rich scent of old parchment...",
    "You spot a hidden silver chest half-buried in the shadows..."
];

const GroupChatView: React.FC<GroupChatViewProps> = ({ location, world, onBack, onSendMessage, onDeleteMessage, userCreations, onSaveMeme }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messageText, setMessageText] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedVoiceId, setSelectedVoiceId] = useState<number>(currentUser.id);
    const [isImagining, setIsImagining] = useState(false);

    const [showMemePicker, setShowMemePicker] = useState(false);
    const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
    const [isCreatingMeme, setIsCreatingMeme] = useState(false);

    const [isDragging, setIsDragging] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerIntervalRef = useRef<number | null>(null);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isOocMode, setIsOocMode] = useState(false);

    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [isChannelMuted, setIsChannelMuted] = useState(false);
    const [showChannelSettings, setShowChannelSettings] = useState(false);
    const [editChannelName, setEditChannelName] = useState(location.name);
    const [editChannelDesc, setEditChannelDesc] = useState(location.description || '');
    const [editChannelBg, setEditChannelBg] = useState(location.imageUrl || '');
    const [editOcMode, setEditOcMode] = useState(true);

    const isAdmin = currentUser.id === world.authorId || world.members.find(m => m.id === currentUser.id)?.role === 'Creator' || world.members.find(m => m.id === currentUser.id)?.role === 'Admin';

    useEffect(() => {
        setEditChannelName(location.name);
        setEditChannelDesc(location.description || '');
        setEditChannelBg(location.imageUrl || '');
    }, [location]);

    const userCharacters = userCreations.filter(c => c.type === 'Character' || c.type === 'AI Character') as UserCreation[];
    
    const selectedVoice = selectedVoiceId === currentUser.id
        ? { ...currentUser, name: 'You', epithet: 'Yourself', imageUrl: currentUser.avatarUrl }
        : userCharacters.find(c => c.id === selectedVoiceId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [location.messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
        }
    }, [messageText]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 210;
        setShowScrollButton(!isNearBottom);
    };

    const handleScrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleQuickRoll = (diceExpression: string) => {
        const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
        const match = diceExpression.match(/^(\d+)?[dD](\d+)$/);
        let diceNum = 1;
        let diceFaces = 20;
        if (match) {
            diceNum = match[1] ? parseInt(match[1]) : 1;
            diceFaces = parseInt(match[2]);
        }
        const rolls: number[] = [];
        for (let i = 0; i < diceNum; i++) {
            rolls.push(Math.floor(Math.random() * diceFaces) + 1);
        }
        const baseSum = rolls.reduce((a, b) => a + b, 0);
        let rollDetail = rolls.join(' + ');
        const rollString = `🎲 rolled ${diceExpression}: **${baseSum}** (${rollDetail})`;
        onSendMessage(world.id, location.id, rollString, character);
        setTimeout(handleScrollToBottom, 100);
    };

    const handleQuickEmote = (emote: string) => {
        const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
        onSendMessage(world.id, location.id, emote, character);
        setTimeout(handleScrollToBottom, 100);
    };

    const handleInsertSpark = () => {
        const randomIndex = Math.floor(Math.random() * ROLEPLAY_SPARKS.length);
        const spark = ROLEPLAY_SPARKS[randomIndex];
        setMessageText(spark);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleSend = () => {
        if (!messageText.trim() && !selectedMeme) return;

        let finalMessageText = messageText.trim();

        if (finalMessageText.startsWith('/imagine ')) {
            handleAiImagine(finalMessageText.substring(9));
            setMessageText('');
            return;
        }

        if (finalMessageText.startsWith('/roll')) {
            const hasSystemDice = world.systemSettings?.enableDice ?? true;
            if (!hasSystemDice) {
                alert("Dice rolls are disabled in this world!");
                return;
            }
            const rest = finalMessageText.substring(5).trim();
            // Parse NdS + mod or dS
            const match = rest.match(/^(\d*)?[dD](\d+)(?:\s*\+\s*(\d+))?$/i);
            let diceNum = 1;
            let diceFaces = 20;
            let modifier = 0;
            if (match) {
                diceNum = match[1] ? parseInt(match[1]) : 1;
                diceFaces = parseInt(match[2]);
                modifier = match[3] ? parseInt(match[3]) : 0;
            }
            if (diceNum > 40) diceNum = 40; // cap
            if (diceFaces > 1000) diceFaces = 1000;

            const rolls: number[] = [];
            for (let i = 0; i < diceNum; i++) {
                rolls.push(Math.floor(Math.random() * diceFaces) + 1);
            }
            const baseSum = rolls.reduce((a, b) => a + b, 0);
            const rollSum = baseSum + modifier;
            let rollDetail = rolls.join(' + ');
            if (modifier) rollDetail += ` + ${modifier} (modifier)`;
            
            finalMessageText = `🎲 rolled ${diceNum}d${diceFaces}${modifier ? `+${modifier}` : ''}: **${rollSum}** (${rollDetail})`;
        } else if (isOocMode && !finalMessageText.startsWith('/')) {
            finalMessageText = `(( ${finalMessageText} ))`;
        }

        const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
        onSendMessage(world.id, location.id, finalMessageText, character, selectedMeme || undefined);
        setMessageText('');
        setSelectedMeme(null);
        
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setTimeout(handleScrollToBottom, 100);
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
                    onSendMessage(world.id, location.id, `Imagined: ${prompt}`, character, imageUrl);
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
                onSendMessage(world.id, location.id, '', character, undefined, audioUrl);
                
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

    return (
        <main 
            className="relative flex-1 flex flex-col h-full min-h-0 bg-[#050505]"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {location.imageUrl && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-40 animate-ken-burns" 
                        style={{ backgroundImage: `url(${location.imageUrl})` }}
                    ></div>
                    <div className="absolute inset-0 bg-noise opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-transparent"></div>
                </div>
            )}

            {isDragging && (
                <div className="absolute inset-0 z-50 bg-cyan-900/80 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-cyan-400 border-dashed m-4 rounded-2xl animate-pulse">
                    <CloudArrowUpIcon />
                    <h2 className="text-2xl font-bold text-white mt-4">Drop to Upload</h2>
                </div>
            )}

            <header className="flex items-center justify-between p-3 border-b border-violet-500/20 flex-shrink-0 bg-neutral-900/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={onBack} className="p-2 text-gray-300 hover:text-white cursor-pointer h-10 w-10 flex items-center justify-center rounded-full hover:bg-neutral-800" style={{ minWidth: '40px', minHeight: '40px' }} aria-label="Back to world home">
                        <ArrowLeftIcon />
                    </button>
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-cyan-400 font-bold text-lg leading-none">
                            {location.name.toLowerCase().includes('voice') || location.name.toLowerCase().includes('tavern') || location.name.toLowerCase().includes('lounge') || location.name.toLowerCase().includes('square') ? "🔊" : "💬"}
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-extrabold text-white truncate text-sm md:text-base">#{location.name}</h2>
                            <p className="text-[11px] text-gray-450 truncate max-w-[200px] md:max-w-[400px]">
                                {isChannelMuted ? "🔇 Muted • " : ""}{location.description || "Enter play space to view active storytelling threads."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                        className="p-2 text-gray-400 hover:text-cyan-400 cursor-pointer rounded-full hover:bg-neutral-800 h-10 w-10 flex items-center justify-center"
                        style={{ minWidth: '40px', minHeight: '40px' }}
                        aria-label="Channel Options"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                    </button>

                    {showHeaderMenu && (
                        <div className="absolute right-0 top-11 mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1 z-50 animate-fadeIn">
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        showHeaderMenu(false);
                                        setShowChannelSettings(true);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer"
                                >
                                    ⚙️ Channel Settings
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    showHeaderMenu(false);
                                    setIsChannelMuted(!isChannelMuted);
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-neutral-850 rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                                {isChannelMuted ? "🔊 Unmute Channel" : "🔇 Mute Channel"}
                            </button>
                            <button
                                onClick={() => {
                                    showHeaderMenu(false);
                                    alert("This channel has been reported for evaluation.");
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer border-t border-neutral-800 mt-1"
                            >
                                🚩 Report Channel
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Message Body Container - now fully scrollable without awkward clipping */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="relative flex-grow p-4 overflow-y-auto flex flex-col gap-4 z-10 scroll-smooth pb-4"
            >
                <div className="flex-grow"></div>
                {location.messages.length === 0 && (
                    <div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center">
                        <span className="text-3xl mb-2 animate-bounce">✨</span>
                        <p className="font-semibold text-gray-400">This channel is quiet... too quiet.</p>
                        <p className="text-xs text-gray-500 mt-1">Be the first to spark a legendary conversation.</p>
                    </div>
                )}
                {location.messages.map(message => (
                    <GroupMessageBubble 
                        key={message.id} 
                        message={message} 
                        onDelete={onDeleteMessage ? () => onDeleteMessage(world.id, location.id, message.id) : undefined}
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
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Scroll to bottom floating helper */}
            {showScrollButton && (
                <button
                    onClick={handleScrollToBottom}
                    className="absolute bottom-40 right-6 z-30 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-extrabold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center gap-2 text-xs animate-bounce cursor-pointer border border-cyan-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.63l3.97-3.97a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.97 3.97V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                    </svg>
                    New Messages
                </button>
            )}

            {/* Input & Interaction Panel - native flex spacing to prevent clipping */}
            <div className="w-full p-4 z-20 bg-[#0c0c0e]/95 border-t border-violet-500/10 backdrop-blur-xl relative flex-shrink-0 flex flex-col gap-3">
                
                {/* Interactive Toolbelt Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    
                    {/* Fast Roll & Inspiration Sparks */}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => handleQuickRoll("1d20")}
                            className="px-2.5 py-1 text-[11px] font-bold bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 rounded-lg cursor-pointer transition-colors border border-violet-500/20"
                            title="Fast Roll a 20-sided die"
                        >
                            🎲 d20
                        </button>
                        <button 
                            onClick={() => handleQuickRoll("2d6")}
                            className="px-2.5 py-1 text-[11px] font-bold bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 rounded-lg cursor-pointer transition-colors border border-violet-500/20"
                            title="Fast Roll 2 6-sided dice"
                        >
                            🎲 2d6
                        </button>
                        <button 
                            onClick={handleInsertSpark}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-lg cursor-pointer transition-colors border border-amber-500/25 flex items-center gap-1"
                            title="Get a creative story helper prompt"
                        >
                            <span>✨ Spark Hook</span>
                        </button>
                    </div>

                    {/* Quick Reactions & OOC Toggle */}
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1 text-gray-500 text-[10px] mr-1 uppercase font-semibold">
                            Reactions:
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg px-1.5 py-0.5">
                            {["❤️", "😂", "👍", "🔥", "😮", "🎭"].map(emote => (
                                <button
                                    key={emote}
                                    onClick={() => handleQuickEmote(emote)}
                                    className="p-1 text-sm hover:scale-125 transition-transform cursor-pointer"
                                    title={`Send ${emote}`}
                                >
                                    {emote}
                                </button>
                            ))}
                        </div>

                        {/* OOC Toggle Indicator */}
                        <button
                            onClick={() => setIsOocMode(!isOocMode)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all border ${
                                isOocMode 
                                    ? 'bg-cyan-500 text-neutral-950 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                            }`}
                            title="Out Of Character mode wraps text in (( brackets ))"
                        >
                            (( OOC ))
                        </button>
                    </div>
                </div>

                {selectedMeme && (
                    <div className="relative inline-block bg-black/80 rounded-lg p-1 animate-fadeIn self-start">
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

                <div className="flex items-end gap-2 bg-gray-900/90 border-t border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl transition-all">
                    <button onClick={() => setIsSelectorOpen(true)} className="flex-shrink-0 self-center rounded-full ring-2 ring-transparent hover:ring-cyan-400 transition-all p-0.5" title="Change Persona">
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
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={messageText.startsWith('/') ? "Enter prompt..." : `Message #${location.name} as ${selectedVoice?.name}...`}
                            className="w-full bg-transparent text-gray-200 focus:outline-none resize-none max-h-[150px] overflow-y-auto py-3 px-1 leading-relaxed text-sm md:text-base"
                            rows={1}
                            enterKeyHint="enter"
                        />
                    )}
                    
                    <div className="flex items-center gap-1 pb-1.5">
                        <div className="relative">
                            <button 
                                onClick={() => setShowMemePicker(!showMemePicker)} 
                                className={`p-2 rounded-full transition-colors ${showMemePicker ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'}`}
                                title="Add Meme / Sticker"
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

                        {messageText.trim() || selectedMeme ? (
                            <button onClick={handleSend} className="p-2 text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500 rounded-full transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                                {messageText.startsWith('/imagine') ? <SparklesIcon /> : <PaperAirplaneIcon />}
                            </button>
                        ) : (
                            !isRecording && (
                                <button onClick={startRecording} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors" title="Record Voice Note">
                                    <MicrophoneIcon />
                                </button>
                            )
                        )}
                    </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5 ml-2 flex justify-between items-center">
                    <span>Tip: Use <b>/roll d20</b> or type <b>/help</b>. Press <b>Enter</b> for a new line or <b>Ctrl+Enter</b> to Send.</span>
                </div>
            </div>

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

            {showChannelSettings && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-violet-500/30 rounded-2xl p-6 max-w-md w-full space-y-4 animate-fadeIn shadow-[0_0_50px_rgba(0,255,255,0.15)] relative z-50">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                            <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                                ⚙️ Channel Settings
                            </h3>
                            <button 
                                onClick={() => setShowChannelSettings(false)}
                                className="text-gray-400 hover:text-white cursor-pointer p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z font-bold" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1.5">Channel Name</label>
                                <input
                                    type="text"
                                    value={editChannelName}
                                    onChange={(e) => setEditChannelName(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1.5">Channel Description</label>
                                <textarea
                                    value={editChannelDesc}
                                    onChange={(e) => setEditChannelDesc(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400 resize-none h-20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1.5">Background Image URL</label>
                                <input
                                    type="text"
                                    value={editChannelBg}
                                    onChange={(e) => setEditChannelBg(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div className="flex items-center justify-between border-t border-b border-neutral-850 py-3">
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">OC Persona Mode Enabled</span>
                                <input
                                    type="checkbox"
                                    checked={editOcMode}
                                    onChange={(e) => setEditOcMode(e.target.checked)}
                                    className="w-4 h-4 bg-neutral-950 border border-violet-500/30 rounded text-cyan-400 focus:ring-0 focus:ring-offset-0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    location.name = editChannelName;
                                    location.description = editChannelDesc;
                                    location.imageUrl = editChannelBg || undefined;
                                    setShowChannelSettings(false);
                                    alert("Channel configurations updated successfully!");
                                }}
                                className="flex-1 py-2.5 bg-cyan-400 text-neutral-950 hover:bg-cyan-300 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this channel? This action cannot be undone.")) {
                                        const locIdx = world.locations.findIndex(l => l.channels.some(c => c.id === location.id));
                                        if (locIdx !== -1) {
                                            const subIdx = world.locations[locIdx].channels.findIndex(c => c.id === location.id);
                                            if (subIdx !== -1) {
                                                world.locations[locIdx].channels.splice(subIdx, 1);
                                            }
                                        }
                                        setShowChannelSettings(false);
                                        if (onBack) onBack();
                                    }
                                }}
                                className="px-4 py-2.5 bg-red-950/45 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer border border-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default GroupChatView;
