// components/avatars.tsx
// 10 illustrated avatar icons — 5 male (m1-m5), 5 female (f1-f5)

export type AvatarId = "m1" | "m2" | "m3" | "m4" | "m5" | "f1" | "f2" | "f3" | "f4" | "f5";

export interface Avatar {
  id: AvatarId;
  label: string;
  bg: string;   // background colour
  svg: string;  // inline SVG path content
}

// Each avatar is a simple illustrated face as an SVG string
export const AVATARS: Avatar[] = [
  {
    id: "m1", label: "Alex", bg: "#dbeafe",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#dbeafe"/>
      <circle cx="32" cy="26" r="13" fill="#fcd9b0"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#3b82f6"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 32 Q32 36 37 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M20 20 Q32 12 44 20" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: "m2", label: "Sam", bg: "#dcfce7",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#dcfce7"/>
      <circle cx="32" cy="26" r="13" fill="#fcd9b0"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#16a34a"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 32 Q32 37 37 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <rect x="22" y="15" width="20" height="7" rx="3.5" fill="#92400e"/>
      <path d="M24 22 Q32 30 40 22" fill="#92400e"/>
    </svg>`,
  },
  {
    id: "m3", label: "Jordan", bg: "#fef9c3",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#fef9c3"/>
      <circle cx="32" cy="26" r="13" fill="#fde68a"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#ca8a04"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M28 32 Q32 35 36 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M22 21 Q32 14 42 21" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="26" cy="28" r="1.5" fill="#f87171" opacity="0.6"/>
      <circle cx="38" cy="28" r="1.5" fill="#f87171" opacity="0.6"/>
    </svg>`,
  },
  {
    id: "m4", label: "Chris", bg: "#ede9fe",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#ede9fe"/>
      <circle cx="32" cy="26" r="13" fill="#fcd9b0"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#7c3aed"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 33 Q32 37 37 33" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M20 22 Q32 13 44 22 Q40 18 32 17 Q24 18 20 22Z" fill="#1e293b"/>
      <rect x="19" y="20" width="5" height="8" rx="2" fill="#1e293b"/>
    </svg>`,
  },
  {
    id: "m5", label: "Taylor", bg: "#ffedd5",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#ffedd5"/>
      <circle cx="32" cy="26" r="13" fill="#fed7aa"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#ea580c"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M28 32 Q32 36 36 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M21 21 Q32 15 43 21" stroke="#b45309" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M22 30 Q20 26 21 21" stroke="#b45309" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M42 30 Q44 26 43 21" stroke="#b45309" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: "f1", label: "Maya", bg: "#fce7f3",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#fce7f3"/>
      <circle cx="32" cy="26" r="13" fill="#fcd9b0"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#db2777"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 32 Q32 37 37 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M19 22 Q32 8 45 22 Q40 34 32 38 Q24 34 19 22Z" fill="#be185d" opacity="0.85"/>
      <circle cx="26" cy="28" r="1.5" fill="#f9a8d4" opacity="0.8"/>
      <circle cx="38" cy="28" r="1.5" fill="#f9a8d4" opacity="0.8"/>
    </svg>`,
  },
  {
    id: "f2", label: "Zoe", bg: "#ecfdf5",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#ecfdf5"/>
      <circle cx="32" cy="26" r="13" fill="#fde68a"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#059669"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 32 Q32 37 37 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M18 24 Q25 10 32 13 Q39 10 46 24" stroke="#d97706" stroke-width="3" fill="none"/>
      <path d="M18 24 Q16 32 19 36" stroke="#d97706" stroke-width="2.5" fill="none"/>
      <path d="M46 24 Q48 32 45 36" stroke="#d97706" stroke-width="2.5" fill="none"/>
      <circle cx="26" cy="28" r="1.5" fill="#fca5a5" opacity="0.7"/>
      <circle cx="38" cy="28" r="1.5" fill="#fca5a5" opacity="0.7"/>
    </svg>`,
  },
  {
    id: "f3", label: "Priya", bg: "#fdf4ff",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#fdf4ff"/>
      <circle cx="32" cy="26" r="13" fill="#fcd9b0"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#a21caf"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 32 Q32 37 37 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M18 22 Q32 10 46 22 L44 36 Q32 42 20 36Z" fill="#7e22ce" opacity="0.8"/>
      <circle cx="32" cy="18" r="2.5" fill="#f59e0b"/>
      <circle cx="26" cy="28" r="1.5" fill="#f0abfc" opacity="0.8"/>
      <circle cx="38" cy="28" r="1.5" fill="#f0abfc" opacity="0.8"/>
    </svg>`,
  },
  {
    id: "f4", label: "Luna", bg: "#eff6ff",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#eff6ff"/>
      <circle cx="32" cy="26" r="13" fill="#fcd9b0"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#2563eb"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 32 Q32 37 37 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M19 21 Q32 11 45 21 L45 24 Q32 16 19 24Z" fill="#1d4ed8"/>
      <path d="M19 24 Q17 30 19 35" stroke="#1d4ed8" stroke-width="3" fill="none"/>
      <path d="M45 24 Q47 30 45 35" stroke="#1d4ed8" stroke-width="3" fill="none"/>
    </svg>`,
  },
  {
    id: "f5", label: "Sara", bg: "#fff7ed",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#fff7ed"/>
      <circle cx="32" cy="26" r="13" fill="#fed7aa"/>
      <ellipse cx="32" cy="52" rx="16" ry="10" fill="#c2410c"/>
      <circle cx="27" cy="25" r="2" fill="#1e293b"/>
      <circle cx="37" cy="25" r="2" fill="#1e293b"/>
      <path d="M27 32 Q32 37 37 32" stroke="#c2855a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M19 20 Q32 9 45 20 Q42 28 38 32 Q32 36 26 32 Q22 28 19 20Z" fill="#c2410c" opacity="0.7"/>
      <circle cx="26" cy="28" r="1.5" fill="#fdba74" opacity="0.9"/>
      <circle cx="38" cy="28" r="1.5" fill="#fdba74" opacity="0.9"/>
    </svg>`,
  },
];

export function getAvatar(id: string | undefined): Avatar {
  return AVATARS.find(a => a.id === id) ?? AVATARS[0];
}
