import { matchesServiceImage } from './compose-service-image';

type DockerRunner = (args: string[], cwd?: string) => string;

export function listProjectImages(
  runDocker: DockerRunner,
  composeFile: string,
  workdir: string,
  projectName: string,
): string[] {
  const images = new Set<string>();

  for (const image of readComposeImageList(runDocker, composeFile, workdir)) {
    images.add(image);
  }

  for (const image of readRunningProjectImages(runDocker, projectName)) {
    const resolved = resolveNamedImageTag(runDocker, image);
    if (resolved) {
      images.add(resolved);
    }
  }

  for (const image of readProjectPrefixedImages(runDocker, projectName)) {
    images.add(image);
  }

  return [...images];
}

export function findServiceBuiltImage(
  serviceName: string,
  builtImages: string[],
  projectName: string,
): string | undefined {
  const direct = builtImages.find((image) => matchesServiceImage(serviceName, image));
  if (direct) {
    return direct;
  }

  const prefix = `${projectName}-${serviceName}:`;
  return builtImages.find((image) => image.toLowerCase().startsWith(prefix.toLowerCase()));
}

function readComposeImageList(
  runDocker: DockerRunner,
  composeFile: string,
  workdir: string,
): string[] {
  try {
    const output = runDocker(
      ['compose', '-f', composeFile, 'images', '--format', 'json'],
      workdir,
    );

    const images = new Set<string>();

    for (const line of output.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      try {
        const entry = JSON.parse(trimmed) as { Repository?: string; Tag?: string };
        if (entry.Repository && entry.Tag && entry.Tag !== '<none>') {
          images.add(`${entry.Repository}:${entry.Tag}`);
        }
      } catch {
        continue;
      }
    }

    return [...images];
  } catch {
    return [];
  }
}

function readRunningProjectImages(runDocker: DockerRunner, projectName: string): string[] {
  try {
    const output = runDocker([
      'ps',
      '-a',
      '--filter',
      `label=com.docker.compose.project=${projectName}`,
      '--format',
      '{{.Image}}',
    ]);

    return [...new Set(
      output
        .split('\n')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
    )];
  } catch {
    return [];
  }
}

function resolveNamedImageTag(runDocker: DockerRunner, imageRef: string): string | null {
  if (imageRef.includes(':') && !isBareImageId(imageRef)) {
    return imageRef;
  }

  try {
    const tag = runDocker(['image', 'inspect', imageRef, '--format', '{{index .RepoTags 0}}']).trim();
    return tag.length > 0 ? tag : null;
  } catch {
    return null;
  }
}

function isBareImageId(imageRef: string): boolean {
  const value = imageRef.includes(':') ? imageRef.split(':')[0] : imageRef;
  return /^[a-f0-9]{12,64}$/i.test(value);
}

function readProjectPrefixedImages(runDocker: DockerRunner, projectName: string): string[] {
  try {
    const output = runDocker(['images', '--format', '{{.Repository}}:{{.Tag}}']);
    const prefix = `${projectName}-`.toLowerCase();

    return [...new Set(
      output
        .split('\n')
        .map((entry) => entry.trim())
        .filter((entry) => {
          if (!entry || entry.endsWith(':<none>')) {
            return false;
          }

          const repository = entry.slice(0, entry.lastIndexOf(':')).toLowerCase();
          return repository.startsWith(prefix);
        }),
    )];
  } catch {
    return [];
  }
}
