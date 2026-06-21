/**
 * Safely copies text to the clipboard using the modern API with a robust fallback.
 * Works even when document is not focused or within restricted iframe environments.
 */
export function copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch((err) => {
                console.warn('Modern clipboard API failed, trying fallback:', err);
                return copyToClipboardFallback(text);
            });
    }
    return Promise.resolve(copyToClipboardFallback(text));
}

function copyToClipboardFallback(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Prevent zooming and keep out of viewport
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy API failed:', err);
    }
    
    document.body.removeChild(textArea);
    return successful;
}
