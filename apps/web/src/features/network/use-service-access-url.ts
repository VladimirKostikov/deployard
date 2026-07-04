import { useQuery } from '@tanstack/react-query';
import type { ServiceSummary } from '@dpd/shared';
import { api } from '../../api';
import { resolveServiceAccess } from './resolve-service-access';

export function useServiceAccessUrl(service: ServiceSummary) {
  const access = resolveServiceAccess(service);

  return useQuery({
    queryKey: ['network', 'access', service.namespace, service.name, access?.servicePort],
    queryFn: () =>
      api.prepareServiceAccess({
        namespace: service.namespace,
        serviceName: service.name,
        servicePort: access!.servicePort,
      }),
    enabled: Boolean(access),
    staleTime: 30_000,
    retry: false,
  });
}
