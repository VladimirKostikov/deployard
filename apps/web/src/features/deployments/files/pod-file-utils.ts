export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function downloadPodFile(url: string, fileName: string) {
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parentPodPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return parts.length ? `/${parts.join('/')}` : '/';
}

export function splitPodPath(path: string): string[] {
  if (path === '/') {
    return ['/'];
  }

  const parts = path.split('/').filter(Boolean);
  return parts.map((_, index) => `/${parts.slice(0, index + 1).join('/')}`);
}
