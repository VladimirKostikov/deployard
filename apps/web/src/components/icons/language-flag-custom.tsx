interface FlagIconProps {
  className?: string;
}

export function FlagEn({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.2" />
      <path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="3.2" />
      <path d="M10 0V14M0 7H20" stroke="#C8102E" strokeWidth="1.8" />
    </svg>
  );
}

export function FlagCs({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="20" height="7" fill="#fff" />
      <rect y="7" width="20" height="7" fill="#D7141A" />
      <path d="M0 0V14L11 7Z" fill="#11457E" />
    </svg>
  );
}

export function FlagPt({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="8" height="14" fill="#006600" />
      <rect x="8" width="12" height="14" fill="#DA020E" />
      <circle cx="8" cy="7" r="2.3" fill="#FFD900" stroke="#006600" strokeWidth="0.4" />
      <rect x="7.1" y="6.4" width="1.8" height="1.2" fill="#006600" />
      <rect x="7.6" y="5.8" width="0.8" height="2.4" fill="#DA020E" />
    </svg>
  );
}

export function FlagSk({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="20" height="4.67" fill="#fff" />
      <rect y="4.67" width="20" height="4.66" fill="#0B4EA2" />
      <rect y="9.33" width="20" height="4.67" fill="#EE1C25" />
      <rect x="1.2" y="3.2" width="4.6" height="7.6" fill="#EE1C25" stroke="#fff" strokeWidth="0.35" />
      <rect x="3.35" y="4.3" width="0.7" height="5.4" fill="#fff" />
      <rect x="2.1" y="5.9" width="3.2" height="0.7" fill="#fff" />
      <rect x="2.85" y="4.5" width="0.45" height="1.3" fill="#fff" />
    </svg>
  );
}

export function FlagSl({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="20" height="4.67" fill="#fff" />
      <rect y="4.67" width="20" height="4.66" fill="#005DA4" />
      <rect y="9.33" width="20" height="4.67" fill="#FF0000" />
      <rect x="1.2" y="3.2" width="4.6" height="7.6" fill="#005DA4" stroke="#FF0000" strokeWidth="0.35" />
      <path d="M2.2 9.8 L4.5 5.2 L6.8 9.8 Z" fill="#fff" />
      <path d="M3.4 9.8 L4.5 7.4 L5.6 9.8 Z" fill="#005DA4" />
    </svg>
  );
}

export function FlagEl({ className = 'h-4 w-5' }: FlagIconProps) {
  const stripeHeight = 14 / 9;

  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      {Array.from({ length: 9 }, (_, index) => (
        <rect
          key={index}
          y={index * stripeHeight}
          width="20"
          height={stripeHeight}
          fill={index % 2 === 0 ? '#0D5EAF' : '#fff'}
        />
      ))}
      <rect width="7.8" height={stripeHeight * 5} fill="#0D5EAF" />
      <rect x="2.9" width="2" height={stripeHeight * 5} fill="#fff" />
      <rect y={stripeHeight * 2} width="7.8" height={stripeHeight} fill="#fff" />
    </svg>
  );
}

export function FlagHr({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="20" height="4.67" fill="#FF0000" />
      <rect y="4.67" width="20" height="4.66" fill="#fff" />
      <rect y="9.33" width="20" height="4.67" fill="#171796" />
      <rect x="7" y="2.2" width="6" height="9.6" fill="#FF0000" stroke="#fff" strokeWidth="0.35" />
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, column) => (
          <rect
            key={`${row}-${column}`}
            x={7.3 + column * 1.05}
            y={2.5 + row * 1.85}
            width={0.95}
            height={1.65}
            fill={(row + column) % 2 === 0 ? '#FF0000' : '#fff'}
          />
        )),
      )}
    </svg>
  );
}

export function FlagMt({ className = 'h-4 w-5' }: FlagIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 14" aria-hidden>
      <rect width="10" height="14" fill="#fff" />
      <rect x="10" width="10" height="14" fill="#CF142B" />
      <rect width="4.2" height="3.6" fill="#B0B0B0" stroke="#707070" strokeWidth="0.2" />
      <rect x="1.7" width="0.8" height="3.6" fill="#CF142B" />
      <rect y="1.4" width="4.2" height="0.8" fill="#CF142B" />
    </svg>
  );
}
