"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile, getUserProfile } from "@/lib/userProfile";

type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  major: string;
  phone: string;
  avatar: string;
  treeCount: number;
  totalSessions: number;
} | null;

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    extra: {
      firstName: string;
      lastName: string;
      dob: string;
      major: string;
      phone: string;
    }
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        document.cookie = "auth-token=true; path=/; max-age=86400";
        const profile = await getUserProfile(u.uid);
        setUserProfile(profile as UserProfile);
      } else {
        document.cookie = "auth-token=; path=/; max-age=0";
        setUserProfile(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signup(
    email: string,
    password: string,
    extra: {
      firstName: string;
      lastName: string;
      dob: string;
      major: string;
      phone: string;
    }
  ): Promise<void> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user.uid, result.user.email || email, extra);
    await sendEmailVerification(result.user);
    await signOut(auth);
  }

  async function login(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async function logout(): Promise<void> {
    await signOut(auth);
  }

  async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signup,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}