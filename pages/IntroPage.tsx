import React, { useState, useEffect } from 'react';

interface IntroPageProps {
    onComplete: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
    const [animationStep, setAnimationStep] = useState<number>(0);

    useEffect(() => {
        // Step 1: Lightning Strike (t=0)
        // Step 2: Show glowing SZ (t=1s)
        // Step 3: Morph SZ into SparkZone + Subtitle (t=2.2s)
        // Step 4: Complete and transition to login (t=4s)
        
        const t1 = setTimeout(() => setAnimationStep(1), 1000);
        const t2 = setTimeout(() => setAnimationStep(2), 2200);
        const t3 = setTimeout(() => onComplete(), 4100);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div 
            onClick={handleSkip}
            className="fixed inset-0 h-[100dvh] w-full bg-[#000000] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none z-50 justify-between py-12 px-4"
        >
            {/* Top Empty Space */}
            <div className="h-10"></div>

            {/* Central Animated Logo Block */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-lg min-h-[300px]">
                
                {/* 1. LIGHTNING STRIKE PATH (Only visible in early steps) */}
                {animationStep < 2 && (
                    <svg 
                        viewBox="0 0 200 300" 
                        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[240px] h-[320px] pointer-events-none drop-shadow-[0_0_15px_#00ffff]"
                    >
                        {/* Main Strike */}
                        <path 
                            d="M 100 0 L 92 80 L 115 100 L 80 170" 
                            fill="none" 
                            stroke="#00FFFF" 
                            strokeWidth="3.5"
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="lightning-path"
                        />
                        {/* Fork Left to 'S' */}
                        <path 
                            d="M 80 170 L 60 210 L 45 230" 
                            fill="none" 
                            stroke="#00FFFF" 
                            strokeWidth="2.5"
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="lightning-fork-left"
                        />
                        {/* Fork Right to 'Z' */}
                        <path 
                            d="M 80 170 L 115 200 L 135 225 L 148 230" 
                            fill="none" 
                            stroke="#00FFFF" 
                            strokeWidth="2.5"
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="lightning-fork-right"
                        />
                    </svg>
                )}

                {/* 2. GLOWING LETTERS "S" & "Z" (Fades in, then morphs) */}
                {animationStep >= 1 && (
                    <div className="flex justify-center items-center gap-12 select-none relative h-28">
                        
                        {/* Letter S with strike glow */}
                        {animationStep === 1 && (
                            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#00ffff] to-[#22d3ee] drop-shadow-[0_0_25px_rgba(0,255,255,0.95)] animate-pulse tracking-widest leading-none font-sans">
                                S
                            </span>
                        )}

                        {/* Letter Z with strike glow */}
                        {animationStep === 1 && (
                            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#00ffff] to-[#22d3ee] drop-shadow-[0_0_25px_rgba(0,255,255,0.95)] animate-pulse tracking-widest leading-none font-sans">
                                Z
                            </span>
                        )}

                        {/* 3. MORPHED COMPOSITE LOGO & SUBTITLE */}
                        {animationStep >= 2 && (
                            <div className="flex flex-col items-center justify-center animate-fadeInUp">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                                        Spark
                                    </h1>
                                    <svg
                                        viewBox="0 0 24 32"
                                        className="h-14 md:h-20 w-auto -ml-1 -mr-0.5 text-[#00FFFF] drop-shadow-[0_0_12px_rgba(0,255,255,0.85)]"
                                        fill="currentColor"
                                    >
                                        <path d="M11.39 2.53L2.09 17.3c-.7.98.15 2.45 1.31 2.45h7.1L8.3 29.35c-.4 1.25.79 2.4 1.93 1.62L21.92 14.7c.7-.98-.15-2.45-1.31-2.45h-7.1l2.19-9.62c.4-1.25-.79-2.4-1.93-1.62l-.38.2z" />
                                    </svg>
                                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                                        Zone
                                    </h1>
                                </div>
                                <p className="mt-4 text-white/95 text-sm md:text-base font-bold tracking-[0.25em] h-6 flex justify-center uppercase font-sans">
                                    Social Roleplay App
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tap to skip hint */}
            <div className="opacity-45 hover:opacity-100 transition-opacity duration-300 text-[10px] text-gray-500 font-mono flex items-center justify-center animate-pulse py-2">
                [ Tap Anywhere to Skip ]
            </div>

            {/* Embedded styles for lightning draw animation */}
            <style>{`
                .lightning-path {
                    stroke-dasharray: 400;
                    stroke-dashoffset: 400;
                    animation: strike 0.6s cubic-bezier(.11,.77,.9,.24) forwards;
                }
                .lightning-fork-left {
                    stroke-dasharray: 150;
                    stroke-dashoffset: 150;
                    animation: strike-forkLil 0.5s cubic-bezier(.11,.77,.9,.24) 0.3s forwards;
                }
                .lightning-fork-right {
                    stroke-dasharray: 150;
                    stroke-dashoffset: 150;
                    animation: strike-forkR 0.5s cubic-bezier(.11,.77,.9,.24) 0.35s forwards;
                }
                @keyframes strike {
                    0% { stroke-dashoffset: 400; opacity: 1; }
                    80% { stroke-dashoffset: 0; opacity: 1; filter: brightness(2); }
                    100% { stroke-dashoffset: 0; opacity: 0.8; }
                }
                @keyframes strike-forkLil {
                    0% { stroke-dashoffset: 150; opacity: 1; }
                    80% { stroke-dashoffset: 0; opacity: 1; }
                    100% { stroke-dashoffset: 0; opacity: 0.8; }
                }
                @keyframes strike-forkR {
                    0% { stroke-dashoffset: 150; opacity: 1; }
                    80% { stroke-dashoffset: 0; opacity: 1; }
                    100% { stroke-dashoffset: 0; opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default IntroPage;
