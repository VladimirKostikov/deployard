interface ThemeIconProps {
  className?: string;
}

export function SunIcon({ className = 'h-4 w-4' }: ThemeIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M10 2.5v1.5M10 16v1.5M17.5 10H16M4 10H2.5M15.07 4.93l-1.06 1.06M6 13.94l-1.06 1.06M15.07 15.07l-1.06-1.06M6 6.06L4.94 5"
      />
    </svg>
  );
}

export function MoonIcon({ className = 'h-4 w-4' }: ThemeIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M15.5 12.2a6.5 6.5 0 01-8.7-8.7A6.5 6.5 0 1015.5 12.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AutoThemeIcon({ className = 'h-4 w-4' }: ThemeIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3a7 7 0 000 14V3z" fill="currentColor" />
    </svg>
  );
}

export function ChevronDownIcon({ className = 'h-4 w-4' }: ThemeIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}
