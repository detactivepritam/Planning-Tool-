import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { updateTeam, deleteTeam } from '$lib/server/repositories/teamRepository.js';

export const PATCH: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const teamId = event.params.id;
  if (!teamId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing team ID' } }, { status: 400 });
  }

  try {
    const body = await event.request.json();
    const updated = await updateTeam(auth.user.organizationId, teamId, {
      name: body.name,
      description: body.description,
      color: body.color
    });

    if (!updated) {
      return json({ error: { code: 'NOT_FOUND', message: 'Team not found' } }, { status: 404 });
    }

    return json({ team: updated });
  } catch (err: any) {
    console.error('Update team error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to update team' } }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const teamId = event.params.id;
  if (!teamId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing team ID' } }, { status: 400 });
  }

  try {
    const success = await deleteTeam(auth.user.organizationId, teamId);
    if (!success) {
      return json({ error: { code: 'NOT_FOUND', message: 'Team not found' } }, { status: 404 });
    }

    return json({ success: true, message: 'Team deleted successfully' });
  } catch (err: any) {
    console.error('Delete team error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to delete team' } }, { status: 500 });
  }
};
