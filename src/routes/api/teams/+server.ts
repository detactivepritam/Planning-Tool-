import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { listTeams, createTeam } from '$lib/server/repositories/teamRepository.js';

export const GET: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const teams = await listTeams(auth.user.organizationId);
  return json({ teams });
};

export const POST: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  try {
    const body = await event.request.json();
    if (!body.name || !body.name.trim()) {
      return json({ error: { code: 'VALIDATION_ERROR', message: 'Team name is required' } }, { status: 400 });
    }

    const team = await createTeam(
      auth.user.organizationId,
      body.name.trim(),
      body.description,
      body.color
    );

    return json({ team }, { status: 201 });
  } catch (err: any) {
    console.error('Create team error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to create team' } }, { status: 500 });
  }
};
