
import React from 'react';
import { currentUser } from '../mockData';
import { GroupMessage } from '../types';
import UserAvatar from './UserAvatar';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>;

interface GroupMessageBubbleProps {
    message: GroupMessage;
    onDelete?: () => void;
}

const GroupMessageBubble: React.FC<GroupMessageBubbleProps> = ({ message, onDelete }) => {
    const isOwnMessage = message.sender.id === currentUser.id;
    const isRP = !!message.character;
    
    const avatarSrc = isRP ? message.character?.imageUrl : message.sender.avatarUrl;
    const senderName = isRP ? message.character?.name : message.sender.name;

    const getYoutubeEmbed = (text: string) => {
        const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]*)/);
        return match ? match[1] : null;
    };

    const videoId = getYoutubeEmbed(message.text);

    return (
       <div className={`group flex items-start gap-3 max-w-full ${isOwnMessage ? 'flex-row-reverse' : ''} hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2`}>
           <div className="flex-shrink-0 mt-1">
                <UserAvatar src={avatarSrc} size="10" className="ring-2 ring-transparent group-hover:ring-white/20 transition-all" />
           </div>
           <div className={`flex-grow min-w-0 flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span className={`text-sm font-bold ${isOwnMessage ? 'text-cyan-400' : 'text-white'} ${isRP ? 'italic' : ''}`}>
                        {senderName}
                    </span>
                    <span className="text-[10px] text-gray-500">{message.timestamp}</span>
                    {isOwnMessage && onDelete && (
                        <button 
                            onClick={onDelete} 
                            className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-2"
                            title="Delete"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </div>
                
                <div className={`relative text-sm md:text-base text-gray-200 whitespace-pre-wrap break-words leading-relaxed max-w-3xl ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {message.text}
                </div>

                {message.imageUrl && (
                    <div className="mt-2 mb-1 rounded-lg overflow-hidden border border-white/10 max-w-sm shadow-md">
                        <img src={message.imageUrl} alt="Attachment" className="w-full h-auto block" loading="lazy" />
                    </div>
                )}
                
                {message.audioUrl && (
                    <div className="mt-2 mb-1">
                        <audio controls src={message.audioUrl} className="h-8 max-w-xs opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                )}
                
                {videoId && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10 w-full max-w-md aspect-video bg-black shadow-md">
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
       </div>
    );
};

export default GroupMessageBubble;
