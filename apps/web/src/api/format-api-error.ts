import type { TFunction } from 'i18next';

export function formatApiError(error: unknown, t: TFunction, fallbackKey: string): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code);
    const translated = t(`errors:${code}`, { defaultValue: '' });
    if (translated) {
      return translated;
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message);
    if (message) {
      return message;
    }
  }

  return t(fallbackKey);
}
