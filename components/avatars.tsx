// components/avatars.tsx
// Generic race-neutral human avatars + fun/cartoon ones

export interface AvatarDef {
  id: string;
  label: string;
  svg: string;
}

export type AvatarId = string;

export const AVATARS: AvatarDef[] = [
  // ── Human avatars (race-neutral, Facebook-style silhouette) ──────────────
  {
    id: "male",
    label: "Male",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#10b981"/>
  <!-- Head -->
  <circle cx="40" cy="28" r="13" fill="#e8d5c4"/>
  <!-- Body / shoulders silhouette -->
  <path d="M14 72 C14 54 66 54 66 72 Z" fill="#e8d5c4"/>
  <!-- Shirt -->
  <path d="M14 72 C14 60 26 56 40 56 C54 56 66 60 66 72 Z" fill="#0d9488"/>
</svg>`,
  },
  {
    id: "female",
    label: "Female",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#10b981"/>
  <!-- Head -->
  <circle cx="40" cy="28" r="13" fill="#e8d5c4"/>
  <!-- Hair -->
  <path d="M27 26 Q28 14 40 13 Q52 14 53 26 Q53 18 40 17 Q27 18 27 26Z" fill="#5c3d2e"/>
  <path d="M27 26 Q24 32 26 36 Q25 30 27 26Z" fill="#5c3d2e"/>
  <path d="M53 26 Q56 32 54 36 Q55 30 53 26Z" fill="#5c3d2e"/>
  <!-- Body -->
  <path d="M14 72 C14 60 26 56 40 56 C54 56 66 60 66 72 Z" fill="#f472b6"/>
</svg>`,
  },

  // ── Fun / cartoon avatars ─────────────────────────────────────────────────
  {
    id: "robot",
    label: "Robot",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#1e293b"/>
  <!-- Antenna -->
  <line x1="40" y1="12" x2="40" y2="20" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="40" cy="11" r="3" fill="#10b981"/>
  <!-- Head box -->
  <rect x="22" y="20" width="36" height="28" rx="5" fill="#334155"/>
  <!-- Eyes -->
  <rect x="28" y="28" width="9" height="7" rx="2" fill="#10b981"/>
  <rect x="43" y="28" width="9" height="7" rx="2" fill="#10b981"/>
  <!-- Mouth -->
  <rect x="29" y="39" width="22" height="4" rx="2" fill="#10b981" opacity="0.7"/>
  <!-- Neck -->
  <rect x="36" y="48" width="8" height="5" fill="#334155"/>
  <!-- Body -->
  <rect x="24" y="53" width="32" height="18" rx="4" fill="#334155"/>
  <circle cx="40" cy="62" r="4" fill="#10b981" opacity="0.8"/>
</svg>`,
  },
  {
    id: "cat",
    label: "Cat",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#fef3c7"/>
  <!-- Ears -->
  <polygon points="20,28 28,42 14,42" fill="#f59e0b"/>
  <polygon points="60,28 66,42 52,42" fill="#f59e0b"/>
  <polygon points="21,30 27,41 16,41" fill="#fde68a"/>
  <polygon points="59,30 65,41 53,41" fill="#fde68a"/>
  <!-- Head -->
  <circle cx="40" cy="46" r="22" fill="#fbbf24"/>
  <!-- Eyes -->
  <ellipse cx="32" cy="42" rx="4" ry="5" fill="#1c1917"/>
  <ellipse cx="48" cy="42" rx="4" ry="5" fill="#1c1917"/>
  <circle cx="33" cy="41" r="1.5" fill="white"/>
  <circle cx="49" cy="41" r="1.5" fill="white"/>
  <!-- Nose -->
  <polygon points="40,48 37,51 43,51" fill="#f43f5e"/>
  <!-- Whiskers -->
  <line x1="18" y1="49" x2="34" y2="50" stroke="#92400e" stroke-width="1.2" opacity="0.6"/>
  <line x1="18" y1="52" x2="34" y2="52" stroke="#92400e" stroke-width="1.2" opacity="0.6"/>
  <line x1="46" y1="50" x2="62" y2="49" stroke="#92400e" stroke-width="1.2" opacity="0.6"/>
  <line x1="46" y1="52" x2="62" y2="52" stroke="#92400e" stroke-width="1.2" opacity="0.6"/>
  <!-- Mouth -->
  <path d="M37 52 Q40 56 43 52" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "alien",
    label: "Alien",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#064e3b"/>
  <!-- Head (tall oval) -->
  <ellipse cx="40" cy="42" rx="22" ry="28" fill="#6ee7b7"/>
  <!-- Eyes (big) -->
  <ellipse cx="31" cy="38" rx="7" ry="9" fill="#000"/>
  <ellipse cx="49" cy="38" rx="7" ry="9" fill="#000"/>
  <ellipse cx="32" cy="36" rx="2.5" ry="3.5" fill="#10b981"/>
  <ellipse cx="50" cy="36" rx="2.5" ry="3.5" fill="#10b981"/>
  <!-- Mouth -->
  <path d="M33 54 Q40 59 47 54" stroke="#047857" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Antennae -->
  <line x1="33" y1="15" x2="28" y2="6" stroke="#6ee7b7" stroke-width="2" stroke-linecap="round"/>
  <circle cx="27" cy="5" r="3" fill="#34d399"/>
  <line x1="47" y1="15" x2="52" y2="6" stroke="#6ee7b7" stroke-width="2" stroke-linecap="round"/>
  <circle cx="53" cy="5" r="3" fill="#34d399"/>
</svg>`,
  },
  {
    id: "pizza",
    label: "Pizza",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#fef9c3"/>
  <!-- Pizza slice -->
  <polygon points="40,10 70,65 10,65" fill="#f59e0b"/>
  <!-- Crust -->
  <path d="M10 65 Q40 78 70 65" fill="#d97706" stroke="#b45309" stroke-width="1"/>
  <!-- Sauce -->
  <polygon points="40,18 64,60 16,60" fill="#ef4444"/>
  <!-- Cheese -->
  <polygon points="40,22 61,57 19,57" fill="#fde68a"/>
  <!-- Pepperoni -->
  <circle cx="40" cy="38" r="5" fill="#dc2626"/>
  <circle cx="30" cy="50" r="4" fill="#dc2626"/>
  <circle cx="50" cy="50" r="4" fill="#dc2626"/>
  <!-- Eyes on pizza (cute face) -->
  <circle cx="36" cy="36" r="2" fill="#1c1917"/>
  <circle cx="44" cy="36" r="2" fill="#1c1917"/>
  <path d="M36 43 Q40 47 44 43" stroke="#1c1917" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "avocado",
    label: "Avocado",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#ecfdf5"/>
  <!-- Avocado body -->
  <ellipse cx="40" cy="44" rx="22" ry="28" fill="#4ade80"/>
  <!-- Darker outline -->
  <ellipse cx="40" cy="44" rx="22" ry="28" stroke="#16a34a" stroke-width="1.5" fill="none"/>
  <!-- Inner flesh -->
  <ellipse cx="40" cy="46" rx="16" ry="21" fill="#d9f99d"/>
  <!-- Pit / face area -->
  <ellipse cx="40" cy="50" rx="9" ry="11" fill="#92400e"/>
  <!-- Eyes -->
  <circle cx="37" cy="47" r="2" fill="white"/>
  <circle cx="43" cy="47" r="2" fill="white"/>
  <circle cx="37.5" cy="47.5" r="1" fill="#1c1917"/>
  <circle cx="43.5" cy="47.5" r="1" fill="#1c1917"/>
  <!-- Smile -->
  <path d="M36 53 Q40 57 44 53" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Little stem -->
  <line x1="40" y1="16" x2="40" y2="10" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 13 Q46 10 48 13" stroke="#16a34a" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "sun",
    label: "Sun",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#1c1917"/>
  <!-- Rays -->
  <line x1="40" y1="8" x2="40" y2="16" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="40" y1="64" x2="40" y2="72" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="8" y1="40" x2="16" y2="40" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="64" y1="40" x2="72" y2="40" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="17" y1="17" x2="23" y2="23" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="57" y1="57" x2="63" y2="63" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="63" y1="17" x2="57" y2="23" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <line x1="17" y1="63" x2="23" y2="57" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <!-- Sun face -->
  <circle cx="40" cy="40" r="16" fill="#fbbf24"/>
  <circle cx="35" cy="37" r="2.5" fill="#92400e"/>
  <circle cx="45" cy="37" r="2.5" fill="#92400e"/>
  <path d="M34 44 Q40 49 46 44" stroke="#92400e" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "ghost",
    label: "Ghost",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#312e81"/>
  <!-- Ghost body -->
  <path d="M20 62 L20 34 Q20 18 40 18 Q60 18 60 34 L60 62 Q54 57 48 62 Q42 57 40 62 Q38 57 32 62 Q26 57 20 62Z" fill="white"/>
  <!-- Eyes -->
  <circle cx="33" cy="38" r="5" fill="#312e81"/>
  <circle cx="47" cy="38" r="5" fill="#312e81"/>
  <circle cx="34.5" cy="36.5" r="2" fill="white"/>
  <circle cx="48.5" cy="36.5" r="2" fill="white"/>
  <!-- Mouth - spooky smile -->
  <path d="M32 48 Q36 52 40 48 Q44 52 48 48" stroke="#312e81" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "cactus",
    label: "Cactus",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="40" fill="#ecfdf5"/>
  <!-- Pot -->
  <path d="M28 64 L32 72 L48 72 L52 64Z" fill="#b45309"/>
  <rect x="26" y="60" width="28" height="5" rx="2" fill="#d97706"/>
  <!-- Main body -->
  <rect x="34" y="22" width="12" height="40" rx="6" fill="#16a34a"/>
  <!-- Left arm -->
  <rect x="22" y="32" width="13" height="8" rx="4" fill="#16a34a"/>
  <rect x="20" y="25" width="8" height="13" rx="4" fill="#16a34a"/>
  <!-- Right arm -->
  <rect x="45" y="38" width="13" height="8" rx="4" fill="#16a34a"/>
  <rect x="52" y="31" width="8" height="13" rx="4" fill="#16a34a"/>
  <!-- Spines -->
  <line x1="38" y1="28" x2="35" y2="24" stroke="#bbf7d0" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="42" y1="28" x2="45" y2="24" stroke="#bbf7d0" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Face -->
  <circle cx="37" cy="36" r="2" fill="#14532d"/>
  <circle cx="43" cy="36" r="2" fill="#14532d"/>
  <path d="M36 41 Q40 44 44 41" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
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
