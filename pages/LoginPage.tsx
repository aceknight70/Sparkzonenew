import React, { useState } from 'react';
import Logo from '../components/Logo';
import { useFirebase } from '../FirebaseContext';

interface LoginPageProps {
    onLogin: () => void;
}

const AuthButton: React.FC<{ children: React.ReactNode, icon?: React.ReactElement, onClick?: () => void, disabled?: boolean }> = ({ children, icon, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-4 px-4 py-3 my-2 font-medium text-white bg-gray-800/50 border border-violet-500/50 rounded-lg hover:bg-violet-500/20 hover:border-violet-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      <span>{children}</span>
    </button>
);

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const { loginWithGoogle, loginAsGuest, loginWithEmail, signUpWithEmail, loginWithOfflineSandbox } = useFirebase();
    const [authError, setAuthError] = useState<string | null>(null);
    const [showAdminRestrictedGuide, setShowAdminRestrictedGuide] = useState(false);
    const [showPopupClosedGuide, setShowPopupClosedGuide] = useState(false);
    const [showEmailDisabledGuide, setShowEmailDisabledGuide] = useState(false);
    const [showGoogleDisabledGuide, setShowGoogleDisabledGuide] = useState(false);
    
    // Email Password states
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setAuthError(null);
        setShowAdminRestrictedGuide(false);
        setShowPopupClosedGuide(false);
        setShowEmailDisabledGuide(false);
        setShowGoogleDisabledGuide(false);
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (error: any) {
            console.error(error);
            const isRestricted = error?.code === 'auth/admin-restricted-operation' || 
                                (error?.message && error.message.includes('admin-restricted-operation'));
            const isPopupClosed = error?.code === 'auth/popup-closed-by-user' || 
                                 (error?.message && error.message.includes('popup-closed-by-user')) ||
                                 error?.code === 'auth/cancelled-popup-request' ||
                                 (error?.message && error.message.includes('cancelled-popup-request'));
            const isNotAllowed = error?.code === 'auth/operation-not-allowed' || 
                                 (error?.message && error.message.includes('operation-not-allowed'));
            
            if (isRestricted) {
                setShowAdminRestrictedGuide(true);
            } else if (isPopupClosed) {
                setShowPopupClosedGuide(true);
            } else if (isNotAllowed) {
                setShowGoogleDisabledGuide(true);
            } else {
                setAuthError(error.message || "Failed to log in with Google.");
            }
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setAuthError(null);
        setShowAdminRestrictedGuide(false);
        setShowPopupClosedGuide(false);
        setShowEmailDisabledGuide(false);
        setShowGoogleDisabledGuide(false);
        setLoading(true);
        try {
            await loginAsGuest();
        } catch (error: any) {
            console.error(error);
            const isRestricted = error?.code === 'auth/admin-restricted-operation' || 
                                (error?.message && error.message.includes('admin-restricted-operation'));
            const isNotAllowed = error?.code === 'auth/operation-not-allowed' || 
                                 (error?.message && error.message.includes('operation-not-allowed'));
            
            if (isRestricted || isNotAllowed) {
                setShowAdminRestrictedGuide(true);
            } else {
                setAuthError(error.message || "Failed to log in as Guest.");
            }
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setShowAdminRestrictedGuide(false);
        setShowPopupClosedGuide(false);
        setShowEmailDisabledGuide(false);
        setShowGoogleDisabledGuide(false);
        
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fadeIn">
            <div className="w-full max-w-sm">
                <Logo className="mb-10 text-center" />

                {authError && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-xs text-center animate-fadeIn">
                        {authError}
                    </div>
                )}

                {showAdminRestrictedGuide && (
                    <div className="mb-6 p-5 bg-violet-900/40 border border-violet-500/30 rounded-xl text-left text-sm space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 text-violet-300 font-bold">
                            <span className="text-lg">📢</span>
                            <span>Anonymous Sign-In Needed</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-xs">
                            Firebase returned <code className="text-cyan-400 bg-black/40 px-1 py-0.5 rounded font-mono">auth/admin-restricted-operation</code>. This means **Anonymous Authentication** is currently disabled on your Firebase project.
                        </p>
                        <div className="bg-black/40 p-3 rounded-lg text-xs font-mono text-gray-300 space-y-1 border border-violet-500/15">
                            <p className="font-semibold text-violet-400">To enable it in 1 minute:</p>
                            <p>1. Open your Firebase Console</p>
                            <p>2. Go to <span className="text-white font-medium">Authentication</span> &rarr; <span className="text-white font-medium">Sign-in method</span></p>
                            <p>3. Click <span className="text-white font-medium">Add new provider</span></p>
                            <p>4. Select <span className="text-white font-medium">Anonymous</span>, click <span className="text-white font-medium">Enable</span>, and save!</p>
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
                                    setShowAdminRestrictedGuide(false);
                                    setAuthError(null);
                                }}
                                className="w-full py-1 text-center text-[11px] text-gray-400 hover:text-white transition-colors"
                            >
                                Back to login
                            </button>
                        </div>
                    </div>
                )}

                {showPopupClosedGuide && (
                    <div className="mb-6 p-5 bg-violet-900/40 border border-violet-500/30 rounded-xl text-left text-sm space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 text-violet-300 font-bold">
                            <span className="text-lg">🌐</span>
                            <span>Sign-In Window Closed</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-xs">
                            The Google Auth sign-in popup was closed before completion. This can happen if the window was dismissed, blocked by a pop-up blocker, or took too long to load inside the preview iframe.
                        </p>
                        <p className="text-gray-400 leading-relaxed text-[11px]">
                            💡 <span className="text-violet-300 font-medium">To fix this easily:</span> Either open the app in a new tab where popups are permitted, or use standard Email & Password registration below!
                        </p>
                        <div className="pt-2 flex flex-col gap-2">
                            <a
                                href={window.location.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all text-center text-xs shadow-md block"
                            >
                                Open in New Tab & try Google Sign-In ↗
                            </a>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPopupClosedGuide(false);
                                    setAuthError(null);
                                }}
                                className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-gray-300 font-semibold rounded-lg transition-colors text-center text-xs shadow-sm"
                            >
                                Continue with Email/Password here
                            </button>
                            <button
                                type="button"
                                onClick={() => loginWithOfflineSandbox()}
                                className="w-full py-1 text-center text-[11px] text-gray-400 hover:text-white transition-colors animate-pulse"
                            >
                                Play Offline (Sandbox Mode)
                            </button>
                        </div>
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
                            <p>3. Click <span className="text-white font-medium">Add new provider</span> (or click <span className="text-white font-medium">Email/Password</span> if it is visible)</p>
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

                {showGoogleDisabledGuide && (
                    <div className="mb-6 p-5 bg-violet-900/40 border border-violet-500/30 rounded-xl text-left text-sm space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 text-violet-300 font-bold">
                            <span className="text-lg">🌐</span>
                            <span>Google Sign-In Disabled</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-xs">
                            Firebase returned <code className="text-cyan-400 bg-black/40 px-1 py-0.5 rounded font-mono">auth/operation-not-allowed</code>. This indicates **Google Sign-In** is currently disabled as a sign-in provider in your Firebase project.
                        </p>
                        <div className="bg-black/40 p-3 rounded-lg text-xs font-mono text-gray-300 space-y-1 border border-violet-500/15">
                            <p className="font-semibold text-violet-400">To enable it in 1 minute:</p>
                            <p>1. Open your Firebase Console</p>
                            <p>2. Go to <span className="text-white font-medium">Authentication</span> &rarr; <span className="text-white font-medium">Sign-in method</span></p>
                            <p>3. Click <span className="text-white font-medium">Add new provider</span></p>
                            <p>4. Select <span className="text-white font-medium">Google</span>, toggle <span className="text-white font-medium">Enable</span>, select a Project support email, and click <span className="text-white font-medium">Save</span>!</p>
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
                                    setShowGoogleDisabledGuide(false);
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
                <div className="bg-gray-900/60 border border-violet-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm mb-6 animate-fadeIn">
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

                <div className="relative text-center my-6">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-800" />
                    <span className="relative bg-[#020205] px-3 text-xs text-gray-500 uppercase tracking-widest font-mono">Alternative Entry</span>
                </div>

                <div className="space-y-3">
                    <AuthButton 
                        onClick={handleGoogleLogin} 
                        icon={loading ? <div className="h-5 w-5 animate-spin rounded-full border-t border-cyan-500" /> : <GoogleIcon />}
                        disabled={loading}
                    >
                        Login with Google
                    </AuthButton>
                    <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-[11px] text-cyan-400/80 hover:text-cyan-300 hover:underline transition-all pb-1"
                    >
                        💡 Popup blocked? Open app in a New Tab ↗
                    </a>
                    <button 
                        type="button"
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full text-center py-2 text-xs text-gray-500 hover:text-violet-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                        <GuestIcon />
                        <span>Instant Anonymous Access</span>
                    </button>
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

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
);

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C41.382 36.141 44 30.637 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

const GuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

export default LoginPage;
