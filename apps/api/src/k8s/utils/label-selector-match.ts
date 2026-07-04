export function labelsMatchSelector(
  labels: Record<string, string> | undefined,
  selector: Record<string, string> | undefined,
): boolean {
  if (!selector || Object.keys(selector).length === 0) {
    return false;
  }

  if (!labels) {
    return false;
  }

  return Object.entries(selector).every(([key, value]) => labels[key] === value);
}
