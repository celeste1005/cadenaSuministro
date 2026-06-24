export const AUTH_COOKIE_NAME = 'access_token';

export function getApiBaseUrl(): string {
  // Prioridad: API_URL (sirve para Docker), NEXT_PUBLIC_API_URL, fallback localhost
  const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  return baseUrl;
}
