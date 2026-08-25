const apiBaseUrl = (window as Window & { PANTRY_API_BASE_URL?: string }).PANTRY_API_BASE_URL || '';

export function pantryApiUrl(path: string) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
}
