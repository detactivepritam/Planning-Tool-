import crypto from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import { query } from '../db/index.js';

export const SESSION_COOKIE_NAME = 'proxie_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string | null;
  organizationId: string;
  organizationName: string;
}

export async function createSession(userId: string): Promise<{ sessionId: string; expiresAt: Date }> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await query(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [sessionId, userId, expiresAt]
  );

  return { sessionId, expiresAt };
}

export async function validateSession(sessionId: string): Promise<AuthenticatedUser | null> {
  if (!sessionId) return null;

  const result = await query<{
    user_id: string;
    email: string;
    full_name: string;
    role: string;
    phone: string | null;
    expires_at: Date;
    organization_id: string;
    organization_name: string;
  }>(
    `SELECT 
       u.id as user_id,
       u.email,
       u.full_name,
       u.role,
       u.phone,
       s.expires_at,
       om.organization_id,
       o.name as organization_name
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN organization_members om ON om.user_id = u.id
     LEFT JOIN organizations o ON o.id = om.organization_id
     WHERE s.id = $1 AND s.expires_at > NOW()
     LIMIT 1`,
    [sessionId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.user_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone,
    organizationId: row.organization_id,
    organizationName: row.organization_name
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export function setSessionCookie(cookies: Cookies, sessionId: string, expiresAt: Date): void {
  cookies.set(SESSION_COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt
  });
}

export function deleteSessionCookie(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export function getSessionFromCookies(cookies: Cookies): string | null {
  return cookies.get(SESSION_COOKIE_NAME) || null;
}
