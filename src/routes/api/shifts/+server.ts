import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { listShifts, createShift } from '$lib/server/repositories/shiftRepository.js';
import { validateShiftInput } from '$lib/server/validators/shiftValidator.js';

export const GET: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const url = event.url;
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;
  const teamId = url.searchParams.get('teamId') || undefined;
  const teamMemberId = url.searchParams.get('teamMemberId') || undefined;
  const status = url.searchParams.get('status') || undefined;

  const shifts = await listShifts(auth.user.organizationId, {
    from,
    to,
    teamId,
    teamMemberId,
    status
  });

  return json({ shifts });
};

export const POST: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  try {
    const body = await event.request.json();
    const validation = validateShiftInput(body);

    if (!validation.valid) {
      return json({ error: { code: 'VALIDATION_ERROR', message: validation.error } }, { status: 400 });
    }

    const shift = await createShift(auth.user.organizationId, {
      teamId: body.teamId,
      teamMemberId: body.teamMemberId,
      shiftDate: body.shiftDate,
      startTime: body.startTime,
      endTime: body.endTime,
      breakMinutes: body.breakMinutes,
      shiftType: body.shiftType || body.type,
      note: body.note || body.notes,
      status: body.status,
      isOpen: body.isOpen || body.openShift,
      createdBy: auth.user.id
    });

    return json({ shift }, { status: 201 });
  } catch (err: any) {
    console.error('Create shift error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to create shift' } }, { status: 500 });
  }
};
