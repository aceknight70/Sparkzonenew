
import React, { useState, useEffect } from 'react';
import IntroPage from './pages/IntroPage';
import LoginPage from './pages/LoginPage';
import MainApp from './pages/MainApp';
import { useFirebase } from './FirebaseContext';

type AppState = 'intro' | 'login' | 'main';

const App: React.FC = () => {
    const { firebaseUser, loading, isOffline } = useFirebase();
    const [appState, setAppState] = useState<AppState>('intro');

    // Automatically transition to 'main' when user is authenticated or in sandbox mode
    useEffect(() => {
        if (!loading) {
            if (firebaseUser || isOffline) {
                setAppState('main');
            } else if (appState === 'main') {
                setAppState('login');
            }
        }
    }, [firebaseUser, loading, isOffline]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    <p className="mt-4 text-cyan-400 text-lg font-medium animate-pulse">
                        Igniting creative sparks...
                    </p>
                </div>
            );
        }

        switch (appState) {
            case 'intro':
                return <IntroPage onComplete={() => setAppState('login')} />;
            case 'login':
                return <LoginPage onLogin={() => setAppState('main')} />;
            case 'main':
                return (firebaseUser || isOffline) ? <MainApp /> : <LoginPage onLogin={() => setAppState('main')} />;
            default:
                return <IntroPage onComplete={() => setAppState('login')} />;
        }
    };

    return (
        // Fixed inset-0 locks the app to the viewport.
        // h-[100dvh] uses dynamic viewport height to handle mobile address bars correctly.
        <div className="fixed inset-0 h-[100dvh] w-full bg-black text-gray-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
            {/* Global Background */}
            <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-blue-900/10 pointer-events-none z-0"></div>
            
            {/* Content - flex-grow ensures it fills the space */}
            <div className="relative z-10 flex-grow flex flex-col min-h-0 w-full">
                {renderContent()}
            </div>
        </div>
    );
};

export default App;
