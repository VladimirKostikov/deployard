import { BadRequestException } from '@nestjs/common';
import { defaultLocalImageTag, mergeLocalImageOverrides } from '@dpd/shared';
import { ComposeBuildService } from '../../compose/compose-build.service';
import { ComposeParserService } from '../../compose/compose-parser.service';

export { defaultLocalImageTag, mergeLocalImageOverrides };

export function resolveBuildServices(composeYaml: string, projectName?: string): string[] {
  const parser = new ComposeParserService();
  const parsed = parser.parse(composeYaml, projectName);

  return parsed.services.filter((service) => service.build).map((service) => service.name);
}

export function ensureLocalProjectImages(
  composeBuildService: ComposeBuildService,
  projectId: string,
  composeYaml: string,
  projectName: string,
  imageOverrides: Record<string, string> = {},
): Record<string, string> {
  const buildServices = resolveBuildServices(composeYaml, projectName);
  if (!buildServices.length) {
    return imageOverrides;
  }

  const merged = mergeLocalImageOverrides(buildServices, imageOverrides, projectName);

  try {
    const result = composeBuildService.buildProject(projectId, merged);
    if (result.taggedImages.length === 0 && Object.keys(merged).length > 0) {
      throw new Error('Compose build finished but no images were tagged for import');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Compose build failed';
    throw new BadRequestException(message);
  }

  return merged;
}
