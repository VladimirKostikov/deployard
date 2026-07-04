import { useToastContext } from './toast-context';

export function useToast() {
  const { push, success, error, info } = useToastContext();
  return { push, success, error, info };
}
