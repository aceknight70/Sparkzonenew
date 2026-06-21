
import React, { useState } from 'react';
import { Community, User, Post, UserCreation } from '../types';
import UserAvatar from '../components/UserAvatar';
import PostCard from '../components/PostCard';
import CreationCard from '../components/CreationCard';
import ShareButton from '../components/ShareButton';

const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.28l1.383 1.382 1.966-1.966a.75.75 0 111.06 1.06l-1.965 1.967 1.382 1.382h.28a.75.75 0 010 1.5h-.28l-1.382 1.382 1.966 1.966a.75.75 0 01-1.06 1.061l-1.967-1.967-1.382 1.383v.28a.75.75 0 01-1.5 0v-.28l-1.382-1.383-1.966 1.967a.75.75 0 01-1.061-1.06l1.967-1.967-1.382-1.382h-.28a.75.75 0 010-1.5h.28l1.383-1.382-1.967-1.966a.75.75 0 111.06-1.06l1.966 1.966 1.383-1.382V2.75A.75.75 0 0110 2zM10 6.25a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5z" clipRule="evenodd" /></svg>;

interface CommunityPageProps {
    community: Community;
    onExit: () => void;
    currentUser: User;
    onJoin: () => void;
    onLeave: () => void;
    onSparkPost: (postId: number) => void;
    onCommentPost: (postId: number) => void;
    allUsers: User[];
}

type Tab = 'overview' | 'bulletin' | 'showcase' | 'members';

const CommunityPage: React.FC<CommunityPageProps> = ({ community, onExit, currentUser, onJoin, onLeave, onSparkPost, onCommentPost, allUsers }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const isMember = community.members.some(m => m.userId === currentUser.id);

    const leader = allUsers.find(u => u.id === community.leaderId);

    return (
        <div className="h-full w-full bg-black overflow-y-auto animate-fadeIn pb-20 md:pb-0">
            {/* Header Banner */}
            <div className="h-48 md:h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${community.bannerUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black"></div>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <button onClick={onExit} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md">
                        <ArrowLeftIcon />
                    </button>
                    <ShareButton 
                        title={`Join ${community.name}`}
                        text={`Check out the ${community.name} community on Spark Zone! ${community.description}`}
                        className="bg-black/50 text-white px-3 py-1.5 rounded-full hover:bg-black/70 backdrop-blur-md text-sm font-semibold"
                    />
                </div>
            </div>

            <div className="container mx-auto max-w-5xl px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-6">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-black shadow-2xl bg-gray-800">
                        <img src={community.imageUrl} alt={community.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-2">{community.name}</h1>
                        <p className="text-cyan-400 font-mono font-bold text-lg mb-2">{community.tag}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">
                                Lvl {community.level}
                            </span>
                            {community.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {isMember ? (
                            <button onClick={onLeave} className="px-6 py-2 rounded-full border border-red-500/50 text-red-400 hover:bg-red-950/30 transition-colors font-bold text-sm">
                                Leave
                            </button>
                        ) : (
                            <button onClick={onJoin} className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all font-bold">
                                Join Community
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'bulletin', label: 'Bulletin' },
                        { id: 'showcase', label: 'Showcase' },
                        { id: 'members', label: 'Members' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="animate-fadeIn">
                    {activeTab === 'overview' && (
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4">About Us</h3>
                                    <p className="text-gray-300 leading-relaxed">{community.description}</p>
                                </div>
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-4 bg-black/20 rounded-lg">
                                            <div className="text-2xl font-bold text-white">{community.members.length}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">Members</div>
                                        </div>
                                        <div className="p-4 bg-black/20 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-400">{community.xp}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">XP</div>
                                        </div>
                                        <div className="p-4 bg-black/20 rounded-lg">
                                            <div className="text-2xl font-bold text-cyan-400">{community.showcase.length}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">Creations</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-white/5">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Leadership</h3>
                                    {leader && (
                                        <div className="flex items-center gap-3">
                                            <UserAvatar src={leader.avatarUrl} size="10" />
                                            <div>
                                                <p className="font-bold text-white">{leader.name}</p>
                                                <p className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                                                    <ShieldCheckIcon /> Leader
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bulletin' && (
                        <div className="max-w-2xl mx-auto">
                            {community.feed.length > 0 ? (
                                community.feed.map(post => (
                                    <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        currentUser={currentUser} 
                                        onSpark={onSparkPost} 
                                        onComment={onCommentPost}
                                        onStartConversation={() => {}}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>The bulletin board is empty.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'showcase' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {community.showcase.map(creation => (
                                <CreationCard key={creation.id} creation={creation} />
                            ))}
                            {community.showcase.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    <p>No creations pinned yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="bg-gray-900/50 rounded-xl border border-white/5 overflow-hidden">
                            {community.members.map((member, i) => {
                                const user = allUsers.find(u => u.id === member.userId);
                                if (!user) return null;
                                return (
                                    <div key={member.userId} className={`flex items-center justify-between p-4 ${i !== community.members.length - 1 ? 'border-b border-white/5' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <UserAvatar src={user.avatarUrl} size="10" />
                                            <div>
                                                <p className="font-bold text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500">Joined {member.joinedAt}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${member.role === 'Leader' ? 'bg-yellow-500/20 text-yellow-400' : member.role === 'Officer' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'}`}>
                                            {member.role}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
