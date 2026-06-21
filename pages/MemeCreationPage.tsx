
import React, { useState, useRef, useEffect } from 'react';
import { memeTemplates } from '../mockData';
import { MemeTemplate } from '../types';

// Icons
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.22 2.22a.75.75 0 101.06-1.06l-3.5-3.5a.75.75 0 00-1.06 0l-3.5 3.5a.75.75 0 101.06 1.06l2.22-2.22v8.614z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>;


interface MemeCreationPageProps {
    onExit: () => void;
    onSave: (memeData: { name: string; imageUrl: string }) => void;
}

const MemeCreationPage: React.FC<MemeCreationPageProps> = ({ onExit, onSave }) => {
    const [title, setTitle] = useState('');
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const [imageSrc, setImageSrc] = useState<string | null>(memeTemplates[0].imageUrl);
    const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Draw meme on canvas whenever inputs change
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !imageSrc) return;

        const img = imageRef.current;
        img.crossOrigin = "anonymous"; // Handle CORS for external template images
        img.src = imageSrc;

        img.onload = () => {
            const canvasWidth = 500;
            const scale = canvasWidth / img.width;
            const canvasHeight = img.height * scale;

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            
            // Text styling
            const fontSize = canvasWidth / 10;
            ctx.font = `bold ${fontSize}px Impact`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = fontSize / 15;
            ctx.textAlign = 'center';

            const drawText = (text: string, y: number) => {
                ctx.strokeText(text, canvasWidth / 2, y);
                ctx.fillText(text, canvasWidth / 2, y);
            };
            
            drawText(topText.toUpperCase(), fontSize * 1.1);
            drawText(bottomText.toUpperCase(), canvasHeight - fontSize / 4);
        };
        img.onerror = () => {
            if (!canvas) return;
             // Fallback for CORS issues
            ctx.fillStyle = '#111827';
            ctx.fillRect(0,0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("Could not load image due to security policy.", canvas.width/2, canvas.height/2);
            ctx.fillText("Try uploading your own image instead.", canvas.width/2, canvas.height/2 + 20);
        }

    }, [imageSrc, topText, bottomText]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setImageSrc(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        if (!title.trim()) {
            alert('Please give your meme a title.');
            return;
        }
        if (!imageSrc) {
            alert('Please select an image for your meme.');
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const imageUrl = canvas.toDataURL('image/jpeg');
            onSave({ name: title, imageUrl });
        }
    };

    return (
        <div className="h-full w-full flex flex-col md:flex-row bg-black bg-gradient-to-tr from-black via-[#010619] to-blue-900/20 text-gray-100 animate-fadeIn pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 transition-all">
            {/* --- Controls Panel --- */}
            <aside className="w-full md:w-96 flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-r border-violet-500/30 flex flex-col h-full">
                <header className="p-4 border-b border-violet-500/30 flex justify-between items-center flex-shrink-0">
                     <div className="flex items-center gap-2 min-w-0">
                        <button onClick={onExit} className="p-1 rounded-md text-gray-400 hover:text-white" title="Exit Workshop"><ArrowLeftIcon /></button>
                        <div>
                            <h1 className="text-lg font-bold text-white">Meme Workshop</h1>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meme Title" className="w-full bg-gray-800 border border-violet-500/30 rounded-md py-2 px-3 text-white"/>
                    <textarea value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="Top Text" rows={2} className="w-full bg-gray-800 border border-violet-500/30 rounded-md py-2 px-3 text-white resize-none" />
                    <textarea value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="Bottom Text" rows={2} className="w-full bg-gray-800 border border-violet-500/30 rounded-md py-2 px-3 text-white resize-none" />
                    
                    <div className="pt-6 border-t border-violet-500/30 space-y-4">
                        <button onClick={() => setIsTemplateDrawerOpen(true)} className="w-full px-4 py-3 text-sm font-semibold text-cyan-300 bg-cyan-500/20 rounded-lg hover:bg-cyan-500/30 transition-colors">Browse Templates</button>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-gray-900 px-2 text-xs text-gray-500 uppercase">Or</span>
                            </div>
                        </div>

                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 text-sm font-semibold text-gray-300 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl hover:border-cyan-500 hover:text-cyan-400 hover:bg-gray-800 transition-all group"
                        >
                            <div className="p-3 bg-gray-700 rounded-full group-hover:bg-cyan-900/30 transition-colors text-white group-hover:text-cyan-400">
                                <UploadIcon />
                            </div>
                            <span>Upload from Device</span>
                        </button>
                    </div>
                </div>

                <footer className="p-4 border-t border-violet-500/30">
                    <button onClick={handleSave} className="w-full px-5 py-3 bg-cyan-500 text-white font-bold rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transform hover:-translate-y-0.5 transition-all">Save Meme</button>
                </footer>
            </aside>
            
            {/* --- Live Preview --- */}
            <main className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black/40">
                <div className="relative max-w-full max-h-full">
                    <canvas ref={canvasRef} className="max-w-full max-h-[80vh] md:max-h-full object-contain rounded-lg shadow-2xl shadow-black/50 border border-white/5" />
                </div>
            </main>

            {/* --- Template Drawer --- */}
            {isTemplateDrawerOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 animate-fadeIn" onClick={() => setIsTemplateDrawerOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-0 left-0 right-0 h-2/3 bg-gray-900 border-t border-violet-500/50 rounded-t-xl flex flex-col animate-slideIn shadow-2xl">
                         <div className="p-4 flex justify-between items-center border-b border-violet-500/30">
                             <h3 className="text-lg font-bold text-cyan-400">Select a Template</h3>
                             <button onClick={() => setIsTemplateDrawerOpen(false)} className="text-gray-400 hover:text-white">Close</button>
                         </div>
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 overflow-y-auto">
                            {memeTemplates.map(template => (
                                <button key={template.id} onClick={() => { setImageSrc(template.imageUrl); setIsTemplateDrawerOpen(false); }} className="aspect-square group overflow-hidden rounded-lg border-2 border-transparent hover:border-cyan-400 focus:border-cyan-400 transition-all">
                                    <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemeCreationPage;
