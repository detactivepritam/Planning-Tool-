import { query } from '../db/index.js';

export interface EventRecord {
  id: string;
  organization_id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEventInput {
  title: string;
  eventDate: string; // 'YYYY-MM-DD'
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
  createdBy?: string | null;
}

export async function listEvents(
  organizationId: string,
  from?: string,
  to?: string
): Promise<EventRecord[]> {
  const conditions = [`organization_id = $1`];
  const params: any[] = [organizationId];

  if (from) {
    params.push(from);
    conditions.push(`event_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`event_date <= $${params.length}`);
  }

  const result = await query<EventRecord>(
    `SELECT * FROM events
     WHERE ${conditions.join(' AND ')}
     ORDER BY event_date ASC, start_time ASC`,
    params
  );
  return result.rows;
}

export async function getEventById(
  organizationId: string,
  eventId: string
): Promise<EventRecord | null> {
  const result = await query<EventRecord>(
    `SELECT * FROM events WHERE organization_id = $1 AND id = $2 LIMIT 1`,
    [organizationId, eventId]
  );
  return result.rows[0] || null;
}

export async function createEvent(
  organizationId: string,
  input: CreateEventInput
): Promise<EventRecord> {
  const result = await query<EventRecord>(
    `INSERT INTO events (
       organization_id,
       title,
       event_date,
       start_time,
       end_time,
       description,
       created_by
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      organizationId,
      input.title,
      input.eventDate,
      input.startTime || null,
      input.endTime || null,
      input.description || null,
      input.createdBy || null
    ]
  );
  return result.rows[0];
}

export async function updateEvent(
  organizationId: string,
  eventId: string,
  updates: Partial<CreateEventInput>
): Promise<EventRecord | null> {
  const fields: string[] = [];
  const values: any[] = [organizationId, eventId];
  let idx = 3;

  if (updates.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(updates.title);
  }
  if (updates.eventDate !== undefined) {
    fields.push(`event_date = $${idx++}`);
    values.push(updates.eventDate);
  }
  if (updates.startTime !== undefined) {
    fields.push(`start_time = $${idx++}`);
    values.push(updates.startTime);
  }
  if (updates.endTime !== undefined) {
    fields.push(`end_time = $${idx++}`);
    values.push(updates.endTime);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(updates.description);
  }

  if (fields.length === 0) {
    return getEventById(organizationId, eventId);
  }

  fields.push(`updated_at = NOW()`);

  const result = await query<EventRecord>(
    `UPDATE events
     SET ${fields.join(', ')}
     WHERE organization_id = $1 AND id = $2
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteEvent(organizationId: string, eventId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM events WHERE organization_id = $1 AND id = $2`,
    [organizationId, eventId]
  );
  return (result.rowCount ?? 0) > 0;
}
