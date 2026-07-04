import { ComposeK8sServicePlan } from '../../compose/compose-plan.types';

export function collectImportImages(
  services: ComposeK8sServicePlan[],
  imageOverrides: Record<string, string> = {},
): string[] {
  const images = new Set<string>();

  for (const service of services) {
    const override = imageOverrides[service.name]?.trim();
    images.add(override || service.image.trim());
  }

  return [...images].filter(Boolean);
}
