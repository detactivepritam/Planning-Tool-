import { query, getClient } from '../db/index.js';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
  role?: string;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await query<UserRecord>(
    `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const result = await query<UserRecord>(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createUserWithOrganization(
  userData: CreateUserData,
  companyName: string
): Promise<{ user: UserRecord; organization: OrganizationRecord }> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Create Organization
    const orgResult = await client.query<OrganizationRecord>(
      `INSERT INTO organizations (name) VALUES ($1) RETURNING *`,
      [companyName || `${userData.fullName}'s Workspace`]
    );
    const organization = orgResult.rows[0];

    // 2. Create User
    const userResult = await client.query<UserRecord>(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES (LOWER($1), $2, $3, $4, $5)
       RETURNING *`,
      [
        userData.email,
        userData.passwordHash,
        userData.fullName,
        userData.phone || null,
        userData.role || 'manager'
      ]
    );
    const user = userResult.rows[0];

    // 3. Link Organization Member
    await client.query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [organization.id, user.id, user.role]
    );

    // 4. Create default 'General' team for the organization
    const teamResult = await client.query(
      `INSERT INTO teams (organization_id, name, description, color)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [organization.id, 'Algemeen', 'General team', '#1D7CF2']
    );
    const defaultTeamId = teamResult.rows[0].id;

    // 5. Create default team member for the user
    await client.query(
      `INSERT INTO team_members (organization_id, team_id, user_id, display_name, email, active)
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      [organization.id, defaultTeamId, user.id, user.full_name, user.email]
    );

    await client.query('COMMIT');
    return { user, organization };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getUserOrganizations(userId: string): Promise<OrganizationRecord[]> {
  const result = await query<OrganizationRecord>(
    `SELECT o.* 
     FROM organizations o
     JOIN organization_members om ON om.organization_id = o.id
     WHERE om.user_id = $1
     ORDER BY o.created_at ASC`,
    [userId]
  );
  return result.rows;
}
