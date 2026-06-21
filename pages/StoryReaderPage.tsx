
import React, { useState, useMemo } from 'react';
import { Story, CodexItem, Character, LoreEntry, User } from '../types';
import { characters as allCharacters, allUsers } from '../mockData';
import UserAvatar from '../components/UserAvatar';
import ShareButton from '../components/ShareButton';

// --- ICONS ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;

// --- INTERACTIVE CODEX COMPONENTS ---

const Tooltip: React.FC<{ content: React.ReactNode; children: React.ReactNode }> = ({ content, children }) => {
  return (
    <span className="relative group inline-block cursor-pointer">
      <span className="text-cyan-400 font-semibold underline decoration-dotted decoration-cyan-400/50 underline-offset-2">
          {children}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 border border-violet-500/50 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {content}
      </div>
    </span>
  );
};

const CodexTooltipContent: React.FC<{ item: CodexItem, onViewCharacter?: (id: number) => void }> = ({ item, onViewCharacter }) => {
    if (item.type === 'character') {
        const char = item.data;
        return (
            <button 
                onClick={(e) => { e.stopPropagation(); onViewCharacter?.(char.id); }}
                className="flex items-center gap-3 text-left w-full hover:bg-violet-500/10 p-1 rounded-md"
            >
                <UserAvatar src={char.imageUrl} size="12" />
                <div>
                    <p className="font-bold text-white">{char.name}</p>
                    <p className="text-xs text-cyan-300">{char.epithet}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{char.tagline}</p>
                </div>
            </button>
        );
    }
    if (item.type === 'lore') {
        const lore = item.data;
        return (
            <div>
                <p className="font-bold text-white">{lore.name}</p>
                <p className="text-xs text-cyan-300 mb-1">{lore.category}</p>
                <p className="text-xs text-gray-400 line-clamp-3">{lore.description}</p>
            </div>
        )
    }
    return null;
}

const InteractiveText: React.FC<{ text: string; codex: Map<string, CodexItem>, onViewCharacter?: (id: number) => void }> = ({ text, codex, onViewCharacter }) => {
    const parts = useMemo(() => {
        if (!codex.size) return [text];
        const regex = new RegExp(`\\b(${Array.from(codex.keys()).join('|')})\\b`, 'gi');
        return text.split(regex);
    }, [text, codex]);

    return (
        <>
            {parts.map((part, index) => {
                const codexItem = codex.get(part.toLowerCase());
                if (codexItem) {
                    return (
                        <Tooltip key={index} content={<CodexTooltipContent item={codexItem} onViewCharacter={onViewCharacter}/>}>
                            {part}
                        </Tooltip>
                    );
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </>
    );
};

// --- MAIN READER PAGE ---

interface StoryReaderPageProps {
    story: Story;
    onExit: () => void;
    onViewCharacter: (characterId: number) => void;
    onStartConversation: (userId: number) => void;
    currentUser: User;
}

const StoryReaderPage: React.FC<StoryReaderPageProps> = ({ story, onExit, onViewCharacter, onStartConversation, currentUser }) => {
    const publishedChapters = story.chapters.filter(c => c.status === 'Published');
    const author = allUsers.find(u => u.id === story.authorId);
    const isOwnStory = story.authorId === currentUser.id;
    
    const codex = useMemo(() => {
        const map = new Map<string, CodexItem>();
        story.cast.forEach(castMember => {
            const character = allCharacters.find(c => c.id === castMember.characterId);
            if (character) {
                map.set(character.name.toLowerCase(), { type: 'character', data: character });
            }
        });
        story.lorebook.forEach(loreItem => {
            map.set(loreItem.name.toLowerCase(), { type: 'lore', data: loreItem });
        });
        return map;
    }, [story]);
    
    return (
        <div className="min-h-screen animate-fadeIn bg-gray-900 text-gray-300 transition-colors duration-300">
            <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-lg border-b border-violet-500/30">
                <button onClick={onExit} className="flex items-center gap-1.5 text-white bg-black/30 px-3 py-1.5 rounded-full hover:bg-black/50 transition-colors">
                    <ArrowLeftIcon />
                    <span className="text-sm font-medium">Exit</span>
                </button>
                <div className="text-center min-w-0">
                    <h1 className="text-xl font-bold text-white truncate">{story.name}</h1>
                </div>
                <div className="w-20 flex justify-end">
                    <ShareButton 
                        title={`Read ${story.name}`}
                        text={`Read "${story.name}" on Spark Zone! ${story.synopsis}`}
                        iconOnly
                        className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"
                    />
                </div>
            </header>
            
            <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold text-white">{story.name}</h1>
                     <p className="text-lg text-gray-400 mt-2">
                        A story by {author ? author.name : 'Unknown Author'}
                        {!isOwnStory && author && (
                            <button onClick={() => onStartConversation(story.authorId)} className="ml-4 px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/20 rounded-full hover:bg-cyan-500/30 transition-colors">
                                Message Author
                            </button>
                        )}
                    </p>
                </div>

                <div className="space-y-12">
                    {publishedChapters.map(chapter => (
                        <article key={chapter.id}>
                            <h2 className="text-3xl font-bold text-cyan-400 mb-6 pb-2 border-b-2 border-violet-500/30">{chapter.title}</h2>
                            <div className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                                <InteractiveText text={chapter.content} codex={codex} onViewCharacter={onViewCharacter} />
                            </div>
                        </article>
                    ))}

                    {publishedChapters.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-lg">This story doesn't have any published chapters yet.</p>
                            <p>Check back later!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StoryReaderPage;
