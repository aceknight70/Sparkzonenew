
import React, { useState } from 'react';
import { Page, Notification, User } from '../types';
import NotificationDropdown from './NotificationDropdown';

interface NavBarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
    notifications?: Notification[];
    onMarkAsRead?: (id: number) => void;
    allUsers?: User[];
}

interface NavItemProps {
    page: Page;
    label: string;
    icon: React.ReactElement;
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ page, label, icon, activePage, setActivePage }) => {
    const isActive = activePage === page;
    
    return (
        <button
            onClick={() => setActivePage(page)}
            className={`group relative flex items-center justify-center p-3 md:px-6 md:py-3 rounded-xl transition-all duration-300 ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${isActive ? 'bg-cyan-500/10' : 'bg-transparent group-hover:bg-white/5'}`}></div>
            <div className={`w-6 h-6 md:w-5 md:h-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'group-hover:scale-110'}`}>
                {icon}
            </div>
            <span className={`hidden md:block ml-2 text-sm font-medium transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>{label}</span>
            
            {/* Active Indicator Dot */}
            {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan] md:hidden"></div>
            )}
        </button>
    );
};

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;

const NavBar: React.FC<NavBarProps> = ({ activePage, setActivePage, notifications = [], onMarkAsRead, allUsers = [] }) => {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const navItems = [
        { page: Page.Home, label: 'Feed', icon: <HomeIcon /> },
        { page: Page.Explore, label: 'Discover', icon: <CompassIcon /> },
        { page: Page.Library, label: 'Library', icon: <LibraryIcon /> },
        { page: Page.Workshop, label: 'Workshop', icon: <WorkshopIcon /> },
        { page: Page.Party, label: 'Party Hub', icon: <PartyIcon /> },
        { page: Page.Messenger, label: 'Messenger', icon: <MessengerIcon />, badge: unreadCount },
        { page: Page.Profile, label: 'Profile', icon: <ProfileIcon /> },
    ];

    return (
        <>
            {/* Desktop Floating Nav */}
            <nav className="hidden lg:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 items-center justify-center">
                <div className="glass-panel rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl shadow-black/50 relative">
                    {navItems.map(item => (
                        <div key={item.page} className="relative">
                            <NavItem {...item} activePage={activePage} setActivePage={setActivePage} />
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-black animate-pulse shadow-md select-none">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    ))}
                    
                    {/* Notification Bell */}
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/5 relative ${isNotifOpen ? 'text-white' : 'text-gray-400'}`}
                        >
                            <div className="w-5 h-5"><BellIcon /></div>
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-gray-900 animate-pulse"></span>
                            )}
                        </button>
                        {isNotifOpen && onMarkAsRead && (
                            <NotificationDropdown 
                                notifications={notifications} 
                                onMarkAsRead={onMarkAsRead} 
                                onClose={() => setIsNotifOpen(false)} 
                                users={allUsers}
                            />
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile / Narrow Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 z-40 pb-safe">
                <div className="flex items-center gap-1 h-full px-2 overflow-x-auto scrollbar-hide select-none max-w-full">
                    {navItems.map(item => (
                        <div key={item.page} className="relative flex-1 min-w-[56px] flex justify-center">
                            <NavItem {...item} activePage={activePage} setActivePage={setActivePage} />
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="absolute top-1.5 right-2 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black select-none">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    ))}
                    {/* Mobile Bell */}
                    <div className="relative flex-1 min-w-[56px] flex justify-center">
                        <button 
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`relative flex items-center justify-center p-3 rounded-xl ${isNotifOpen ? 'text-cyan-400' : 'text-gray-400'}`}
                        >
                            <div className="w-6 h-6"><BellIcon /></div>
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                        {/* Mobile Notification Dropdown (Anchored differently) */}
                        {isNotifOpen && onMarkAsRead && (
                            <div className="absolute bottom-full right-0 mb-4 transform translate-x-4">
                                <NotificationDropdown 
                                    notifications={notifications} 
                                    onMarkAsRead={onMarkAsRead} 
                                    onClose={() => setIsNotifOpen(false)} 
                                    users={allUsers}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

const ExploreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;

const CompassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 1.5L10.5 10.5 16.5 9 15 15z" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
    </svg>
);

const LibraryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 3.75h-11a2.25 2.25 0 0 0-2.25 2.25v15l7.75-5.25 7.75 5.25v-15a2.25 2.25 0 0 0-2.25-2.25z" />
    </svg>
);

const WorkshopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.014A3 3 0 0012 21a3 3 0 00.58-5.986l8.42-8.42a1 1 0 00-1.42-1.42l-8.42 8.42z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 13.5l3.8-3.8M8.5 7.5L5.7 10.3" />
    </svg>
);

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;

const PartyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const MessengerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
);

const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;

export default NavBar;
