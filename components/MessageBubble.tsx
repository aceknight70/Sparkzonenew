
import React from 'react';
import { currentUser } from '../mockData';
import { Message, User } from '../types';
import UserAvatar from './UserAvatar';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>;
const SwordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.835 5.707a.75.75 0 00-1.17-1.025l-3.912 4.471-1.29-1.29a.75.75 0 00-1.061 1.06l2.675 2.676-.53.53a.75.75 0 000 1.061l.75.75a.75.75 0 001.06 0l.53-.53 2.676 2.675a.75.75 0 001.06-1.06l-1.29-1.29 4.472-3.912a.75.75 0 00.025-1.12zM14.896 8.232a.75.75 0 00-1.06 1.06l2.675 2.676-.53.53a.75.75 0 000 1.061l.75.75a.75.75 0 001.06 0l.53-.53 2.676 2.675a.75.75 0 001.06-1.06l-1.29-1.29 4.472-3.912a.75.75 0 00-1.12-.025l-3.912 4.471-1.29-1.29a.75.75 0 00-1.061 0z" clipRule="evenodd" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M14 6a2.5 2.5 0 00-4-4.9V9h4a2.5 2.5 0 000-5zm-1.5 0a1 1 0 011 1 1 1 0 110-2 1 1 0 01-1 1zm-2.5 1.9V1.1a2.5 2.5 0 00-4 4.9 2.5 2.5 0 000 5h4zm-1.5-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /><path d="M2 11.5a1.5 1.5 0 011.5-1.5h13a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 16.5v-5z" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" /></svg>;
const DiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M14.5 3.5a.5.5 0 01.5.5v12a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5h9zM10 6a1 1 0 100-2 1 1 0 000 2zm-3 3a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-3 3a1 1 0 100-2 1 1 0 000 2z" /></svg>;

interface MessageBubbleProps {
    message: Message;
    participant: User;
    onDelete?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, participant, onDelete }) => {
    const isOwnMessage = message.senderId === currentUser.id;
    const isRP = !!message.character;
    
    const sender = isOwnMessage ? currentUser : participant;
    const avatarSrc = isRP ? message.character?.imageUrl : sender.avatarUrl;

    const bubbleClasses = isOwnMessage
        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl rounded-br-md'
        : 'bg-slate-800 rounded-2xl rounded-bl-md';

    const getYoutubeEmbed = (text: string) => {
        if (!text) return null;
        const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]*)/);
        return match ? match[1] : null;
    };

    const videoId = getYoutubeEmbed(message.text);

    // --- Special Message Types ---

    if (message.type === 'challenge') {
        return (
            <div className={`flex items-start gap-3 w-full max-w-lg group ${isOwnMessage ? 'self-end flex-row-reverse' : 'self-start'}`}>
                {!isOwnMessage && <UserAvatar src={avatarSrc} size="10" className="flex-shrink-0" />}
                <div className={`flex flex-col flex-grow ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className="p-1 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-900/50">
                        <div className="bg-black/80 rounded-xl p-4 border border-white/10 w-64">
                            <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider mb-2">
                                <SwordIcon /> Challenge Request
                            </div>
                            <p className="text-white text-sm mb-4">
                                {isOwnMessage ? "You challenged them to Spark Clash!" : `${sender.name} challenged you to a duel!`}
                            </p>
                            {!isOwnMessage && (
                                <button className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors">
                                    Accept Challenge
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
                </div>
            </div>
        );
    }

    if (message.type === 'gift') {
        return (
            <div className={`flex items-start gap-3 w-full max-w-lg group ${isOwnMessage ? 'self-end flex-row-reverse' : 'self-start'}`}>
                {!isOwnMessage && <UserAvatar src={avatarSrc} size="10" className="flex-shrink-0" />}
                <div className={`flex flex-col flex-grow ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className="p-1 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 shadow-lg shadow-yellow-900/50">
                        <div className="bg-black/80 rounded-xl p-4 border border-white/10 w-64 text-center">
                            <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold uppercase tracking-wider mb-2">
                                <GiftIcon /> Gift Received
                            </div>
                            <div className="text-3xl font-black text-white mb-1">
                                {message.metadata?.amount || 0}
                            </div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Sparks</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
                </div>
            </div>
        );
    }

    if (message.type === 'invite') {
        return (
            <div className={`flex items-start gap-3 w-full max-w-lg group ${isOwnMessage ? 'self-end flex-row-reverse' : 'self-start'}`}>
                {!isOwnMessage && <UserAvatar src={avatarSrc} size="10" className="flex-shrink-0" />}
                <div className={`flex flex-col flex-grow ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-cyan-900/50">
                        <div className="bg-black/80 rounded-xl p-4 border border-white/10 w-64">
                            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider mb-2">
                                <TicketIcon /> Invitation
                            </div>
                            <p className="text-white text-sm mb-1">
                                {isOwnMessage ? "You invited them to:" : `${sender.name} invited you to:`}
                            </p>
                            <p className="text-lg font-bold text-white mb-3 truncate">{message.metadata?.targetName}</p>
                            <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors text-sm">
                                View {message.metadata?.targetType}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
                </div>
            </div>
        );
    }

    return (
       <div className={`flex items-start gap-3 w-full max-w-lg group ${isOwnMessage ? 'self-end flex-row-reverse' : 'self-start'}`}>
            {!isOwnMessage && (
                <UserAvatar src={avatarSrc} size="10" className="flex-shrink-0" />
            )}
            <div className={`flex flex-col flex-grow ${isOwnMessage ? 'items-end' : 'items-start'} max-w-full relative`}>
                <div className={`p-3 text-white ${bubbleClasses} shadow-md overflow-hidden relative`}>
                    {isRP && (
                        <p className={`font-bold text-sm mb-1 ${isOwnMessage ? 'text-cyan-200' : 'text-cyan-400'}`}>
                            {message.character?.name}
                        </p>
                    )}
                    {message.imageUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/20 max-w-xs">
                            <img src={message.imageUrl} alt="Attachment" className="w-full h-auto block" />
                        </div>
                    )}
                    {message.audioUrl && (
                        <div className="mb-2">
                            <audio controls src={message.audioUrl} className="max-w-[200px] h-8" />
                        </div>
                    )}
                    
                    {/* Standard Text */}
                    {message.text && <p className="whitespace-pre-wrap break-words text-sm md:text-base">{message.text}</p>}
                    
                    {/* Dice Roll Display */}
                    {message.metadata?.roll && (
                        <div className="bg-black/30 border border-white/20 rounded p-2 mt-2 flex items-center gap-2">
                            <DiceIcon />
                            <span className="font-mono text-cyan-300 font-bold">
                                {message.metadata.roll.command}: {message.metadata.roll.total}
                            </span>
                            <span className="text-xs text-gray-400">[{message.metadata.roll.rolls.join(', ')}]</span>
                        </div>
                    )}
                    
                    {videoId && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-black/20 w-full aspect-video">
                            <iframe 
                                src={`https://www.youtube.com/embed/${videoId}`} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-2">
                    <p className="text-xs text-gray-500">{message.timestamp}</p>
                    {isOwnMessage && onDelete && (
                        <button 
                            onClick={onDelete} 
                            className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Message"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </div>
            </div>
             {isOwnMessage && (
                <div className="w-10 flex-shrink-0"></div>
            )}
       </div>
    );
};

export default React.memo(MessageBubble);
