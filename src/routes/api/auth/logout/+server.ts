import { json, type RequestHandler } from '@sveltejs/kit';
import { deleteSession, deleteSessionCookie, getSessionFromCookies } from '$lib/server/auth/session.js';

export const POST: RequestHandler = async ({ cookies, request }) => {
  try {
    const sessionId = getSessionFromCookies(cookies) || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (sessionId) {
      await deleteSession(sessionId);
    }
    deleteSessionCookie(cookies);

    return json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    deleteSessionCookie(cookies);
    return json({ success: true });
  }
};
