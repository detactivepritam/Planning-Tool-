import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { listTeamMembers, createTeamMember } from '$lib/server/repositories/teamRepository.js';

export const GET: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const teamId = event.url.searchParams.get('teamId') || undefined;
  const activeParam = event.url.searchParams.get('active');
  const activeOnly = activeParam !== null ? activeParam === 'true' : true;

  const members = await listTeamMembers(auth.user.organizationId, teamId, activeOnly);
  return json({ members });
};

export const POST: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  try {
    const body = await event.request.json();
    const displayName = (body.displayName || body.name)?.toString().trim();

    if (!displayName) {
      return json({ error: { code: 'VALIDATION_ERROR', message: 'Display name is required' } }, { status: 400 });
    }

    const member = await createTeamMember(
      auth.user.organizationId,
      body.teamId || null,
      displayName,
      body.email || null,
      body.userId || null
    );

    return json({ member }, { status: 201 });
  } catch (err: any) {
    console.error('Create team member error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to create team member' } }, { status: 500 });
  }
};
