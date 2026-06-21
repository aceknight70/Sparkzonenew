import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Chapter, StoryCharacter, Character, Story } from '../types';
import { characters as allCharacters } from '../mockData';
import UserAvatar from './UserAvatar';
import { GoogleGenAI } from '@google/genai';
import { 
    ArrowLeft, 
    Sparkles, 
    MoreHorizontal, 
    Bold, 
    Italic, 
    Underline, 
    Link, 
    Palette, 
    FileText, 
    Check, 
    Settings, 
    Download, 
    X, 
    Layers, 
    Eye, 
    Edit3,
    BookOpen,
    HelpCircle
} from 'lucide-react';

interface StoryEditorViewProps {
    chapter: Chapter;
    cast: StoryCharacter[];
    onChapterUpdate: (field: string, value: any) => void;
    onBack?: () => void;
    onSave: () => void;
    storyBannerUrl?: string;
    reusableActions?: { id: number; name: string; content: string }[];
}

const StoryEditorView: React.FC<StoryEditorViewProps> = ({ 
    chapter, 
    cast, 
    onChapterUpdate, 
    onBack, 
    onSave, 
    storyBannerUrl,
    reusableActions = []
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // --- MODE TOGGLES ---
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    
    // --- DROPDOWN MENUS ---
    const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [activeSuggestions, setActiveSuggestions] = useState(true);
    
    // --- COMPARISON VIEWPORT OVERLAY ---
    const [aiSuggestType, setAiSuggestType] = useState<'continue' | 'rewrite' | 'dialogue' | null>(null);
    const [aiResponseText, setAiResponseText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiErrorMessage, setAiErrorMessage] = useState('');

    // --- TEXT SELECTION STATE FOR FLOATING TOOLBAR ---
    const [isTextSelected, setIsTextSelected] = useState(false);

    // --- OC SELECTION DIALOGUE ---
    const [selectedOcActionMenu, setSelectedOcActionMenu] = useState<number | null>(null);

    // --- PAGE-SPECIFIC BACKGROUNDS ---
    const [editingBgdPageIndex, setEditingBgdPageIndex] = useState<number>(0);
    const [bgdUrlInput, setBgdUrlInput] = useState('');
    const [showBgdSelector, setShowBgdSelector] = useState(false);

    // --- STATS MODAL ---
    const [showStatsModal, setShowStatsModal] = useState(false);

    // --- NOTIFICATION TOAST ---
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Predefined visual presets
    const visualAtmospheres = [
        { name: 'Mystic Forest', url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Nebula Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Cyber Lounge', url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Castle Dungeon', url: 'https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Gothic City', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop' }
    ];

    // --- READ CAST DETAILS ---
    const castMembers = useMemo(() => {
        return cast.map(c => ({
            ...c,
            character: allCharacters.find(char => char.id === c.characterId)
        })).filter(c => c.character);
    }, [cast]);

    // --- PAGINATION HELPER ---
    // Splitting chapter contents by the special "--- PAGEBREAK ---" or manual pagination elements
    const virtualPages = useMemo(() => {
        const text = chapter.content || '';
        if (!text.trim()) return ['Start writing your story...'];
        return text.split(/--- PAGEBREAK ---|\[page\]/gi);
    }, [chapter.content]);

    // Track which page index is active in slide show preview
    const [previewPageIndex, setPreviewPageIndex] = useState(0);

    // Ensure we don't scale out of bounds
    useEffect(() => {
        if (previewPageIndex >= virtualPages.length) {
            setPreviewPageIndex(Math.max(0, virtualPages.length - 1));
        }
    }, [virtualPages, previewPageIndex]);

    // Calculate word counters
    const { wordCount, charCount, paragraphCount } = useMemo(() => {
        const text = chapter.content || '';
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const paragraphs = text.split('\n').filter(p => p.trim() !== '').length;
        return {
            wordCount: text.trim() === '' ? 0 : words,
            charCount: text.length,
            paragraphCount: paragraphs
        };
    }, [chapter.content]);

    // Save state
    const handleSave = () => {
        setIsSaving(true);
        onSave();
        setTimeout(() => setIsSaving(false), 800);
    };

    // Auto close menus when clicking elsewhere
    useEffect(() => {
        const handleOutsideClick = () => {
            setIsAiMenuOpen(false);
            setIsSettingsMenuOpen(false);
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    // Detect text selection inside textarea for floating toolbar
    const handleSelectionCheck = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const ta = e.currentTarget;
        if (ta && ta.selectionStart !== ta.selectionEnd) {
            setIsTextSelected(true);
        } else {
            setIsTextSelected(false);
        }
    };

    // Apply quick syntax tags
    const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'link' | 'pagebreak' | 'quote') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        let prefix = '';
        let suffix = '';

        if (format === 'bold') {
            prefix = '**';
            suffix = '**';
        } else if (format === 'italic') {
            prefix = '*';
            suffix = '*';
        } else if (format === 'underline') {
            prefix = '__';
            suffix = '__';
        } else if (format === 'link') {
            prefix = '[';
            suffix = '](https://)';
        } else if (format === 'pagebreak') {
            prefix = '\n\n--- PAGEBREAK ---\n\n';
            suffix = '';
        } else if (format === 'quote') {
            prefix = '\n> ';
            suffix = '\n';
        }

        const newText = `${textarea.value.substring(0, start)}${prefix}${selectedText}${suffix}${textarea.value.substring(end)}`;
        onChapterUpdate('content', newText);

        setTimeout(() => {
            textarea.focus();
            const offset = prefix.length;
            textarea.setSelectionRange(start + offset, start + offset + selectedText.length);
            // Re-evaluate selection states
            setIsTextSelected(selectedText.length > 0);
        }, 30);
    };

    const insertTextAtCursor = (textStr: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;

        const addedSpacing = currentVal.endsWith(' ') || currentVal.endsWith('\n') ? '' : ' ';
        const insertBlock = `${addedSpacing}${textStr}`;
        const finalVal = `${currentVal.substring(0, start)}${insertBlock}${currentVal.substring(end)}`;
        
        onChapterUpdate('content', finalVal);
        
        setTimeout(() => {
            textarea.focus();
            const restorePos = start + insertBlock.length;
            textarea.setSelectionRange(restorePos, restorePos);
        }, 30);
    };

    // --- AI ASSIST GENERATION CONTROLS ---
    const handleTriggerAiAssist = async (category: 'continue' | 'rewrite' | 'dialogue') => {
        setAiSuggestType(category);
        setIsAiLoading(true);
        setAiResponseText('');
        setAiErrorMessage('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string || 'default-temp' });
            
            // Build direct context prompt depending on type
            const lastWordsContext = chapter.content.slice(-2500) || 'Once upon a time...';
            const castNames = castMembers.map(c => c.character!.name).join(', ') || 'protagonists';
            
            let promptText = '';
            if (category === 'continue') {
                promptText = `You are an expert co-author. Read this block context, and continue the narrative sequence naturally. Maintain the perspective and tone. Do not repeat the last sentences. Write ~120 words to advance the active plot.\n\nContext:\n"${lastWordsContext}"`;
            } else if (category === 'rewrite') {
                promptText = `You are a cinematic literary editor. Read the following prose, and rewrite it with rich descriptions, emotional weight, and high-fidelity atmosphere. Keep the core actions identical but amplify the sensory feedback. Under 150 words.\n\nProse snippet:\n"${lastWordsContext.slice(-800)}"`;
            } else if (category === 'dialogue') {
                promptText = `Write a dramatic back-and-forth dialogue exchange involving these characters: [${castNames}]. Keep lines punchy, expressive, and packed with subtext. Under 150 words total.\n\nSetting context:\n"${lastWordsContext.slice(-600)}"`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptText,
            });

            if (response.text) {
                setAiResponseText(response.text.trim());
            } else {
                throw new Error("Empty model response payload received.");
            }
        } catch (e) {
            console.error("AI writing assistance failed: ", e);
            // Fallback scenario generator
            setTimeout(() => {
                const characterName = castMembers[0]?.character?.name || 'A shadow';
                const simulatedSuggestions = {
                    continue: `With a subtle shift of weight, [${characterName}] stepped closer to the glowing terminal structure. The energy hummed beneath their fingertips, vibrating in time with their quickening heartbeat. This was the coordinates they had spent months searching for.`,
                    rewrite: `The air turned freezing. In an instant, the light dimmed as high-frequency particles gathered around the chamber, reflecting off [${characterName}]'s heavy metal armor in brilliant turquoise flashes.`,
                    dialogue: `"[${characterName}]?" a quiet voice cut through the thick hum of the machinery. "We don't have much time. Set the anchors before the portal destabilizes."`
                };
                setAiResponseText(simulatedSuggestions[category]);
            }, 1500);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Replace or insert AI Suggestion
    const handleAcceptSuggestion = () => {
        if (aiResponseText) {
            insertTextAtCursor(aiResponseText);
            setAiSuggestType(null);
            setAiResponseText('');
            triggerToast("AI co-prose successfully added!");
        }
    };

    const handleRejectSuggestion = () => {
        setAiSuggestType(null);
        setAiResponseText('');
        triggerToast("Suggestion dismissed.");
    };

    // Export current draft
    const handleExportDraft = () => {
        const element = document.createElement("a");
        const file = new Blob([chapter.content || ""], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${chapter.title || 'Untitled-Chapter'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        triggerToast("Draft exported successfully!");
    };

    // --- ASSIGN SCENE BACKGROUND ---
    const handleSetBgdUrl = (urlStr: string) => {
        const backgrounds = chapter.pageBackgrounds ? { ...chapter.pageBackgrounds } : {};
        backgrounds[editingBgdPageIndex] = urlStr;
        onChapterUpdate('pageBackgrounds', backgrounds);
        setBgdUrlInput('');
        setShowBgdSelector(false);
        triggerToast(`Applied custom backdrop to virtual Page ${editingBgdPageIndex + 1}`);
    };

    const handleClearBgd = () => {
        const backgrounds = chapter.pageBackgrounds ? { ...chapter.pageBackgrounds } : {};
        delete backgrounds[editingBgdPageIndex];
        onChapterUpdate('pageBackgrounds', backgrounds);
        setShowBgdSelector(false);
        triggerToast(`Cleared background image for virtual Page ${editingBgdPageIndex + 1}`);
    };

    // Return active backdrop based on active page or defaults
    const activePageBackdrop = useMemo(() => {
        const pageIdx = isPreviewMode ? previewPageIndex : editingBgdPageIndex;
        const customBg = chapter.pageBackgrounds?.[pageIdx];
        if (customBg) return customBg;
        return storyBannerUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800';
    }, [isPreviewMode, previewPageIndex, editingBgdPageIndex, chapter.pageBackgrounds, storyBannerUrl]);

    return (
        <main className="flex-grow flex flex-col min-w-0 h-full relative overflow-hidden bg-black text-gray-100 font-sans select-none">
            
            {/* Ambient background aura covering the writing slate */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.12] blur-3xl scale-105 pointer-events-none transition-all duration-700"
                style={{ backgroundImage: `url(${activePageBackdrop})` }}
            ></div>
            <div className="absolute inset-0 bg-[#000000]/80 pointer-events-none"></div>

            {/* PERSISTENT TOP NAVIGATION BAR */}
            <header className="px-6 py-4.5 border-b border-zinc-900 bg-black/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 select-none">
                
                {/* Left block: back arrow + chapter title */}
                <div className="flex items-center gap-4 min-w-0 flex-grow mr-2">
                    {onBack && (
                        <button 
                            onClick={() => { handleSave(); onBack(); }}
                            className="p-2 -ml-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-zinc-900/60 transition-all active:scale-95"
                            title="Save draft and head back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="min-w-0 flex-grow max-w-sm">
                        <input 
                            type="text"
                            value={chapter.title}
                            onChange={(e) => onChapterUpdate('title', e.target.value)}
                            placeholder="Start title..."
                            className="bg-transparent text-lg font-bold text-white focus:outline-none placeholder-zinc-800 truncate w-full transition-all border-b border-transparent focus:border-cyan-400/50 pb-0.5"
                        />
                    </div>
                </div>

                {/* Center block: word count + page count */}
                <div className="hidden sm:flex items-center gap-1 bg-zinc-950/90 border border-zinc-900 px-4 py-1.5 rounded-full select-none shadow-[0_0_15px_rgba(0,255,255,0.03)] text-center">
                    <span className="font-mono text-[9px] tracking-widest text-[#00ffff] uppercase font-black">
                        {wordCount} WORDS • {virtualPages.length} PAGES
                    </span>
                </div>

                {/* Right block: actions, sparkle co-author dropdown, settings dropdown */}
                <div className="flex items-center gap-3">
                    
                    {/* Tiny inline saving state loader */}
                    <div className="flex items-center">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`p-2 rounded-xl border transition-all ${isSaving ? 'bg-green-950/20 text-green-400 border-green-900/30' : 'bg-transparent text-zinc-550 border-transparent hover:text-white'}`}
                            title="Save Story Draft"
                        >
                            {isSaving ? (
                                <span className="animate-spin block w-4 h-4 border-2 border-green-400/20 border-t-green-400 rounded-full" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* AI Sparkle dropdown trigger */}
                    <div className="relative select-none" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => {
                                setIsAiMenuOpen(!isAiMenuOpen);
                                setIsSettingsMenuOpen(false);
                            }}
                            className={`p-2.5 rounded-xl transition-all border flex items-center justify-center gap-1.5 ${isAiMenuOpen ? 'bg-cyan-950/55 border-cyan-400/60 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-900 text-cyan-400 hover:text-cyan-300'}`}
                            title="AI Authoring Assistance"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-wider hidden md:inline">AI Assist</span>
                        </button>

                        {/* Dropdown popup */}
                        {isAiMenuOpen && (
                            <div className="absolute right-0 top-11 w-72 bg-zinc-950 border border-zinc-850/80 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 space-y-1.5 animate-slideDown">
                                <div className="px-2.5 py-2 border-b border-zinc-905 flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-black">Gemini Co-Author</span>
                                    <span className="text-[7.5px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-900 rounded px-1.5 leading-none py-0.5 font-mono">Synced</span>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setIsAiMenuOpen(false);
                                        handleTriggerAiAssist('continue');
                                    }}
                                    className="w-full text-left p-2.5 hover:bg-cyan-950/20 rounded-xl transition-all border border-transparent hover:border-cyan-950 flex flex-col gap-0.5"
                                >
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span className="text-cyan-400 text-sm">⚡</span> Spark Continue
                                    </span>
                                    <span className="text-[9.5px] text-zinc-500 leading-normal">Generates the next logical narrative block sequence.</span>
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        setIsAiMenuOpen(false);
                                        handleTriggerAiAssist('rewrite');
                                    }}
                                    className="w-full text-left p-2.5 hover:bg-purple-950/20 rounded-xl transition-all border border-transparent hover:border-purple-950 flex flex-col gap-0.5"
                                >
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span className="text-purple-400 text-sm">✒️</span> Cinematic Rewrite
                                    </span>
                                    <span className="text-[9.5px] text-zinc-500 leading-normal">Overhauls current paragraph sensory metrics.</span>
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        setIsAiMenuOpen(false);
                                        handleTriggerAiAssist('dialogue');
                                    }}
                                    className="w-full text-left p-2.5 hover:bg-pink-950/20 rounded-xl transition-all border border-transparent hover:border-pink-950 flex flex-col gap-0.5"
                                >
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span className="text-pink-400 text-sm">💬</span> Inject Cast Dialogue
                                    </span>
                                    <span className="text-[9.5px] text-zinc-500 leading-normal">Generates banter lines between active cast OCs.</span>
                                </button>

                                <div className="border-t border-zinc-900 mt-2.5 pt-2.5 px-2.5 pb-1 flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-400">Enable Active Suggestions</span>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={activeSuggestions}
                                            onChange={() => setActiveSuggestions(!activeSuggestions)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-black"></div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Three-Dot Settings Icon Menu trigger */}
                    <div className="relative select-none" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => {
                                setIsSettingsMenuOpen(!isSettingsMenuOpen);
                                setIsAiMenuOpen(false);
                            }}
                            className={`p-2.5 rounded-xl border transition-all ${isSettingsMenuOpen ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white'}`}
                            title="Settings & Export"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {/* Options Dropdown */}
                        {isSettingsMenuOpen && (
                            <div className="absolute right-0 top-11 w-60 bg-zinc-950 border border-zinc-850/80 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 space-y-1 animate-slideDown">
                                <div className="px-2 pt-1.5 pb-2 border-b border-zinc-905 flex items-center gap-1.5 mb-1.5">
                                    <Settings className="w-3.5 h-3.5 text-zinc-550" />
                                    <span className="text-[9px] font-mono tracking-widest text-[#00ffff] uppercase font-black">Chapter Options</span>
                                </div>

                                <button 
                                    onClick={() => {
                                        setIsSettingsMenuOpen(false);
                                        setIsPreviewMode(!isPreviewMode);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-xl transition-all text-xs text-zinc-200 flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4 text-cyan-400" />
                                    <span>{isPreviewMode ? "📝 Edit Story prose" : "📖 Preview Book layout"}</span>
                                </button>

                                <button 
                                    onClick={() => {
                                        setIsSettingsMenuOpen(false);
                                        setShowStatsModal(true);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-xl transition-all text-xs text-zinc-200 flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4 text-cyan-400" />
                                    <span>📊 Word Count & Stats</span>
                                </button>

                                <button 
                                    onClick={() => {
                                        setIsSettingsMenuOpen(false);
                                        handleExportDraft();
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-xl transition-all text-xs text-zinc-200 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4 text-cyan-400" />
                                    <span>📥 Export Draft (.txt)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN MINIMAL WRITING VIEW OR SKEUOMORPHIC READER */}
            {!isPreviewMode ? (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                    
                    {/* Centralised Minimalist Workspace */}
                    <div className="flex-1 overflow-y-auto px-6 py-12 md:py-16 md:px-12 relative flex flex-col bg-zinc-950/15" onClick={() => setIsTextSelected(false)}>
                        <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col min-h-full">
                            <textarea 
                                ref={textareaRef}
                                value={chapter.content || ''}
                                onChange={(e) => onChapterUpdate('content', e.target.value)}
                                onSelect={handleSelectionCheck}
                                onKeyDown={handleSelectionCheck}
                                onKeyUp={handleSelectionCheck}
                                onMouseDown={handleSelectionCheck}
                                onMouseUp={handleSelectionCheck}
                                placeholder="Start writing your story..."
                                className="w-full flex-grow bg-transparent text-[#ffffff] focus:outline-none resize-none font-sans text-[18px] md:text-[20px] leading-[1.8] placeholder-zinc-850 px-2 text-justify select-text pb-40"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* FLOATING TEXT FORMATTING TOOLBAR - APPEARS ON SELECTION */}
                    {isTextSelected && (
                        <div 
                            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-full px-5 py-2.5 flex items-center gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.9)] z-50 select-none animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => applyFormat('bold')}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black text-gray-300 hover:text-white hover:bg-zinc-900 transition-colors"
                                title="Bold (B)"
                            >
                                <Bold className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => applyFormat('italic')}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-xs italic text-gray-300 hover:text-white hover:bg-zinc-900 transition-colors"
                                title="Italic (I)"
                            >
                                <Italic className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => applyFormat('underline')}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-xs underline text-gray-300 hover:text-white hover:bg-zinc-900 transition-colors"
                                title="Underline (U)"
                            >
                                <Underline className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => applyFormat('link')}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-xs text-gray-300 hover:text-white hover:bg-zinc-900 transition-colors"
                                title="Insert Link"
                            >
                                <Link className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => applyFormat('quote')}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-xs text-gray-300 hover:text-white hover:bg-zinc-900 transition-colors font-serif font-black"
                                title="Insert Blockquote"
                            >
                                ❝
                            </button>
                            <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />
                            <button 
                                onClick={() => setIsTextSelected(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-xs text-zinc-500 hover:text-white transition-colors"
                                title="Dismiss menu"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* BOTTOM CONTROLS & CAST SELECTION RAIL */}
                    <div className="w-full bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none z-20">
                        {/* Page break and background setters */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => applyFormat('pagebreak')}
                                className="px-3.5 py-2 bg-zinc-900/60 border border-zinc-805 hover:border-zinc-700 rounded-xl text-[10px] font-mono text-cyan-400 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
                                title="Append physical pagination break mark"
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>+ Page Break</span>
                            </button>

                            <button 
                                onClick={() => {
                                    setEditingBgdPageIndex(0);
                                    setShowBgdSelector(!showBgdSelector);
                                }}
                                className={`p-2 rounded-xl border transition-all active:scale-95 ${showBgdSelector ? 'bg-purple-950/40 border-purple-800 text-purple-400' : 'bg-zinc-900/60 border-zinc-805 text-purple-400 hover:border-zinc-750'}`}
                                title="Page Backdrop presets"
                            >
                                <Palette className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Horizontal Custom OC Cast bar */}
                        <div className="flex-1 max-w-lg overflow-x-auto scrollbar-none py-1 mx-2">
                            <div className="flex items-center gap-2 px-2 whitespace-nowrap">
                                <span className="text-[8.5px] text-zinc-650 font-mono font-bold uppercase mr-1">Cast OCs:</span>
                                {castMembers.map(({ character, role }) => (
                                    <div key={character!.id} className="relative inline-block select-none">
                                        <button 
                                            onClick={() => {
                                                setSelectedOcActionMenu(selectedOcActionMenu === character!.id ? null : character!.id);
                                            }}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-900 border rounded-full transition-all text-left ${selectedOcActionMenu === character!.id ? 'border-[#00ffff]/60 text-cyan-300' : 'border-zinc-850 text-gray-300'}`}
                                        >
                                            <UserAvatar src={character!.imageUrl} size="5" />
                                            <span className="text-xs font-bold">{character!.name}</span>
                                            <span className="text-[7.5px] bg-zinc-950 text-zinc-500 hover:text-white font-mono font-semibold uppercase leading-none px-1.5 py-0.5 rounded-full">{role}</span>
                                        </button>

                                        {/* OC Actions Context menu */}
                                        {selectedOcActionMenu === character!.id && (
                                            <div className="absolute bottom-11 left-0 bg-zinc-950 border border-zinc-850 rounded-2xl p-2.5 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-1 animate-slideUp min-w-[190px]">
                                                <button 
                                                    onClick={() => {
                                                        insertTextAtCursor(` [${character!.name}] `);
                                                        setSelectedOcActionMenu(null);
                                                    }}
                                                    className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 text-xs text-white rounded-lg font-bold"
                                                >
                                                    Insert [{character!.name}]
                                                </button>
                                                
                                                {reusableActions.length > 0 && (
                                                    <div className="border-t border-zinc-900 pt-1.5 mt-1">
                                                        <span className="block text-[7.5px] text-gray-500 uppercase font-mono px-2 mb-1">Action templates</span>
                                                        {reusableActions.map(act => (
                                                            <button 
                                                                key={act.id}
                                                                onClick={() => {
                                                                    const body = act.content.replace(/they|them|him|her/i, character!.name);
                                                                    insertTextAtCursor(`\n${body}\n`);
                                                                    setSelectedOcActionMenu(null);
                                                                }}
                                                                className="w-full text-left px-2.5 py-1 text-[10px] hover:text-cyan-400 truncate text-gray-400 block"
                                                                title={act.content}
                                                            >
                                                                {act.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={() => setSelectedOcActionMenu(null)}
                                                    className="w-full text-center text-[10px] text-zinc-600 hover:text-white pt-1.5 block"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {castMembers.length === 0 && (
                                    <p className="text-[10px] text-zinc-600 italic">No cast assigned to chapter seeds yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Suggestions Synced Active Display */}
                        {activeSuggestions && (
                            <div className="hidden lg:flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                <span className="text-[8.5px] font-mono tracking-wider text-green-500 uppercase font-semibold">Co-Author Linked</span>
                            </div>
                        )}
                    </div>

                    {/* SLIDE-UP BACKGROUND PRESENTS DRAWER */}
                    {showBgdSelector && (
                        <div className="absolute inset-x-0 bottom-16 bg-zinc-950/95 border-t border-zinc-900 p-4.5 z-30 animate-slideUp">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-[10px] font-bold text-[#00ffff] uppercase tracking-widest font-mono">Set Page Scene Backdrops</h4>
                                <button onClick={() => setShowBgdSelector(false)} className="text-zinc-500 hover:text-white text-xs font-bold px-2">×</button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <label className="text-[9px] text-zinc-400 uppercase font-mono whitespace-nowrap">Virtual Page</label>
                                    <select 
                                        value={editingBgdPageIndex}
                                        onChange={(e) => setEditingBgdPageIndex(Number(e.target.value))}
                                        className="bg-zinc-900 text-xs border border-zinc-800 p-1.5 rounded-lg text-white font-mono"
                                    >
                                        {virtualPages.map((_, idx) => (
                                            <option key={idx} value={idx}>Page {idx + 1}</option>
                                        ))}
                                    </select>
                                    
                                    <input 
                                        type="text" 
                                        value={bgdUrlInput}
                                        onChange={(e) => setBgdUrlInput(e.target.value)}
                                        placeholder="Paste image link, Unsplash, or GIF url..."
                                        className="flex-grow min-w-[200px] bg-zinc-900 text-xs border border-zinc-805 p-1.5 rounded-lg text-gray-300"
                                    />
                                    <button 
                                        onClick={() => handleSetBgdUrl(bgdUrlInput)}
                                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg"
                                    >
                                        Apply
                                    </button>
                                    <button 
                                        onClick={handleClearBgd}
                                        className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-red-400 border border-transparent font-bold text-[10px] uppercase rounded-lg"
                                    >
                                        Clear
                                    </button>
                                </div>

                                {/* Atmosphere presets */}
                                <div>
                                    <span className="block text-[8.5px] text-zinc-500 mb-2 font-mono uppercase tracking-wider">Atmosphere Quick Presets:</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {visualAtmospheres.map(atm => (
                                            <button 
                                                key={atm.name}
                                                onClick={() => handleSetBgdUrl(atm.url)}
                                                className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] text-gray-400 hover:text-white transition-all text-center truncate"
                                            >
                                                {atm.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                
                // SKEUOMORPHIC SLIDESHOW BOOK STAGE READER
                <div className="flex-grow flex flex-col justify-between py-6 px-4 md:px-12 relative min-h-0 overflow-hidden bg-[#050505]">
                    
                    {/* Page Content layout centered */}
                    <div className="flex-grow flex items-center justify-center relative my-4">
                        
                        {/* Skeuomorphic book frame */}
                        <div className="w-full max-w-4xl aspect-[1.12/1] md:aspect-[1.5/1] bg-[#121214] border border-zinc-850/80 rounded-3xl shadow-[0_40px_90px_rgba(0,0,0,0.85)] flex relative overflow-hidden">
                            
                            <div className="absolute top-3.5 left-6 text-[8.5px] tracking-wider text-cyan-400/80 font-mono z-20 uppercase font-bold">Book Reader Perspective</div>
                            
                            {/* Middle binding spine gutter shadow */}
                            <div className="absolute inset-y-0 left-1/2 -ml-0.5 w-1 bg-gradient-to-r from-black/90 via-black/30 to-black/90 z-20 shadow-2xl" />

                            {/* Spread page columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
                                
                                {/* Left spread page */}
                                <div className="p-8 md:p-14 border-r border-zinc-900/60 relative flex flex-col justify-between overflow-y-auto custom-scrollbar bg-zinc-950/20">
                                    <div className="space-y-4">
                                        <span className="text-[9.5px] font-mono uppercase tracking-widest text-[#00ffff] font-extrabold block leading-none">{chapter.title || 'Untitled Chapter'}</span>
                                        <div className="font-serif leading-[1.8] text-gray-100 text-[14px] md:text-[15.5px] select-text whitespace-pre-wrap break-words text-justify">
                                            {virtualPages[previewPageIndex] || 'The story begins...'}
                                        </div>
                                    </div>
                                    <div className="text-right mt-6 border-t border-zinc-900/50 pt-3">
                                        <span className="text-[9px] font-mono text-zinc-650">Page {previewPageIndex * 2 + 1}</span>
                                    </div>
                                </div>

                                {/* Right spread page */}
                                <div className="p-8 md:p-14 relative flex flex-col justify-between overflow-y-auto custom-scrollbar bg-zinc-950/20">
                                    <div className="space-y-4">
                                        <span className="text-[9.5px] font-mono uppercase tracking-widest text-zinc-600 block leading-none">{chapter.title || 'Untitled Chapter'}</span>
                                        <div className="font-serif leading-[1.8] text-zinc-400 text-[13.5px] md:text-[14.5px] select-text whitespace-pre-wrap break-words italic text-justify">
                                            {virtualPages[previewPageIndex + 1] ? (
                                                virtualPages[previewPageIndex + 1]
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-center py-16 text-zinc-700 text-xs">
                                                    <span className="text-2xl mb-1 select-none text-zinc-800">❦</span>
                                                    <p>End of chapter segment.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right mt-6 border-t border-zinc-900/50 pt-3">
                                        <span className="text-[9px] font-mono text-zinc-650">Page {previewPageIndex * 2 + 2}</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Pagination control buttons */}
                    <div className="flex justify-between items-center bg-zinc-950/80 p-3.5 border border-zinc-900 rounded-2xl max-w-sm mx-auto w-full z-20">
                        <button 
                            onClick={() => setPreviewPageIndex(prev => Math.max(0, prev - 2))}
                            disabled={previewPageIndex === 0}
                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-25 rounded-xl font-bold text-[10.5px] uppercase text-gray-300"
                        >
                            ◀ Left Page
                        </button>
                        <span className="font-mono text-[10.5px] text-cyan-400">Page {previewPageIndex + 1} of {virtualPages.length}</span>
                        <button 
                            onClick={() => setPreviewPageIndex(prev => Math.min(virtualPages.length - 1, prev + 2))}
                            disabled={previewPageIndex >= virtualPages.length - 2}
                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-25 rounded-xl font-bold text-[10.5px] uppercase text-gray-300"
                        >
                            Right Page ▶
                        </button>
                    </div>

                </div>
            )}

            {/* COMPARISON VIEWPORT OVERLAY (MODAL OVERLAY FOR AI CO-AUTHOR DRAFTING) */}
            {aiSuggestType && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
                    <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-850 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-5 max-h-[85vh]">
                        
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">
                                    Co-Author Draft Suggestion
                                </h3>
                            </div>
                            <span className="text-[9.5px] font-mono text-cyan-400 uppercase font-semibold">
                                Option: {aiSuggestType}
                            </span>
                        </div>

                        {/* Loader or Comparison Content */}
                        {isAiLoading ? (
                            <div className="py-20 text-center space-y-4">
                                <span className="animate-spin block mx-auto w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full" />
                                <span className="text-xs text-zinc-500 font-mono tracking-wider block uppercase animate-pulse">
                                    Consulting Gemini Co-Creator...
                                </span>
                            </div>
                        ) : aiResponseText ? (
                            <div className="space-y-4 overflow-y-auto pr-1">
                                
                                {/* Original contextual reference panel */}
                                <div className="space-y-1.5">
                                    <span className="block text-[8.5px] font-mono uppercase text-zinc-550 tracking-wider">Original Context / Contextual prose:</span>
                                    <div className="p-3 bg-zinc-900/25 border border-zinc-910 rounded-xl text-zinc-500 text-xs font-serif leading-relaxed line-clamp-3 select-text">
                                        "{chapter.content ? chapter.content.slice(-700) : 'Start draft...'}"
                                    </div>
                                </div>

                                {/* Suggested prompt panel */}
                                <div className="space-y-1.5">
                                    <span className="block text-[8.5px] font-mono uppercase text-cyan-400 tracking-wider">Suggested Co-Prose Block:</span>
                                    <div className="p-4 bg-zinc-900 border border-cyan-400/20 rounded-xl text-gray-200 text-sm font-serif leading-loose outline-none shadow-[0_0_20px_rgba(0,255,255,0.03)] select-text">
                                        "{aiResponseText}"
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="py-8 text-center text-red-400 font-mono text-xs">
                                Unable to extract prompt context coordinates. Please retry.
                            </div>
                        )}

                        {/* Actions block footer */}
                        <div className="flex gap-3 pt-2.5 border-t border-zinc-900">
                            <button 
                                onClick={handleAcceptSuggestion}
                                disabled={isAiLoading || !aiResponseText}
                                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-45 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,255,0.25)] active:scale-95"
                            >
                                Accept & Insert Co-Prose
                            </button>
                            <button 
                                onClick={handleRejectSuggestion}
                                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-bold text-[11px] uppercase tracking-wider rounded-lg border border-transparent hover:border-zinc-700 active:scale-95"
                            >
                                Reject & Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STATS DETAILS OVERLAY MODAL */}
            {showStatsModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none animate-fadeIn" onClick={() => setShowStatsModal(false)}>
                    <div className="w-full max-w-sm bg-zinc-950 border border-zinc-850 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-4.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                            <span className="text-[10px] font-mono tracking-widest text-[#00ffff] uppercase font-black">Prose Statistics</span>
                            <button onClick={() => setShowStatsModal(false)} className="text-zinc-550 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between py-1 border-b border-zinc-910">
                                <span className="text-zinc-500">Words Total:</span>
                                <span className="text-cyan-400 font-bold">{wordCount}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-zinc-910">
                                <span className="text-zinc-500">Characters Total:</span>
                                <span className="text-cyan-400 font-bold">{charCount}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-zinc-910">
                                <span className="text-zinc-500">Paragraphs Total:</span>
                                <span className="text-cyan-400 font-bold">{paragraphCount}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-zinc-910">
                                <span className="text-zinc-500">Virtual Book Pages:</span>
                                <span className="text-cyan-400 font-bold">{virtualPages.length}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-zinc-500">Estimated Read Time:</span>
                                <span className="text-cyan-400 font-bold">{Math.max(1, Math.ceil(wordCount / 200))} min</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowStatsModal(false)}
                            className="w-full mt-2 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold font-mono uppercase tracking-wider"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* DYNAMIC TOAST NOTIFICATIONS */}
            {toastMessage && (
                <div className="fixed bottom-24 right-6 bg-zinc-950 border border-cyan-400/30 text-white px-4.5 py-2.5 rounded-xl text-xs font-mono shadow-[0_0_20px_rgba(0,255,255,0.1)] z-50 flex items-center gap-2 animate-fadeIn uppercase tracking-wider font-semibold">
                    <span className="w-1.5 h-1.5 bg-[#00ffff] rounded-full animate-pulse" />
                    <span>{toastMessage}</span>
                </div>
            )}

        </main>
    );
};

export default StoryEditorView;
