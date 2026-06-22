
import React, { useState, useEffect } from 'react';
import { Page, World, Character, Story, Party, Conversation, Post, UserCreation, User, Notification, Message, Comment, Community, ShopItem, MessageType } from '../types';
import NavBar from '../components/NavBar';
import HomePage from './HomePage';
import ExplorePage from './ExplorePage';
import WorkshopPage from './WorkshopPage';
import PartyPage from './PartyPage';
import MessengerPage from './MessengerPage';
import ProfilePage from './ProfilePage';
import SparkClashPage from './SparkClashPage';
import LibraryPage from './LibraryPage';

// Firebase imports
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from '../FirebaseContext';
import { 
    collection, 
    doc, 
    query, 
    orderBy, 
    onSnapshot, 
    setDoc as firestoreSetDoc, 
    updateDoc as firestoreUpdateDoc, 
    where, 
    getDoc, 
    getDocs 
} from 'firebase/firestore';

const cleanUndefined = (obj: any): any => {
    if (obj === undefined || obj === null) return null;
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        return value === undefined ? null : value;
    }));
};

const setDoc = (reference: any, data: any, options?: any) => {
    return firestoreSetDoc(reference, cleanUndefined(data), options);
};

const updateDoc = (reference: any, data: any) => {
    return firestoreUpdateDoc(reference, cleanUndefined(data));
};

// Viewers
import WorldPage from './WorldPage';
import GroupChatView from '../components/GroupChatView';
import CharacterPage from './CharacterPage';
import StoryReaderPage from './StoryReaderPage';
import PartyViewPage from './PartyViewPage';
import CommunityPage from './CommunityPage';

// Editors / Creators
import WorldCreationPage from './WorldCreationPage';
import CharacterCreationPage from './CharacterCreationPage';
import StoryCreationPage from './StoryCreationPage';
import MemeCreationPage from './MemeCreationPage';
import WorldWorkshop from './WorldWorkshop';
import StoryWorkshopPage from './StoryWorkshopPage';
import PartyWorkshopPage from './PartyWorkshopPage';
import ProfileEditorPage from './ProfileEditorPage';
import CommunityCreationPage from './CommunityCreationPage';
import CommunityWorkshopPage from './CommunityWorkshopPage';

import SonicJukebox from '../components/SonicJukebox';
import CommentModal from '../components/CommentModal';
import ShopView from '../components/ShopView';

import { 
    currentUser as initialUser, 
    initialUserCreations, 
    posts as initialPosts, 
    conversations as initialConversations,
    allUsers as initialAllUsers,
    worlds as initialWorlds,
    stories as initialStories,
    parties as initialParties,
    characters as initialCharacters,
    comments as initialComments,
    communities as initialCommunities,
    mockNotifications
} from '../mockData';

type OverlayState = 
    | { type: 'world'; id: number | string }
    | { type: 'story-read'; id: number | string }
    | { type: 'story-edit'; id: number | string }
    | { type: 'party-view'; id: number | string }
    | { type: 'party-edit'; id: number | string }
    | { type: 'character-view'; id: number | string }
    | { type: 'character-edit'; id: number | string }
    | { type: 'world-edit'; id: number | string }
    | { type: 'world-create' }
    | { type: 'character-create' }
    | { type: 'story-create'; initialData?: { synopsis?: string, name?: string } }
    | { type: 'party-create' }
    | { type: 'meme-create' }
    | { type: 'profile-edit' }
    | { type: 'spark-clash' }
    | { type: 'comments'; postId: number | string }
    | { type: 'community'; id: number | string }
    | { type: 'community-create' }
    | { type: 'community-edit'; id: number | string }
    | { type: 'shop' };

