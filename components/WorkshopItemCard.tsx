
import React, { useState, useRef, useEffect } from 'react';
import { UserCreation } from '../types';

const MoreOptionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
    </svg>
);

interface WorkshopItemCardProps {
    creation: UserCreation;
    onEdit?: () => void;
    onView?: () => void;
}

const WorkshopItemCard: React.FC<WorkshopItemCardProps> = ({ creation, onEdit, onView }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuRef]);
    
    const statusColorMap: Record<UserCreation['status'], string> = {
        Draft: 'bg-yellow-500/80 text-yellow-50',
        Published: 'bg-green-500/80 text-green-50',
        Active: 'bg-rose-500/80 text-rose-50',
    };

    const statusColor = statusColorMap[creation.status] || 'bg-gray-500/80';
    
    const cardContent = (
        <>
            <div className="aspect-[4/3] relative rounded-t-lg overflow-hidden">
                 <img src={creation.imageUrl} alt={creation.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                 
                 {/* Quick Edit Overlay Button */}
                 {onEdit && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-cyan-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm shadow-lg transform translate-y-2 group-hover:translate-y-0"
                        title="Edit Creation"
                    >
                        <PencilIcon />
                    </button>
                 )}
            </div>
            
            <div className="p-4 flex flex-col flex-grow bg-gray-900/50 rounded-b-lg border-t-0 border border-violet-500/30 relative">
                <div className="flex justify-between items-start">
                    <div className="min-w-0">
                        <p className="font-bold text-white truncate">{creation.name}</p>
                        <p className="text-sm text-gray-400">{creation.type}</p>
                    </div>
                     <div className="relative ml-2" ref={menuRef}>
                         <button 
                             onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }} 
                             disabled={!onEdit}
                             className="p-1 rounded-full text-gray-400 hover:bg-violet-500/20 hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                            <MoreOptionsIcon />
                        </button>
                        {menuOpen && onEdit && (
                            <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md shadow-xl bg-gray-800 border border-violet-500/50 z-50 animate-fadeIn">
                                <div className="py-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-violet-500/20 hover:text-white">
                                        <PencilIcon /> Edit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-auto pt-4">
                     <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                        {creation.status}
                    </span>
                </div>
            </div>
        </>
    );

    if (onView) {
        return (
            <div 
                onClick={onView} 
                className="text-left rounded-lg group transition-all hover:shadow-xl hover:shadow-violet-500/10 flex flex-col cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onView(); }}
            >
                {cardContent}
            </div>
        );
    }

    return (
        <div className="rounded-lg group transition-all flex flex-col">
            {cardContent}
        </div>
    );
};

export default WorkshopItemCard;
