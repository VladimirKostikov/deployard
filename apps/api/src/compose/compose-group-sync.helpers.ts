import { composeServiceNameFromResourceName } from '@dpd/shared';
import { matchesServiceImage } from './compose-service-image';

export function resolveImagesToLoad(
  builtImages: string[],
  taggedImages: string[],
  buildServiceNames: string[],
): string[] {
  const tagged = [...new Set(taggedImages.map((image) => image.trim()).filter(Boolean))];
  if (tagged.length > 0) {
    return tagged;
  }

  if (buildServiceNames.length === 0) {
    return [];
  }

  return [...new Set(builtImages.filter((image) =>
    buildServiceNames.some((serviceName) => matchesServiceImage(serviceName, image)),
  ))];
}

export function isBuildDeployment(
  deploymentName: string,
  partOf: string,
  buildServiceNames: string[],
): boolean {
  if (buildServiceNames.length === 0) {
    return false;
  }

  const serviceName = composeServiceNameFromResourceName(partOf, deploymentName);
  return buildServiceNames.includes(serviceName);
}
