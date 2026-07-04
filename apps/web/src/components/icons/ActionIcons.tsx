interface IconProps {
  className?: string;
}

export function EditIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12.2 3.8l4 4-8.4 8.4H3.8v-4l8.4-8.4z" strokeLinejoin="round" />
      <path d="M11 5l4 4" strokeLinecap="round" />
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

export function OpenIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M11 3h6v6M9 11l8-8M7 5H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TerminalIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="4" width="14" height="12" rx="1" />
      <path d="M4 6.5h12M4 10h12M4 13.5h8" strokeLinecap="round" />
    </svg>
  );
}
