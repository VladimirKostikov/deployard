export type ToastVariant = 'success' | 'error' | 'info';

export type ToastPhase = 'enter' | 'visible' | 'leave';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

export interface ToastInput {
  variant: ToastVariant;
  message: string;
}
