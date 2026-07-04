interface IconProps {
  className?: string;
}

export function PlayIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M6.5 4.2a1 1 0 011.5-.86l7.5 4.3a1 1 0 010 1.72l-7.5 4.3a1 1 0 01-1.5-.86V4.2z" />
    </svg>
  );
}

export function PauseIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M6.5 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1zm7 0a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
    </svg>
  );
}

export function PodsIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1" />
      <rect x="11" y="3.5" width="5.5" height="5.5" rx="1" />
      <rect x="3.5" y="11" width="5.5" height="5.5" rx="1" />
      <rect x="11" y="11" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

export function LogsIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="4.5" width="13" height="11" rx="1.2" />
      <path d="M6.5 8.5h7M6.5 11.5h5" strokeLinecap="round" />
      <path d="M13.5 11.5l1.5 1.5 2.5-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HistoryIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M10 4.5a5.5 5.5 0 105.5 5.5" strokeLinecap="round" />
      <path d="M10 2.5V5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10h2.2l1.3 1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ConsoleIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4.5 6.5h11M4.5 10h7M4.5 13.5h5" strokeLinecap="round" />
    </svg>
  );
}

export function OpenIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M11 3h6v6M9 11l8-8M7 5H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RestartIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 4v4h4M16 16v-4h-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15a6.5 6.5 0 0011-2.5M15.5 5a6.5 6.5 0 00-11 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DeleteIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4.5 6.5h11M8 6.5V5a1 1 0 011-1h2a1 1 0 011 1v1.5M7 6.5v8.5M10 6.5v8.5M13 6.5v8.5" strokeLinecap="round" />
      <path d="M6 6.5l.5 8.5a1 1 0 001 1h5a1 1 0 001-1l.5-8.5" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="2.5" />
      <path
        d="M10 3.5v1.2M10 15.3v1.2M16.5 10h-1.2M4.7 10H3.5M14.1 5.9l-.85.85M6.75 13.25l-.85.85M14.1 14.1l-.85-.85M6.75 6.75l-.85-.85"
        strokeLinecap="round"
      />
    </svg>
  );
}
