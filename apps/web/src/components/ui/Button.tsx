import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'inverse';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg shadow-sm hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent/40',
  secondary:
    'bg-elevated text-primary border border-border hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-border',
  danger:
    'bg-danger text-white shadow-sm hover:opacity-90 focus-visible:ring-2 focus-visible:ring-danger/40',
  ghost: 'text-secondary hover:bg-accent-soft/60 hover:text-primary',
  link: 'text-accent hover:text-accent-hover underline-offset-4 hover:underline p-0 h-auto font-medium',
  inverse:
    'bg-black text-white border-0 shadow-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isLink = variant === 'link';

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-apple font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${isLink ? variantClasses.link : sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
