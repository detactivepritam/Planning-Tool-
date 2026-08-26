import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { updateEvent, deleteEvent } from '$lib/server/repositories/eventRepository.js';

export const PATCH: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const eventId = event.params.id;
  if (!eventId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing event ID' } }, { status: 400 });
  }

  try {
    const body = await event.request.json();
    const updated = await updateEvent(auth.user.organizationId, eventId, {
      title: body.title,
      eventDate: body.eventDate,
      startTime: body.startTime !== undefined ? body.startTime : body.start,
      endTime: body.endTime !== undefined ? body.endTime : body.end,
      description: body.description !== undefined ? body.description : body.notes
    });

    if (!updated) {
      return json({ error: { code: 'NOT_FOUND', message: 'Event not found' } }, { status: 404 });
    }

    return json({ event: updated });
  } catch (err: any) {
    console.error('Update event error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to update event' } }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const eventId = event.params.id;
  if (!eventId) {
    return json({ error: { code: 'INVALID_ID', message: 'Missing event ID' } }, { status: 400 });
  }

  try {
    const success = await deleteEvent(auth.user.organizationId, eventId);
    if (!success) {
      return json({ error: { code: 'NOT_FOUND', message: 'Event not found' } }, { status: 404 });
    }

    return json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    console.error('Delete event error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to delete event' } }, { status: 500 });
  }
};
