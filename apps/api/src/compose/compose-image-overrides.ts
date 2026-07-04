import { readFileSync } from 'node:fs';
import { mergeLocalImageOverrides } from '@dpd/shared';
import { ComposeParserService } from './compose-parser.service';

export function resolveComposeImageOverrides(
  composePath: string,
  projectName: string,
  imageOverrides: Record<string, string> = {},
): Record<string, string> {
  const composeYaml = readFileSync(composePath, 'utf8');
  const parser = new ComposeParserService();
  const parsed = parser.parse(composeYaml, projectName);
  const buildServices = parsed.services
    .filter((service) => service.build)
    .map((service) => service.name);

  return mergeLocalImageOverrides(buildServices, imageOverrides, projectName);
}
