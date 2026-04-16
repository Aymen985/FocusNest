"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const VISITED_KEY = "focusnest_visited";
const GUEST_KEY   = "focusnest_guest";

// Routes guests are allowed to access
export const GUEST_ALLOWED = ["/", "/pomodoro", "/timetable"];

type GuestContextType = {
  isGuest:        boolean;
  hasVisited:     boolean;
  showWelcome:    boolean;
  continueAsGuest: () => void;
  dismissWelcome: () => void;
};

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuest,     setIsGuest]     = useState(false);
  const [hasVisited,  setHasVisited]  = useState(true);  // true until we know otherwise
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem(VISITED_KEY);
    const guest   = localStorage.getItem(GUEST_KEY);

    if (!visited) {
      // First ever visit — show modal
      setHasVisited(false);
      setShowWelcome(true);
    } else if (guest === "true") {
      setIsGuest(true);
    }
  }, []);

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
