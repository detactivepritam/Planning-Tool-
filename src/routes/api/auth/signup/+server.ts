import { json, type RequestHandler } from '@sveltejs/kit';
import { hashPassword } from '$lib/server/auth/password.js';
import { createSession, setSessionCookie } from '$lib/server/auth/session.js';
import { getUserByEmail, createUserWithOrganization } from '$lib/server/repositories/userRepository.js';
import { validateSignupInput } from '$lib/server/validators/authValidator.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validation = validateSignupInput(body);

    if (!validation.valid) {
      return json({ error: { code: 'VALIDATION_ERROR', message: validation.error } }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const existing = await getUserByEmail(email);
    if (existing) {
      return json({ error: { code: 'USER_EXISTS', message: 'An account with this email already exists.' } }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    const fullName = (body.fullName || body.memberName || body.name || 'Planner').trim();
    const companyName = (body.company || body.companyName || `${fullName}'s Workspace`).trim();

    const { user, organization } = await createUserWithOrganization(
      {
        email,
        passwordHash,
        fullName,
        phone: body.phone || null,
        role: 'manager'
      },
      companyName
    );

    const { sessionId, expiresAt } = await createSession(user.id);
    setSessionCookie(cookies, sessionId, expiresAt);

    return json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          organizationId: organization.id,
          organizationName: organization.name
        },
        sessionId
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Signup error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'An error occurred while creating your account.' } }, { status: 500 });
  }
};
