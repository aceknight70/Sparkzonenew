import React, { useState } from 'react';
import Logo from '../components/Logo';
import { useFirebase } from '../FirebaseContext';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = () => {
    const { loginWithEmail, signUpWithEmail, loginWithOfflineSandbox } = useFirebase();
    const [authError, setAuthError] = useState<string | null>(null);
    const [showEmailDisabledGuide, setShowEmailDisabledGuide] = useState(false);
    
    // Email Password states
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setShowEmailDisabledGuide(false);
        
        if (!email || !password) {
            setAuthError("Please fill in all requested fields.");
            return;
        }

        if (isSignUp && !displayName) {
            setAuthError("Please specify a display name.");
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, displayName);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (error: any) {
            console.error(error);
            const isNotAllowed = error?.code === 'auth/operation-not-allowed' || 
                                 (error?.message && error.message.includes('operation-not-allowed'));
            
            if (isNotAllowed) {
                setShowEmailDisabledGuide(true);
            } else {
                setAuthError(error.message || "Email authentication failed.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a0a14] text-white animate-fadeIn">
            <div className="w-full max-w-sm">
                <Logo className="mb-10 text-center" />

                {authError && (
                    <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-200 text-xs text-center animate-fadeIn">
                        {authError}
                    </div>
                )}

                {showEmailDisabledGuide && (
                    <div className="mb-6 p-5 bg-violet-900/40 border border-violet-500/30 rounded-xl text-left text-sm space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 text-violet-300 font-bold">
                            <span className="text-lg">✉️</span>
                            <span>Email/Password Provider Disabled</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-xs">
                            Firebase returned <code className="text-cyan-400 bg-black/40 px-1 py-0.5 rounded font-mono">auth/operation-not-allowed</code>. This indicates **Email/Password Provider** is disabled on your Firebase project.
                        </p>
                        <div className="bg-black/40 p-3 rounded-lg text-xs font-mono text-gray-300 space-y-1 border border-violet-500/15">
                            <p className="font-semibold text-violet-400">To enable it in 1 minute:</p>
                            <p>1. Open your Firebase Console</p>
                            <p>2. Go to <span className="text-white font-medium">Authentication</span> &rarr; <span className="text-white font-medium">Sign-in method</span></p>
                            <p>3. Click <span className="text-white font-medium">Add new provider</span></p>
                            <p>4. Select <span className="text-white font-medium">Email/Password</span>, toggle <span className="text-white font-medium">Enable</span>, and click <span className="text-white font-medium">Save</span>!</p>
                        </div>
                        <div className="pt-2 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => loginWithOfflineSandbox()}
                                className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-lg transition-colors text-center text-xs shadow-md"
                            >
                                Sandbox Mode (Bypass & Preview Instantly)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEmailDisabledGuide(false);
                                    setAuthError(null);
                                }}
                                className="w-full py-1 text-center text-[11px] text-gray-400 hover:text-white transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Online Credentials Card --- */}
                <div className="bg-gray-950/60 border border-violet-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm mb-6 animate-fadeIn">
                    <div className="flex border-b border-gray-800 mb-5">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(false);
                                setAuthError(null);
                            }}
                            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${!isSignUp ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(true);
                                setAuthError(null);
                            }}
                            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${isSignUp ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-1">
                                <label className="text-[11px] font-mono tracking-wider text-gray-400 uppercase">Aesthetic Username</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. StarBorn"
                                    disabled={loading}
                                    className="w-full bg-black/40 border border-violet-500/20 focus:border-violet-400 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[11px] font-mono tracking-wider text-gray-400 uppercase">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={loading}
                                className="w-full bg-black/40 border border-violet-500/20 focus:border-violet-400 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-mono tracking-wider text-gray-400 uppercase">Secret Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={loading}
                                className="w-full bg-black/40 border border-violet-500/20 focus:border-violet-400 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 mt-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-lg transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-t border-white" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <span>{isSignUp ? 'Create Online Profile' : 'Sign In Online'}</span>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => loginWithOfflineSandbox()}
                        className="text-[11px] text-cyan-400/70 hover:text-cyan-300 transition-colors underline decoration-dotted underline-offset-4"
                    >
                        Testing offline? Bypass to Offline Sandbox Mode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
