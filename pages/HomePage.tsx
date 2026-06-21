
import React, { useState, useEffect } from 'react';
import { trendingData, allUsers } from '../mockData';
import { TrendingItem, Post, UserCreation, User } from '../types';
import { currentUser } from '../mockData';
import UserAvatar from '../components/UserAvatar';
import PostCard from '../components/PostCard';
import CharacterSelectorModal from '../components/CharacterSelectorModal';
import PostCreationModal from '../components/PostCreationModal';
import DailySparkWidget from '../components/DailySparkWidget';

// --- Reusable Icon Components ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37z" clipRule="evenodd" /><path d="M5.5 4C6.328 4 7 4.672 7 5.5S6.328 7 5.5 7 4 6.328 4 5.5 4.672 4 5.5 4zM10 4c.828 0 1.5.672 1.5 1.5S10.828 7 10 7s-1.5-.672-1.5-1.5S9.172 4 10 4zM14.5 4c.828 0 1.5.672 1.5 1.5S15.328 7 14.5 7 13 6.328 13 5.5 13.672 4 14.5 4z" /></svg>;

// --- Helper Functions ---
const getRankTitle = (power: number) => {
    if (power < 1000) return "Novice";
    if (power < 1500) return "Apprentice";
    if (power < 2000) return "Duelist";
    if (power < 2500) return "Gladiator";
    if (power < 3000) return "Warlord";
    return "Grandmaster";
};

// --- Page Components ---

interface PostCreationBoxProps {
    onCreatePost: (content: string, character?: UserCreation) => void;
    userCreations: UserCreation[];
}

const PostCreationBox: React.FC<PostCreationBoxProps> = ({ onCreatePost, userCreations }) => {
    const [content, setContent] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedVoiceId, setSelectedVoiceId] = useState<number>(currentUser.id);
    
    const userCharacters = userCreations.filter(c => c.type === 'Character' || c.type === 'AI Character') as UserCreation[];
    
    const selectedVoice = selectedVoiceId === currentUser.id
        ? { ...currentUser, name: 'You', epithet: 'Yourself', imageUrl: currentUser.avatarUrl }
        : userCharacters.find(c => c.id === selectedVoiceId);
        
    const handleSubmit = () => {
        if (!content.trim()) return;
        const character = selectedVoiceId === currentUser.id ? undefined : userCharacters.find(c => c.id === selectedVoiceId);
        onCreatePost(content, character);
        setContent('');
    };

    return (
        <>
            <div className="hidden md:flex items-start gap-4 p-4 bg-gray-900/50 border border-violet-500/30 rounded-lg mb-6">
                <UserAvatar src={currentUser.avatarUrl} />
                <div className="flex-grow">
                    <textarea
                        className="w-full bg-transparent text-gray-300 placeholder-gray-500 focus:outline-none resize-none"
                        rows={2}
                        placeholder="Let a spark of creativity fly..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    <div className="text-sm mt-2 flex justify-between items-center">
                        <button onClick={() => setIsSelectorOpen(true)} className="flex items-center gap-2 bg-gray-800/60 border border-violet-500/50 rounded-full px-3 py-1 text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                             <UserAvatar src={selectedVoice?.imageUrl} size="6" />
                             <span className="text-sm font-medium">Posting As: {selectedVoice?.name}</span>
                        </button>
                         <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-full hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!content.trim()}>
                            Post
                        </button>
                    </div>
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
        </>
    );
};

const TrendingCard: React.FC<{ item: TrendingItem }> = ({ item }) => (
    <div className="flex-shrink-0 w-64 h-36 rounded-lg overflow-hidden relative group border border-violet-500/30 cursor-pointer">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 text-white">
            <span className={`text-xs font-bold px-2 py-1 rounded-full mb-1 inline-block ${item.type === 'Story' ? 'bg-cyan-500/80' : 'bg-violet-500/80'}`}>
                {item.type}
            </span>
            <h3 className="font-bold truncate">{item.title}</h3>
            <p className="text-sm text-gray-300">by {item.author}</p>
        </div>
    </div>
);

