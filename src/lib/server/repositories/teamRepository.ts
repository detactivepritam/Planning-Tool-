import { query } from '../db/index.js';

export interface TeamRecord {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TeamMemberRecord {
  id: string;
  organization_id: string;
  team_id: string | null;
  user_id: string | null;
  display_name: string;
  email: string | null;
  active: boolean;
  team_name?: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function listTeams(organizationId: string): Promise<TeamRecord[]> {
  const result = await query<TeamRecord>(
    `SELECT * FROM teams WHERE organization_id = $1 ORDER BY name ASC`,
    [organizationId]
  );
  return result.rows;
}

export async function createTeam(
  organizationId: string,
  name: string,
  description?: string,
  color?: string
): Promise<TeamRecord> {
  const result = await query<TeamRecord>(
    `INSERT INTO teams (organization_id, name, description, color)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [organizationId, name, description || null, color || '#1D7CF2']
  );
  return result.rows[0];
}

export async function updateTeam(
  organizationId: string,
  teamId: string,
  updates: { name?: string; description?: string; color?: string }
): Promise<TeamRecord | null> {
  const fields: string[] = [];
  const values: any[] = [organizationId, teamId];
  let idx = 3;

  if (updates.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(updates.description);
  }
  if (updates.color !== undefined) {
    fields.push(`color = $${idx++}`);
    values.push(updates.color);
  }

  if (fields.length === 0) {
    const res = await query<TeamRecord>(
      `SELECT * FROM teams WHERE organization_id = $1 AND id = $2`,
      [organizationId, teamId]
    );
    return res.rows[0] || null;
  }

  fields.push(`updated_at = NOW()`);

  const result = await query<TeamRecord>(
    `UPDATE teams 
     SET ${fields.join(', ')} 
     WHERE organization_id = $1 AND id = $2 
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteTeam(organizationId: string, teamId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM teams WHERE organization_id = $1 AND id = $2`,
    [organizationId, teamId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function listTeamMembers(
  organizationId: string,
  teamId?: string,
  activeOnly = true
): Promise<TeamMemberRecord[]> {
  const conditions = [`tm.organization_id = $1`];
  const params: any[] = [organizationId];

  if (teamId) {
    params.push(teamId);
    conditions.push(`tm.team_id = $${params.length}`);
  }

  if (activeOnly) {
    conditions.push(`tm.active = TRUE`);
  }

  const result = await query<TeamMemberRecord>(
    `SELECT tm.*, t.name as team_name
     FROM team_members tm
     LEFT JOIN teams t ON t.id = tm.team_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY tm.display_name ASC`,
    params
  );
  return result.rows;
}

export async function createTeamMember(
  organizationId: string,
  teamId: string | null,
  displayName: string,
  email?: string,
  userId?: string
): Promise<TeamMemberRecord> {
  const result = await query<TeamMemberRecord>(
    `INSERT INTO team_members (organization_id, team_id, user_id, display_name, email, active)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     RETURNING *`,
    [organizationId, teamId || null, userId || null, displayName, email || null]
  );
  return result.rows[0];
}

export async function updateTeamMember(
  organizationId: string,
  memberId: string,
  updates: { displayName?: string; email?: string; teamId?: string | null; active?: boolean }
): Promise<TeamMemberRecord | null> {
  const fields: string[] = [];
  const values: any[] = [organizationId, memberId];
  let idx = 3;

  if (updates.displayName !== undefined) {
    fields.push(`display_name = $${idx++}`);
    values.push(updates.displayName);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(updates.email);
  }
  if (updates.teamId !== undefined) {
    fields.push(`team_id = $${idx++}`);
    values.push(updates.teamId);
  }
  if (updates.active !== undefined) {
    fields.push(`active = $${idx++}`);
    values.push(updates.active);
  }

  if (fields.length === 0) {
    const res = await query<TeamMemberRecord>(
      `SELECT * FROM team_members WHERE organization_id = $1 AND id = $2`,
      [organizationId, memberId]
    );
    return res.rows[0] || null;
  }

  fields.push(`updated_at = NOW()`);

  const result = await query<TeamMemberRecord>(
    `UPDATE team_members
     SET ${fields.join(', ')}
     WHERE organization_id = $1 AND id = $2
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteTeamMember(organizationId: string, memberId: string): Promise<boolean> {
  // Soft deactivate instead of hard delete per docs
  const result = await query(
    `UPDATE team_members SET active = FALSE, updated_at = NOW() WHERE organization_id = $1 AND id = $2`,
    [organizationId, memberId]
  );
  return (result.rowCount ?? 0) > 0;
}
