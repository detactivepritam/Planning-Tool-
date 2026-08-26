import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { rescheduleShift } from '$lib/server/repositories/shiftRepository.js';
import { validateShiftInput } from '$lib/server/validators/shiftValidator.js';

export const POST: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const shiftId = event.params.id;
  if (!shiftId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing shift ID' } }, { status: 400 });
  }

  try {
    const body = await event.request.json();
    const validation = validateShiftInput(body);
    if (!validation.valid) {
      return json({ error: { code: 'VALIDATION_ERROR', message: validation.error } }, { status: 400 });
    }

    const updated = await rescheduleShift(
      auth.user.organizationId,
      shiftId,
      body.shiftDate,
      body.startTime,
      body.endTime,
      body.teamId,
      body.teamMemberId
    );

    if (!updated) {
      return json({ error: { code: 'NOT_FOUND', message: 'Shift not found' } }, { status: 404 });
    }

    return json({ shift: updated });
  } catch (err: any) {
    console.error('Reschedule shift error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to reschedule shift' } }, { status: 500 });
  }
};
