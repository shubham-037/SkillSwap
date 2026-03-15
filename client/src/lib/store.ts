import { create } from 'zustand';
import {
  getFirebaseAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
  getFirestoreDb,
  doc,
  setDoc,
  getDoc,
} from './firebase';

interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  bio: string;
  skillsTeach: string[];
  skillsLearn: string[];
  credits: number;
  rating: number;
  profileImage: string;
  skillVerifications?: {
    [skill: string]: {
      status: 'pending' | 'verified' | 'failed';
      score: number;
      feedback: string;
      lastAttempt: any;
      aiProbability: number;
    };
  };
}

interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    skillsTeach: string[];
    skillsLearn: string[];
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  initAuth: () => () => void;
  updateSkillVerification: (skill: string, result: {
    status: 'verified' | 'failed';
    score: number;
    feedback: string;
    aiProbability: number;
  }) => Promise<void>;
}

function firebaseToAppUser(fbUser: FirebaseUser, extra?: any): AppUser {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('skillswap_profile') : null;
  const profile = stored ? JSON.parse(stored) : {};

  // Prioritize extra (Firestore) > fbUser (Auth) > profile (LocalStorage)
  return {
    uid: fbUser.uid,
    displayName: extra?.displayName || fbUser.displayName || profile.displayName || profile.name || '',
    email: fbUser.email || extra?.email || profile.email || '',
    bio: extra?.bio || profile.bio || '',
    skillsTeach: extra?.skillsTeach || profile.skillsTeach || [],
    skillsLearn: extra?.skillsLearn || profile.skillsLearn || [],
    credits: extra?.credits ?? profile.credits ?? 5,
    rating: extra?.rating || profile.rating || 0,
    profileImage: extra?.profileImage || fbUser.photoURL || profile.profileImage || '',
    skillVerifications: extra?.skillVerifications || profile.skillVerifications || {},
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  login: async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const appUser = firebaseToAppUser(cred.user);
    set({ user: appUser, firebaseUser: cred.user });
  },

  signup: async (signupData) => {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(
      auth,
      signupData.email,
      signupData.password
    );

    await updateProfile(cred.user, { displayName: signupData.name });

    const profileData = {
      uid: cred.user.uid,
      displayName: signupData.name,
      email: signupData.email,
      bio: '',
      skillsTeach: signupData.skillsTeach,
      skillsLearn: signupData.skillsLearn,
      credits: 5,
      rating: 0,
      profileImage: cred.user.photoURL || '',
      skillVerifications: {},
    };

    // Persist to Firestore immediately
    try {
      const db = getFirestoreDb();
      await setDoc(doc(db, 'users', cred.user.uid), profileData);
    } catch (err) {
      console.error('Error saving profile to Firestore:', err);
    }

    const appUser = firebaseToAppUser(cred.user, profileData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('skillswap_profile', JSON.stringify(appUser));
    }

    set({ user: appUser, firebaseUser: cred.user });
  },

  logout: () => {
    try {
      const auth = getFirebaseAuth();
      signOut(auth);
    } catch { /* SSR guard */ }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skillswap_profile');
    }
    set({ user: null, firebaseUser: null });
  },

  loadUser: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const db = getFirestoreDb();
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        const appUser = firebaseToAppUser(currentUser, userDoc.exists() ? userDoc.data() : undefined);
        set({ user: appUser, firebaseUser: currentUser, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Error loading user:', err);
      set({ isLoading: false });
    }
  },

  initAuth: () => {
    if (typeof window === 'undefined') {
      return () => {};
    }
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const db = getFirestoreDb();
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            const appUser = firebaseToAppUser(fbUser, userDoc.exists() ? userDoc.data() : undefined);
            set({ user: appUser, firebaseUser: fbUser, isLoading: false });
          } catch (err) {
            console.error('Error in onAuthStateChanged:', err);
            const appUser = firebaseToAppUser(fbUser);
            set({ user: appUser, firebaseUser: fbUser, isLoading: false });
          }
        } else {
          set({ user: null, firebaseUser: null, isLoading: false });
        }
      });
      return unsubscribe;
    } catch {
      set({ isLoading: false });
      return () => {};
    }
  },

  updateSkillVerification: async (skill, result) => {
    const { user } = get();
    if (!user) return;

    const db = getFirestoreDb();
    const userRef = doc(db, 'users', user.uid);
    
    const verificationData = {
      status: result.status,
      score: result.score,
      feedback: result.feedback,
      lastAttempt: new Date().toISOString(),
      aiProbability: result.aiProbability,
    };

    const updatedVerifications = {
      ...(user.skillVerifications || {}),
      [skill]: verificationData,
    };

    try {
      await setDoc(userRef, { skillVerifications: updatedVerifications }, { merge: true });
      
      const updatedUser = {
        ...user,
        skillVerifications: updatedVerifications,
      };
      
      set({ user: updatedUser });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('skillswap_profile', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Error updating skill verification:', err);
    }
  },
}));
