import { useState } from 'react';
import { ContainerImageOption, iconUrl } from './container-image-options';

interface ContainerImageOptionButtonProps {
  option: ContainerImageOption;
  onSelect: (option: ContainerImageOption) => void;
}

function OptionIcon({ slug, label }: { slug: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const letter = label.trim().charAt(0).toUpperCase() || '?';

  if (failed) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-canvas text-[10px] font-semibold text-secondary">
        {letter}
      </span>
    );
  }

  return (
    <img
      src={iconUrl(slug)}
      alt=""
      className="h-7 w-7 shrink-0 bg-canvas p-1"
      onError={() => setFailed(true)}
    />
  );
}

export function ContainerImageOptionButton({ option, onSelect }: ContainerImageOptionButtonProps) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onSelect(option)}
        className="flex h-full w-full min-w-0 items-start gap-2 px-2 py-2 text-left transition-colors hover:bg-canvas"
      >
        <OptionIcon slug={option.icon} label={option.name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-primary">{option.image}</span>
          <span className="block truncate text-[11px] text-secondary">
            {option.name}
            {option.defaultPort ? ` · :${option.defaultPort}` : ''}
          </span>
        </span>
      </button>
    </li>
  );
}
