import type { CoreV1Api, V1Service } from '@kubernetes/client-node';

const SERVICE_LIST_PAGE_SIZE = 200;

export async function listAllServices(core: CoreV1Api): Promise<V1Service[]> {
  const items: V1Service[] = [];
  let continueToken: string | undefined;

  do {
    const response = await core.listServiceForAllNamespaces({
      limit: SERVICE_LIST_PAGE_SIZE,
      _continue: continueToken,
    });

    items.push(...(response.items ?? []));
    continueToken = response.metadata?._continue;
  } while (continueToken);

  return items;
}
