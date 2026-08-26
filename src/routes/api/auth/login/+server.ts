import { json, type RequestHandler } from '@sveltejs/kit';
import { verifyPassword } from '$lib/server/auth/password.js';
import { createSession, setSessionCookie } from '$lib/server/auth/session.js';
import { getUserByEmail, getUserOrganizations } from '$lib/server/repositories/userRepository.js';
import { validateLoginInput } from '$lib/server/validators/authValidator.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validation = validateLoginInput(body);

    if (!validation.valid) {
      return json({ error: { code: 'VALIDATION_ERROR', message: validation.error } }, { status: 400 });
    }

    const identity = (body.email || body.identity).trim().toLowerCase();
    const user = await getUserByEmail(identity);

    if (!user) {
      return json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }, { status: 401 });
    }

    const passwordMatch = await verifyPassword(body.password, user.password_hash);
    if (!passwordMatch) {
      return json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }, { status: 401 });
    }

    const organizations = await getUserOrganizations(user.id);
    const primaryOrg = organizations[0] || null;

    const { sessionId, expiresAt } = await createSession(user.id);
    setSessionCookie(cookies, sessionId, expiresAt);

    return json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        organizationId: primaryOrg?.id || null,
        organizationName: primaryOrg?.name || null
      },
      sessionId
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'An error occurred while logging in.' } }, { status: 500 });
  }
};
