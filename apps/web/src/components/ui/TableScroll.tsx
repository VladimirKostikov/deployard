import type { ReactNode } from 'react';

interface TableScrollProps {
  children: ReactNode;
  className?: string;
}

export function TableScroll({ children, className = '' }: TableScrollProps) {
  return (
    <div className={`table-scroll overflow-x-auto ${className}`.trim()}>{children}</div>
  );
}
