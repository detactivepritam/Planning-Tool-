import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/guard.js';
import { listTeams, listTeamMembers } from '$lib/server/repositories/teamRepository.js';
import { listShifts } from '$lib/server/repositories/shiftRepository.js';
import { listEvents } from '$lib/server/repositories/eventRepository.js';

export const GET: RequestHandler = async (event) => {
  const auth = await requireAuth(event);
  if (auth instanceof Response) return auth;

  const url = event.url;
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;
  const orgId = auth.user.organizationId;

  const [teams, teamMembers, shifts, events] = await Promise.all([
    listTeams(orgId),
    listTeamMembers(orgId),
    listShifts(orgId, { from, to }),
    listEvents(orgId, from, to)
  ]);

  return json({
    from: from || null,
    to: to || null,
    plannedShiftCount: shifts.length,
    teams,
    teamMembers,
    shifts,
    events
  });
};
