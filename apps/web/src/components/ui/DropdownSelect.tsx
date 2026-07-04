import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDownIcon } from '../icons/ThemeIcons';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
}

interface DropdownSelectProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  fullWidth?: boolean;
  placement?: 'bottom' | 'top';
  scrollable?: boolean;
}

const panelPlacementClasses = {
  bottom: 'top-full mt-1.5',
  top: 'bottom-full mb-1.5',
};

export function DropdownSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  fullWidth = false,
  placement = 'bottom',
  scrollable = false,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`field-control inline-flex h-9 items-center gap-2 rounded-apple border border-border bg-elevated px-3 text-sm text-primary shadow-sm transition-colors hover:bg-canvas ${
          fullWidth ? 'w-full justify-between' : ''
        } ${open ? 'border-accent ring-2 ring-accent/15' : ''}`}
      >
        <span className="inline-flex items-center gap-2">
          {activeOption.icon}
          <span className="font-medium">{activeOption.label}</span>
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 overflow-hidden rounded-apple border border-border bg-elevated py-1 shadow-md ${panelPlacementClasses[placement]} ${
            scrollable ? 'max-h-60 overflow-y-auto' : ''
          } ${fullWidth ? 'left-0 right-0' : 'right-0 min-w-[10rem]'}`}
        >
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-canvas font-medium text-primary'
                      : 'text-secondary hover:bg-canvas hover:text-primary'
                  }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
