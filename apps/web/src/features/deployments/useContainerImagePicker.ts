import { useEffect, useMemo, useRef, useState } from 'react';
import { containerImageOptions, ContainerImageOption } from './container-image-options';

interface UseContainerImagePickerOptions {
  value: string;
  onChange: (value: string) => void;
  onOptionSelect?: (option: ContainerImageOption) => void;
}

export function useContainerImagePicker({
  value,
  onChange,
  onOptionSelect,
}: UseContainerImagePickerOptions) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [filterActive, setFilterActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery(value);
      setFilterActive(false);
    }
  }, [value, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!filterActive) {
      return containerImageOptions;
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return containerImageOptions;
    }

    return containerImageOptions.filter(
      (option) =>
        option.image.toLowerCase().includes(normalized) ||
        option.name.toLowerCase().includes(normalized) ||
        option.category.toLowerCase().includes(normalized) ||
        (option.keywords?.some((keyword) => keyword.toLowerCase().includes(normalized)) ?? false),
    );
  }, [filterActive, query]);

  const openPicker = () => {
    setFilterActive(false);
    setOpen(true);
  };

  const commitValue = (nextValue: string) => {
    setQuery(nextValue);
    onChange(nextValue);
  };

  const commitOption = (option: ContainerImageOption) => {
    commitValue(option.image);
    onOptionSelect?.(option);
    setFilterActive(false);
    setOpen(false);
  };

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    onChange(nextQuery);
    setFilterActive(true);
    setOpen(true);
  };

  return {
    rootRef,
    open,
    setOpen,
    query,
    filteredOptions,
    openPicker,
    updateQuery,
    commitOption,
  };
}
