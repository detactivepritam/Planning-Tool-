import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { updateTeamMember, deleteTeamMember } from '$lib/server/repositories/teamRepository.js';

export const PATCH: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const memberId = event.params.id;
  if (!memberId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing member ID' } }, { status: 400 });
  }

  try {
    const body = await event.request.json();
    const updated = await updateTeamMember(auth.user.organizationId, memberId, {
      displayName: body.displayName || body.name,
      email: body.email,
      teamId: body.teamId,
      active: body.active
    });

    if (!updated) {
      return json({ error: { code: 'NOT_FOUND', message: 'Team member not found' } }, { status: 404 });
    }

    return json({ member: updated });
  } catch (err: any) {
    console.error('Update member error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to update member' } }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const memberId = event.params.id;
  if (!memberId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing member ID' } }, { status: 400 });
  }

  try {
    const success = await deleteTeamMember(auth.user.organizationId, memberId);
    if (!success) {
      return json({ error: { code: 'NOT_FOUND', message: 'Team member not found' } }, { status: 404 });
    }

    return json({ success: true, message: 'Team member deactivated successfully' });
  } catch (err: any) {
    console.error('Delete member error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to deactivate member' } }, { status: 500 });
  }
};
