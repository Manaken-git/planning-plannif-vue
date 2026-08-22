import type { ReactNode, SVGProps } from 'react';

export type IconName = 'atom' | 'bell' | 'book' | 'calendar' | 'calendarDays' | 'calculator' | 'chevronDown' | 'chevronLeft' | 'chevronRight' | 'close' | 'cube' | 'flag' | 'globe' | 'grid' | 'info' | 'landmark' | 'languages' | 'list' | 'menu' | 'more' | 'rocket' | 'trash' | 'users';

const paths: Record<IconName, ReactNode> = {
  atom: <><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M20.2 20.2c2.04-2.03-1.04-8.4-6.88-14.24C7.48.12 1.11-2.96-.92-.92" transform="translate(2.36 2.36)"/><path d="M3.8 20.2C1.76 18.17 4.84 11.8 10.68 5.96 16.52.12 22.89-2.96 24.92-.92" transform="translate(-1.36 2.36)"/><path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/></>,
  calendar: <><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  calendarDays: <><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
  calculator: <><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></>,
  chevronDown: <path d="m6 9 6 6 6-6"/>,
  chevronLeft: <path d="m15 18-6-6 6-6"/>,
  chevronRight: <path d="m9 18 6-6-6-6"/>,
  close: <path d="M18 6 6 18M6 6l12 12"/>,
  cube: <><path d="m21 16-9 5-9-5V8l9-5 9 5z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
  flag: <><path d="M5 22V4"/><path d="M5 4h11l-1 4 1 4H5"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/></>,
  grid: <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></>,
  info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
  landmark: <><path d="m3 10 9-7 9 7M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/></>,
  languages: <><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  more: <><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.18 2.18 0 0 0-2.9-.1Z"/><path d="m9 15-3-3s.5-2 2-3.5c1.5-1.4 5-1 5-1s-.4 3.5-1.8 5c-1.5 1.5-3.5 2-3.5 2Z"/><path d="M9 15c2.5.5 4.5-.5 6-2l4-4c2-2 2-6 2-6s-4 0-6 2l-4 4c-1.5 1.5-2.5 3.5-2 6Z"/><circle cx="16" cy="8" r="1"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
};

interface IconProps extends SVGProps<SVGSVGElement> { name: IconName; }

export function Icon({ name, className = '', ...props }: IconProps) {
  return <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
