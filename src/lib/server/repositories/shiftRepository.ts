import { query } from '../db/index.js';

export interface ShiftRecord {
  id: string;
  organization_id: string;
  team_id: string | null;
  team_member_id: string | null;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  shift_type: string;
  note: string | null;
  status: string;
  is_open: boolean;
  recurring_group_id: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  team_name?: string;
  member_name?: string;
}

export interface CreateShiftInput {
  teamId?: string | null;
  teamMemberId?: string | null;
  shiftDate: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
  breakMinutes?: number;
  shiftType?: string;
  note?: string;
  status?: string;
  isOpen?: boolean;
  createdBy?: string;
}

export interface ShiftFilter {
  from?: string;
  to?: string;
  teamId?: string;
  teamMemberId?: string;
  status?: string;
}

export async function listShifts(organizationId: string, filter: ShiftFilter = {}): Promise<ShiftRecord[]> {
  const conditions = [`s.organization_id = $1`];
  const params: any[] = [organizationId];

  if (filter.from) {
    params.push(filter.from);
    conditions.push(`s.shift_date >= $${params.length}`);
  }
  if (filter.to) {
    params.push(filter.to);
    conditions.push(`s.shift_date <= $${params.length}`);
  }
  if (filter.teamId) {
    params.push(filter.teamId);
    conditions.push(`s.team_id = $${params.length}`);
  }
  if (filter.teamMemberId) {
    params.push(filter.teamMemberId);
    conditions.push(`s.team_member_id = $${params.length}`);
  }
  if (filter.status) {
    params.push(filter.status);
    conditions.push(`s.status = $${params.length}`);
  }

  const result = await query<ShiftRecord>(
    `SELECT 
       s.*,
       t.name as team_name,
       tm.display_name as member_name
     FROM shifts s
     LEFT JOIN teams t ON t.id = s.team_id
     LEFT JOIN team_members tm ON tm.id = s.team_member_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY s.shift_date ASC, s.start_time ASC`,
    params
  );
  return result.rows;
}

export async function getShiftById(organizationId: string, shiftId: string): Promise<ShiftRecord | null> {
  const result = await query<ShiftRecord>(
    `SELECT 
       s.*,
       t.name as team_name,
       tm.display_name as member_name
     FROM shifts s
     LEFT JOIN teams t ON t.id = s.team_id
     LEFT JOIN team_members tm ON tm.id = s.team_member_id
     WHERE s.organization_id = $1 AND s.id = $2
     LIMIT 1`,
    [organizationId, shiftId]
  );
  return result.rows[0] || null;
}

export async function createShift(organizationId: string, input: CreateShiftInput): Promise<ShiftRecord> {
  const result = await query<ShiftRecord>(
    `INSERT INTO shifts (
       organization_id,
       team_id,
       team_member_id,
       shift_date,
       start_time,
       end_time,
       break_minutes,
       shift_type,
       note,
       status,
       is_open,
       created_by
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      organizationId,
      input.teamId || null,
      input.teamMemberId || null,
      input.shiftDate,
      input.startTime,
      input.endTime,
      input.breakMinutes ?? 0,
      input.shiftType || 'Standard',
      input.note || null,
      input.status || (input.isOpen ? 'open' : 'draft'),
      Boolean(input.isOpen),
      input.createdBy || null
    ]
  );
  return result.rows[0];
}

export async function updateShift(
  organizationId: string,
  shiftId: string,
  updates: Partial<CreateShiftInput>
): Promise<ShiftRecord | null> {
  const fields: string[] = [];
  const values: any[] = [organizationId, shiftId];
  let idx = 3;

  if (updates.teamId !== undefined) {
    fields.push(`team_id = $${idx++}`);
    values.push(updates.teamId);
  }
  if (updates.teamMemberId !== undefined) {
    fields.push(`team_member_id = $${idx++}`);
    values.push(updates.teamMemberId);
  }
  if (updates.shiftDate !== undefined) {
    fields.push(`shift_date = $${idx++}`);
    values.push(updates.shiftDate);
  }
  if (updates.startTime !== undefined) {
    fields.push(`start_time = $${idx++}`);
    values.push(updates.startTime);
  }
  if (updates.endTime !== undefined) {
    fields.push(`end_time = $${idx++}`);
    values.push(updates.endTime);
  }
  if (updates.breakMinutes !== undefined) {
    fields.push(`break_minutes = $${idx++}`);
    values.push(updates.breakMinutes);
  }
  if (updates.shiftType !== undefined) {
    fields.push(`shift_type = $${idx++}`);
    values.push(updates.shiftType);
  }
  if (updates.note !== undefined) {
    fields.push(`note = $${idx++}`);
    values.push(updates.note);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(updates.status);
  }
  if (updates.isOpen !== undefined) {
    fields.push(`is_open = $${idx++}`);
    values.push(updates.isOpen);
  }

  if (fields.length === 0) {
    return getShiftById(organizationId, shiftId);
  }

  fields.push(`updated_at = NOW()`);

  const result = await query<ShiftRecord>(
    `UPDATE shifts
     SET ${fields.join(', ')}
     WHERE organization_id = $1 AND id = $2
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function rescheduleShift(
  organizationId: string,
  shiftId: string,
  shiftDate: string,
  startTime: string,
  endTime: string,
  teamId?: string | null,
  teamMemberId?: string | null
): Promise<ShiftRecord | null> {
  const fields = [
    `shift_date = $3`,
    `start_time = $4`,
    `end_time = $5`,
    `updated_at = NOW()`
  ];
  const values: any[] = [organizationId, shiftId, shiftDate, startTime, endTime];
  let idx = 6;

  if (teamId !== undefined) {
    fields.push(`team_id = $${idx++}`);
    values.push(teamId);
  }
  if (teamMemberId !== undefined) {
    fields.push(`team_member_id = $${idx++}`);
    values.push(teamMemberId);
  }

  const result = await query<ShiftRecord>(
    `UPDATE shifts
     SET ${fields.join(', ')}
     WHERE organization_id = $1 AND id = $2
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteShift(organizationId: string, shiftId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM shifts WHERE organization_id = $1 AND id = $2`,
    [organizationId, shiftId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function setShiftPublishState(
  organizationId: string,
  shiftId: string,
  published: boolean
): Promise<ShiftRecord | null> {
  const status = published ? 'published' : 'draft';
  const result = await query<ShiftRecord>(
    `UPDATE shifts
     SET status = $3, updated_at = NOW()
     WHERE organization_id = $1 AND id = $2
     RETURNING *`,
    [organizationId, shiftId, status]
  );
  return result.rows[0] || null;
}
