
import React, { useRef, useEffect } from 'react';
import { Notification, User } from '../types';
import UserAvatar from './UserAvatar';

// --- Icons ---
const SparkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.84 2.84l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.84 2.84l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.84-2.84l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.84-2.84l.813-2.846A.75.75 0 019 4.5zM18 9.75a.75.75 0 01.721.544l.63 2.199a2.25 2.25 0 001.705 1.705l2.199.63a.75.75 0 010 1.442l-2.199.63a2.25 2.25 0 00-1.705 1.705l-.63 2.199a.75.75 0 01-1.442 0l-.63-2.199a2.25 2.25 0 00-1.705-1.705l-2.199-.63a.75.75 0 010-1.442l2.199-.63a2.25 2.25 0 001.705-1.705l.63-2.199A.75.75 0 0118 9.75z" clipRule="evenodd" /></svg>;
const ChatBubbleLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-400"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /><path d="M13.5 3a.75.75 0 01.75.75V5.25h1.5a.75.75 0 010 1.5H14.25v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5V3.75a.75.75 0 01.75-.75z" /></svg>;
const SwordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500"><path fillRule="evenodd" d="M10.835 5.707a.75.75 0 00-1.17-1.025l-3.912 4.471-1.29-1.29a.75.75 0 00-1.061 1.06l2.675 2.676-.53.53a.75.75 0 000 1.061l.75.75a.75.75 0 001.06 0l.53-.53 2.676 2.675a.75.75 0 001.06-1.06l-1.29-1.29 4.472-3.912a.75.75 0 00.025-1.12zM14.896 8.232a.75.75 0 00-1.06 1.06l2.675 2.676-.53.53a.75.75 0 000 1.061l.75.75a.75.75 0 001.06 0l.53-.53 2.676 2.675a.75.75 0 001.06-1.06l-1.29-1.29 4.472-3.912a.75.75 0 00-1.12-.025l-3.912 4.471-1.29-1.29a.75.75 0 00-1.061 0z" clipRule="evenodd" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 0013.484 0 .75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 16.03A.75.75 0 018.8 15.5h2.4a.75.75 0 01.75.75 1.5 1.5 0 01-3 0z" clipRule="evenodd" /></svg>;

interface NotificationDropdownProps {
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onClose: () => void;
    users: User[];
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onMarkAsRead, onClose, users }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'spark': return <div className="p-1.5 rounded-full bg-yellow-500/20"><SparkIcon /></div>;
            case 'comment': return <div className="p-1.5 rounded-full bg-blue-500/20"><ChatBubbleLeftIcon /></div>;
            case 'follow': return <div className="p-1.5 rounded-full bg-green-500/20"><UserPlusIcon /></div>;
            case 'clash_challenge': return <div className="p-1.5 rounded-full bg-red-500/20"><SwordIcon /></div>;
            default: return <div className="p-1.5 rounded-full bg-gray-500/20"><BellIcon /></div>;
        }
    };

    return (
        <div ref={dropdownRef} className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-gray-900/95 backdrop-blur-md border border-violet-500/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-violet-500/20 flex justify-between items-center bg-black/20">
                <h3 className="font-bold text-white text-sm">Notifications</h3>
                <button onClick={() => notifications.forEach(n => !n.read && onMarkAsRead(n.id))} className="text-xs text-cyan-400 hover:text-cyan-300">
                    Mark all as read
                </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => {
                        const actor = users.find(u => u.id === notif.actorId);
                        return (
                            <div 
                                key={notif.id} 
                                onClick={() => onMarkAsRead(notif.id)}
                                className={`flex gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-800/50 last:border-0 ${!notif.read ? 'bg-cyan-900/10' : ''}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <UserAvatar src={actor?.avatarUrl} size="10" />
                                    <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full border border-gray-800">
                                        {getIcon(notif.type)}
                                    </div>
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className={`text-sm leading-snug ${!notif.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                                </div>
                                {!notif.read && (
                                    <div className="self-center">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
