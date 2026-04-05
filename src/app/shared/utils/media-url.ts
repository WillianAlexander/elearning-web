export function getMediaUrl(storageKey: string, baseUrl?: string): string {
  const base = baseUrl ?? '';
  return `${base}/${storageKey}`;
}
