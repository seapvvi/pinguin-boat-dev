/**
 * Session cookie naming and attributes.
 *
 * In production the cookie is `__Host-session`, which browsers only accept when
 * it is Secure, Path=/ and has no Domain attribute — that blocks a sibling
 * subdomain from planting a session cookie. In development the plain `session`
 * name keeps local http origins working.
 */
export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-session' : 'session';

export const SESSION_COOKIE_PATH = '/';

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    path: SESSION_COOKIE_PATH,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: maxAgeSeconds,
  };
}