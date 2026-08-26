import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { setShiftPublishState } from '$lib/server/repositories/shiftRepository.js';

export const POST: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const shiftId = event.params.id;
  if (!shiftId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing shift ID' } }, { status: 400 });
  }

  try {
    const updated = await setShiftPublishState(auth.user.organizationId, shiftId, false);
    if (!updated) {
      return json({ error: { code: 'NOT_FOUND', message: 'Shift not found' } }, { status: 404 });
    }

    return json({ shift: updated });
  } catch (err: any) {
    console.error('Unpublish shift error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to unpublish shift' } }, { status: 500 });
  }
};
