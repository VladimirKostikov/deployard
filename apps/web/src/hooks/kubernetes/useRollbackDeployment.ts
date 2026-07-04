import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { useAppMutation } from '../../hooks/use-app-mutation';

interface RollbackToastMessages {
  success: string;
  error: string;
}

export function useRollbackDeployment(
  namespace: string,
  name: string,
  messages?: RollbackToastMessages,
) {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (revision: number) => api.rollbackDeployment(namespace, name, revision),
    successMessage: messages?.success,
    errorMessage: messages?.error,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      void queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name] });
      void queryClient.invalidateQueries({ queryKey: ['deployments', namespace, name, 'history'] });
      void queryClient.invalidateQueries({ queryKey: ['pods', namespace, name] });
    },
  });
}
