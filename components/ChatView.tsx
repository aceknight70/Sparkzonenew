
import React, { useEffect, useRef, useState } from 'react';
import { currentUser } from '../mockData';
import { Conversation, UserCreation, MessageType, DiceRoll } from '../types';
import UserAvatar from './UserAvatar';
import MessageBubble from './MessageBubble';
import CharacterSelectorModal from './CharacterSelectorModal';
import MemePicker from './MemePicker';
import MemeCreationPage from '../pages/MemeCreationPage';
import { GoogleGenAI, Modality } from '@google/genai';

const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;
const PaperAirplaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>;
const FaceSmileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>;
const MicrophoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" /><path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>;
const CloudArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-cyan-400 animate-bounce"><path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-pulse text-yellow-400"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.84 2.84l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.84 2.84l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.84-2.84l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.84-2.84l.813-2.846A.75.75 0 019 4.5zM18 9.75a.75.75 0 01.721.544l.63 2.199a2.25 2.25 0 001.705 1.705l2.199.63a.75.75 0 010 1.442l-2.199.63a2.25 2.25 0 00-1.705 1.705l-.63 2.199a.75.75 0 01-1.442 0l-.63-2.199a2.25 2.25 0 00-1.705-1.705l-2.199-.63a.75.75 0 010-1.442l2.199-.63a2.25 2.25 0 001.705-1.705l.63-2.199A.75.75 0 0118 9.75z" clipRule="evenodd" /></svg>;
const BoltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.292 6.636a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" /></svg>;

