import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { listEvents, createEvent } from '$lib/server/repositories/eventRepository.js';

export const GET: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const url = event.url;
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;

  const events = await listEvents(auth.user.organizationId, from, to);
  return json({ events });
};

export const POST: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  try {
    const body = await event.request.json();
    if (!body.title || !body.title.trim()) {
      return json({ error: { code: 'VALIDATION_ERROR', message: 'Event title is required' } }, { status: 400 });
    }
    if (!body.eventDate) {
      return json({ error: { code: 'VALIDATION_ERROR', message: 'Event date is required' } }, { status: 400 });
    }

    const created = await createEvent(auth.user.organizationId, {
      title: body.title.trim(),
      eventDate: body.eventDate,
      startTime: body.startTime || body.start || null,
      endTime: body.endTime || body.end || null,
      description: body.description || body.notes || null,
      createdBy: auth.user.id
    });

    return json({ event: created }, { status: 201 });
  } catch (err: any) {
    console.error('Create event error:', err);
    return json({ error: { code: 'SERVER_ERROR', message: 'Failed to create event' } }, { status: 500 });
  }
};
