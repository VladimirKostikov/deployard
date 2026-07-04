import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`field-control h-10 w-full rounded-apple border border-border bg-elevated px-3 text-sm text-primary shadow-sm transition-colors placeholder:text-secondary/70 hover:bg-canvas disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
