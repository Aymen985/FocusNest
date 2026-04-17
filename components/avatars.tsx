// components/avatars.tsx
// Race-neutral human avatars + fun/cartoon ones (no animals)

export interface AvatarDef {
  id: string;
  label: string;
  svg: string;
}

export type AvatarId = string;

export const AVATARS: AvatarDef[] = [
  // ── Human avatars — flat silhouette style ────────────────────────────────
  {
    id: "male",
    label: "Male",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#10b981"/>
  <!-- Silhouette body/shoulders -->
  <path d="M12 78 C12 56 24 50 40 50 C56 50 68 56 68 78 Z" fill="rgba(255,255,255,0.85)"/>
  <!-- Silhouette head -->
  <circle cx="40" cy="30" r="14" fill="rgba(255,255,255,0.85)"/>
</svg>`,
  },
  {
    id: "female",
    label: "Female",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#10b981"/>
  <!-- Silhouette body/shoulders — slightly narrower, more curved -->
  <path d="M14 78 C14 58 26 51 40 51 C54 51 66 58 66 78 Z" fill="rgba(255,255,255,0.85)"/>
  <!-- Silhouette head -->
  <circle cx="40" cy="30" r="13" fill="rgba(255,255,255,0.85)"/>
  <!-- Hair: bob/longer style sitting on top of and around head -->
  <path d="M27 28 Q27 14 40 13 Q53 14 53 28 Q53 20 40 19 Q27 20 27 28 Z" fill="rgba(255,255,255,0.85)"/>
  <!-- Side hair pieces that frame the face and extend below ears -->
  <rect x="26" y="26" width="5" height="14" rx="2.5" fill="rgba(255,255,255,0.85)"/>
  <rect x="49" y="26" width="5" height="14" rx="2.5" fill="rgba(255,255,255,0.85)"/>
</svg>`,
  },

  // ── Fun / cartoon avatars (no animals) ───────────────────────────────────
  {
    id: "robot",
    label: "Robot",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#1e293b"/>
  <line x1="40" y1="10" x2="40" y2="19" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="40" cy="9" r="3.5" fill="#10b981"/>
  <rect x="21" y="19" width="38" height="30" rx="6" fill="#334155"/>
  <rect x="23" y="21" width="14" height="6" rx="3" fill="#1e40af" opacity="0.3"/>
  <rect x="27" y="27" width="10" height="8" rx="2.5" fill="#10b981"/>
  <rect x="43" y="27" width="10" height="8" rx="2.5" fill="#10b981"/>
  <rect x="29" y="29" width="4" height="4" rx="1" fill="#34d399" opacity="0.6"/>
  <rect x="45" y="29" width="4" height="4" rx="1" fill="#34d399" opacity="0.6"/>
  <rect x="28" y="40" width="24" height="5" rx="2.5" fill="#10b981" opacity="0.5"/>
  <rect x="30" y="41.5" width="4" height="2" rx="1" fill="#10b981"/>
  <rect x="36" y="41.5" width="4" height="2" rx="1" fill="#10b981"/>
  <rect x="42" y="41.5" width="4" height="2" rx="1" fill="#10b981"/>
  <rect x="35" y="49" width="10" height="5" rx="2" fill="#334155"/>
  <rect x="22" y="54" width="36" height="20" rx="5" fill="#334155"/>
  <circle cx="32" cy="64" r="4" fill="#10b981" opacity="0.7"/>
  <circle cx="48" cy="64" r="4" fill="#0ea5e9" opacity="0.7"/>
  <rect x="35" y="61" width="10" height="6" rx="2" fill="#1e293b"/>
</svg>`,
  },
  {
    id: "alien",
    label: "Alien",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#064e3b"/>
  <line x1="33" y1="16" x2="27" y2="6" stroke="#6ee7b7" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="26" cy="4.5" r="3.5" fill="#34d399"/>
  <line x1="47" y1="16" x2="53" y2="6" stroke="#6ee7b7" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="54" cy="4.5" r="3.5" fill="#34d399"/>
  <ellipse cx="40" cy="43" rx="23" ry="29" fill="#6ee7b7"/>
  <ellipse cx="30" cy="38" rx="8" ry="10" fill="#000"/>
  <ellipse cx="50" cy="38" rx="8" ry="10" fill="#000"/>
  <ellipse cx="31.5" cy="35.5" rx="3" ry="4" fill="#10b981"/>
  <ellipse cx="51.5" cy="35.5" rx="3" ry="4" fill="#10b981"/>
  <circle cx="32" cy="35" r="1.2" fill="white" opacity="0.8"/>
  <circle cx="52" cy="35" r="1.2" fill="white" opacity="0.8"/>
  <ellipse cx="38" cy="49" rx="1.5" ry="2" fill="#4ade80" opacity="0.6"/>
  <ellipse cx="42" cy="49" rx="1.5" ry="2" fill="#4ade80" opacity="0.6"/>
  <path d="M32 56 Q40 62 48 56" stroke="#047857" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "pizza",
    label: "Pizza",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#fffbeb"/>
  <polygon points="40,8 72,68 8,68" fill="#f59e0b"/>
  <path d="M8 68 Q40 82 72 68" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
  <polygon points="40,16 66,63 14,63" fill="#ef4444"/>
  <polygon points="40,22 62,59 18,59" fill="#fde68a"/>
  <circle cx="40" cy="40" r="6" fill="#dc2626"/>
  <circle cx="28" cy="53" r="5" fill="#dc2626"/>
  <circle cx="52" cy="53" r="5" fill="#dc2626"/>
  <circle cx="34" cy="30" r="4" fill="#dc2626"/>
  <circle cx="47" cy="32" r="4" fill="#dc2626"/>
  <circle cx="35" cy="38" r="2.2" fill="#1c1917"/>
  <circle cx="45" cy="38" r="2.2" fill="#1c1917"/>
  <circle cx="35.8" cy="37.2" r="0.8" fill="white"/>
  <circle cx="45.8" cy="37.2" r="0.8" fill="white"/>
  <path d="M35 44 Q40 49 45 44" stroke="#92400e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "avocado",
    label: "Avocado",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#f0fdf4"/>
  <ellipse cx="40" cy="45" rx="23" ry="29" fill="#4ade80"/>
  <ellipse cx="40" cy="45" rx="23" ry="29" stroke="#16a34a" stroke-width="1.5" fill="none"/>
  <ellipse cx="40" cy="47" rx="17" ry="22" fill="#d9f99d"/>
  <ellipse cx="40" cy="52" rx="10" ry="12" fill="#92400e"/>
  <ellipse cx="37" cy="48" rx="3" ry="3.5" fill="#a05020" opacity="0.5"/>
  <circle cx="37" cy="50" r="2.2" fill="white"/>
  <circle cx="43" cy="50" r="2.2" fill="white"/>
  <circle cx="37.6" cy="50.6" r="1" fill="#1c1917"/>
  <circle cx="43.6" cy="50.6" r="1" fill="#1c1917"/>
  <path d="M36 55 Q40 59 44 55" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <line x1="40" y1="16" x2="40" y2="9" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M40 12 Q47 8 50 12 Q47 15 40 12Z" fill="#22c55e"/>
</svg>`,
  },
  {
    id: "sun",
    label: "Sun",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#1c1917"/>
  <line x1="40" y1="6" x2="40" y2="15" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="40" y1="65" x2="40" y2="74" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="6" y1="40" x2="15" y2="40" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="65" y1="40" x2="74" y2="40" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="15" y1="15" x2="21.5" y2="21.5" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="58.5" y1="58.5" x2="65" y2="65" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="65" y1="15" x2="58.5" y2="21.5" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="15" y1="65" x2="21.5" y2="58.5" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <circle cx="40" cy="40" r="19" fill="#fde68a" opacity="0.3"/>
  <circle cx="40" cy="40" r="16" fill="#fbbf24"/>
  <rect x="28" y="34" width="10" height="7" rx="3.5" fill="#1c1917"/>
  <rect x="42" y="34" width="10" height="7" rx="3.5" fill="#1c1917"/>
  <line x1="38" y1="37.5" x2="42" y2="37.5" stroke="#1c1917" stroke-width="2"/>
  <line x1="28" y1="37.5" x2="25" y2="36" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="52" y1="37.5" x2="55" y2="36" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M33 45 Q40 51 47 45" stroke="#92400e" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "ghost",
    label: "Ghost",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#312e81"/>
  <ellipse cx="40" cy="40" rx="22" ry="26" fill="white" opacity="0.08"/>
  <path d="M18 65 L18 33 Q18 15 40 15 Q62 15 62 33 L62 65 Q56 59 50 65 Q44 59 40 65 Q36 59 30 65 Q24 59 18 65Z" fill="white"/>
  <circle cx="32" cy="36" r="6" fill="#312e81"/>
  <circle cx="48" cy="36" r="6" fill="#312e81"/>
  <circle cx="34" cy="34" r="2.5" fill="white"/>
  <circle cx="50" cy="34" r="2.5" fill="white"/>
  <path d="M32 49 Q36 54 40 49 Q44 54 48 49" stroke="#312e81" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <ellipse cx="28" cy="45" rx="4" ry="2.5" fill="#c7d2fe" opacity="0.5"/>
  <ellipse cx="52" cy="45" rx="4" ry="2.5" fill="#c7d2fe" opacity="0.5"/>
</svg>`,
  },
  {
    id: "cactus",
    label: "Cactus",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#ecfdf5"/>
  <path d="M29 65 L33 74 L47 74 L51 65Z" fill="#b45309"/>
  <rect x="27" y="60" width="26" height="6" rx="3" fill="#d97706"/>
  <ellipse cx="40" cy="62" rx="10" ry="2" fill="#92400e" opacity="0.3"/>
  <rect x="34" y="20" width="12" height="42" rx="6" fill="#16a34a"/>
  <rect x="20" y="30" width="15" height="8" rx="4" fill="#16a34a"/>
  <rect x="18" y="22" width="8" height="16" rx="4" fill="#16a34a"/>
  <rect x="45" y="36" width="15" height="8" rx="4" fill="#16a34a"/>
  <rect x="54" y="28" width="8" height="17" rx="4" fill="#16a34a"/>
  <line x1="38" y1="27" x2="35" y2="22" stroke="#bbf7d0" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="42" y1="27" x2="45" y2="22" stroke="#bbf7d0" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="38" y1="34" x2="35" y2="30" stroke="#bbf7d0" stroke-width="1.3" stroke-linecap="round"/>
  <line x1="42" y1="34" x2="45" y2="30" stroke="#bbf7d0" stroke-width="1.3" stroke-linecap="round"/>
  <circle cx="40" cy="17" r="5" fill="#fbbf24"/>
  <circle cx="40" cy="11" r="3" fill="#f472b6"/>
  <circle cx="35" cy="14" r="3" fill="#f472b6"/>
  <circle cx="45" cy="14" r="3" fill="#f472b6"/>
  <circle cx="40" cy="17" r="3" fill="#fde68a"/>
  <circle cx="37" cy="35" r="2" fill="#14532d"/>
  <circle cx="43" cy="35" r="2" fill="#14532d"/>
  <path d="M36 40 Q40 43.5 44 40" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "strawberry",
    label: "Strawberry",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#fff1f2"/>
  <path d="M40 14 Q34 10 30 16 Q36 15 40 22Z" fill="#16a34a"/>
  <path d="M40 14 Q46 10 50 16 Q44 15 40 22Z" fill="#16a34a"/>
  <line x1="40" y1="14" x2="40" y2="20" stroke="#15803d" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 36 Q20 22 40 22 Q60 22 60 36 Q60 58 40 68 Q20 58 20 36Z" fill="#f43f5e"/>
  <ellipse cx="32" cy="34" rx="1.5" ry="2" fill="#fecdd3" transform="rotate(-10 32 34)"/>
  <ellipse cx="40" cy="30" rx="1.5" ry="2" fill="#fecdd3"/>
  <ellipse cx="48" cy="34" rx="1.5" ry="2" fill="#fecdd3" transform="rotate(10 48 34)"/>
  <ellipse cx="29" cy="44" rx="1.5" ry="2" fill="#fecdd3" transform="rotate(-15 29 44)"/>
  <ellipse cx="38" cy="42" rx="1.5" ry="2" fill="#fecdd3"/>
  <ellipse cx="47" cy="43" rx="1.5" ry="2" fill="#fecdd3" transform="rotate(12 47 43)"/>
  <ellipse cx="33" cy="54" rx="1.5" ry="2" fill="#fecdd3" transform="rotate(-8 33 54)"/>
  <ellipse cx="42" cy="54" rx="1.5" ry="2" fill="#fecdd3" transform="rotate(8 42 54)"/>
  <ellipse cx="32" cy="28" rx="5" ry="3" fill="white" opacity="0.25" transform="rotate(-20 32 28)"/>
  <circle cx="35" cy="38" r="2.5" fill="#9f1239"/>
  <circle cx="45" cy="38" r="2.5" fill="#9f1239"/>
  <circle cx="35.8" cy="37" r="1" fill="white" opacity="0.7"/>
  <circle cx="45.8" cy="37" r="1" fill="white" opacity="0.7"/>
  <path d="M34 44 Q40 49 46 44" stroke="#9f1239" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "planet",
    label: "Planet",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#0f172a"/>
  <circle cx="12" cy="14" r="1.2" fill="white" opacity="0.8"/>
  <circle cx="68" cy="20" r="1" fill="white" opacity="0.6"/>
  <circle cx="20" cy="62" r="1.1" fill="white" opacity="0.7"/>
  <circle cx="66" cy="60" r="1.3" fill="white" opacity="0.5"/>
  <circle cx="8" cy="44" r="0.9" fill="white" opacity="0.6"/>
  <circle cx="72" cy="38" r="1" fill="white" opacity="0.7"/>
  <ellipse cx="40" cy="40" rx="34" ry="8" fill="none" stroke="#a78bfa" stroke-width="4" opacity="0.4" stroke-dasharray="60 40"/>
  <circle cx="40" cy="40" r="22" fill="#7c3aed"/>
  <path d="M20 34 Q40 30 60 34" stroke="#6d28d9" stroke-width="3" fill="none" opacity="0.6"/>
  <path d="M19 40 Q40 36 61 40" stroke="#8b5cf6" stroke-width="4" fill="none" opacity="0.5"/>
  <path d="M20 46 Q40 50 60 46" stroke="#6d28d9" stroke-width="3" fill="none" opacity="0.6"/>
  <circle cx="40" cy="40" r="22" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.4"/>
  <ellipse cx="33" cy="32" rx="7" ry="4" fill="white" opacity="0.15" transform="rotate(-30 33 32)"/>
  <ellipse cx="40" cy="40" rx="34" ry="8" fill="none" stroke="#c4b5fd" stroke-width="4" opacity="0.4" stroke-dasharray="40 60" stroke-dashoffset="50"/>
  <circle cx="35" cy="40" r="2.5" fill="#ddd6fe"/>
  <circle cx="45" cy="40" r="2.5" fill="#ddd6fe"/>
  <circle cx="35.8" cy="39" r="1" fill="white" opacity="0.8"/>
  <circle cx="45.8" cy="39" r="1" fill="white" opacity="0.8"/>
  <path d="M34 46 Q40 50 46 46" stroke="#ddd6fe" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "diamond",
    label: "Diamond",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#ecfeff"/>
  <polygon points="40,10 68,35 40,72 12,35" fill="#67e8f9"/>
  <polygon points="40,10 68,35 40,35" fill="#a5f3fc"/>
  <polygon points="40,10 12,35 40,35" fill="#22d3ee"/>
  <polygon points="40,35 68,35 40,72" fill="#0891b2"/>
  <polygon points="40,35 12,35 40,72" fill="#0e7490"/>
  <line x1="40" y1="10" x2="40" y2="72" stroke="white" stroke-width="0.8" opacity="0.4"/>
  <line x1="12" y1="35" x2="68" y2="35" stroke="white" stroke-width="0.8" opacity="0.4"/>
  <line x1="40" y1="10" x2="24" y2="35" stroke="white" stroke-width="0.6" opacity="0.3"/>
  <line x1="40" y1="10" x2="56" y2="35" stroke="white" stroke-width="0.6" opacity="0.3"/>
  <circle cx="32" cy="24" r="2" fill="white" opacity="0.7"/>
  <line x1="32" y1="20" x2="32" y2="28" stroke="white" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  <line x1="28" y1="24" x2="36" y2="24" stroke="white" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  <circle cx="36" cy="38" r="2.2" fill="#0c4a6e"/>
  <circle cx="44" cy="38" r="2.2" fill="#0c4a6e"/>
  <circle cx="36.8" cy="37.2" r="0.8" fill="white" opacity="0.8"/>
  <circle cx="44.8" cy="37.2" r="0.8" fill="white" opacity="0.8"/>
  <path d="M35 43 Q40 47 45 43" stroke="#0c4a6e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "fire",
    label: "Fire",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#1c0a00"/>
  <path d="M40 8 Q52 20 54 32 Q60 24 56 36 Q64 32 62 46 Q62 62 40 72 Q18 62 18 46 Q16 32 24 36 Q20 24 26 32 Q28 20 40 8Z" fill="#f97316"/>
  <path d="M40 18 Q49 28 50 38 Q55 32 52 42 Q56 38 55 48 Q54 60 40 68 Q26 60 25 48 Q24 38 28 42 Q25 32 30 38 Q31 28 40 18Z" fill="#fb923c"/>
  <path d="M40 28 Q46 36 46 44 Q50 40 48 48 Q48 58 40 64 Q32 58 32 48 Q30 40 34 44 Q34 36 40 28Z" fill="#fde68a"/>
  <ellipse cx="40" cy="54" rx="8" ry="6" fill="#fef3c7"/>
  <circle cx="36" cy="48" r="2.5" fill="#92400e"/>
  <circle cx="44" cy="48" r="2.5" fill="#92400e"/>
  <circle cx="36.8" cy="47" r="1" fill="white" opacity="0.8"/>
  <circle cx="44.8" cy="47" r="1" fill="white" opacity="0.8"/>
  <path d="M35 54 Q40 58 45 54" stroke="#92400e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`,
  },
];

export function getAvatar(id: string): AvatarDef {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export function getAllAvatars(): AvatarDef[] {
  return AVATARS;
}

export default AVATARS;
