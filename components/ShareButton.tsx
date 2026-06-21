
import React from 'react';
import { copyToClipboard } from '../utils';

const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08a2.25 2.25 0 014.206 0 .64.64 0 00.588-.08m-5.382 0a2.25 2.25 0 00-4.206 0 .64.64 0 01-.588.08m5.382 0a2.25 2.25 0 014.206 0 .64.64 0 00.588-.08m-5.382 0c.195.025.39.05.588.08a2.25 2.25 0 014.206 0m0 0a2.25 2.25 0 100-2.186m0 2.186c-.195-.025-.39-.05-.588-.08a2.25 2.25 0 00-4.206 0 .64.64 0 01-.588.08" /></svg>;

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
    showLabel?: boolean;
    iconOnly?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url, className = '', showLabel = true, iconOnly = false }) => {
    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        let shareUrl = url || window.location.href;
        // Basic validation to prevent "Invalid URL" error if it's not http/https (e.g. blob: or about:srcdoc in previews)
        if (!shareUrl.startsWith('http')) {
             shareUrl = 'https://sparkzone.app'; // Mock URL for preview environments
        }

        const shareData = {
            title: title,
            text: text,
            url: shareUrl,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                throw new Error("Web Share API not supported or invalid data");
            }
        } catch (error) {
            console.log('Share API failed, falling back to clipboard:', error);
            try {
                const copied = await copyToClipboard(`${text}\n${shareUrl}`);
                if (copied) {
                    alert('Link copied to clipboard!');
                } else {
                    throw new Error('Fallback copying failed');
                }
            } catch (clipboardError) {
                console.error('Clipboard failed:', clipboardError);
                alert('Unable to share or copy link.');
            }
        }
    };

    return (
        <button 
            onClick={handleShare}
            className={`flex items-center justify-center gap-2 transition-colors ${className}`}
            aria-label="Share"
            title="Share"
        >
            <ShareIcon />
            {showLabel && !iconOnly && <span>Share</span>}
        </button>
    );
};

export default ShareButton;
