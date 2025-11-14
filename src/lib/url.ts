const envShareBase =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_PUBLIC_SHARE_BASE_URL) ||
  '';

const normalizedEnvShareBase = envShareBase ? envShareBase.trim().replace(/\/+$/, '') : '';

const normalizePath = (path: string): string => {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
};

export function getShareBaseUrl(): string {
  if (normalizedEnvShareBase) {
    return normalizedEnvShareBase;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return '';
}

export function buildShareUrl(path: string): string {
  const base = getShareBaseUrl();
  const normalizedPath = normalizePath(path);
  if (!base) {
    return normalizedPath;
  }
  return `${base}${normalizedPath}`;
}