const WorldOverlayView: React.FC<{
    world: World;
    onExit: () => void;
    currentUser: User;
    userCreations: UserCreation[];
    handleSendGroupMessage: (worldId: number, locationId: number, text: string, character?: UserCreation, imageUrl?: string, audioUrl?: string) => void;
    handleDeleteGroupMessage: (worldId: number, locationId: number, messageId: number) => void;
    handleSaveMeme: (meme: { name: string, imageUrl: string }) => void;
    onPlayMusic: (url: string | null) => void;
    onJoinWorld: (worldId: number) => void;
    onStartConversation: (participantId: number) => number;
    onEditWorld?: (worldId: number) => void;
}> = ({
    world,
    onExit,
    currentUser,
    userCreations,
    handleSendGroupMessage,
    handleDeleteGroupMessage,
    handleSaveMeme,
    onPlayMusic,
    onJoinWorld,
    onStartConversation,
    onEditWorld,
}) => {
    const [currentView, setCurrentView] = useState<'World Home' | 'Channel Chat'>('World Home');
    const [activeLocationId, setActiveLocationId] = useState<number | null>(null);

    const activeLocation = world.locations
        .flatMap(cat => cat.channels)
        .find(chan => chan.id === activeLocationId);

    const handleSelectLocationId = (id: number | null) => {
        if (id === null) {
            setActiveLocationId(null);
            setCurrentView('World Home');
        } else {
            setActiveLocationId(id);
            setCurrentView('Channel Chat');
        }
    };

    if (currentView === 'Channel Chat' && activeLocation) {
        return (
            <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-hidden">
                <GroupChatView 
                    key={activeLocation.id} 
                    location={activeLocation} 
                    world={world}
                    onBack={() => {
                        setActiveLocationId(null);
                        setCurrentView('World Home');
                    }}
                    onSendMessage={handleSendGroupMessage}
                    onDeleteMessage={handleDeleteGroupMessage}
                    userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                    onSaveMeme={handleSaveMeme}
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-hidden">
            <WorldPage
                world={world}
                onExit={onExit}
                activeLocationId={null}
                onSelectLocationId={handleSelectLocationId}
                onSendGroupMessage={handleSendGroupMessage}
                onDeleteGroupMessage={handleDeleteGroupMessage}
                userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                onStartConversation={onStartConversation}
                currentUser={currentUser}
                onSaveMeme={handleSaveMeme}
                onPlayMusic={onPlayMusic}
                onJoinWorld={onJoinWorld}
                onEditWorld={onEditWorld}
            />
        </div>
    );
};

const MainApp: React.FC = () => {
    const { firebaseUser, currentUserProfile, logout, isOffline } = useFirebase();
    const [activePage, setActivePage] = useState<Page>(Page.Home);
    const [overlay, setOverlay] = useState<OverlayState | null>(null);
    
    
    // Data State
    const [currentUser, setCurrentUser] = useState<User>(initialUser);
    const [users, setUsers] = useState<User[]>(initialAllUsers);
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [allComments, setAllComments] = useState<Comment[]>(initialComments);
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [userCreations, setUserCreations] = useState<UserCreation[]>(initialUserCreations);
    const [worlds, setWorlds] = useState<World[]>(initialWorlds);
    const [stories, setStories] = useState<Story[]>(initialStories);
    const [parties, setParties] = useState<Party[]>(initialParties);
    const [characters, setCharacters] = useState<Character[]>(initialCharacters);
    const [communities, setCommunities] = useState<Community[]>(initialCommunities);
    const [memes, setMemes] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

    // Global Music State
    const [bgMusic, setBgMusic] = useState<string | null>(null);

    // Sync with Firebase Context Profile
    useEffect(() => {
        if (currentUserProfile) {
            setCurrentUser(currentUserProfile);
        }
    }, [currentUserProfile]);

    // Sync global users profiles
    useEffect(() => {
        if (isOffline) return;
        if (!firebaseUser) return;
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList: User[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                usersList.push({
                    id: docSnap.id as any,
                    name: data.name || 'Spark Star',
                    avatarUrl: data.avatarUrl || '',
                    bannerUrl: data.bannerUrl || '',
                    bio: data.bio || '',
                    isPremium: data.isPremium || false,
                    pronouns: data.pronouns || '',
                    age: data.age || undefined,
                    gender: data.gender || '',
                    nationality: data.nationality || '',
                    communityIds: data.communityIds || [],
                    followingIds: data.followingIds || [],
                    sparkClashProfile: data.sparkClashProfile || { 
                        battlePower: 1000, sparks: 100, wins: 0, losses: 0,
                        inventory: [], templates: [], decks: []
                    }
                });
            });
            if (usersList.length > 0) {
                setUsers(usersList);
                if (firebaseUser) {
                    const updatedMe = usersList.find(u => String(u.id) === String(firebaseUser.uid));
                    if (updatedMe) {
                        setCurrentUser(updatedMe);
                    }
                }
            }
        }, (err) => {
            handleFirestoreError(err, OperationType.GET, 'users');
        });
        return () => unsubscribe();
    }, [isOffline, firebaseUser]);

    // Sync posts
    useEffect(() => {
        if (isOffline) return;
        if (!firebaseUser) return;
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsList: Post[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                postsList.push({
                    id: isNaN(Number(docSnap.id)) ? docSnap.id as any : Number(docSnap.id),
                    author: {
                        id: data.authorId,
                        name: data.authorName,
                        avatarUrl: data.authorAvatarUrl,
                    } as any,
                    content: data.content,
                    timestamp: data.timestamp || 'Just now',
                    sparks: data.sparks || 0,
                    sparkedBy: data.sparkedBy || [],
                    comments: data.commentsCount || 0,
                    media: data.mediaUrl ? { type: data.mediaType || 'image', url: data.mediaUrl } : undefined,
                    character: data.characterId ? {
                        id: data.characterId,
                        name: data.characterName,
                        imageUrl: data.characterImageUrl,
                        type: 'Character',
                        status: 'Published',
                        authorId: data.authorId
                    } : undefined
                });
            });
            if (postsList.length > 0) {
                setPosts(postsList);
            }
        }, (err) => {
            handleFirestoreError(err, OperationType.GET, 'posts');
        });
        return () => unsubscribe();
    }, [isOffline, firebaseUser]);

    // Sync comments
    useEffect(() => {
        if (isOffline) return;
        if (!firebaseUser) return;
        const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsList: Comment[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                commentsList.push({
                    id: isNaN(Number(docSnap.id)) ? docSnap.id as any : Number(docSnap.id),
                    postId: isNaN(Number(data.postId)) ? data.postId as any : Number(data.postId),
                    author: {
                        id: data.authorId,
                        name: data.authorName,
                        avatarUrl: data.authorAvatarUrl,
                    } as any,
                    content: data.content,
                    timestamp: data.timestamp || 'Just now',
                    sparks: data.sparks || 0,
                    sparkedBy: data.sparkedBy || [],
                    character: data.characterId ? {
                        id: data.characterId,
                        name: data.characterName,
                        imageUrl: data.characterImageUrl,
                        type: 'Character',
                        status: 'Published',
                        authorId: data.authorId
                    } : undefined
                });
            });
            if (commentsList.length > 0) {
                setAllComments(commentsList);
            }
        }, (err) => {
            handleFirestoreError(err, OperationType.GET, 'comments');
        });
        return () => unsubscribe();
    }, [isOffline, firebaseUser]);

    // Sync creations (Worlds, Characters, Stories, Parties, Communities, Memes)
    useEffect(() => {
        if (isOffline) return;
        if (!firebaseUser) return;
        const collectionsToSync = [
            { name: 'worlds', setter: setWorlds, initial: initialWorlds },
            { name: 'characters', setter: setCharacters, initial: initialCharacters },
            { name: 'stories', setter: setStories, initial: initialStories },
            { name: 'parties', setter: setParties, initial: initialParties },
            { name: 'communities', setter: setCommunities, initial: initialCommunities },
            { name: 'memes', setter: setMemes, initial: [] }
        ];

        const unsubscribes = collectionsToSync.map(coll => {
            const q = query(collection(db, coll.name));
            return onSnapshot(q, (snapshot) => {
                const list: any[] = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const parsedId = isNaN(Number(docSnap.id)) ? docSnap.id : Number(docSnap.id);
                    list.push({
                        ...data,
                        id: parsedId,
                        authorId: isNaN(Number(data.authorId)) ? data.authorId : Number(data.authorId)
                    });
                });

                // Merge initial reference mock data with Firestore data to keep it rich and instantly ready for use
                const mergedMap = new Map();
                coll.initial.forEach((item: any) => {
                    mergedMap.set(String(item.id), item);
                });
                list.forEach((item: any) => {
                    mergedMap.set(String(item.id), item);
                });

                coll.setter(Array.from(mergedMap.values()));
            }, (err) => {
                handleFirestoreError(err, OperationType.GET, coll.name);
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [isOffline, firebaseUser]);

    // Sync creations list (Worlds + Characters + Stories + Parties/RP Cards + Communities + Memes merge)
    useEffect(() => {
        const mergedCreations: UserCreation[] = [];
        worlds.forEach(w => mergedCreations.push({ ...w, type: 'World' as const, status: 'Published' as const }));
        characters.forEach(c => mergedCreations.push({ ...c, type: 'Character' as const, status: 'Published' as const }));
        stories.forEach(s => mergedCreations.push({ ...s, type: 'Story' as const, status: 'Published' as const }));
        parties.forEach(p => mergedCreations.push({ 
            id: p.id,
            type: 'RP Card' as const,
            name: p.name,
            imageUrl: p.imageUrl,
            status: 'Active' as const,
            authorId: p.authorId,
            contentMetadata: p.contentMetadata
        }));
        communities.forEach(c => mergedCreations.push({
            id: c.id,
            type: 'Community' as const,
            name: c.name,
            imageUrl: c.imageUrl,
            status: 'Active' as const,
            authorId: c.leaderId
        }));
        memes.forEach(m => mergedCreations.push({
            id: m.id,
            type: 'Meme' as const,
            name: m.name,
            imageUrl: m.imageUrl,
            status: 'Published' as const,
            authorId: m.authorId
        }));
        
        if (mergedCreations.length > 0) {
            setUserCreations(mergedCreations);
        }
    }, [worlds, characters, stories, parties, communities, memes]);

    // Sync conversations (DM list) for the authenticated user
    useEffect(() => {
        if (isOffline || !currentUser || !currentUser.id) return;
        // Strict guard: in online mode, do not run until our local user profile has fully transitioned from mock ID "1" to the authenticated UID
        if (!isOffline && firebaseUser && currentUser.id.toString() !== firebaseUser.uid) {
            return;
        }

        const q = query(
            collection(db, 'conversations'), 
            where('participantIds', 'array-contains', currentUser.id.toString())
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                const conversationsList: Conversation[] = [];
                for (const docSnap of snapshot.docs) {
                    const data = docSnap.data();
                    
                    // Get other participant profile
                    const otherUid = data.participantIds.find((id: string) => id !== currentUser.id.toString());
                    const otherUserSnap = await getDoc(doc(db, 'users', otherUid));
                    const otherUserData = otherUserSnap.exists() 
                        ? otherUserSnap.data() as User 
                        : users.find(u => u.id.toString() === otherUid) || { id: otherUid as any, name: 'Other User', avatarUrl: '' };

                    // Now listen to the messages subcollection for this conversation
                    const msgQ = query(collection(db, `conversations/${docSnap.id}/messages`), orderBy('createdAt', 'asc'));
                    const messagesSnap = await getDocs(msgQ);
                    const messages: Message[] = [];
                    messagesSnap.forEach(msgDoc => {
                        const msgData = msgDoc.data();
                        messages.push({
                            id: Number(msgData.id),
                            text: msgData.text,
                            timestamp: msgData.timestamp,
                            senderId: msgData.senderId as any,
                            type: msgData.type || 'text',
                            imageUrl: msgData.imageUrl,
                            audioUrl: msgData.audioUrl,
                            character: msgData.characterId ? {
                                id: msgData.characterId,
                                name: msgData.characterName,
                                imageUrl: msgData.characterImageUrl,
                                type: 'Character',
                                status: 'Published',
                                authorId: msgData.senderId
                            } : undefined,
                            metadata: msgData.metadata
                        });
                    });

                    conversationsList.push({
                        id: isNaN(Number(docSnap.id)) ? docSnap.id as any : Number(docSnap.id),
                        participant: otherUserData as User,
                        messages,
                        unreadCount: data.unreadCount || 0,
                        typing: data.typing || {}
                    });
                }

                if (conversationsList.length > 0) {
                    setConversations(conversationsList);
                }
            } catch (err) {
                handleFirestoreError(err, OperationType.GET, 'conversations_subcollection');
            }
        }, (err) => {
            handleFirestoreError(err, OperationType.GET, 'conversations');
        });

        return () => unsubscribe();
    }, [currentUser, users, isOffline, firebaseUser]);

    // --- Actions ---

    const handleCreatePost = async (content: string, character?: UserCreation, media?: { type: 'image' | 'video', url: string }) => {
        if (isOffline) {
            const newPost: Post = {
                id: Date.now(),
                author: currentUser,
                character,
                timestamp: 'Just now',
                content,
                media,
                sparks: 0,
                sparkedBy: [],
                comments: 0
            };
            setPosts([newPost, ...posts]);
            return;
        }

        const id = Date.now().toString();
        const path = `posts/${id}`;
        const newPostData = {
            id,
            authorId: currentUser.id.toString(),
            authorName: currentUser.name,
            authorAvatarUrl: currentUser.avatarUrl,
            characterId: character?.id.toString() || '',
            characterName: character?.name || '',
            characterImageUrl: character?.imageUrl || '',
            content,
            mediaUrl: media?.url || '',
            mediaType: media?.type || '',
            sparks: 0,
            sparkedBy: [],
            commentsCount: 0,
            timestamp: 'Just now',
            createdAt: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, 'posts', id), newPostData);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
        }
    };

    const handleSparkPost = async (postId: number | string) => {
        if (isOffline) {
            setPosts(posts.map(p => {
                if (p.id.toString() === postId.toString()) {
                    const isSparked = p.sparkedBy.includes(currentUser.id as any);
                    return {
                        ...p,
                        sparks: isSparked ? p.sparks - 1 : p.sparks + 1,
                        sparkedBy: isSparked 
                            ? p.sparkedBy.filter(id => id !== (currentUser.id as any)) 
                            : [...p.sparkedBy, currentUser.id]
                    } as Post;
                }
                return p;
            }));
            return;
        }

        const postStringId = postId.toString();
        const postRef = doc(db, 'posts', postStringId);
        const post = posts.find(p => p.id.toString() === postStringId);
        if (!post) return;

        const isSparked = post.sparkedBy.includes(currentUser.id as any);
        const newSparkedBy = isSparked 
            ? post.sparkedBy.filter(id => id !== (currentUser.id as any))
            : [...post.sparkedBy, currentUser.id];

        const nextSparks = isSparked ? post.sparks - 1 : post.sparks + 1;

        try {
            await updateDoc(postRef, {
                sparks: nextSparks,
                sparkedBy: newSparkedBy
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `posts/${postStringId}`);
        }
    };

    const handleCommentPost = (postId: number) => {
        setOverlay({ type: 'comments', postId });
    };

    const handleAddComment = async (postId: number | string, content: string, character?: UserCreation) => {
        if (isOffline) {
            const newComment: Comment = {
                id: Date.now(),
                postId: postId as any,
                author: currentUser,
                character,
                content,
                timestamp: 'Just now',
                sparks: 0,
                sparkedBy: []
            };
            setAllComments([newComment, ...allComments]);
            setPosts(posts.map(p => p.id.toString() === postId.toString() ? { ...p, comments: (p.comments || 0) + 1 } : p));
            return;
        }

        const commentId = Date.now().toString();
        const path = `comments/${commentId}`;
        const newCommentData = {
            id: commentId,
            postId: postId.toString(),
            authorId: currentUser.id.toString(),
            authorName: currentUser.name,
            authorAvatarUrl: currentUser.avatarUrl,
            characterId: character?.id.toString() || '',
            characterName: character?.name || '',
            characterImageUrl: character?.imageUrl || '',
            content,
            sparks: 0,
            sparkedBy: [],
            timestamp: 'Just now',
            createdAt: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, 'comments', commentId), newCommentData);
            
            // Increment comments count inside post doc
            const postRef = doc(db, 'posts', postId.toString());
            const post = posts.find(p => p.id.toString() === postId.toString());
            if (post) {
                await updateDoc(postRef, {
                    commentsCount: (post.comments || 0) + 1
                });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
        }
    };

    const handleSparkComment = async (commentId: number | string) => {
        if (isOffline) {
            setAllComments(allComments.map(c => {
                if (c.id.toString() === commentId.toString()) {
                    const isSparked = c.sparkedBy.includes(currentUser.id as any);
                    return {
                        ...c,
                        sparks: isSparked ? c.sparks - 1 : c.sparks + 1,
                        sparkedBy: isSparked 
                            ? c.sparkedBy.filter(id => id !== (currentUser.id as any)) 
                            : [...c.sparkedBy, currentUser.id]
                    } as Comment;
                }
                return c;
            }));
            return;
        }

        const commentStringId = commentId.toString();
        const commentRef = doc(db, 'comments', commentStringId);
        const comment = allComments.find(c => c.id.toString() === commentStringId);
        if (!comment) return;

        const isSparked = comment.sparkedBy.includes(currentUser.id as any);
        const newSparkedBy = isSparked 
            ? comment.sparkedBy.filter(id => id !== (currentUser.id as any))
            : [...comment.sparkedBy, currentUser.id];

        const nextSparks = isSparked ? comment.sparks - 1 : comment.sparks + 1;

        try {
            await updateDoc(commentRef, {
                sparks: nextSparks,
                sparkedBy: newSparkedBy
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `comments/${commentStringId}`);
        }
    };

    const handleStartConversation = async (userId: number | string) => {
        const userIdStr = userId.toString();
        // Check if a conversation between these two already exists
        const existingConvo = conversations.find(c => c.participant.id.toString() === userIdStr);
        if (existingConvo) {
            setOverlay(null); 
            setActivePage(Page.Messenger);
            return;
        }

        if (isOffline) {
            const user = users.find(u => u.id.toString() === userIdStr);
            if (user) {
                const newConvo: Conversation = {
                    id: Date.now(),
                    participant: user,
                    messages: [],
                    unreadCount: 0
                };
                setConversations([newConvo, ...conversations]);
                setOverlay(null);
                setActivePage(Page.Messenger);
            }
            return;
        }

        const convoId = Date.now().toString();
        const participantIds = [currentUser.id.toString(), userIdStr].sort(); // Unique sorting to avoid duplicates
        const path = `conversations/${convoId}`;

        const newConvoData = {
            id: convoId,
            participantIds,
            updatedAt: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, 'conversations', convoId), newConvoData);
            setOverlay(null);
            setActivePage(Page.Messenger);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
        }
    };

    const handleSendMessage = async (conversationId: number | string, text: string, character?: UserCreation, imageUrl?: string, audioUrl?: string, type: MessageType = 'text', metadata?: any) => {
        if (isOffline) {
            setConversations(conversations.map(c => {
                if (c.id.toString() === conversationId.toString()) {
                    const newMessage: Message = {
                        id: Date.now(),
                        text,
                        senderId: currentUser.id,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        character,
                        imageUrl,
                        audioUrl,
                        type,
                        metadata
                    };
                    return { ...c, messages: [...c.messages, newMessage] };
                }
                return c;
            }));
            return;
        }

        const msgId = Date.now().toString();
        const convoIdStr = conversationId.toString();
        const path = `conversations/${convoIdStr}/messages/${msgId}`;

        const messageData = {
            id: msgId,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderId: currentUser.id.toString(),
            senderName: currentUser.name,
            senderAvatarUrl: currentUser.avatarUrl,
            characterId: character?.id.toString() || '',
            characterName: character?.name || '',
            characterImageUrl: character?.imageUrl || '',
            type,
            imageUrl: imageUrl || '',
            audioUrl: audioUrl || '',
            metadata: metadata || {},
            createdAt: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, `conversations/${convoIdStr}/messages`, msgId), messageData);
            
            // Update last activity timestamp on target conversation document
            await updateDoc(doc(db, 'conversations', convoIdStr), {
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
        }
    };

    const handleDeleteMessage = async (conversationId: number | string, messageId: number | string) => {
        if (isOffline) {
            setConversations(conversations.map(c => {
                if (c.id.toString() === conversationId.toString()) {
                    return { ...c, messages: c.messages.filter(m => m.id.toString() !== messageId.toString()) };
                }
                return c;
            }));
            return;
        }

        const convoIdStr = conversationId.toString();
        const msgIdStr = messageId.toString();
        const path = `conversations/${convoIdStr}/messages/${msgIdStr}`;

        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, `conversations/${convoIdStr}/messages`, msgIdStr));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, path);
        }
    };

    const handleSetTyping = async (conversationId: number | string, isTyping: boolean) => {
        if (isOffline) {
            setConversations(prev => prev.map(c => {
                if (c.id.toString() === conversationId.toString()) {
                    return {
                        ...c,
                        typing: {
                            ...(c.typing || {}),
                            [currentUser.id.toString()]: isTyping
                        }
                    };
                }
                return c;
            }));
            return;
        }

        const convoIdStr = conversationId.toString();
        const path = `conversations/${convoIdStr}`;
        try {
            await updateDoc(doc(db, 'conversations', convoIdStr), {
                [`typing.${currentUser.id.toString()}`]: isTyping
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
        }
    };

    const pruneWorldMessages = (w: any) => {
        if (!w) return w;
        
        const cleanMembers = w.members ? w.members.map((m: any) => ({
            id: m.id,
            name: m.name || 'Anonymous Creator',
            avatarUrl: m.avatarUrl || '',
            role: m.role || 'Member',
            bio: m.bio || '',
            pronouns: m.pronouns || ''
        })) : [];

        return {
            ...w,
            members: cleanMembers,
            locations: w.locations ? w.locations.map((cat: any) => ({
                ...cat,
                channels: cat.channels ? cat.channels.map((chan: any) => {
                    const messages = chan.messages || [];
                    // Keep the last 20 messages for Firestore document size safety
                    const limited = messages.length > 20 ? messages.slice(messages.length - 20) : messages;
                    const pruned = limited.map((m: any) => ({
                        id: m.id,
                        text: m.text,
                        timestamp: m.timestamp,
                        sender: m.sender ? {
                            id: m.sender.id,
                            name: m.sender.name || 'Anonymous Creator',
                            avatarUrl: m.sender.avatarUrl || '',
                            role: m.sender.role || 'Member'
                        } : { id: 0, name: 'Anonymous', avatarUrl: '', role: 'Member' },
                        character: m.character ? {
                            id: m.character.id,
                            name: m.character.name,
                            imageUrl: m.character.imageUrl || ''
                        } : undefined,
                        imageUrl: m.imageUrl || '',
                        audioUrl: m.audioUrl || ''
                    }));
                    return {
                        ...chan,
                        messages: pruned
                    };
                }) : []
            })) : []
        };
    };

    const pruneParty = (p: any) => {
        if (!p) return p;

        const cleanMembers = p.members ? p.members.map((m: any) => ({
            id: m.id,
            name: m.name || 'Anonymous Creator',
            avatarUrl: m.avatarUrl || '',
            role: m.role || 'Member',
            bio: m.bio || '',
            pronouns: m.pronouns || ''
        })) : [];

        const chat = p.chat || [];
        // Keep the last 20 messages for Firestore document size safety
        const limitedChat = chat.length > 20 ? chat.slice(chat.length - 20) : chat;
        const prunedChat = limitedChat.map((m: any) => ({
            id: m.id,
            text: m.text,
            timestamp: m.timestamp,
            sender: m.sender ? {
                id: m.sender.id,
                name: m.sender.name || 'Anonymous Creator',
                avatarUrl: m.sender.avatarUrl || '',
                isHost: !!m.sender.isHost
            } : { id: 0, name: 'Anonymous', avatarUrl: '', isHost: false },
            character: m.character ? {
                id: m.character.id,
                name: m.character.name,
                imageUrl: m.character.imageUrl || ''
            } : undefined,
            roll: m.roll || null,
            imageUrl: m.imageUrl || '',
            audioUrl: m.audioUrl || ''
        }));

        return {
            ...p,
            members: cleanMembers,
            chat: prunedChat
        };
    };

    const handleSendGroupMessage = async (worldId: number | string, locationId: number | string, text: string, character?: UserCreation, imageUrl?: string, audioUrl?: string) => {
        const newMessage = {
            id: Date.now(),
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: { ...currentUser, role: 'Member' as any },
            character,
            imageUrl: imageUrl || '',
            audioUrl: audioUrl || ''
        };

        if (isOffline) {
            setWorlds(prev => prev.map(w => {
                if (String(w.id) === String(worldId)) {
                    const newLocations = w.locations.map(cat => ({
                        ...cat,
                        channels: cat.channels.map(chan => {
                            if (String(chan.id) === String(locationId)) {
                                return {
                                    ...chan,
                                    messages: [...chan.messages, newMessage]
                                };
                            }
                            return chan;
                        })
                    }));
                    return pruneWorldMessages({ ...w, locations: newLocations });
                }
                return w;
            }));
        } else {
            const targetWorld = worlds.find(w => String(w.id) === String(worldId));
            if (!targetWorld) return;
            const newLocations = targetWorld.locations.map(cat => ({
                ...cat,
                channels: cat.channels.map(chan => {
                    if (String(chan.id) === String(locationId)) {
                        return {
                            ...chan,
                            messages: [...chan.messages, newMessage]
                        };
                    }
                    return chan;
                })
            }));
            const updatedWorld = pruneWorldMessages({ ...targetWorld, locations: newLocations });
            try {
                await setDoc(doc(db, 'worlds', String(worldId)), updatedWorld);
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `worlds/${worldId}`);
            }
        }
    };

    const handleDeleteGroupMessage = async (worldId: number | string, locationId: number | string, messageId: number | string) => {
        if (isOffline) {
            setWorlds(prev => prev.map(w => {
                if (String(w.id) === String(worldId)) {
                    const newLocations = w.locations.map(cat => ({
                        ...cat,
                        channels: cat.channels.map(chan => {
                            if (String(chan.id) === String(locationId)) {
                                return {
                                    ...chan,
                                    messages: chan.messages.filter(m => String(m.id) !== String(messageId))
                                };
                            }
                            return chan;
                        })
                    }));
                    return pruneWorldMessages({ ...w, locations: newLocations });
                }
                return w;
            }));
        } else {
            const targetWorld = worlds.find(w => String(w.id) === String(worldId));
            if (!targetWorld) return;
            const newLocations = targetWorld.locations.map(cat => ({
                ...cat,
                channels: cat.channels.map(chan => {
                    if (String(chan.id) === String(locationId)) {
                        return {
                            ...chan,
                            messages: chan.messages.filter(m => String(m.id) !== String(messageId))
                        };
                    }
                    return chan;
                })
            }));
            const updatedWorld = pruneWorldMessages({ ...targetWorld, locations: newLocations });
            try {
                await setDoc(doc(db, 'worlds', String(worldId)), updatedWorld);
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `worlds/${worldId}`);
            }
        }
    };

    const handleSendPartyMessage = async (partyId: number | string, text: string, character?: UserCreation, imageUrl?: string, audioUrl?: string) => {
        let roll = undefined;
        // Match patterns like: /roll 1d20, /roll d20, /roll 2d6+4, /roll d100-5, /roll 1d10 - 2
        const rollMatch = text.trim().match(/^\/roll\s+(\d*)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
        if (rollMatch) {
            const count = parseInt(rollMatch[1]) || 1;
            const sides = parseInt(rollMatch[2]);
            const sign = rollMatch[3] || '+';
            const modValue = rollMatch[4] ? parseInt(rollMatch[4]) : 0;
            const modifier = sign === '-' ? -modValue : modValue;
            
            const rolls = Array.from({length: count}, () => Math.floor(Math.random() * sides) + 1);
            const total = rolls.reduce((a, b) => a + b, 0) + modifier;
            roll = { command: text.trim(), rolls, modifier, total };
        }

        const newMessageItem = {
            id: Date.now(),
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: { ...currentUser, isHost: false },
            character,
            roll,
            imageUrl: imageUrl || '',
            audioUrl: audioUrl || ''
        };

        if (isOffline) {
            setParties(prev => prev.map(p => {
                if (String(p.id) === String(partyId)) {
                    newMessageItem.sender.isHost = String(p.hostId) === String(currentUser.id);
                    return {
                        ...p,
                        chat: [...p.chat, newMessageItem]
                    };
                }
                return p;
            }));
        } else {
            const targetParty = parties.find(p => String(p.id) === String(partyId));
            if (!targetParty) return;
            newMessageItem.sender.isHost = String(targetParty.hostId) === String(currentUser.id);
            const updatedParty = pruneParty({
                ...targetParty,
                chat: [...targetParty.chat, newMessageItem]
            });
            try {
                await setDoc(doc(db, 'parties', String(partyId)), updatedParty);
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `parties/${partyId}`);
            }
        }
    };

    const handleDeletePartyMessage = async (partyId: number | string, messageId: number | string) => {
        if (isOffline) {
            setParties(prev => prev.map(p => {
                if (String(p.id) === String(partyId)) {
                    return {
                        ...p,
                        chat: p.chat.filter(m => String(m.id) !== String(messageId))
                    };
                }
                return p;
            }));
        } else {
            const targetParty = parties.find(p => String(p.id) === String(partyId));
            if (!targetParty) return;
            const updatedParty = pruneParty({
                ...targetParty,
                chat: targetParty.chat.filter(m => String(m.id) !== String(messageId))
            });
            try {
                await setDoc(doc(db, 'parties', String(partyId)), updatedParty);
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `parties/${partyId}`);
            }
        }
    };

    const handleMarkNotificationRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleUpdateProfile = async (updates: Partial<User>) => {
        setCurrentUser(prev => ({ ...prev, ...updates }));
        if (!isOffline && firebaseUser) {
            try {
                await setDoc(doc(db, 'users', currentUser.id.toString()), updates, { merge: true });
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
            }
        }
    };

    const handleOverlay = (newState: OverlayState | null) => {
        setOverlay(newState);
    };

    // --- Creation Handlers ---

    const handleSaveWorld = async (worldData: World) => {
        if (isOffline) {
            if (overlay?.type === 'world-create') {
                const newWorld = { ...worldData, id: Date.now(), authorId: currentUser.id };
                setWorlds([...worlds, newWorld]);
                setUserCreations([...userCreations, newWorld]);
                handleOverlay({ type: 'world', id: newWorld.id });
            } else if (overlay?.type === 'world-edit') {
                setWorlds(worlds.map(w => w.id === worldData.id ? worldData : w));
                setUserCreations(userCreations.map(c => c.id === worldData.id ? worldData : c));
                handleOverlay({ type: 'world', id: worldData.id });
            }
        } else {
            const worldId = overlay?.type === 'world-create' ? String(Date.now()) : String(worldData.id);
            const dbWorld = pruneWorldMessages({
                type: 'World',
                status: 'Published',
                ...worldData,
                id: worldId,
                authorId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(),
                authorName: currentUser.name || firebaseUser?.displayName || 'Guest Artist',
                createdAt: worldData.createdAt || new Date().toISOString()
            });
            try {
                await setDoc(doc(db, 'worlds', worldId), dbWorld);
                handleOverlay({ type: 'world', id: worldId as any });
            } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `worlds/${worldId}`);
            }
        }
    };

    const handleSaveCharacter = async (charData: Character) => {
        if (isOffline) {
            if (overlay?.type === 'character-create') {
                const newChar = { ...charData, id: Date.now(), authorId: currentUser.id };
                setCharacters([...characters, newChar]);
                setUserCreations([...userCreations, newChar]);
                handleOverlay({ type: 'character-view', id: newChar.id });
            } else if (overlay?.type === 'character-edit') {
                setCharacters(characters.map(c => c.id === charData.id ? charData : c));
                setUserCreations(userCreations.map(c => c.id === charData.id ? charData : c));
                handleOverlay({ type: 'character-view', id: charData.id });
            }
        } else {
            const charId = overlay?.type === 'character-create' ? String(Date.now()) : String(charData.id);
            const dbChar = {
                type: 'Character',
                status: charData.status || 'Active',
                ...charData,
                id: charId,
                authorId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(),
                authorName: currentUser.name || firebaseUser?.displayName || 'Guest Artist',
                createdAt: charData.createdAt || new Date().toISOString()
            };
            try {
                await setDoc(doc(db, 'characters', charId), dbChar);
                handleOverlay({ type: 'character-view', id: charId as any });
            } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `characters/${charId}`);
            }
        }
    };

    const handleSaveStory = async (storyData: Story) => {
        if (isOffline) {
            if (overlay?.type === 'story-create') {
                const newStory = { ...storyData, id: Date.now(), authorId: currentUser.id, chapters: [] };
                setStories([...stories, newStory]);
                setUserCreations([...userCreations, newStory]);
                handleOverlay({ type: 'story-edit', id: newStory.id });
            } else if (overlay?.type === 'story-edit') {
                setStories(stories.map(s => s.id === storyData.id ? storyData : s));
                setUserCreations(userCreations.map(c => c.id === storyData.id ? storyData : c));
            }
        } else {
            const storyId = overlay?.type === 'story-create' ? String(Date.now()) : String(storyData.id);
            const dbStory = {
                type: 'Story',
                status: storyData.status || 'Published',
                ...storyData,
                id: storyId,
                authorId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(),
                authorName: currentUser.name || firebaseUser?.displayName || 'Guest Artist',
                createdAt: storyData.createdAt || new Date().toISOString(),
                chapters: storyData.chapters || []
            };
            try {
                await setDoc(doc(db, 'stories', storyId), dbStory);
                if (overlay?.type === 'story-create') {
                    handleOverlay({ type: 'story-edit', id: storyId as any });
                }
            } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `stories/${storyId}`);
            }
        }
    };

    const handleSaveParty = async (partyData: Party) => {
        if (isOffline) {
            if (overlay?.type === 'party-create') {
                const newParty = { ...partyData, id: Date.now(), authorId: currentUser.id, hostId: currentUser.id };
                setParties([...parties, newParty]);
                setUserCreations([...userCreations, newParty]);
                handleOverlay({ type: 'party-view', id: newParty.id });
            } else if (overlay?.type === 'party-edit') {
                setParties(parties.map(p => p.id === partyData.id ? partyData : p));
                setUserCreations(userCreations.map(c => c.id === partyData.id ? partyData : c));
                handleOverlay({ type: 'party-view', id: partyData.id });
            }
        } else {
            const partyId = overlay?.type === 'party-create' ? String(Date.now()) : String(partyData.id);
            const dbParty = pruneParty({
                type: 'Party',
                status: partyData.status || 'Active',
                ...partyData,
                id: partyId,
                authorId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(),
                authorName: currentUser.name || firebaseUser?.displayName || 'Guest Artist',
                hostId: partyData.hostId || (firebaseUser ? firebaseUser.uid : currentUser.id.toString()),
                createdAt: partyData.createdAt || new Date().toISOString()
            });
            try {
                await setDoc(doc(db, 'parties', partyId), dbParty);
                handleOverlay({ type: 'party-view', id: partyId as any });
            } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `parties/${partyId}`);
            }
        }
    };

    const handleUpdateParty = async (updatedParty: Party) => {
        if (isOffline) {
            setParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
            setUserCreations(prev => prev.map(c => c.id === updatedParty.id ? updatedParty : c));
        } else {
            try {
                await setDoc(doc(db, 'parties', String(updatedParty.id)), pruneParty(updatedParty));
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `parties/${updatedParty.id}`);
            }
        }
    };

    const handleSaveMeme = async (memeData: { name: string, imageUrl: string }) => {
        const memeId = Date.now();
        const newMeme: UserCreation = {
            id: memeId,
            type: 'Meme',
            name: memeData.name,
            imageUrl: memeData.imageUrl,
            status: 'Published',
            authorId: currentUser.id
        };
        if (isOffline) {
            setUserCreations([...userCreations, newMeme]);
        } else {
            try {
                await setDoc(doc(db, 'memes', String(memeId)), {
                    id: String(memeId),
                    type: 'Meme',
                    name: memeData.name,
                    imageUrl: memeData.imageUrl,
                    status: 'Published',
                    authorId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(),
                    createdAt: new Date().toISOString()
                });
            } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `memes/${memeId}`);
            }
        }
        handleOverlay(null);
    };

    const handleSaveCommunity = async (communityData: Community) => {
        const commId = overlay?.type === 'community-create' ? Date.now() : communityData.id;
        const commIdStr = String(commId);

        let resolvedCommunity: any;
        if (overlay?.type === 'community-create') {
            resolvedCommunity = { 
                ...communityData, 
                id: isOffline ? commId : commIdStr, 
                authorId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(), 
                leaderId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(),
                members: [{ userId: firebaseUser ? firebaseUser.uid : currentUser.id.toString(), role: 'Leader' as any, joinedAt: new Date().toISOString().split('T')[0] }],
                level: 1, 
                xp: 0, 
                showcase: [], 
                feed: [] 
            };
        } else {
            resolvedCommunity = {
                ...communityData,
                id: isOffline ? communityData.id : String(communityData.id)
            };
        }

        if (isOffline) {
            if (overlay?.type === 'community-create') {
                setCommunities([...communities, resolvedCommunity]);
                setUserCreations([...userCreations, resolvedCommunity]);
                setCurrentUser(prev => ({
                    ...prev,
                    communityIds: [...(prev.communityIds || []), commId]
                }));
                handleOverlay({ type: 'community', id: commId });
            } else if (overlay?.type === 'community-edit') {
                setCommunities(communities.map(c => c.id === commId ? resolvedCommunity : c));
                setUserCreations(userCreations.map(c => c.id === commId ? resolvedCommunity : c));
                handleOverlay({ type: 'community', id: commId });
            }
        } else {
            try {
                await setDoc(doc(db, 'communities', commIdStr), resolvedCommunity);
                if (overlay?.type === 'community-create') {
                    const updatedCommunityIds = [...(currentUser.communityIds || []), commId];
                    await updateDoc(doc(db, 'users', currentUser.id.toString()), {
                        communityIds: updatedCommunityIds
                    });
                }
                handleOverlay({ type: 'community', id: commId });
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `communities/${commIdStr}`);
            }
        }
    };

    const handleJoinCommunity = async (communityId: number | string) => {
        const commIdStr = String(communityId);
        const newMember = { userId: currentUser.id, role: 'Member' as any, joinedAt: new Date().toISOString().split('T')[0] };

        if (isOffline) {
            setCommunities(prev => prev.map(c => {
                if (String(c.id) === commIdStr) {
                    return {
                        ...c,
                        members: [...c.members, newMember]
                    };
                }
                return c;
            }));
            setCurrentUser(prev => ({
                ...prev,
                communityIds: [...(prev.communityIds || []), communityId as any]
            }));
        } else {
            const targetCommunity = communities.find(c => String(c.id) === commIdStr);
            if (!targetCommunity) return;
            if (targetCommunity.members.some(m => String(m.userId) === String(currentUser.id))) return;
            const updatedCommunity = {
                ...targetCommunity,
                members: [...targetCommunity.members, newMember]
            };
            try {
                await setDoc(doc(db, 'communities', commIdStr), updatedCommunity);
                const updatedCommunityIds = [...(currentUser.communityIds || []), Number(communityId) || communityId];
                await updateDoc(doc(db, 'users', currentUser.id.toString()), {
                    communityIds: updatedCommunityIds
                });
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `communities/${commIdStr}`);
            }
        }
    };

    const handleLeaveCommunity = async (communityId: number | string) => {
        const commIdStr = String(communityId);

        if (isOffline) {
            setCommunities(prev => prev.map(c => {
                if (String(c.id) === commIdStr) {
                    return {
                        ...c,
                        members: c.members.filter(m => String(m.userId) !== String(currentUser.id))
                    };
                }
                return c;
            }));
            setCurrentUser(prev => ({
                ...prev,
                communityIds: (prev.communityIds || []).filter(id => String(id) !== commIdStr)
            }));
        } else {
            const targetCommunity = communities.find(c => String(c.id) === commIdStr);
            if (!targetCommunity) return;
            const updatedCommunity = {
                ...targetCommunity,
                members: targetCommunity.members.filter(m => String(m.userId) !== String(currentUser.id))
            };
            try {
                await setDoc(doc(db, 'communities', commIdStr), updatedCommunity);
                const updatedCommunityIds = (currentUser.communityIds || []).filter(id => String(id) !== commIdStr);
                await updateDoc(doc(db, 'users', currentUser.id.toString()), {
                    communityIds: updatedCommunityIds
                });
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `communities/${commIdStr}`);
            }
        }
    };

    const handleJoinWorld = async (worldId: number | string) => {
        const worldIdStr = String(worldId);

        if (isOffline) {
            setWorlds(prev => prev.map(w => {
                if (String(w.id) === worldIdStr) {
                    if (w.members.some(m => String(m.id) === String(currentUser.id))) return w;
                    return {
                        ...w,
                        members: [...w.members, { ...currentUser, role: 'Member' }]
                    };
                }
                return w;
            }));
        } else {
            const targetWorld = worlds.find(w => String(w.id) === worldIdStr);
            if (!targetWorld) return;
            if (targetWorld.members.some(m => String(m.id) === String(currentUser.id))) return;
            const updatedWorld = pruneWorldMessages({
                ...targetWorld,
                members: [...targetWorld.members, { ...currentUser, role: 'Member' as any }]
            });
            try {
                await setDoc(doc(db, 'worlds', worldIdStr), updatedWorld);
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `worlds/${worldIdStr}`);
            }
        }
    };

    const handlePurchase = (item: ShopItem) => {
        if (item.type === 'bundle') {
            const amount = item.currencyAmount || 0;
            setCurrentUser(prev => ({
                ...prev,
                sparkClashProfile: {
                    ...prev.sparkClashProfile!,
                    sparks: (prev.sparkClashProfile?.sparks || 0) + amount
                }
            }));
            alert(`Purchase successful! +${amount} Sparks`);
        } else if (item.type === 'subscription') {
            setCurrentUser(prev => ({ ...prev, isPremium: true }));
            alert("Upgrade successful! You are now Premium.");
        } else if (item.type === 'cosmetic' || item.type === 'tool') {
            if ((currentUser.sparkClashProfile?.sparks || 0) >= item.price) {
                setCurrentUser(prev => ({
                    ...prev,
                    sparkClashProfile: {
                        ...prev.sparkClashProfile!,
                        sparks: (prev.sparkClashProfile?.sparks || 0) - item.price
                    }
                }));
                alert(`Purchased ${item.name}!`);
            } else {
                alert("Not enough Sparks!");
            }
        }
        handleOverlay(null);
    };

    // --- Audio Control ---
    const handlePlayMusic = (url: string | null) => {
        setBgMusic(url);
    };

    // --- Render Logic ---

    const renderOverlay = () => {
        if (!overlay) return null;

        switch (overlay.type) {
            case 'world': {
                const world = worlds.find(w => String(w.id) === String(overlay.id));
                if (!world) return null;

                return (
                    <WorldOverlayView
                        world={world}
                        onExit={() => setOverlay(null)}
                        currentUser={currentUser}
                        userCreations={userCreations}
                        handleSendGroupMessage={handleSendGroupMessage}
                        handleDeleteGroupMessage={handleDeleteGroupMessage}
                        handleSaveMeme={handleSaveMeme}
                        onPlayMusic={handlePlayMusic}
                        onJoinWorld={handleJoinWorld}
                        onStartConversation={handleStartConversation}
                        onEditWorld={(id) => handleOverlay({ type: 'world-edit', id })}
                    />
                );
            }
            case 'world-create':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <WorldCreationPage onExit={() => setOverlay(null)} onCreate={handleSaveWorld} />
                    </div>
                );
            case 'world-edit':
                const worldToEdit = worlds.find(w => String(w.id) === String(overlay.id));
                if (!worldToEdit) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-hidden">
                        <WorldWorkshop world={worldToEdit} onExit={() => setOverlay(null)} onSave={handleSaveWorld} />
                    </div>
                );
            case 'character-view':
                const char = characters.find(c => String(c.id) === String(overlay.id));
                if (!char) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <CharacterPage 
                            character={char} 
                            onExit={() => setOverlay(null)} 
                            onViewCharacter={(id) => setOverlay({ type: 'character-view', id })}
                            onEdit={() => handleOverlay({ type: 'character-edit', id: char.id })}
                            onStartConversation={handleStartConversation}
                            currentUser={currentUser}
                        />
                    </div>
                );
            case 'character-create':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <CharacterCreationPage onExit={() => setOverlay(null)} onSave={handleSaveCharacter} />
                    </div>
                );
            case 'character-edit':
                const charToEdit = characters.find(c => String(c.id) === String(overlay.id));
                if (!charToEdit) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <CharacterCreationPage characterToEdit={charToEdit} onExit={() => setOverlay(null)} onSave={handleSaveCharacter} />
                    </div>
                );
            case 'story-read':
                const story = stories.find(s => String(s.id) === String(overlay.id));
                if (!story) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <StoryReaderPage 
                            story={story} 
                            onExit={() => setOverlay(null)}
                            onViewCharacter={(id) => handleOverlay({ type: 'character-view', id })}
                            onStartConversation={handleStartConversation}
                            currentUser={currentUser}
                        />
                    </div>
                );
            case 'story-create':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <StoryCreationPage 
                            onExit={() => setOverlay(null)} 
                            onCreate={handleSaveStory} 
                            initialData={overlay.initialData}
                        />
                    </div>
                );
            case 'story-edit':
                const storyToEdit = stories.find(s => String(s.id) === String(overlay.id));
                if (!storyToEdit) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-hidden">
                        <StoryWorkshopPage story={storyToEdit} onExit={() => setOverlay(null)} onSave={handleSaveStory} />
                    </div>
                );
            case 'party-view':
                const party = parties.find(p => String(p.id) === String(overlay.id));
                if (!party) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-hidden">
                        <PartyViewPage 
                            party={party} 
                            onExit={() => setOverlay(null)} 
                            onSendMessage={handleSendPartyMessage}
                            onDeleteMessage={handleDeletePartyMessage}
                            userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                            onStartConversation={handleStartConversation}
                            currentUser={currentUser}
                            onSaveMeme={handleSaveMeme}
                            onUpdateParty={handleUpdateParty}
                        />
                    </div>
                );
            case 'party-create':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <PartyWorkshopPage onExit={() => setOverlay(null)} onSave={handleSaveParty} />
                    </div>
                );
            case 'party-edit':
                const partyToEdit = parties.find(p => String(p.id) === String(overlay.id));
                if (!partyToEdit) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <PartyWorkshopPage party={partyToEdit} onExit={() => setOverlay(null)} onSave={handleSaveParty} />
                    </div>
                );
            case 'meme-create':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <MemeCreationPage onExit={() => setOverlay(null)} onSave={handleSaveMeme} />
                    </div>
                );
            case 'profile-edit':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <ProfileEditorPage currentUser={currentUser} onSave={(data) => { handleUpdateProfile(data); setOverlay(null); }} onExit={() => setOverlay(null)} />
                    </div>
                );
            case 'spark-clash':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-hidden">
                        <SparkClashPage 
                            onExit={() => setOverlay(null)} 
                            currentUser={currentUser} 
                            userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                            onUpdateUser={handleUpdateProfile}
                        />
                    </div>
                );
            case 'comments':
                const post = posts.find(p => String(p.id) === String(overlay.postId));
                if (!post) return null;
                const postComments = allComments.filter(c => c.postId === overlay.postId);
                return (
                    <CommentModal 
                        post={post}
                        comments={postComments}
                        currentUser={currentUser}
                        userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                        allUsers={users}
                        onClose={() => setOverlay(null)}
                        onCreateComment={handleAddComment}
                        onSparkComment={handleSparkComment}
                    />
                );
            case 'community':
                const community = communities.find(c => String(c.id) === String(overlay.id));
                if (!community) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <CommunityPage 
                            community={community} 
                            onExit={() => setOverlay(null)}
                            currentUser={currentUser}
                            onJoin={() => handleJoinCommunity(community.id)}
                            onLeave={() => handleLeaveCommunity(community.id)}
                            onSparkPost={handleSparkPost}
                            onCommentPost={handleCommentPost}
                            allUsers={users}
                        />
                    </div>
                );
            case 'community-create':
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <CommunityCreationPage onExit={() => setOverlay(null)} onCreate={handleSaveCommunity} />
                    </div>
                );
            case 'community-edit':
                const commToEdit = communities.find(c => String(c.id) === String(overlay.id));
                if (!commToEdit) return null;
                return (
                    <div className="fixed inset-0 z-50 bg-black animate-fadeIn overflow-y-auto">
                        <CommunityWorkshopPage community={commToEdit} onExit={() => setOverlay(null)} onSave={handleSaveCommunity} allUsers={users} />
                    </div>
                );
            case 'shop':
                return (
                    <ShopView onClose={() => setOverlay(null)} onPurchase={handlePurchase} currentUser={currentUser} />
                );
            default:
                return null;
        }
    };

    const renderActivePage = () => {
        switch (activePage) {
            case Page.Home:
                return (
                    <HomePage 
                        posts={posts} 
                        onCreatePost={handleCreatePost} 
                        onSparkPost={handleSparkPost} 
                        onCommentPost={handleCommentPost}
                        userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                        currentUser={currentUser}
                        onStartConversation={handleStartConversation}
                        onStartStoryWithPrompt={(prompt) => handleOverlay({ type: 'story-create', initialData: { synopsis: prompt } })}
                    />
                );
            case Page.Explore:
                return (
                    <ExplorePage 
                        onSelectWorld={(id) => handleOverlay({ type: 'world', id })}
                        onViewStory={(id) => handleOverlay({ type: 'story-read', id })}
                        onSelectParty={(id) => handleOverlay({ type: 'party-view', id })}
                        onSelectCommunity={(id) => handleOverlay({ type: 'community', id })}
                        onStartConversation={handleStartConversation}
                        currentUser={currentUser}
                        communities={communities}
                        worlds={worlds}
                        stories={stories}
                        parties={parties}
                        characters={characters}
                    />
                );
            case Page.Workshop:
                return (
                    <WorkshopPage 
                        userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                        onEditWorld={(id) => handleOverlay({ type: 'world-edit', id })}
                        onCreateCharacter={() => handleOverlay({ type: 'character-create' })}
                        onEditCharacter={(id) => handleOverlay({ type: 'character-edit', id })}
                        onViewCharacter={(id) => handleOverlay({ type: 'character-view', id })}
                        onCreateWorld={() => handleOverlay({ type: 'world-create' })}
                        onCreateStory={() => handleOverlay({ type: 'story-create' })}
                        onEditStory={(id) => handleOverlay({ type: 'story-edit', id })}
                        onViewStory={(id) => handleOverlay({ type: 'story-read', id })}
                        onCreateParty={() => handleOverlay({ type: 'party-create' })}
                        onEditParty={(id) => handleOverlay({ type: 'party-edit', id })}
                        onCreateMeme={() => handleOverlay({ type: 'meme-create' })}
                        onCreateCommunity={() => handleOverlay({ type: 'community-create' })}
                        onEditCommunity={(id) => handleOverlay({ type: 'community-edit', id })}
                    />
                );
            case Page.Messenger:
                return (
                    <MessengerPage 
                        conversations={conversations} 
                        onSendMessage={handleSendMessage}
                        onDeleteMessage={handleDeleteMessage}
                        onSetTyping={handleSetTyping}
                        onCreateConversation={(pid) => {
                            const id = Date.now();
                            const user = users.find(u => u.id === pid);
                            if(user) {
                                setConversations([{ id, participant: user, messages: [] }, ...conversations]);
                                return id;
                            }
                            return 0;
                        }}
                        userCreations={userCreations.filter(c => c.authorId === currentUser.id)}
                        allUsers={users}
                        initialConversationId={null}
                        onClearInitialConversation={() => {}}
                        onSaveMeme={handleSaveMeme}
                    />
                );
            case Page.Profile:
                return (
                    <ProfilePage 
                        currentUser={currentUser}
                        userCreations={userCreations}
                        allCommunities={communities}
                        onSelectCommunity={(id) => handleOverlay({ type: 'community', id })}
                        onUpdateProfile={handleUpdateProfile}
                        onEditProfile={() => handleOverlay({ type: 'profile-edit' })}
                        onEnterSparkClash={() => handleOverlay({ type: 'spark-clash' })}
                        onOpenShop={() => handleOverlay({ type: 'shop' })}
                        allUsers={users}
                        onLogout={logout}
                        onStartConversation={handleStartConversation}
                    />
                );
            case Page.Party:
                return (
                    <PartyPage 
                        parties={parties} 
                        onSelectParty={(id) => handleOverlay({ type: 'party-view', id })}
                        onCreateParty={() => handleOverlay({ type: 'party-create' })}
                        onEditParty={(id) => handleOverlay({ type: 'party-edit', id })}
                    />
                );
            case Page.Library:
                return (
                    <LibraryPage 
                        currentUser={currentUser}
                        worlds={worlds}
                        stories={stories}
                        communities={communities}
                        parties={parties}
                        characters={characters}
                        onSelectWorld={(id) => handleOverlay({ type: 'world', id })}
                        onViewStory={(id) => handleOverlay({ type: 'story-read', id })}
                        onSelectParty={(id) => handleOverlay({ type: 'party-view', id })}
                        onSelectCommunity={(id) => handleOverlay({ type: 'community', id })}
                        onCreateMeme={() => handleOverlay({ type: 'meme-create' })}
                        onUpdateUserWorlds={(updatedWorlds) => setWorlds(updatedWorlds)}
                        onUpdateUserCommunities={(updatedComms) => setCommunities(updatedComms)}
                    />
                );
            default:
                return <div>Page Not Found</div>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-black text-gray-100 font-sans relative">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-20"></div>
            
            <div className="flex-grow overflow-hidden z-10">
                {renderActivePage()}
            </div>

            <NavBar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationRead}
                allUsers={users}
            />

            {/* Global Overlays */}
            {renderOverlay()}

            {/* Persistent Audio Player */}
            <SonicJukebox musicUrl={bgMusic} onClear={() => setBgMusic(null)} />
        </div>
    );
};

export default MainApp;
