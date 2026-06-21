import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import LightningBoltIcon from './icons/LightningBoltIcon';

interface GeneratedData {
    name: string;
    epithet: string;
    tagline: string;
    archetypeTags: string[];
    appearance: string;
    physicalDetails: {
        Age: string;
        Height: string;
        Strength: string;
        Agility: string;
        Intellect: string;
        Charisma: string;
        Luck: string;
        [key: string]: string;
    };
    personality: {
        description: string;
        traits: {
            name: string;
            value: number;
            labels: [string, string];
        }[];
        quirks: string[];
    };
    backstory: string;
    abilities: {
        name: string;
        description: string;
    }[];
}

interface CharacterAiGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (data: GeneratedData) => void;
}

const CharacterAiGeneratorModal: React.FC<CharacterAiGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [creativeStyle, setCreativeStyle] = useState('Epic Fantasy');

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError('');

        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });
            
            const genreContext = `Theme/Genre style: ${creativeStyle}. `;
            const fullPrompt = `${genreContext}Generate a fully detailed, rich role-playing original character profile based on this idea: "${prompt}". 
            Give them custom RPG attributes, rich background history, physical description, personality parameters, and 3 iconic unique abilities with mechanics.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The character's name." },
                    epithet: { type: Type.STRING, description: "A detailed title or designation, e.g. 'the Renegade Cyberdoc'." },
                    tagline: { type: Type.STRING, description: "A highly iconic cool catchphrase reflecting their core motivation." },
                    archetypeTags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3-4 general genre/archetype tags, e.g. ['Cyberpunk', 'Hacker', 'Anti-Hero']."
                    },
                    appearance: { type: Type.STRING, description: "A descriptive paragraphs of their physical appearance, clothing style, gear, and visible aura." },
                    physicalDetails: {
                        type: Type.OBJECT,
                        properties: {
                            Age: { type: Type.STRING, description: "Character's age, e.g. '24' or 'Unknown'" },
                            Height: { type: Type.STRING, description: "Character's height, e.g. '5'11' or '180 cm'" },
                            Strength: { type: Type.STRING, description: "Strength rating from 0 to 100" },
                            Agility: { type: Type.STRING, description: "Agility/Speed rating from 0 to 100" },
                            Intellect: { type: Type.STRING, description: "Intelligence/Focus rating from 0 to 100" },
                            Charisma: { type: Type.STRING, description: "Charisma/Banter rating from 0 to 100" },
                            Luck: { type: Type.STRING, description: "Luck rating from 0 to 100" }
                        },
                        required: ["Age", "Height", "Strength", "Agility", "Intellect", "Charisma", "Luck"]
                    },
                    personality: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING, description: "Deep summary of their mental state, fears, ethics, and social mannerisms." },
                            traits: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: "One of standard sliders: 'Social Spark', 'Mind Focus', 'Alignment', or 'Temperament'" },
                                        value: { type: Type.INTEGER, description: "A slider value from 0 to 100" },
                                        labels: {
                                            type: Type.ARRAY,
                                            items: { type: Type.STRING },
                                            description: "Pair of opposite descriptive poles, e.g., ['Introverted', 'Extroverted'] for Social Spark, ['Logical', 'Emotional'] for Mind Focus, ['Chaotic', 'Orderly'] for Alignment, ['Serene', 'Passionate'] for Temperament"
                                        }
                                    },
                                    required: ["name", "value", "labels"]
                                },
                                description: "Exactly 4 items corresponding to 'Social Spark', 'Mind Focus', 'Alignment', and 'Temperament' sliders."
                            },
                            quirks: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "List of 2-3 fun or compelling quirks, habits, or minor phobias."
                            }
                        },
                        required: ["description", "traits", "quirks"]
                    },
                    backstory: { type: Type.STRING, description: "A comprehensive lore background describing their origins, previous struggles, secrets, and goals." },
                    abilities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Name of the ability or trade" },
                                description: { type: Type.STRING, description: "A summary of what the ability does and its roleplay effects." }
                            },
                            required: ["name", "description"]
                        },
                        description: "List of 3 distinct custom abilities."
                    }
                },
                required: ["name", "epithet", "tagline", "archetypeTags", "appearance", "physicalDetails", "personality", "backstory", "abilities"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const parsed = JSON.parse(response.text);
            onGenerate(parsed);
            onClose();

        } catch (err) {
            console.error("AI Generation Error:", err);
            setError("Sorry, we couldn't spark the character ideas. Check your API connection and prompt!");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const creativePresets = [
        "Epic Fantasy", "Cyberpunk", "Steampunk", "Eldritch Horror", "Sci-Fi Space Opera", "Urban Fantasy"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div ref={modalRef} className="w-full max-w-xl bg-neutral-900 border border-violet-500/30 rounded-xl shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col overflow-hidden max-h-[90vh]">
                
                {/* Header Banner */}
                <div className="p-5 bg-gradient-to-r from-violet-900/60 to-indigo-900/40 border-b border-violet-500/20 relative">
                    <div className="absolute top-2 right-4 text-cyan-400 text-xs font-mono uppercase tracking-widest animate-pulse">
                        Gemini Pro Engine
                    </div>
                    <h2 className="text-2xl font-black text-cyan-400 tracking-tight flex items-center gap-2">
                        <LightningBoltIcon className="w-5 h-5 text-amber-400" />
                        Spark Character with AI
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Describe an outline, concept, or personality, and let Gemini craft a fully fleshed out original character.
                    </p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    
                    {/* Creative Style Preset Selector */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Select Creative Genre
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {creativePresets.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setCreativeStyle(preset)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        creativeStyle === preset
                                            ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                            : 'bg-neutral-800 text-gray-400 border-neutral-700 hover:text-white'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prompt input */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                            Describe your Hero, Rebel or Rogue
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A quick-witted smuggler who carries a broken timepiece containing an artificial star. Friendly to strangers but haunted by a forgotten betrayal..."
                            rows={5}
                            className="w-full bg-neutral-950 border border-violet-500/20 rounded-lg py-3 px-4 text-sm text-gray-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none leading-relaxed"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-neutral-950/80 border-t border-violet-500/20 flex justify-between items-center">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt.trim()}
                        className="px-6 py-2.5 flex items-center gap-2 text-xs font-extrabold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                         <LightningBoltIcon className="w-4 h-4 text-neutral-950" />
                         {isLoading ? 'Sculpting Spark...' : 'Ignite Creation'}
                     </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterAiGeneratorModal;
