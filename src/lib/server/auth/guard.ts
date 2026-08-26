import { json, type RequestEvent } from '@sveltejs/kit';
import { getSessionFromCookies, validateSession, type AuthenticatedUser } from './session.js';

export async function requireAuth(event: RequestEvent): Promise<{ user: AuthenticatedUser } | Response> {
  const sessionId = getSessionFromCookies(event.cookies) || event.request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null;

  if (!sessionId) {
    return json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
  }

  const user = await validateSession(sessionId);
  if (!user) {
    return json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } }, { status: 401 });
  }

  return { user };
}
