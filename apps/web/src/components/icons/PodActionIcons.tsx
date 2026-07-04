interface IconProps {
  className?: string;
}

export function RestartIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4v6h6M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19a8 8 0 0013-3M19 5a8 8 0 00-13 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ConsoleIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
    </svg>
  );
}

export { DeleteIcon } from './ActionIcons';
