import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    Search, 
    ChevronDown, 
    Bookmark, 
    Share2, 
    Flag, 
    Mic, 
    Trash2, 
    Plus, 
    Heart, 
    MessageSquare, 
    Eye, 
    Users, 
    Calendar, 
    MapPin, 
    Compass, 
    Filter, 
    BarChart3, 
    ShieldAlert, 
    Volume2, 
    X, 
    Check, 
    Sparkles, 
    BookOpen, 
    Globe, 
    UserPlus, 
    UserCheck,
    VolumeX,
    Activity,
    Info,
    RefreshCw
} from 'lucide-react';
import { User, Community, World, Story, Party, Character, DiscoverableItem, AgeRating } from '../types';
import { allUsers as baseUsers } from '../mockData';

// --- Types & Interfaces for Discover Hub ---
interface EventItem {
    id: string;
    title: string;
    worldName: string;
    hostName: string;
    dateTime: string;
    stageMode: 'Social' | 'VTT' | 'Theatre' | 'Live Stream';
    participantCount: string;
    imageUrl: string;
    description: string;
    genreTags: string[];
}

interface ExplorePageProps {
    onSelectWorld: (worldId: number) => void;
    onViewStory: (storyId: number) => void;
    onSelectParty: (partyId: number) => void;
    onSelectCommunity?: (communityId: number) => void;
    onStartConversation: (userId: number) => void;
    currentUser: User;
    communities?: Community[];
    worlds?: World[];
    stories?: Story[];
    parties?: Party[];
    characters?: Character[];
}

type ContentFilterType = 'All' | 'OCs' | 'Worlds' | 'Stories' | 'Live Rooms' | 'Users' | 'Communities' | 'Events';

interface SearchHistoryEntry {
    id: string;
    term: string;
    timestamp: string;
}

interface AnalyticsStats {
    totalSearches: number;
    clicks: Record<string, number>;
    impressions: Record<string, number>;
    activeOperators: string[];
}

// --- Dynamic Mock Events ---
const mockEvents: EventItem[] = [];

