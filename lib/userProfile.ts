// lib/userProfile.ts

import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

// Create user document (on signup)
export async function createUserProfile(uid: string, email: string) {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    email,
    name: "",
    avatar: "",
    treeCount: 0,
    totalSessions: 0,
  });
}

// Get user data (on login)
export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return null;

  return snap.data();
}

// Update stats (after Pomodoro)
export async function updateUserStats(uid: string) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    treeCount: increment(1),
    totalSessions: increment(1),
  });
}