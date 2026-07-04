export function isBrowserAccessibleServicePort(servicePort: number): boolean {
  return servicePort === 80 || servicePort === 8080 || servicePort === 3000;
}

export function isWebFrontendServicePort(servicePort: number): boolean {
  return servicePort === 80 || servicePort === 8080;
}
