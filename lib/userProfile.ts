// lib/userProfile.ts
import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

export async function createUserProfile(uid: string, email: string, extra: {
  firstName: string;
  lastName: string;
  dob: string;
  major: string;
  phone: string;
}) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    email,
    firstName: extra.firstName,
    lastName: extra.lastName,
    dob: extra.dob,
    major: extra.major,
    phone: extra.phone,
    avatar: "",
    treeCount: 0,
    totalSessions: 0,
  });
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateUserProfile(uid: string, data: {
  firstName?: string;
  lastName?: string;
  dob?: string;
  major?: string;
  phone?: string;
}) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
}

export async function updateUserStats(uid: string) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    treeCount: increment(1),
    totalSessions: increment(1),
  });
}