interface ChatViewProps {
    conversation: Conversation;
    onBack: () => void;
    onSendMessage: (conversationId: number, text: string, character?: UserCreation, imageUrl?: string, audioUrl?: string, type?: MessageType, metadata?: any) => void;
    onDeleteMessage?: (conversationId: number, messageId: number) => void;
    onSetTyping?: (conversationId: number, isTyping: boolean) => void;
    userCreations: UserCreation[];
    onSaveMeme?: (meme: { name: string, imageUrl: string }) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ conversation, onBack, onSendMessage, onDeleteMessage, onSetTyping, userCreations, onSaveMeme }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<any>(null);
    const [messageText, setMessageText] = useState('');
    const [isLocalTyping, setIsLocalTyping] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedVoiceId, setSelectedVoiceId] = useState<number>(currentUser.id);
    const [isImagining, setIsImagining] = useState(false);
    
    // Media State
    const [showMemePicker, setShowMemePicker] = useState(false);
    const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
    const [isCreatingMeme, setIsCreatingMeme] = useState(false);
    
    // Actions State
    const [showActions, setShowActions] = useState(false);
    
    // Drag & Drop State
    const [isDragging, setIsDragging] = useState(false);

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerIntervalRef = useRef<number | null>(null);

    const userCharacters = userCreations.filter(c => c.type === 'Character' || c.type === 'AI Character') as UserCreation[];
    
    const selectedVoice = selectedVoiceId === currentUser.id
        ? { ...currentUser, name: 'You', epithet: 'Yourself', imageUrl: currentUser.avatarUrl }
        : userCharacters.find(c => c.id === selectedVoiceId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); 
    }

    const isParticipantTyping = conversation.typing && conversation.typing[conversation.participant.id.toString()];

    useEffect(scrollToBottom, [conversation.messages, isParticipantTyping]);

    useEffect(() => {
        // Reset typing tracking when conversation ID changes or unmounts
        setIsLocalTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        return () => {
            if (onSetTyping && conversation.id) {
                onSetTyping(conversation.id, false);
            }
        };
    }, [conversation.id, onSetTyping]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessageText(value);

        if (onSetTyping) {
            if (!isLocalTyping && value.trim().length > 0) {
                setIsLocalTyping(true);
                onSetTyping(conversation.id, true);
            } else if (value.trim().length === 0 && isLocalTyping) {
                setIsLocalTyping(false);
                onSetTyping(conversation.id, false);
            }

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            if (value.trim().length > 0) {
                typingTimeoutRef.current = setTimeout(() => {
                    setIsLocalTyping(false);
                    onSetTyping(conversation.id, false);
                }, 3000);
            }
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
        }
    }, [messageText]);
    
    const handleSend = () => {
        if (!messageText.trim() && !selectedMeme) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (onSetTyping) {
            setIsLocalTyping(false);
            onSetTyping(conversation.id, false);
        }

        if (messageText.trim().startsWith('/imagine ')) {
            handleAiImagine(messageText.trim().substring(9));
            setMessageText('');
            return;
        }

        // Check for Dice Roll
        const rollMatch = messageText.match(/^\/roll (\d+)d(\d+)(\+(\d+))?/);
        if (rollMatch) {
            const count = parseInt(rollMatch[1]);
            const sides = parseInt(rollMatch[2]);
            const mod = rollMatch[4] ? parseInt(rollMatch[4]) : 0;
            const rolls = Array.from({length: count}, () => Math.floor(Math.random() * sides) + 1);
            const total = rolls.reduce((a, b) => a + b, 0) + mod;
            const roll = { command: rollMatch[0], rolls, modifier: mod, total };
            
            const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
            onSendMessage(conversation.id, messageText, character, undefined, undefined, 'text', { roll });
            setMessageText('');
            return;
        }

        const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
        onSendMessage(conversation.id, messageText, character, selectedMeme || undefined);
        setMessageText('');
        setSelectedMeme(null);
    };

    const handleAction = (type: MessageType) => {
        const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
        
        if (type === 'challenge') {
            onSendMessage(conversation.id, '', character, undefined, undefined, 'challenge', { challengeId: Date.now().toString() });
        } else if (type === 'gift') {
            const amount = 50; // Mock amount
            onSendMessage(conversation.id, '', character, undefined, undefined, 'gift', { amount });
        } else if (type === 'invite') {
            // Mock Invite to a world
            onSendMessage(conversation.id, '', character, undefined, undefined, 'invite', { targetId: 10, targetName: 'The Crimson Archipelago', targetType: 'World' });
        }
        setShowActions(false);
    };

    const handleAiImagine = async (prompt: string) => {
        if (!prompt) return;
        setIsImagining(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: `Generate a scene: ${prompt}` }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
                    onSendMessage(conversation.id, `Imagined: ${prompt}`, character, imageUrl);
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
                onSendMessage(conversation.id, '', character, undefined, audioUrl);
                
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

    const backgroundStyle = conversation.participant.bannerUrl 
        ? { backgroundImage: `url(${conversation.participant.bannerUrl})` }
        : {};

    return (
        <div 
            className="flex flex-col h-full bg-black relative overflow-hidden"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Immersive Background */}
            {conversation.participant.bannerUrl && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-20 animate-ken-burns" 
                        style={backgroundStyle}
                    ></div>
                    <div className="absolute inset-0 bg-noise opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/90"></div>
                </div>
            )}

            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-cyan-900/80 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-cyan-400 border-dashed m-4 rounded-2xl animate-pulse">
                    <CloudArrowUpIcon />
                    <h2 className="text-2xl font-bold text-white mt-4">Drop to Upload</h2>
                </div>
            )}

            {/* Header */}
            <header className="flex items-center gap-3 p-3 border-b border-violet-500/30 flex-shrink-0 bg-gray-900/80 backdrop-blur-md z-10">
                <button onClick={onBack} className="md:hidden p-2 text-gray-300 hover:text-white">
                    <ArrowLeftIcon />
                </button>
                <UserAvatar src={conversation.participant.avatarUrl} size="10" />
                <h2 className="font-bold text-white">{conversation.participant.name}</h2>
            </header>

            {/* Messages */}
            <div className={`relative flex-grow p-4 overflow-y-auto flex flex-col gap-4 z-10 pb-20`}>
                {conversation.messages.map(message => (
                    <MessageBubble 
                        key={message.id} 
                        message={message} 
                        participant={conversation.participant} 
                        onDelete={onDeleteMessage ? () => onDeleteMessage(conversation.id, message.id) : undefined}
                    />
                ))}
                
                {isParticipantTyping && (
                    <div className="flex items-start gap-2.5 self-start mr-auto max-w-[85%] animate-fadeIn">
                        <UserAvatar src={conversation.participant.avatarUrl} size="8" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-500 font-mono pl-1">{conversation.participant.name}</span>
                            <div className="bg-gray-900/80 border border-violet-500/20 text-gray-200 py-2 px-3 rounded-2xl rounded-tl-none shadow-md flex items-center gap-1 min-h-[32px]">
                                <span className="flex gap-1 items-center py-1">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

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

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 w-full p-4 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-10">
                {/* Meme Preview */}
                {selectedMeme && (
                    <div className="mb-3 relative inline-block animate-fadeIn bg-black/80 rounded-lg p-1">
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

                {/* Action Menu */}
                {showActions && (
                    <div className="absolute bottom-20 left-4 bg-gray-900 border border-violet-500/50 rounded-xl shadow-2xl p-2 animate-fadeIn z-30 flex flex-col gap-1 w-48">
                        <button onClick={() => handleAction('challenge')} className="flex items-center gap-2 p-2 hover:bg-red-900/30 rounded text-red-300 font-bold text-sm text-left">
                            <span className="text-lg">⚔️</span> Challenge
                        </button>
                        <button onClick={() => handleAction('gift')} className="flex items-center gap-2 p-2 hover:bg-yellow-900/30 rounded text-yellow-300 font-bold text-sm text-left">
                            <span className="text-lg">🎁</span> Send Gift
                        </button>
                        <button onClick={() => handleAction('invite')} className="flex items-center gap-2 p-2 hover:bg-cyan-900/30 rounded text-cyan-300 font-bold text-sm text-left">
                            <span className="text-lg">✉️</span> Invite
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 bg-gray-900/90 border border-violet-500/30 rounded-2xl p-2 shadow-2xl backdrop-blur-xl transition-all">
                    {/* Character Selector */}
                    <button onClick={() => setIsSelectorOpen(true)} className="flex-shrink-0 self-center rounded-full ring-2 ring-transparent hover:ring-cyan-400 transition-all p-0.5" title="Change Speaking As">
                        <UserAvatar src={selectedVoice?.imageUrl} size="10" />
                    </button>
                    
                    {/* Action Button */}
                    <button 
                        onClick={() => setShowActions(!showActions)}
                        className={`flex-shrink-0 self-center p-2 rounded-full transition-colors ${showActions ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-cyan-400'}`}
                    >
                        <BoltIcon />
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
                            onChange={handleTextChange}
                            placeholder={messageText.startsWith('/') ? "Enter prompt..." : "Type a message..."} 
                            className="w-full bg-transparent text-gray-200 focus:outline-none resize-none max-h-[150px] overflow-y-auto py-3 px-2 leading-relaxed text-sm md:text-base"
                            rows={1}
                            enterKeyHint="enter"
                        />
                    )}
                    
                    <div className="relative self-center">
                        <button 
                            onClick={() => setShowMemePicker(!showMemePicker)} 
                            className={`p-2 transition-colors rounded-full ${showMemePicker ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'}`}
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
                        <button onClick={handleSend} className="p-2 text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500 rounded-full transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] self-end pb-2">
                            {messageText.startsWith('/imagine') ? <SparklesIcon /> : <PaperAirplaneIcon />}
                        </button>
                    ) : (
                        !isRecording && (
                            <button onClick={startRecording} className="p-2 text-gray-400 hover:text-red-400 transition-colors self-center" title="Record Voice Note">
                                <MicrophoneIcon />
                            </button>
                        )
                    )}
                </div>
                <div className="text-[10px] text-gray-500 mt-1 ml-2">Tip: Use <b>/imagine</b> for AI images or <b>/roll</b> for dice.</div>
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
        </div>
    );
};

export default ChatView;
