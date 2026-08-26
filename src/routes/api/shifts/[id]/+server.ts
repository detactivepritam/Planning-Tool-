import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { updateShift, deleteShift } from '$lib/server/repositories/shiftRepository.js';

export const PATCH: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const shiftId = event.params.id;
  if (!shiftId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing shift ID' } }, { status: 400 });
  }

  try {
    const body = await event.request.json();
    const updated = await updateShift(auth.user.organizationId, shiftId, {
      teamId: body.teamId,
      teamMemberId: body.teamMemberId,
      shiftDate: body.shiftDate,
      startTime: body.startTime,
      endTime: body.endTime,
      breakMinutes: body.breakMinutes,
      shiftType: body.shiftType || body.type,
      note: body.note || body.notes,
      status: body.status,
      isOpen: body.isOpen !== undefined ? body.isOpen : body.openShift
    });

    if (!updated) {
      return json({ error: { code: 'NOT_FOUND', message: 'Shift not found' } }, { status: 404 });
    }

    return json({ shift: updated });
  } catch (err: any) {
    console.error('Update shift error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to update shift' } }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const shiftId = event.params.id;
  if (!shiftId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing shift ID' } }, { status: 400 });
  }

  try {
    const success = await deleteShift(auth.user.organizationId, shiftId);
    if (!success) {
      return json({ error: { code: 'NOT_FOUND', message: 'Shift not found' } }, { status: 404 });
    }

    return json({ success: true, message: 'Shift deleted successfully' });
  } catch (err: any) {
    console.error('Delete shift error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to delete shift' } }, { status: 500 });
  }
};
