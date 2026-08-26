# Backend Implementation - Proxie Planning Tool

## 1. Recommended Architecture

Recommended stack:

- Frontend + server framework: **SvelteKit**
- Database: **PostgreSQL**
- Authentication: **Supabase Auth** or another managed auth provider
- Database access: Supabase client/server SDK or a PostgreSQL ORM/query layer
- Deployment: **Vercel**

A practical architecture is:

`Browser -> SvelteKit UI -> SvelteKit server/API -> PostgreSQL`

Authentication can be:

`Browser -> Auth Provider -> Session -> SvelteKit server`

If Supabase is used:

`SvelteKit -> Supabase Auth + Supabase PostgreSQL`

Do not expose the PostgreSQL connection string or service-role credentials to the browser.

## 2. Backend Responsibilities

The backend is responsible for:
- Authentication/session verification.
- Authorization.
- Input validation.
- Database reads/writes.
- Business rules.
- Conflict detection.
- Request workflow.
- Consistent API responses.
- Audit-friendly timestamps.

## 3. Suggested Project Structure

```text
src/
  routes/
    +page.svelte
    login/
      +page.svelte
    signup/
      +page.svelte
    planning/
      +page.svelte

    api/
      auth/
        ...
      teams/
        ...
      team-members/
        ...
      shifts/
        ...
      events/
        ...
      availability/
        ...
      requests/
        ...
      templates/
        ...

  lib/
    components/
    server/
      auth/
      db/
      services/
      validators/
      permissions/
      repositories/
```

Keep server-only modules under `src/lib/server` so secrets and database logic do not reach the client bundle.

## 4. Service Layer

Recommended services:

### shiftService
Responsibilities:
- createShift
- updateShift
- deleteShift
- rescheduleShift
- reassignShift
- createRecurringShifts
- createMultipleShifts
- publishShift
- unpublishShift

### eventService
Responsibilities:
- createEvent
- updateEvent
- deleteEvent

### availabilityService
Responsibilities:
- setAvailability
- updateAvailability
- getAvailabilityForWeek

### requestService
Responsibilities:
- createRequest
- listRequests
- approveRequest
- rejectRequest
- cancelRequest

### templateService
Responsibilities:
- createTemplate
- loadTemplate
- deleteTemplate

## 5. Validation

Validate all requests on the server.

Examples:
- Start time must be earlier than end time.
- Team member must exist.
- Team must exist.
- Shift date must be valid.
- User must have permission to modify the shift.
- A shift trade must reference a valid shift.
- An already-approved request cannot be approved again.
- Recurring-shift end date cannot precede start date.

Use schema validation such as Zod if already compatible with the project.

## 6. Authorization

Do not trust frontend visibility.

Every protected backend endpoint must verify:
1. User is authenticated.
2. User belongs to the correct organization/workspace.
3. User has the required role.
4. User is allowed to access the target resource.

Examples:
- A team member can normally modify only their own requests.
- A manager can modify planning for their teams.
- Only authorized users can publish schedules.

## 7. Request Handling

Use a generic request entity for workflows that require review.

Example lifecycle:

`PENDING -> APPROVED`
`PENDING -> REJECTED`
`PENDING -> CANCELLED`

For a shift trade:
1. Requester selects shift.
2. Request identifies proposed recipient or open trade.
3. Manager/team-member submits request.
4. Backend validates shift availability/conflicts.
5. Reviewer accepts/rejects.
6. On approval, database transaction updates the shift assignment.
7. Request becomes APPROVED.

## 8. Transactions

Use a database transaction for operations where multiple records must change together.

Example:
- Approving a shift trade:
  1. Lock/validate shift.
  2. Validate target team member.
  3. Update shift assignment.
  4. Update request status.
  5. Commit.

If any step fails, rollback.

## 9. Error Format

Recommended API error format:

```json
{
  "error": {
    "code": "SHIFT_CONFLICT",
    "message": "The team member already has a shift during this time."
  }
}
```

Use appropriate HTTP status codes:
- 400 invalid input
- 401 unauthenticated
- 403 unauthorized
- 404 resource not found
- 409 conflict
- 500 unexpected server error

## 10. Environment Variables

Example:

```text
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

Only expose variables prefixed for public/client use.

Never commit `.env` files containing secrets.

## 11. Database Migration Strategy

Use migrations rather than manually changing production tables.

Recommended process:
1. Create migration.
2. Test locally.
3. Apply to staging/preview.
4. Verify.
5. Deploy to production.

## 12. Testing

At minimum test:
- Authentication.
- Shift creation/update/delete.
- Event creation/update/delete.
- Rescheduling.
- Request creation.
- Request approval/rejection.
- Database persistence after refresh.
- Unauthorized access.
- Conflict handling.

## 13. Implementation Order

1. Database connection.
2. Authentication/session.
3. Users/organizations.
4. Teams/team members.
5. Shifts.
6. Events.
7. Availability/absence.
8. Requests.
9. Templates.
10. Publish workflow.
11. Advanced conflict checking.

Do not rewrite the existing UI during database integration unless an API change requires a small adjustment.
