"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

const VISITED_KEY = "focusnest_visited";
const GUEST_KEY   = "focusnest_guest";

export const GUEST_ALLOWED = ["/", "/pomodoro", "/timetable"];

type GuestContextType = {
  isGuest:         boolean;
  hasVisited:      boolean;
  showWelcome:     boolean;
  continueAsGuest: () => void;
  dismissWelcome:  () => void;
};

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [isGuest,     setIsGuest]     = useState(false);
  const [hasVisited,  setHasVisited]  = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // On mount — restore state from localStorage
  useEffect(() => {
    const visited = localStorage.getItem(VISITED_KEY);
    const guest   = localStorage.getItem(GUEST_KEY);
    if (!visited) {
      setHasVisited(false);
      setShowWelcome(true);
    } else if (guest === "true") {
      setIsGuest(true);
    }
  }, []);

  // When a real user logs in — clear guest state immediately
  useEffect(() => {
    if (!loading && user) {
      localStorage.removeItem(GUEST_KEY);
      localStorage.setItem(VISITED_KEY, "true");
      setIsGuest(false);
      setShowWelcome(false);
    }
  }, [user, loading]);

  function continueAsGuest() {
    localStorage.setItem(VISITED_KEY, "true");
    localStorage.setItem(GUEST_KEY, "true");
    setHasVisited(true);
    setIsGuest(true);
    setShowWelcome(false);
  }

  function dismissWelcome() {
    localStorage.setItem(VISITED_KEY, "true");
    localStorage.removeItem(GUEST_KEY);
    setHasVisited(true);
    setIsGuest(false);
    setShowWelcome(false);
  }

  return (
    <GuestContext.Provider value={{ isGuest, hasVisited, showWelcome, continueAsGuest, dismissWelcome }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be used inside GuestProvider");
  return ctx;
}
