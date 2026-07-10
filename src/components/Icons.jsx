import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Shared minimal line-icon library — replaces emoji throughout the app.
// Consistent style: 24x24 viewBox, ~1.8 stroke width, rounded caps.
// ─────────────────────────────────────────────────────────────────────────────

const base = { viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconSpeakerOn = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
)

export const IconSpeakerPlaying = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" style={{ opacity: 0.9 }} />
  </svg>
)

export const IconSpeakerOff = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
)

export const IconCheckCircle = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export const IconXCircle = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

export const IconLightbulb = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
  </svg>
)

export const IconBook = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

export const IconBookOpen = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

export const IconDocument = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
)

export const IconPencil = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

export const IconMic = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

export const IconEar = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M6 9a6 6 0 0 1 12 0c0 3.5-3 4-3 8a3 3 0 0 1-6 0" />
    <path d="M9 9a3 3 0 0 1 6 0c0 1.6-1.5 2-1.5 4" />
  </svg>
)

export const IconStar = ({ size = 16, color = 'currentColor', sw = 1.8, filled = false }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw} fill={filled ? color : 'none'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const IconTarget = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

export const IconTrendingUp = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

export const IconBriefcase = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
)

export const IconHandshake = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M8.5 14.5 4 10l4-4 3 3" />
    <path d="M15.5 14.5 20 10l-4-4-3 3" />
    <path d="M11 9l1.5 1.5a2 2 0 0 1 0 2.83v0a2 2 0 0 1-2.83 0L8 11.67" />
    <path d="M13 9l-1.5 1.5" />
  </svg>
)

export const IconTrophy = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M7 5H4a2 2 0 0 0 2 4h1" />
    <path d="M17 5h3a2 2 0 0 1-2 4h-1" />
  </svg>
)

export const IconAlertTriangle = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const IconCalendar = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export const IconClock = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const IconRefresh = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

export const IconSparkle = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
)

export const IconLock = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export const IconChevronDown = ({ size = 16, color = 'currentColor', sw = 2 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export const IconPlayCircle = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} {...base} stroke={color} strokeWidth={sw}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill={color} stroke="none" />
  </svg>
)

export const IconZap = ({ size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export const IconFox = ({ size = 16, color = 'currentColor', sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16c-3 0-5.5-2-6.5-4.5C4 8 5 5 7 4l1.5 3L12 5.5 15.5 7 17 4c2 1 3 4 1.5 7.5C17.5 14 15 16 12 16z"/>
    <path d="M9 12.5c.3.5.9.8 1.5.8s1.2-.3 1.5-.8"/>
    <circle cx="9.5" cy="10" r="0.6" fill={color} stroke="none"/>
    <circle cx="14.5" cy="10" r="0.6" fill={color} stroke="none"/>
    <path d="M12 16v3M9 20l1.5-1.5M15 20l-1.5-1.5"/>
  </svg>
)

// Icon-key → component map, used by data-driven content like learningResources.js
export const ICON_MAP = {
  book: IconBook,
  pencil: IconPencil,
  vocabulary: IconBookOpen,
  lightbulb: IconLightbulb,
  mic: IconMic,
  speaker: IconSpeakerOn,
  ear: IconEar,
  star: IconStar,
  target: IconTarget,
  write: IconPencil,
  document: IconDocument,
  briefcase: IconBriefcase,
  handshake: IconHandshake,
  trendingUp: IconTrendingUp,
  sparkle: IconSparkle,
  trophy: IconTrophy,
  clock: IconClock,
  checkCircle: IconCheckCircle,
  refresh: IconRefresh,
}
