import { useCallback, useState } from 'react';
import { ALL_NAMESPACES } from '@dpd/shared';

const STORAGE_KEY = 'dpd-selected-namespace';
const DEFAULT_NAMESPACE = 'default';

export function readStoredNamespace(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)?.trim();
    if (stored) {
      return stored;
    }
  } catch {
    return DEFAULT_NAMESPACE;
  }

  return DEFAULT_NAMESPACE;
}

export function storeNamespace(namespace: string) {
  try {
    localStorage.setItem(STORAGE_KEY, namespace);
  } catch {
    return;
  }
}

export function isPersistedNamespace(value: string): boolean {
  return value === ALL_NAMESPACES || value.trim().length > 0;
}

export function usePersistedNamespace() {
  const [namespace, setNamespaceState] = useState(() => readStoredNamespace());

  const setNamespace = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!isPersistedNamespace(trimmed)) {
      return;
    }

    setNamespaceState(trimmed);
    storeNamespace(trimmed);
  }, []);

  return [namespace, setNamespace] as const;
}
