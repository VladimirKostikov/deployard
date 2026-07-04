import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '../components/ui/toast/use-toast';

type AppMutationOptions<TData, TError, TVariables, TContext> = UseMutationOptions<
  TData,
  TError,
  TVariables,
  TContext
> & {
  successMessage?: string;
  errorMessage?: string;
};

export function useAppMutation<
  TData = unknown,
  TError = { message?: string },
  TVariables = void,
  TContext = unknown,
>(options: AppMutationOptions<TData, TError, TVariables, TContext>) {
  const toast = useToast();
  const { successMessage, errorMessage, onSuccess, onError, ...rest } = options;

  return useMutation({
    ...rest,
    onSuccess: (data, variables, context, mutation) => {
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      const message =
        (error as { message?: string } | undefined)?.message?.trim() || errorMessage;
      if (message) {
        toast.error(message);
      }
      onError?.(error, variables, context, mutation);
    },
  });
}
