import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logOut, handleFirestoreError, OperationType } from './firebase';
import { User } from './types';

interface FirebaseContextType {
  firebaseUser: FirebaseUser | null;
  currentUserProfile: User | null;
  loading: boolean;
  isOffline: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithOfflineSandbox: () => void;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const fetchOrCreateProfile = async (fbUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const path = `users/${fbUser.uid}`;
    try {
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return userSnap.data() as User;
      } else {
        // Create initial default user profile in Firestore
        const defaultProfile: User = {
          id: fbUser.uid as any, // Cast to numeric if typing requires, but we use UID string for documents
          name: fbUser.displayName || 'Guest Artist',
          avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          bio: 'Let the spark of creativity start here. Embark on a role-play journey!',
          bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
          pronouns: 'they/them',
          age: '18',
          gender: 'Explorer',
          nationality: 'Spark Zone',
          followingIds: [],
          communityIds: [],
          isPremium: false,
          skynetStatus: { warningCount: 0, isMuted: false },
          sparkClashProfile: {
            battlePower: 1000,
            sparks: 100,
            wins: 0,
            losses: 0,
            inventory: [],
            templates: [],
            decks: []
          }
        };
        await setDoc(userDocRef, defaultProfile);
        return defaultProfile;
      }
    } catch (err) {
      console.warn('Firestore failed to fetch/create profile, serving fallback guest profile:', err);
      // Fallback
      return {
        id: fbUser.uid as any,
        name: fbUser.displayName || 'Guest Artist',
        avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        bio: 'Let the spark of creativity start here. Embark on a role-play journey!',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        pronouns: 'they/them',
        age: '18',
        gender: 'Explorer',
        nationality: 'Spark Zone',
        followingIds: [],
        communityIds: [],
        isPremium: false,
        skynetStatus: { warningCount: 0, isMuted: false },
        sparkClashProfile: {
          battlePower: 1000,
          sparks: 100,
          wins: 0,
          losses: 0,
          inventory: [],
          templates: [],
          decks: []
        }
      };
    }
  };

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      try {
        const p = await fetchOrCreateProfile(auth.currentUser);
        setCurrentUserProfile(p);
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    }
  };

  useEffect(() => {
    // Safety timer: Ensure loading gets cleared even if Firestore/Auth network connection lags
    const safetyTimer = setTimeout(() => {
      setLoading(currentLoading => {
        if (currentLoading) {
          console.warn('Firebase connection handshake taking longer than expected. Enabling Sandbox Bypass.');
          return false;
        }
        return currentLoading;
      });
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);
          const p = await fetchOrCreateProfile(fbUser);
          setCurrentUserProfile(p);
        } else {
          setFirebaseUser(null);
          setCurrentUserProfile(null);
        }
      } catch (err) {
        console.error('Authentication configuration error:', err);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    throw new Error("Google login is disabled.");
  };

  const loginAsGuest = async () => {
    throw new Error("Guest access is disabled.");
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setLoading(false);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', credential.user.uid);
      const defaultProfile: User = {
        id: credential.user.uid as any,
        name: name || 'Creator Spirit',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        bio: 'Let the spark of creativity start here. Embark on a role-play journey!',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        pronouns: 'they/them',
        age: '18',
        gender: 'Explorer',
        nationality: 'Spark Zone',
        followingIds: [],
        communityIds: [],
        isPremium: false,
        skynetStatus: { warningCount: 0, isMuted: false },
        sparkClashProfile: {
          battlePower: 1000,
          sparks: 100,
          wins: 0,
          losses: 0,
          inventory: [],
          templates: [],
          decks: []
        }
      };
      await setDoc(userDocRef, defaultProfile);
      setCurrentUserProfile(defaultProfile);
    } catch (err) {
      console.error(err);
      setLoading(false);
      throw err;
    }
  };

  const loginWithOfflineSandbox = () => {
    setIsOffline(true);
    setCurrentUserProfile({
      id: 100 as any, // Match mock user ID to link seamlessly with existing creations/profile
      name: 'Sandbox Spark',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      bio: 'Let the spark of creativity start here. Playing in offline sandbox mode!',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
      pronouns: 'they/them',
      age: '18',
      gender: 'Explorer',
      nationality: 'Spark Zone',
      followingIds: [],
      communityIds: [],
      isPremium: false,
      skynetStatus: { warningCount: 0, isMuted: false }
    });
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        setIsOffline(false);
        setCurrentUserProfile(null);
      } else {
        await logOut();
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        currentUserProfile,
        loading,
        isOffline,
        loginWithGoogle,
        loginAsGuest,
        loginWithEmail,
        signUpWithEmail,
        loginWithOfflineSandbox,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
