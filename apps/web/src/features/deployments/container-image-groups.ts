import { ContainerImageOption, containerImageOptions } from './container-image-options';

export function groupImageOptions(options: ContainerImageOption[]): Array<[string, ContainerImageOption[]]> {
  const groups = new Map<string, ContainerImageOption[]>();

  for (const option of options) {
    const items = groups.get(option.category) ?? [];
    items.push(option);
    groups.set(option.category, items);
  }

  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
}

export function findImageOption(image: string): ContainerImageOption | undefined {
  return containerImageOptions.find((option) => option.image === image);
}
