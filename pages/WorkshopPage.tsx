
import React, { useState, useRef, useEffect } from 'react';
import { UserCreation } from '../types';
import WorkshopItemCard from '../components/WorkshopItemCard';

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>;
const CharacterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.995 9.995 0 0010 12c-2.31 0-4.438.784-6.131-2.095z" /></svg>;
const WorldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.42 2.222a.75.75 0 011.16 0l4.25 6.5a.75.75 0 01-.58 1.168h-8.5a.75.75 0 01-.58-1.168l4.25-6.5zM10 8.25a.75.75 0 01.75.75v3.19l2.22 1.48a.75.75 0 11-.74 1.11l-2.5-1.667A.75.75 0 019.25 12V9a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
const StoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2.5 1a.5.5 0 00-.5.5v1.886c0 .041.012.08.034.114l1.192 1.589a.5.5 0 00.316.16h3.916a.5.5 0 00.316-.16l1.192-1.589A.5.5 0 0013.5 7.386V5.5a.5.5 0 00-.5-.5h-9z" clipRule="evenodd" /></svg>;
const PartyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M12.75 1.522a1.5 1.5 0 012.058 2.058l-6 6a1.5 1.5 0 01-2.058-2.058l6-6zM8.5 7.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5z" /><path d="M12.5 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /><path d="M3.66 4.01a.75.75 0 00-1.112 1.018l1.016 1.11a.75.75 0 001.112-1.018L3.66 4.01zM15.99 15.28a.75.75 0 00-1.017 1.112l1.11 1.016a.75.75 0 001.018-1.112l-1.11-1.016z" /></svg>;
const MemeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 9.22a.75.75 0 00-1.06 1.06L8.94 12l-1.72 1.72a.75.75 0 101.06 1.06L10 13.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 12l1.72-1.72a.75.75 0 00-1.06-1.06L10 10.94 8.28 9.22zM8 6.5a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" /></svg>;

type CreationFilter = 'All' | UserCreation['type'];
const filters: CreationFilter[] = ['All', 'Character', 'World', 'Story', 'Community', 'RP Card', 'Meme'];

interface WorkshopPageProps {
    userCreations: UserCreation[];
    onEditWorld: (worldId: number) => void;
    onCreateCharacter: () => void;
    onEditCharacter: (characterId: number) => void;
    onViewCharacter: (characterId: number) => void;
    onCreateWorld: () => void;
    onCreateStory: () => void;
    onEditStory: (storyId: number) => void;
    onViewStory: (storyId: number) => void;
    onCreateParty: () => void;
    onEditParty: (partyId: number) => void;
    onCreateMeme: () => void;
    onCreateCommunity?: () => void;
    onEditCommunity?: (communityId: number) => void;
}

const WorkshopPage: React.FC<WorkshopPageProps> = ({ 
    userCreations, 
    onEditWorld, 
    onCreateCharacter, 
    onEditCharacter, 
    onViewCharacter, 
    onCreateWorld, 
    onCreateStory,
    onEditStory,
    onViewStory,
    onCreateParty,
    onEditParty,
    onCreateMeme,
    onCreateCommunity,
    onEditCommunity
}) => {
    const [activeFilter, setActiveFilter] = useState<CreationFilter>('All');
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsCreateMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuRef]);

    const filteredCreations = userCreations.filter(creation => activeFilter === 'All' || creation.type === activeFilter);

    const CreateMenuItem: React.FC<{ icon: React.ReactElement, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
        <button 
            onClick={() => { onClick(); setIsCreateMenuOpen(false); }} 
            className="flex items-center gap-3 w-full p-3 hover:bg-violet-500/20 transition-colors text-left text-sm md:text-base"
        >
            <div className="text-gray-400">{icon}</div>
            <span className="text-gray-200 font-medium">{label}</span>
        </button>
    );

    const handleEdit = (creation: UserCreation) => {
        switch(creation.type) {
            case 'World': onEditWorld(creation.id); break;
            case 'Character': onEditCharacter(creation.id); break;
            case 'AI Character': onEditCharacter(creation.id); break;
            case 'Story': onEditStory(creation.id); break;
            case 'RP Card': onEditParty(creation.id); break;
            case 'Community': onEditCommunity && onEditCommunity(creation.id); break;
            default: console.log("Edit not implemented for", creation.type);
        }
    };

    const handleView = (creation: UserCreation) => {
        switch(creation.type) {
            case 'Character': onViewCharacter(creation.id); break;
            case 'AI Character': onViewCharacter(creation.id); break;
            case 'Story': onViewStory(creation.id); break;
            default: console.log("View not implemented for", creation.type);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn h-full overflow-y-auto pb-20 md:pb-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-cyan-400">Workshop</h1>
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white font-semibold rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
                    >
                        <PlusIcon />
                        <span className="hidden md:inline">Create New</span>
                        <span className="md:hidden">Create</span>
                        <ChevronDownIcon />
                    </button>
                    
                    {isCreateMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-violet-500/50 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn origin-top-right">
                            <CreateMenuItem icon={<CharacterIcon />} label="Character" onClick={onCreateCharacter} />
                            <CreateMenuItem icon={<WorldIcon />} label="World" onClick={onCreateWorld} />
                            <CreateMenuItem icon={<StoryIcon />} label="Story" onClick={onCreateStory} />
                            <CreateMenuItem icon={<PartyIcon />} label="Party Room" onClick={onCreateParty} />
                            <CreateMenuItem icon={<UserGroupIcon />} label="Community" onClick={onCreateCommunity || (() => {})} />
                            <CreateMenuItem icon={<MemeIcon />} label="Meme" onClick={onCreateMeme} />
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCreations.length > 0 ? (
                    filteredCreations.map(creation => (
                        <WorkshopItemCard 
                            key={creation.id} 
                            creation={creation} 
                            onEdit={() => handleEdit(creation)}
                            onView={['Character', 'AI Character', 'Story'].includes(creation.type) ? () => handleView(creation) : undefined}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        <p className="text-lg">No creations found.</p>
                        <p className="text-sm">Start creating to see your items here!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkshopPage;