// --- Static Common Suggestions ---
const POPULAR_SUGGESTIONS = [
    'roleplay',
    'fantasy',
    'scifi',
    'cyberpunk',
    'adventure'
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
    onSelectWorld,
    onViewStory,
    onSelectParty,
    onSelectCommunity,
    onStartConversation,
    currentUser,
    communities = [],
    worlds = [],
    stories = [],
    parties = [],
    characters = []
}) => {
    // --- State Managers ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<ContentFilterType[]>(['All']);
    const [sortOption, setSortOption] = useState<string>('Relevance');
    const [searchFocused, setSearchFocused] = useState(false);
    
    // Safety & Moderation States
    const [safetyShield, setSafetyShield] = useState<'Safe' | 'Moderate' | 'Unrestricted'>('Moderate');
    const [revealedMatureItems, setRevealedMatureItems] = useState<Set<string>>(new Set());
    
    // User Relationship Simulation
    const [followingList, setFollowingList] = useState<number[]>(() => currentUser.followingIds || []);
    const [blockedList, setBlockedList] = useState<number[]>([]);
    const [savedList, setSavedList] = useState<Set<string>>(() => new Set());
    const [rsvpEvents, setRsvpEvents] = useState<Set<string>>(new Set());
    const [joinedWorlds, setJoinedWorlds] = useState<Set<number>>(() => new Set(currentUser.communityIds || []));
    const [reportedItems, setReportedItems] = useState<Set<string>>(new Set());

    // Search History persistence
    const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>(() => {
        try {
            const val = localStorage.getItem('discover_search_history');
            if (val) return JSON.parse(val);
        } catch (_) {}
        // High quality initial prefill index entries
        return [
            { id: '1', term: 'from:elara cyberpunk', timestamp: '2h ago' },
            { id: '2', term: '"Neon Nights"', timestamp: '5h ago' },
            { id: '3', term: 'tag:mage', timestamp: '1d ago' }
        ];
    });

    // Voice simulation
    const [isListeningForVoice, setIsListeningForVoice] = useState(false);
    const [voiceFeedbackText, setVoiceFeedbackText] = useState('');

    // Telemetry & Insights Logger (Section 8)
    const [isDevInsightsOpen, setIsDevInsightsOpen] = useState(false);
    const [telemetry, setTelemetry] = useState<AnalyticsStats>({
        totalSearches: 0,
        clicks: {},
        impressions: {},
        activeOperators: []
    });

    // Toast stack notifications
    const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);

    // Infinite scroll
    const [visibleCount, setVisibleCount] = useState<number>(8);
    const [loadingMore, setLoadingMore] = useState(false);

    // --- Search Input Focus & Blur Handlers ---
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Auto save search history
    useEffect(() => {
        try {
            localStorage.setItem('discover_search_history', JSON.stringify(searchHistory));
        } catch (_) {}
    }, [searchHistory]);

    // Toast pop-up helper
    const showToast = (text: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, text }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Debounce listener
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchTerm);
            if (searchTerm.trim()) {
                setTelemetry(prev => ({ ...prev, totalSearches: prev.totalSearches + 1 }));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle typing simulation for Voice search
    const triggerVoiceSimulation = () => {
        if (isListeningForVoice) return;
        setIsListeningForVoice(true);
        setVoiceFeedbackText('Listening actively...');
        const phrases = ['tag:fantasy magic', '"Neon Nights"', 'from:elara', 'The Crimson Archipelago'];
        const chosen = phrases[Math.floor(Math.random() * phrases.length)];
        
        setTimeout(() => {
            setVoiceFeedbackText(`Analyzing: "${chosen}"...`);
            setTimeout(() => {
                setSearchTerm(chosen);
                setIsListeningForVoice(false);
                showToast(`Voice Search loaded: "${chosen}"`);
                // Add to search history
                addHistoryItem(chosen);
            }, 1000);
        }, 1500);
    };

    // Add search history item
    const addHistoryItem = (term: string) => {
        if (!term.trim()) return;
        setSearchHistory(prev => {
            const filtered = prev.filter(h => h.term.toLowerCase() !== term.toLowerCase());
            return [{ id: Date.now().toString(), term, timestamp: 'Now' }, ...filtered.slice(0, 9)];
        });
    };

    // Delete history item
    const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchHistory(prev => prev.filter(h => h.id !== id));
        showToast('Search log cleared');
    };

    const clearAllHistory = () => {
        setSearchHistory([]);
        showToast('All search history wiped');
    };

    // --- Search Operator Parsing Syntax (Section 1.2) ---
    const parsedQuery = useMemo(() => {
        const canonical = debouncedQuery.toLowerCase();
        
        // Exact Phrase search: match text inside double quotes
        const exactMatches: string[] = [];
        const exactRegex = /"([^"]+)"/g;
        let match;
        const tempStringForRegex = canonical;
        while ((match = exactRegex.exec(tempStringForRegex)) !== null) {
            exactMatches.push(match[1]);
        }

        // Tag Operator: match tag:tagname
        const tagMatch = canonical.match(/tag:([^\s]+)/);
        const filterTag = tagMatch ? tagMatch[1] : null;

        // Custom Creator Operator: match from:username
        const fromMatch = canonical.match(/from:([^\s]+)/);
        const filterFrom = fromMatch ? fromMatch[1] : null;

        // Content Rating Operator: age:teen or age:mature
        const ageMatch = canonical.match(/age:([^\s]+)/);
        const filterAge = ageMatch ? ageMatch[1] : null;

        // Negative Exclusions: match -word
        const words = canonical.replace(/"[^"]+"/g, '').split(/\s+/);
        const excludedWords = words
            .filter(w => w.startsWith('-') && w.length > 1)
            .map(w => w.substring(1));

        // Remaining text terms after removing operators
        let cleanQuery = canonical
            .replace(/tag:[^\s]+/g, '')
            .replace(/from:[^\s]+/g, '')
            .replace(/age:[^\s]+/g, '')
            .replace(/"[^"]+"/g, '')
            .replace(/-\w+/g, '')
            .trim();

        // Update active detected operators in telemetry
        const foundOps: string[] = [];
        if (filterTag) foundOps.push(`tag:${filterTag}`);
        if (filterFrom) foundOps.push(`from:${filterFrom}`);
        if (filterAge) foundOps.push(`age:${filterAge}`);
        if (exactMatches.length > 0) foundOps.push(`exact:${exactMatches.join(',')}`);
        if (excludedWords.length > 0) foundOps.push(`exclude:${excludedWords.join(',')}`);

        if (foundOps.length > 0) {
            setTelemetry(prev => {
                const uniqueOps = Array.from(new Set([...prev.activeOperators, ...foundOps]));
                return { ...prev, activeOperators: uniqueOps };
            });
        }

        return {
            filterTag,
            filterFrom,
            filterAge,
            exactMatches,
            excludedWords,
            cleanQuery
        };
    }, [debouncedQuery]);

    // Toggle multi-select content chips
    const handleToggleFilter = (filter: ContentFilterType) => {
        setActiveFilters(prev => {
            if (filter === 'All') {
                return ['All'];
            }
            const clean = prev.filter(f => f !== 'All');
            if (clean.includes(filter)) {
                const next = clean.filter(f => f !== filter);
                return next.length === 0 ? ['All'] : next;
            } else {
                return [...clean, filter];
            }
        });
    };

    // Matches search items with complex operators
    const matchesQuery = (item: any, type: string) => {
        // Exclude reported items immediately
        const key = `${type}-${item.id}`;
        if (reportedItems.has(key)) return false;

        // Filter out content of blocked creators
        const authorId = Number(item.authorId || item.hostId || item.leaderId);
        if (authorId && blockedList.includes(authorId)) return false;

        // Safety rules and age-filtering (Section 6)
        const rating: AgeRating = item.contentMetadata?.ageRating || 'Everyone';
        if (safetyShield === 'Safe' && rating === 'Mature') {
            return false; // Skip entirely on strict safe search
        }

        const titleLower = (item.name || item.title || '').toLowerCase();
        const synopsisLower = (item.tagline || item.synopsis || item.description || item.bio || '').toLowerCase();
        
        // Tags array conversion
        const tagList: string[] = [];
        const originalTags = item.archetypeTags || item.genreTags || item.tags || [];
        originalTags.forEach((t: string) => tagList.push(t.toLowerCase()));

        // Author Name string conversion
        let authorText = '';
        if (item.authorName) authorText = item.authorName;
        else if (item.author) authorText = item.author;
        else if (item.hostName) authorText = item.hostName;
        else {
            const authorUser = baseUsers.find(u => String(u.id) === String(authorId));
            if (authorUser) authorText = authorUser.name;
        }

        const authorTextLower = authorText.toLowerCase();

        // 1. Excluded word check
        if (parsedQuery.excludedWords.length > 0) {
            const hitsExcluded = parsedQuery.excludedWords.some(exc => 
                titleLower.includes(exc) || synopsisLower.includes(exc) || tagList.some(tg => tg.includes(exc))
            );
            if (hitsExcluded) return false;
        }

        // 2. Exact phrase check
        if (parsedQuery.exactMatches.length > 0) {
            const hitsExact = parsedQuery.exactMatches.some(phrase => 
                titleLower.includes(phrase) || synopsisLower.includes(phrase)
            );
            if (!hitsExact) return false;
        }

        // 3. Creator operator check (from:)
        if (parsedQuery.filterFrom) {
            if (!authorTextLower.includes(parsedQuery.filterFrom)) return false;
        }

        // 4. Tag operator check (tag:)
        if (parsedQuery.filterTag) {
            const hasTag = tagList.some(tg => tg.includes(parsedQuery.filterTag!.toLowerCase()));
            if (!hasTag) return false;
        }

        // 5. Age rating operator check (age:)
        if (parsedQuery.filterAge) {
            if (!rating.toLowerCase().includes(parsedQuery.filterAge.toLowerCase())) return false;
        }

        // 6. Fallback clean query check
        if (parsedQuery.cleanQuery) {
            const terms = parsedQuery.cleanQuery.split(/\s+/).filter(Boolean);
            const matchesAllTerms = terms.every(term => 
                titleLower.includes(term) || 
                synopsisLower.includes(term) || 
                tagList.some(tg => tg.includes(term)) ||
                authorTextLower.includes(term)
            );
            if (!matchesAllTerms) return false;
        }

        return true;
    };

    // --- Search Index Synthesis (Combining all tables) ---
    const allSearchResults = useMemo(() => {
        const results: { type: string; data: any; title: string; engagement: number; date: string }[] = [];

        // OCs Characters
        if (activeFilters.includes('All') || activeFilters.includes('OCs')) {
            characters.forEach(c => {
                if (matchesQuery(c, 'Character')) {
                    results.push({
                        type: 'OC',
                        data: c,
                        title: c.name,
                        engagement: 140, // Base
                        date: c.createdAt || '2026-06-15'
                    });
                }
            });
        }

        // Worlds
        if (activeFilters.includes('All') || activeFilters.includes('Worlds')) {
            worlds.forEach(w => {
                if (matchesQuery(w, 'World')) {
                    results.push({
                        type: 'World',
                        data: w,
                        title: w.name,
                        engagement: w.members?.length * 10 || 50,
                        date: w.createdAt || '2026-06-18'
                    });
                }
            });
        }

        // Stories
        if (activeFilters.includes('All') || activeFilters.includes('Stories')) {
            stories.forEach(s => {
                if (matchesQuery(s, 'Story')) {
                    results.push({
                        type: 'Story',
                        data: s,
                        title: s.name,
                        engagement: 210,
                        date: s.createdAt || '2026-06-10'
                    });
                }
            });
        }

        // Live Rooms / Parties
        if (activeFilters.includes('All') || activeFilters.includes('Live Rooms')) {
            parties.forEach(p => {
                if (matchesQuery(p, 'Live Room')) {
                    results.push({
                        type: 'Live Room',
                        data: p,
                        title: p.name,
                        engagement: p.members?.length * 30 || 80,
                        date: p.createdAt || '2026-06-20'
                    });
                }
            });
        }

        // Users Index
        if (activeFilters.includes('All') || activeFilters.includes('Users')) {
            baseUsers.forEach(u => {
                if (matchesQuery(u, 'User')) {
                    results.push({
                        type: 'User',
                        data: u,
                        title: u.name,
                        engagement: u.sparkClashProfile?.battlePower || 400,
                        date: '2025-01-01'
                    });
                }
            });
        }

        // Communities
        if (activeFilters.includes('All') || activeFilters.includes('Communities')) {
            communities.forEach(c => {
                if (matchesQuery(c, 'Community')) {
                    results.push({
                        type: 'Community',
                        data: c,
                        title: c.name,
                        engagement: c.members?.length * 20 || 30,
                        date: '2026-01-10'
                    });
                }
            });
        }

        // Events
        if (activeFilters.includes('All') || activeFilters.includes('Events')) {
            mockEvents.forEach(evt => {
                if (matchesQuery(evt, 'Event')) {
                    results.push({
                        type: 'Event',
                        data: evt,
                        title: evt.title,
                        engagement: Number(evt.participantCount.split('/')[0]) * 15,
                        date: '2026-06-21'
                    });
                }
            });
        }

        // --- Execute Selected Sorting Algorithm (Section 5) ---
        if (sortOption === 'Latest') {
            results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (sortOption === 'Popular') {
            results.sort((a, b) => b.engagement - a.engagement);
        } else if (sortOption === 'Alphabetical') {
            results.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === 'Most Members') {
            results.sort((a, b) => {
                const countA = a.data.members?.length || a.data.participantCount ? Number(a.data.participantCount?.split('/')[0] || 0) : 0;
                const countB = b.data.members?.length || b.data.participantCount ? Number(b.data.participantCount?.split('/')[0] || 0) : 0;
                return countB - countA;
            });
        }
        
        return results;
    }, [activeFilters, sortOption, worlds, stories, parties, characters, communities, safetyShield, blockedList, reportedItems, parsedQuery]);

    // Live pagination slice
    const paginatedResults = useMemo(() => {
        return allSearchResults.slice(0, visibleCount);
    }, [allSearchResults, visibleCount]);

    // Simulated infinite scrolling logic
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
            if (visibleCount < allSearchResults.length && !loadingMore) {
                setLoadingMore(true);
                setTimeout(() => {
                    setVisibleCount(prev => prev + 8);
                    setLoadingMore(false);
                }, 800);
            }
        }
    };

    // Action telemetry logging
    const logClickTelemetry = (category: string, itemTitle: string) => {
        setTelemetry(prev => {
            const updatedClicks = { ...prev.clicks };
            updatedClicks[category] = (updatedClicks[category] || 0) + 1;
            return { ...prev, clicks: updatedClicks };
        });
    };

    // Core Interaction Handlers
    const handleToggleFollow = (userId: number, username: string) => {
        setFollowingList(prev => {
            const exists = prev.includes(userId);
            if (exists) {
                showToast(`Unfollowed ${username}`);
                return prev.filter(id => id !== userId);
            } else {
                showToast(`Following ${username}`);
                return [...prev, userId];
            }
        });
        logClickTelemetry('Follow', username);
    };

    const handleToggleSave = (id: string, name: string) => {
        setSavedList(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                showToast(`Removed "${name}" from saved Library`);
            } else {
                next.add(id);
                showToast(`Saved "${name}" to Library!`);
            }
            return next;
        });
        logClickTelemetry('Bookmark', name);
    };

    const handleShare = (type: string, id: string, name: string) => {
        const url = `https://sparkzone.app/share/${type}/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            showToast(`Share URL copied to clipboard: ${url}`);
        }).catch(() => {
            showToast(`Share Link: ${url}`);
        });
        logClickTelemetry('Share', name);
    };

    const handleReport = (itemKey: string, title: string) => {
        setReportedItems(prev => {
            const next = new Set(prev);
            next.add(itemKey);
            return next;
        });
        showToast(`"${title}" reported. It is temporarily hidden pending review.`);
        logClickTelemetry('Report', title);
    };

    const handleBlockCreator = (creatorId: number, name: string) => {
        setBlockedList(prev => [...prev, creatorId]);
        showToast(`Creator blocked. All creations of "${name}" are now hidden.`);
        logClickTelemetry('Block', name);
    };

    const handleToggleRSVP = (evtId: string, eventTitle: string) => {
        setRsvpEvents(prev => {
            const next = new Set(prev);
            if (next.has(evtId)) {
                next.delete(evtId);
                showToast(`RSVP cancelled for "${eventTitle}"`);
            } else {
                next.add(evtId);
                showToast(`RSVP Confirmed! "${eventTitle}" added to your calendar`);
            }
            return next;
        });
        logClickTelemetry('RSVP', eventTitle);
    };

    const handleToggleJoinWorld = (worldId: number, worldName: string) => {
        setJoinedWorlds(prev => {
            const next = new Set(prev);
            if (next.has(worldId)) {
                next.delete(worldId);
                showToast(`Leaved world: ${worldName}`);
            } else {
                next.add(worldId);
                showToast(`Welcome! Joined the world blueprint: ${worldName}`);
            }
            return next;
        });
        logClickTelemetry('JoinWorld', worldName);
    };

    // Auto-complete suggestion selection
    const selectSuggestion = (term: string) => {
        setSearchTerm(term);
        setSearchFocused(false);
        addHistoryItem(term);
    };

    // Filter matched tags for suggestions drop-down
    const activeSuggestions = useMemo(() => {
        if (!searchTerm) {
            return POPULAR_SUGGESTIONS;
        }
        const clean = searchTerm.toLowerCase();
        const suggestionsSet = new Set<string>();

        // Tag matching suggestions
        ['fantasy', 'cosmic', 'stealth', 'survival', 'magic', 'rogue', 'cyberpunk', 'action', 'adventure'].forEach(tag => {
            if (tag.includes(clean)) {
                suggestionsSet.add(`tag:${tag}`);
            }
        });

        // Username suggestions
        baseUsers.forEach(u => {
            if (u.name.toLowerCase().includes(clean)) {
                suggestionsSet.add(`from:${u.name.toLowerCase().replace(/\s+/g, '')}`);
            }
        });

        POPULAR_SUGGESTIONS.forEach(p => {
            if (p.includes(clean)) {
                suggestionsSet.add(p);
            }
        });

        return Array.from(suggestionsSet).slice(0, 5);
    }, [searchTerm]);

    // Clean search text on clear
    const handleClearSearchInput = () => {
        setSearchTerm('');
        setDebouncedQuery('');
    };

    // Determine if we should show search results vs landing rows
    const isActiveSearchPage = debouncedQuery.trim().length > 0 || !activeFilters.includes('All');

    // Return visual representation of search operator parsing as helper chips
    const activeSearchQueryChips = useMemo(() => {
        const chips: { label: string; action: () => void }[] = [];
        if (parsedQuery.filterTag) {
            chips.push({ label: `Tag: #${parsedQuery.filterTag}`, action: () => setSearchTerm(prev => prev.replace(/tag:[^\s]+/g, '')) });
        }
        if (parsedQuery.filterFrom) {
            chips.push({ label: `By: @${parsedQuery.filterFrom}`, action: () => setSearchTerm(prev => prev.replace(/from:[^\s]+/g, '')) });
        }
        if (parsedQuery.filterAge) {
            chips.push({ label: `Age Rating: ${parsedQuery.filterAge.toUpperCase()}`, action: () => setSearchTerm(prev => prev.replace(/age:[^\s]+/g, '')) });
        }
        if (parsedQuery.exactMatches.length > 0) {
            parsedQuery.exactMatches.forEach(ex => {
                chips.push({ label: `Phrase: "${ex}"`, action: () => setSearchTerm(prev => prev.replace(new RegExp(`"${ex}"`, 'g'), '')) });
            });
        }
        if (parsedQuery.excludedWords.length > 0) {
            parsedQuery.excludedWords.forEach(ex => {
                chips.push({ label: `Exclude: -${ex}`, action: () => setSearchTerm(prev => prev.replace(new RegExp(`-${ex}`, 'g'), '')) });
            });
        }
        return chips;
    }, [parsedQuery]);

    // --- Core Section Arrays Render (Shown on Default Discovery Feed) ---
    // 4.1 Trending Worlds (Active members order)
    const trendingWorlds = useMemo(() => {
        return [...worlds].sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0)).slice(0, 5);
    }, [worlds]);

    // 4.2 Recommended (matches User character tags and following tags)
    const recommendedItems = useMemo(() => {
        const items: any[] = [];
        const myTags = currentUser.characterTags || ['Sci-Fi', 'Tech'];

        characters.forEach(c => {
            const match = c.archetypeTags?.some(tg => myTags.includes(tg));
            if (match && c.authorId !== currentUser.id) {
                items.push({ type: 'OC', data: c });
            }
        });

        worlds.forEach(w => {
            const match = w.genreTags?.some(tg => myTags.includes(tg));
            if (match && w.authorId !== currentUser.id) {
                items.push({ type: 'World', data: w });
            }
        });

        stories.forEach(s => {
            const match = s.genreTags?.some(tg => myTags.includes(tg));
            if (match && s.authorId !== currentUser.id) {
                items.push({ type: 'Story', data: s });
            }
        });

        return items.slice(0, 6);
    }, [characters, worlds, stories, currentUser]);

    // 4.5 Top Creators (Popular users with follower counts)
    const topCreatorsList = useMemo(() => {
        return baseUsers.filter(u => u.id !== currentUser.id).slice(0, 8);
    }, [currentUser]);

    // Manual Refresh active Live Rooms
    const [liveRoomsSeed, setLiveRoomsSeed] = useState(0);
    const randomizedLiveRooms = useMemo(() => {
        // Shuffle parties list and simulate changes
        return [...parties].map(p => {
            const simulatedOnlineCount = Math.floor(Math.random() * 5) + 2;
            return { ...p, simulatedActive: simulatedOnlineCount };
        }).slice(0, 5);
    }, [parties, liveRoomsSeed]);

    // Simulate auto-refresh of live rooms every 30 seconds (Section 4.3)
    useEffect(() => {
        const timer = setInterval(() => {
            setLiveRoomsSeed(prev => prev + 1);
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div 
            onScroll={handleScroll}
            className="flex-grow h-full overflow-y-auto px-4 md:px-8 py-6 relative select-none bg-neutral-950 text-neutral-100"
            style={{ contentVisibility: 'auto' }}
        >
            {/* Action Toast stack alert */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
                {toasts.map(t => (
                    <div 
                        key={t.id} 
                        className="p-4 bg-cyan-950/90 border border-cyan-500/40 text-cyan-200 rounded-xl shadow-lg ring-1 ring-cyan-500/20 text-sm font-semibold flex items-center gap-2 animate-fadeInUp pointer-events-auto"
                    >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>{t.text}</span>
                    </div>
                ))}
            </div>

            {/* --- TOP BANNER / NAVIGATION LINE --- */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b border-neutral-900 pb-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                        <Compass className="w-8 h-8 text-cyan-500" />
                        DISCOVER <span className="text-cyan-400 font-medium text-lg tracking-widest font-mono">HUB</span>
                    </h1>
                    <p className="text-xs text-neutral-400 font-medium">Find elite OCs, immersive worlds, roleplay storylines, live nodes, and community clans.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Safety Rating Shield Selector (Section 6) */}
                    <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs">
                        <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-neutral-400 font-bold mr-1">Content Shield:</span>
                        {(['Safe', 'Moderate', 'Unrestricted'] as const).map(sh => (
                            <button
                                key={sh}
                                onClick={() => { setSafetyShield(sh); showToast(`Safety Shield now set to: ${sh}`); }}
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors ${safetyShield === sh ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                {sh.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Developer Analytics trigger (Section 8) */}
                    <button
                        onClick={() => setIsDevInsightsOpen(prev => !prev)}
                        className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${isDevInsightsOpen ? 'bg-neutral-800 border-yellow-500/40 text-yellow-400 shadow-md shadow-yellow-500/10' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Telemetry</span>
                    </button>
                </div>
            </div>

            {/* --- DEVELOPER INSIGHTS DASHBOARD (Section 8) --- */}
            {isDevInsightsOpen && (
                <div className="bg-neutral-900/95 border border-yellow-500/30 rounded-2xl p-4 mb-6 animate-fadeIn font-mono text-xs text-neutral-300 shadow-xl shadow-yellow-500/5">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                            <Activity className="w-4 h-4" />
                            <span>DEVELOPER INSIGHTS PANEL (LIVE DATA TELEMETRY)</span>
                        </div>
                        <button onClick={() => setIsDevInsightsOpen(false)} className="text-neutral-500 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                            <span className="text-neutral-500 flex justify-between">Total Search Cycles: </span>
                            <span className="text-lg font-black text-white">{telemetry.totalSearches}</span>
                        </div>
                        <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                            <span className="text-neutral-500 block">Category Discover Impressions:</span>
                            <div className="mt-1 space-y-0.5 text-[10px]">
                                {Object.entries(telemetry.clicks).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span>{k}:</span>
                                        <span className="text-cyan-400 font-bold">{v} clicks</span>
                                    </div>
                                ))}
                                {Object.keys(telemetry.clicks).length === 0 && <span className="text-neutral-600 block">Waiting for telemetry clicks...</span>}
                            </div>
                        </div>
                        <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 col-span-2">
                            <span className="text-neutral-400 font-bold block mb-1">Parsed Operators State (AST Syntax Tree):</span>
                            <pre className="text-[10px] text-green-400 bg-neutral-950 max-h-20 overflow-y-auto pr-2 scrollbar-hide">
                                {JSON.stringify(parsedQuery, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 1. SEARCH BAR & VOICE BOX (Section 1) --- */}
            <div className="relative mb-6">
                <div className="relative flex items-center scale-100 transition-transform focus-within:scale-[1.01]">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400">
                        <Search className="w-5 h-5 text-neutral-400" />
                    </div>
                    
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => {
                            // Delay slightly to click dropdown suggestion items
                            setTimeout(() => setSearchFocused(false), 200);
                        }}
                        placeholder="Search OCs, worlds, people, tags (#warrior), author (from:Sarah)..."
                        className="w-full bg-neutral-900 border border-neutral-800 ring-1 ring-neutral-900/50 rounded-2xl py-3.5 pl-12 pr-28 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
                    />

                    <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                        {/* Clear button if text input exists */}
                        {searchTerm && (
                            <button
                                onClick={handleClearSearchInput}
                                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                                title="Clear Search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Voice Input Trigger Simulation (Section 7) */}
                        <button
                            onClick={triggerVoiceSimulation}
                            className={`p-2 rounded-xl border text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800/80 transition-all relative ${isListeningForVoice ? 'bg-red-950/20 border-red-500/40 text-red-400 animate-pulse' : 'bg-neutral-900 border-neutral-800'}`}
                            title="Simulate Voice Search"
                        >
                            <Mic className="w-4 h-4" />
                            {isListeningForVoice && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Simulated Listening Indicator */}
                {isListeningForVoice && (
                    <div className="mt-2 text-xs flex items-center gap-2 text-cyan-400 bg-cyan-950/20 border border-cyan-500/25 p-2 rounded-xl animate-pulse">
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        <span className="font-bold font-mono">{voiceFeedbackText}</span>
                    </div>
                )}

                {/* Dynamic Operators parsed active indicators helper row */}
                {activeSearchQueryChips.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                            <Filter className="w-3 h-3" /> Filters parsed:
                        </span>
                        {activeSearchQueryChips.map((ch, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center gap-1 bg-cyan-950/50 border border-cyan-500/25 px-2 py-0.5 rounded-lg text-xs text-cyan-300 font-semibold"
                            >
                                <span>{ch.label}</span>
                                <button onClick={ch.action} className="text-cyan-500 hover:text-cyan-300">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- 1.1 SEARCH SUGGESTIONS & SEARCH HISTORY DROPDOWN (Section 1.3 & 1.1) --- */}
                {searchFocused && (
                    <div 
                        ref={dropdownRef}
                        className="absolute left-0 right-0 top-full mt-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl z-50 overflow-hidden text-sm font-sans"
                    >
                        {/* 1.1 Search History group */}
                        {searchHistory.length > 0 && (
                            <div className="p-3 border-b border-neutral-800 bg-neutral-900/50">
                                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">
                                    <span>Recent Search History Log</span>
                                    <button 
                                        onMouseDown={(e) => { e.preventDefault(); clearAllHistory(); }}
                                        className="text-[10px] text-red-500 font-bold hover:text-red-400 normal-case"
                                    >
                                        Wipe Logs
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {searchHistory.map(hist => (
                                        <div
                                            key={hist.id}
                                            onMouseDown={() => selectSuggestion(hist.term)}
                                            className="cursor-pointer flex items-center gap-1 text-xs bg-neutral-950 text-neutral-300 border border-neutral-800 rounded-lg px-2 py-1 max-w-xs hover:bg-neutral-800 hover:text-white group transition-colors"
                                        >
                                            <span className="truncate">{hist.term}</span>
                                            <span className="text-[9px] text-neutral-600 font-mono hidden md:inline">{hist.timestamp}</span>
                                            <button
                                                onMouseDown={(e) => deleteHistoryItem(hist.id, e)}
                                                className="text-neutral-500 hover:text-red-400 p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search suggestions matching type ahead */}
                        <div className="p-2 select-none">
                            <span className="block text-neutral-500 text-xs font-bold uppercase tracking-wider px-2 py-1.5">
                                {searchTerm ? 'AI Autocomplete suggestions' : 'Popular Search Operators'}
                            </span>
                            {activeSuggestions.map((sug, i) => (
                                <button
                                    key={i}
                                    onMouseDown={() => selectSuggestion(sug)}
                                    className="w-full text-left px-3 py-2 text-neutral-300 rounded-lg hover:bg-neutral-800 hover:text-white text-xs font-bold flex items-center justify-between transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>{sug}</span>
                                    </span>
                                    <span className="text-[10px] text-neutral-500 block">Click to execute</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- 2. MULTI-SELECT FILTER CHIPS ROW (Section 2) --- */}
            <div className="mb-6 flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1 font-mono whitespace-nowrap">
                    <Filter className="w-3.5 h-3.5 text-neutral-500" /> Refined Filter:
                </span>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 select-none pr-4">
                    {([
                        'All', 
                        'OCs', 
                        'Worlds', 
                        'Stories', 
                        'Live Rooms', 
                        'Users', 
                        'Communities', 
                        'Events'
                    ] as ContentFilterType[]).map(fc => {
                        const isSelected = activeFilters.includes(fc);
                        return (
                            <button
                                key={fc}
                                onClick={() => {
                                    handleToggleFilter(fc);
                                    logClickTelemetry('FilterChip', fc);
                                }}
                                className={`px-4.5 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${isSelected ? 'bg-cyan-500/25 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300'}`}
                            >
                                {fc}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- CORE FEED ROUTING SYSTEM --- */}
            {!isActiveSearchPage ? (
                /* --- DEFAULT EXPLORE FEED (Trending & Curated Sections) --- */
                <div className="space-y-10">
                    
                    {/* 4.1 TRENDING WORLDS SECTION */}
                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
                                <Globe className="w-5 h-5 text-cyan-400" /> 
                                Trending Worlds
                                <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/20 font-bold ml-1 font-mono">POPULAR</span>
                            </h2>
                            <p className="text-[10px] text-neutral-500 font-bold">1h interval audit logs</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {trendingWorlds.map((world, idx) => (
                                <div 
                                    key={world.id} 
                                    onClick={() => { onSelectWorld(world.id); logClickTelemetry('WorldCard', world.name); }}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer relative group hover:border-cyan-500/40 hover:shadow-lg transition-all"
                                >
                                    <div className="absolute top-2 left-2 bg-black/75 text-cyan-400 font-mono font-black text-xs w-6 h-6 rounded-lg border border-neutral-700 flex items-center justify-center z-10">
                                        #{idx + 1}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/75 text-yellow-500 text-[9px] font-black px-2 py-0.5 rounded-lg border border-neutral-700 z-10 font-mono flex items-center gap-1">
                                        ★ {world.contentMetadata?.ageRating || 'Everyone'}
                                    </div>
                                    <div className="h-28 relative overflow-hidden">
                                        <img src={world.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-neutral-100 truncate group-hover:text-cyan-400 transition-colors">{world.name}</h3>
                                        <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{world.tagline}</p>
                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-800 text-[10px]">
                                            <span className="text-neutral-500 flex items-center gap-1"><Users className="w-3 h-3" /> {world.members?.length || 2} members</span>
                                            <span className="text-cyan-400 font-bold font-mono px-1.5 py-0.5 bg-cyan-900/20 border border-cyan-500/20 rounded-md">VIEW</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4.2 RECOMMENDED FOR YOU (PERSONALIZED) */}
                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
                                <Sparkles className="w-5 h-5 text-violet-400" />
                                Recommended for You
                                <span className="text-[10px] bg-violet-900/30 text-violet-400 px-2 py-0.5 rounded-md border border-violet-500/20 font-bold ml-1 font-mono">MATCHED FOR {currentUser.name.toUpperCase()}</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {recommendedItems.map((rec, index) => {
                                const item = rec.data;
                                return (
                                    <div 
                                        key={index} 
                                        onClick={() => {
                                            if (rec.type === 'OC') onSelectParty(30); // Fallback Character viewer is Party
                                            else if (rec.type === 'World') onSelectWorld(item.id);
                                            else if (rec.type === 'Story') onViewStory(item.id);
                                            logClickTelemetry('Recommends', item.name);
                                        }}
                                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 cursor-pointer group hover:border-violet-500/40 hover:shadow-lg transition-all"
                                    >
                                        <div className="h-28 w-full rounded-lg overflow-hidden relative mb-2">
                                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                                            <span className="absolute top-1 left-1 bg-black/70 text-violet-300 font-black text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-neutral-800">
                                                {rec.type}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-xs text-neutral-200 truncate group-hover:text-violet-400 transition-colors">{item.name}</h3>
                                        <p className="text-[9px] text-neutral-500 truncate mt-0.5">{item.tagline || item.synopsis || 'Recommended creator blueprint.'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4.3 LIVE ROOMS NOW (PARTIES) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
                                    <Activity className="w-5 h-5 text-green-400" />
                                    Live Rooms Right Now
                                </h2>
                                <p className="text-[10px] text-neutral-400 mt-0.5">High fidelity synced channels in Active RP campaigns.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setLiveRoomsSeed(prev => prev + 1);
                                    showToast('Live Rooms roster refreshed!');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs"
                                title="Sync Nodes"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Sync Nodes</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {randomizedLiveRooms.map(room => (
                                <div 
                                    key={room.id}
                                    onClick={() => { onSelectParty(room.id); logClickTelemetry('LiveRoomCard', room.name); }}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-green-500/40 relative shadow-md transition-all"
                                >
                                    <div className="absolute top-2 left-2 bg-green-500 text-neutral-950 text-[8px] font-black tracking-wider px-2 py-0.5 rounded-lg border border-green-400/20 z-10 font-mono animate-pulse flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-neutral-950 rounded-full"></span> LIVE
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/80 border border-neutral-800 text-neutral-400 text-[9px] font-bold px-1.5 py-0.5 rounded-lg z-10">
                                        {room.simulatedActive || 3}/8
                                    </div>
                                    <div className="h-28 relative overflow-hidden">
                                        <img src={room.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
                                    </div>
                                    <div className="p-3.5">
                                        <h3 className="font-bold text-sm text-neutral-100 truncate">{room.name}</h3>
                                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">Hosted by: Darius</p>
                                        <div className="flex items-center justify-between mt-3 text-[9px] font-semibold">
                                            <span className="text-neutral-500 font-mono">Format: {room.rpFormat || 'Group'}</span>
                                            <span className="text-green-400 hover:underline">ENTER STAGE →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4.5 TOP CREATORS ROW */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
                            <Users className="w-5 h-5 text-yellow-500" />
                            Elite Creators
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
                            {topCreatorsList.map(cr => {
                                const isFollowing = followingList.includes(cr.id);
                                return (
                                    <div key={cr.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center text-center group">
                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-800 group-hover:border-yellow-500/40 relative mb-2 transition-colors">
                                            <img src={cr.avatarUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="font-bold text-xs text-white truncate max-w-full">{cr.name}</h3>
                                        <p className="text-[8px] text-neutral-500 font-mono mt-0.5">@creator_{(cr.name || '').toLowerCase().replace(/\s+/g, '')}</p>
                                        
                                        <button
                                            onClick={() => handleToggleFollow(cr.id, cr.name)}
                                            className={`mt-3.5 w-full py-1 rounded-lg text-[10px] font-black border transition-all ${isFollowing ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-yellow-500 hover:bg-yellow-400 text-neutral-950 border-transparent shadow shadow-yellow-500/10'}`}
                                        >
                                            {isFollowing ? 'FOLLOWED' : 'FOLLOW'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            ) : (
                /* --- 3. DYNAMIC RESULTS LIST GRID AREA (Section 3.1) --- */
                <div>
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3.5 mb-6">
                        <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono font-black">
                            <span>Index scanned: {allSearchResults.length} hits matching criteria</span>
                        </div>

                        {/* 5.1 SORT DROPDOWN SELECTOR (Section 5) */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-neutral-500 font-bold font-mono">Sort Order:</span>
                            <div className="relative inline-block text-left">
                                <select
                                    value={sortOption}
                                    onChange={(e) => {
                                        setSortOption(e.target.value);
                                        logClickTelemetry('SortingChange', e.target.value);
                                        showToast(`Sort order updated: ${e.target.value}`);
                                    }}
                                    className="bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-xs py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer"
                                    style={{ WebkitAppearance: 'none' }}
                                >
                                    <option value="Relevance">Relevance</option>
                                    <option value="Latest">Latest</option>
                                    <option value="Popular">Popular (likes)</option>
                                    <option value="Alphabetical">A–Z</option>
                                    <option value="Most Members">Most Members</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-500">
                                    <ChevronDown className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Layout Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {paginatedResults.map((result, idx) => {
                            const type = result.type;
                            const item = result.data;
                            const itemKey = `${type}-${item.id}`;
                            const isSaved = savedList.has(itemKey);
                            
                            // Age Rating warning unblur state rule check
                            const rating: AgeRating = item.contentMetadata?.ageRating || 'Everyone';
                            const isMatureBlurred = rating === 'Mature' && safetyShield === 'Moderate' && !revealedMatureItems.has(itemKey);

                            return (
                                <div 
                                    key={idx}
                                    className="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-inner ring-1 ring-white/5 transition-all duration-300 hover:border-cyan-500/30 hover:scale-[1.01] flex flex-col justify-between"
                                >
                                    <div className="relative">
                                        {/* Age Rating Badge */}
                                        <span className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-lg text-[9px] font-black border text-white ${rating === 'Mature' ? 'bg-red-950 border-red-500/40 text-red-400' : rating === 'Teen' ? 'bg-yellow-950 border-yellow-500/40 text-yellow-400' : 'bg-green-950 border-green-500/40 text-green-400'}`}>
                                            {rating === 'Mature' ? '18' : rating === 'Teen' ? '13' : 'E'}
                                        </span>

                                        {/* Card Cover Photo with Blurred warning overlay trigger */}
                                        <div className="h-36 relative overflow-hidden bg-neutral-950 select-none">
                                            <img 
                                                src={item.imageUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400'} 
                                                className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${isMatureBlurred ? 'blur-2xl opacity-60 scale-95' : 'blur-none'}`} 
                                            />
                                            {isMatureBlurred && (
                                                <div className="absolute inset-0 bg-neutral-950/80 p-3 h-full flex flex-col items-center justify-center text-center z-10">
                                                    <ShieldAlert className="w-6 h-6 text-red-500 mb-1.5 animate-bounce" />
                                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Mature Content</span>
                                                    <button 
                                                        onClick={() => {
                                                            setRevealedMatureItems(prev => {
                                                                const next = new Set(prev);
                                                                next.add(itemKey);
                                                                return next;
                                                            });
                                                        }}
                                                        className="px-2.5 py-1 bg-red-900/35 hover:bg-red-800/50 text-[9px] font-bold text-white rounded-lg border border-red-500/30 transition-colors"
                                                    >
                                                        REVEAL IMAGE
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Universal Quick Action Floating menu block (Section 3.3) */}
                                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-20">
                                            <button
                                                onClick={() => handleToggleSave(itemKey, item.name || item.title)}
                                                className={`p-1.5 rounded-lg border backdrop-blur-md transition-all ${isSaved ? 'bg-cyan-500/25 border-cyan-500/40 text-cyan-300' : 'bg-black/40 border-neutral-800 text-neutral-400 hover:text-white'}`}
                                                title="Save to Library"
                                            >
                                                <Bookmark className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleShare(type, String(item.id), item.name || item.title)}
                                                className="p-1.5 bg-black/40 border border-neutral-800 backdrop-blur-md rounded-lg text-neutral-400 hover:text-white"
                                                title="Share Invite"
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleReport(itemKey, item.name || item.title)}
                                                className="p-1.5 bg-black/40 border border-neutral-800 backdrop-blur-md rounded-lg text-neutral-400 hover:text-red-400"
                                                title="Report content"
                                            >
                                                <Flag className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* --- DYNAMIC RENDERING PER CONTENT TYPE (Section 3.2) --- */}
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                        
                                        {/* A. ORIGINAL CHARACTERS (OCs) */}
                                        {type === 'OC' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-cyan-900/30 border border-cyan-500/20 text-cyan-400 uppercase tracking-widest font-mono">OC Character</span>
                                                    <h3 className="font-bold text-base text-neutral-100 truncate mt-1">{item.name}</h3>
                                                    <p className="text-[10px] text-neutral-500">by Creator id: {item.authorId}</p>
                                                </div>
                                                <p className="text-xs text-neutral-400 line-clamp-2 h-8">{item.tagline || 'Original Character blueprint, fully configured for active roleplay stages.'}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(item.archetypeTags || ['Tactical', 'Mage']).slice(0, 3).map((tg: string) => (
                                                        <span key={tg} className="text-[9px] bg-neutral-950 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md">#{tg}</span>
                                                    ))}
                                                </div>
                                                <div className="pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-1.5">
                                                    <button 
                                                        onClick={() => onSelectParty(30)}
                                                        className="flex-grow py-1.5 bg-cyan-600 hover:bg-cyan-500 text-neutral-950 rounded-xl text-xs font-black"
                                                    >
                                                        VIEW CHARACTER
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleFollow(item.authorId, `Creator ${item.authorId}`)}
                                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${followingList.includes(item.authorId) ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'}`}
                                                    >
                                                        {followingList.includes(item.authorId) ? 'FOLLOWED' : 'FOLLOW'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* B. WORLDS CARD */}
                                        {type === 'World' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-900/30 border border-purple-500/20 text-purple-400 uppercase tracking-widest font-mono">World Realm</span>
                                                    <h3 className="font-bold text-base text-neutral-100 truncate mt-1">{item.name}</h3>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(item.members?.length || 5) * 12} members online</p>
                                                </div>
                                                <p className="text-xs text-neutral-400 line-clamp-2 h-8">{item.tagline || 'Immersive space, lore chronicles, and custom rules sets pre-loaded.'}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(item.genreTags || ['Fantasy', 'Rulebase']).slice(0, 3).map((tg: string) => (
                                                        <span key={tg} className="text-[9px] bg-neutral-950 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md">{tg}</span>
                                                    ))}
                                                </div>
                                                <div className="pt-2.5 border-t border-neutral-800/60 flex items-center gap-1.5">
                                                    <button 
                                                        onClick={() => onSelectWorld(item.id)}
                                                        className="flex-grow py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-xl text-xs font-bold"
                                                    >
                                                        PREVIEW REALM
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleJoinWorld(item.id, item.name)}
                                                        className={`flex-grow py-1.5 rounded-xl text-xs font-black transition-colors ${joinedWorlds.has(item.id) ? 'bg-neutral-800 border border-neutral-700 text-neutral-400' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                                                    >
                                                        {joinedWorlds.has(item.id) ? 'JOINED' : 'JOIN WORLD'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* C. STORY CARD */}
                                        {type === 'Story' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest font-mono">Roleplay Story</span>
                                                    <h3 className="font-bold text-base text-neutral-100 truncate mt-1">{item.name}</h3>
                                                    <p className="text-[10px] text-neutral-500">Chapters: {item.chapters?.length || 1} • Last update: 21/06/2026</p>
                                                </div>
                                                <p className="text-xs text-neutral-400 line-clamp-2 h-8">{item.synopsis || 'Interactive campaign story logs written by veteran players.'}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(item.genreTags || ['Sci-Fi', 'Space']).slice(0, 3).map((tg: string) => (
                                                        <span key={tg} className="text-[9px] bg-neutral-950 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md">{tg}</span>
                                                    ))}
                                                </div>
                                                <div className="pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-1.5">
                                                    <button 
                                                        onClick={() => onViewStory(item.id)}
                                                        className="flex-grow py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 rounded-xl text-xs font-black"
                                                    >
                                                        READ STORY
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleFollow(item.authorId, `Author ${item.authorId}`)}
                                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${followingList.includes(item.authorId) ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'}`}
                                                    >
                                                        {followingList.includes(item.authorId) ? 'FOLLOWED' : 'FOLLOW'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* D. LIVE ROOM CARD */}
                                        {type === 'Live Room' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-red-900/30 border border-red-500/20 text-red-400 uppercase tracking-widest font-mono">Active Live Room</span>
                                                    <h3 className="font-bold text-base text-neutral-100 truncate mt-1">{item.name}</h3>
                                                    <p className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1 font-mono"><Users className="w-3.5 h-3.5" /> Stage: Social | Host: Darius</p>
                                                </div>
                                                <p className="text-xs text-neutral-400 line-clamp-2 h-8">{item.description || 'Casual roleplay and live discussion on general campaign topics.'}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(item.genreTags || ['Cyberpunk', 'Action']).slice(0, 3).map((tg: string) => (
                                                        <span key={tg} className="text-[9px] bg-neutral-950 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md">{tg}</span>
                                                    ))}
                                                </div>
                                                <div className="pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-1.5">
                                                    <button 
                                                        onClick={() => onSelectParty(item.id)}
                                                        className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black animate-pulse"
                                                    >
                                                        JOIN LIVE CHAT →
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* E. USER CARD */}
                                        {type === 'User' && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700">
                                                        <img src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm text-neutral-100 truncate">{item.name}</h4>
                                                        <span className="text-[10px] text-neutral-500 font-mono">@creator_{(item.name || '').toLowerCase().replace(/\s+/g, '')}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-neutral-950 p-2 rounded-xl text-[10px] space-y-1 text-neutral-400 border border-neutral-800 font-mono">
                                                    <div className="flex justify-between">
                                                        <span>User Rank:</span>
                                                        <span className="text-yellow-500 font-bold">Traveler ★</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Power Rating:</span>
                                                        <span className="text-cyan-400 font-bold">{item.sparkClashProfile?.battlePower || 450} BSP</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2.5 border-t border-neutral-800/60 flex items-center gap-1.5">
                                                    <button 
                                                        onClick={() => { onStartConversation(item.id); logClickTelemetry('UserMessage', item.name); }}
                                                        className="flex-grow py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-xl text-xs font-bold"
                                                    >
                                                        MESSAGE
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleFollow(item.id, item.name)}
                                                        className={`flex-grow py-1.5 rounded-xl text-xs font-black border transition-all ${followingList.includes(item.id) ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-cyan-600 hover:bg-cyan-500 text-neutral-950 border-transparent'}`}
                                                    >
                                                        {followingList.includes(item.id) ? 'FOLLOWED' : 'FOLLOW'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlockCreator(item.id, item.name)}
                                                        className="p-1.5 bg-red-950/20 hover:bg-red-950/50 text-red-500 rounded-lg"
                                                        title="Block user"
                                                    >
                                                        <VolumeX className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* F. COMMUNITY CARD */}
                                        {type === 'Community' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-yellow-900/30 border border-yellow-500/20 text-yellow-400 uppercase tracking-widest font-mono">Community Clan</span>
                                                    <h3 className="font-bold text-base text-neutral-100 truncate mt-1">{item.name}</h3>
                                                    <p className="text-[10px] text-yellow-400 font-mono mt-0.5">{item.tag || '[COSMIC]'} • {item.members?.length || 2} members</p>
                                                </div>
                                                <p className="text-xs text-neutral-400 line-clamp-2 h-8">{item.description || 'A unified network of creators focused on structured world building.'}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(item.tags || ['Roleplay', 'Lounge']).slice(0, 3).map((tg: string) => (
                                                        <span key={tg} className="text-[9px] bg-neutral-950 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md">{tg}</span>
                                                    ))}
                                                </div>
                                                <div className="pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-1.5 font-sans">
                                                    <button 
                                                        onClick={() => onSelectCommunity && onSelectCommunity(item.id)}
                                                        className="flex-grow py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-xl text-xs font-bold"
                                                    >
                                                        CLAN ROOM
                                                    </button>
                                                    <button 
                                                        onClick={() => showToast(`Requested invitation entry for clan ${item.name}`)}
                                                        className="flex-grow py-1.5 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 rounded-xl text-xs font-black"
                                                    >
                                                        JOIN CLAN
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* G. ROLEPLAY EVENTS */}
                                        {type === 'Event' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-900/30 border border-amber-500/40 text-amber-400 uppercase tracking-widest font-mono">Weekly Event Session</span>
                                                    <h3 className="font-bold text-base text-neutral-100 truncate mt-1">{item.title}</h3>
                                                    <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono mt-0.5"><MapPin className="w-3.5 h-3.5 text-neutral-500" /> {item.worldName}</p>
                                                </div>
                                                <p className="text-xs text-neutral-400 line-clamp-2 h-8">{item.description}</p>
                                                <div className="bg-neutral-950 p-2 rounded-xl text-[10px] space-y-0.5 text-neutral-400 border border-neutral-800">
                                                    <div className="flex justify-between">
                                                        <span>Date / TIme:</span>
                                                        <span className="text-white font-bold">{item.dateTime}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Stage Format:</span>
                                                        <span className="text-cyan-400 font-bold">{item.stageMode}</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2.5 border-t border-neutral-800/60 flex items-center gap-1.5">
                                                    <button 
                                                        onClick={() => handleToggleRSVP(item.id, item.title)}
                                                        className={`flex-grow py-1.5 rounded-xl text-xs font-black transition-all ${rsvpEvents.has(item.id) ? 'bg-neutral-800 border border-neutral-700 text-neutral-400' : 'bg-amber-600 hover:bg-amber-500 text-neutral-950'}`}
                                                    >
                                                        {rsvpEvents.has(item.id) ? 'RSVP ACTIVE ★' : 'RSVP FOR EVENT'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* --- EMPTY RESULT STATE (Section 3.1) --- */}
                    {allSearchResults.length === 0 && (
                        <div className="mt-12 text-center max-w-md mx-auto p-8 rounded-2xl bg-neutral-900 border border-neutral-800 border-dashed animate-fadeIn">
                            <Compass className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                            <h3 className="text-sm font-black text-white">No search results found</h3>
                            <p className="text-xs text-neutral-400 mt-2">Try adjusting your filters, safety toggles, or broaden your queries by removing minus operators (`-`) or exact phrases (`""`).</p>
                            <button
                                onClick={() => {
                                    handleClearSearchInput();
                                    setActiveFilters(['All']);
                                }}
                                className="mt-4 px-4 py-1.5 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/80 rounded-xl text-xs font-bold inline-block"
                            >
                                Reset Search Constraints
                            </button>
                        </div>
                    )}

                    {/* --- INFINITE SCROLL / LOAD MORE (Section 3.1 & 12) --- */}
                    {visibleCount < allSearchResults.length && (
                        <div className="mt-8 flex justify-center pb-12 select-none">
                            <button 
                                onClick={() => {
                                    setLoadingMore(true);
                                    setTimeout(() => {
                                        setVisibleCount(prev => prev + 8);
                                        setLoadingMore(false);
                                    }, 800);
                                }}
                                disabled={loadingMore}
                                className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-black text-neutral-300 transition-colors flex items-center gap-2"
                            >
                                {loadingMore ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                                        <span>Loading Next Batch...</span>
                                    </>
                                ) : (
                                    <span>SCROLL OR CLICK TO LOAD MORE RESULTS</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExplorePage;
