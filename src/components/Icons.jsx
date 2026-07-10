const I = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export const HomeIcon = (p) => (
  <I {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></I>
)
export const KanbanIcon = (p) => (
  <I {...p}><rect x="4" y="4" width="4.5" height="13" rx="1" /><rect x="10" y="4" width="4.5" height="9" rx="1" /><rect x="16" y="4" width="4.5" height="16" rx="1" /></I>
)
export const EuroIcon = (p) => (
  <I {...p}><path d="M12 3v18" /><path d="M16.5 7.5c-.9-1.4-2.8-2-4.5-2-2 0-3.5 1.1-3.5 2.75C8.5 12 15.5 11 15.5 14.5c0 1.65-1.5 2.75-3.5 2.75-1.7 0-3.6-.6-4.5-2" /></I>
)
export const ChartIcon = (p) => (
  <I {...p}><path d="M4 20V9M10 20V4M16 20v-8M21 20H3" /></I>
)
export const UserIcon = (p) => (
  <I {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" /></I>
)
export const UsersIcon = (p) => (
  <I {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1.2-3 3.6-4.5 6.5-4.5s5.3 1.5 6.5 4.5" /><path d="M16 5a3.5 3.5 0 0 1 0 7M18 15.5c1.8.7 3 2 3.5 4.5" /></I>
)
export const PlusIcon = (p) => (
  <I {...p}><path d="M12 5v14M5 12h14" /></I>
)
export const MailIcon = (p) => (
  <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></I>
)
export const CheckIcon = (p) => (
  <I {...p}><path d="m5 13 4 4L19 7" /></I>
)
export const CalIcon = (p) => (
  <I {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></I>
)
export const XIcon = (p) => (
  <I {...p}><path d="M6 6l12 12M18 6L6 18" /></I>
)
export const BellIcon = (p) => (
  <I {...p}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></I>
)
export const SunIcon = (p) => (
  <I {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></I>
)
export const MoonIcon = (p) => (
  <I {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5" /></I>
)
export const ChevronIcon = (p) => (
  <I {...p}><path d="m9 6 6 6-6 6" /></I>
)
export const SearchIcon = (p) => (
  <I {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></I>
)