const ChampionCard: React.FC<{ user: User; rank: number }> = ({ user, rank }) => {
    const bp = user.sparkClashProfile?.battlePower || 1000;
    const rankColor = rank === 1 ? 'text-yellow-400 border-yellow-500/50 shadow-yellow-500/20' 
        : rank === 2 ? 'text-gray-300 border-gray-400/50' 
        : rank === 3 ? 'text-amber-600 border-amber-600/50' 
        : 'text-cyan-400 border-cyan-500/30';
    
    return (
        <div className={`flex-shrink-0 w-40 bg-gray-900/60 border rounded-xl p-4 flex flex-col items-center justify-center relative group hover:bg-gray-800/80 transition-all hover:-translate-y-1 ${rank === 1 ? 'shadow-lg' : ''} ${rankColor.split(' ')[1]}`}>
            <div className={`absolute top-2 left-2 font-black text-lg flex items-center gap-1 ${rankColor.split(' ')[0]}`}>
                {rank <= 3 && <TrophyIcon />} #{rank}
            </div>
            <UserAvatar src={user.avatarUrl} size="16" className={`mb-3 border-2 ${rank === 1 ? 'border-yellow-500' : 'border-transparent'}`} />
            <h3 className="font-bold text-white text-center truncate w-full px-1">{user.name}</h3>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">{getRankTitle(bp)}</p>
            <div className="text-white font-mono font-bold bg-black/40 px-3 py-1 rounded text-xs flex items-center gap-1">
                <span className="text-yellow-500">⚡</span> {bp}
            </div>
        </div>
    );
};

const ContentShelf: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-200 mb-3 px-4 md:px-0">{title}</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 px-4 md:px-0 scrollbar-hide">
            {children}
        </div>
    </div>
);

interface HomePageProps {
    posts: Post[];
    onCreatePost: (content: string, character?: UserCreation) => void;
    onSparkPost: (postId: number) => void;
    onCommentPost: (postId: number) => void;
    userCreations: UserCreation[];
    currentUser: User;
    onStartConversation: (userId: number) => void;
    onStartStoryWithPrompt?: (prompt: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ posts, onCreatePost, onSparkPost, onCommentPost, userCreations, currentUser, onStartConversation, onStartStoryWithPrompt }) => {
    const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
    const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [initialPostContent, setInitialPostContent] = useState('');

    useEffect(() => {
        const sortedData = [...trendingData].sort((a, b) => b.engagementScore - a.engagementScore);
        setTrendingItems(sortedData);
    }, []);

    const filteredPosts = activeTab === 'following' 
        ? posts.filter(post => currentUser.followingIds?.includes(post.author.id)) 
        : posts;

    const topPlayers = [...allUsers].sort((a, b) => (b.sparkClashProfile?.battlePower || 0) - (a.sparkClashProfile?.battlePower || 0)).slice(0, 5);

    const handlePromptPost = (prompt: string) => {
        setInitialPostContent(prompt);
        setIsPostModalOpen(true);
    };

    return (
        <div className="container mx-auto max-w-2xl px-0 md:px-4 py-4 animate-fadeIn h-full overflow-y-auto pb-20 md:pb-4">
            {/* Tabs */}
            <div className="px-4 md:px-0 mb-4 border-b border-violet-500/30">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('foryou')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'foryou' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
                    >
                        For You
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`py-2 px-4 font-semibold ${activeTab === 'following' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
                    >
                        Following
                    </button>
                </div>
            </div>

            {/* Daily Spark Widget */}
            <div className="px-4 md:px-0">
                <DailySparkWidget 
                    onPost={handlePromptPost}
                    onStory={(prompt) => onStartStoryWithPrompt?.(prompt)}
                />
            </div>

            <div className="md:px-0">
                <PostCreationBox onCreatePost={onCreatePost} userCreations={userCreations} />
            </div>

            {/* Content Shelves - only show on 'For You' tab */}
            {activeTab === 'foryou' && (
                <>
                    <ContentShelf title="Active Party Rooms">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-48 h-28 bg-gray-800/70 border border-violet-500/30 rounded-lg animate-pulse">
                                {/* Placeholder for party room card */}
                            </div>
                        ))}
                    </ContentShelf>

                    <ContentShelf title="Spark Clash Champions">
                        {topPlayers.map((u, i) => <ChampionCard key={u.id} user={u} rank={i + 1} />)}
                    </ContentShelf>

                    <ContentShelf title="Trending Now">
                        {trendingItems.map(item => <TrendingCard key={item.id} item={item} />)}
                    </ContentShelf>
                </>
            )}


            {/* Feed */}
            <div className="px-4 md:px-0">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post}
                            currentUser={currentUser}
                            onSpark={onSparkPost}
                            onComment={onCommentPost}
                            onStartConversation={onStartConversation}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <h3 className="text-lg font-semibold">Your 'Following' feed is empty</h3>
                        <p>Follow creators to see their posts here!</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Mobile */}
            <button
                onClick={() => { setInitialPostContent(''); setIsPostModalOpen(true); }}
                className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-cyan-500/40 transform hover:-translate-y-1 transition-all z-50">
                <PlusIcon />
            </button>
            
            <PostCreationModal
                isOpen={isPostModalOpen}
                onClose={() => { setIsPostModalOpen(false); setInitialPostContent(''); }}
                onCreatePost={onCreatePost}
                userCreations={userCreations}
                initialContent={initialPostContent}
            />
        </div>
    );
};

export default HomePage;
