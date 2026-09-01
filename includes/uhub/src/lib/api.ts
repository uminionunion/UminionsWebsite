const pantryApiBaseUrl = (window as Window & { PANTRY_API_BASE_URL?: string }).PANTRY_API_BASE_URL || '/pantry-api';

export function pantryApiUrl(path: string) {
  return `${pantryApiBaseUrl.replace(/\/$/, '')}${path}`;
}