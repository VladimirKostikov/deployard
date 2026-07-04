export type { ContainerImageOption } from './types';
export { applicationImageOptions } from './application.options';
export { databaseImageOptions } from './database.options';
export { devtoolsImageOptions } from './devtools.options';
export { frameworkImageOptions } from './framework.options';
export { mediaImageOptions } from './media.options';
export { messagingImageOptions } from './messaging.options';
export { mlImageOptions } from './ml.options';
export { observabilityImageOptions } from './observability.options';
export { runtimeImageOptions } from './runtime.options';
export { securityImageOptions } from './security.options';
export { storageImageOptions } from './storage.options';
export { webServerImageOptions } from './web-server.options';

import { applicationImageOptions } from './application.options';
import { databaseImageOptions } from './database.options';
import { devtoolsImageOptions } from './devtools.options';
import { frameworkImageOptions } from './framework.options';
import { mediaImageOptions } from './media.options';
import { messagingImageOptions } from './messaging.options';
import { mlImageOptions } from './ml.options';
import { observabilityImageOptions } from './observability.options';
import { runtimeImageOptions } from './runtime.options';
import { securityImageOptions } from './security.options';
import { storageImageOptions } from './storage.options';
import { webServerImageOptions } from './web-server.options';

const rawOptions = [
  ...webServerImageOptions,
  ...runtimeImageOptions,
  ...frameworkImageOptions,
  ...databaseImageOptions,
  ...observabilityImageOptions,
  ...messagingImageOptions,
  ...storageImageOptions,
  ...applicationImageOptions,
  ...devtoolsImageOptions,
  ...mlImageOptions,
  ...securityImageOptions,
  ...mediaImageOptions,
];

export const containerImageOptions = [...rawOptions].sort((left, right) =>
  left.image.localeCompare(right.image, undefined, { sensitivity: 'base' }),
);

export function iconUrl(slug: string): string {
  return `https://cdn.simpleicons.org/${slug}/6b7280`;
}
