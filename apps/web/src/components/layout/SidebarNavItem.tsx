import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useMobileNav } from './mobile-nav-context';

interface SidebarNavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

export function SidebarNavItem({ to, label, icon, end }: SidebarNavItemProps) {
  const { close } = useMobileNav();

  return (
    <NavLink
      to={to}
      end={end}
      onClick={close}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-apple border px-3 py-2.5 text-[14px] font-medium transition-colors ${
          isActive
            ? 'border-border bg-accent-soft text-primary'
            : 'border-transparent text-secondary hover:border-border hover:bg-accent-soft/60 hover:text-primary'
        }`
      }
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
