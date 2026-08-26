# API Specification - Proxie Planning Tool

## 1. API Principles

- Use REST-style endpoints through SvelteKit server routes.
- Return JSON.
- Require authentication for protected endpoints.
- Validate all payloads server-side.
- Return consistent error structures.
- Use UUIDs for resource IDs.

Base path:

`/api`

## 2. Authentication

### POST /api/auth/signup
Create account.

Request:
```json
{
  "email": "user@example.com",
  "password": "********",
  "fullName": "Example User"
}
```

### POST /api/auth/login
Authenticate user.

### POST /api/auth/logout
End session.

### GET /api/auth/me
Return authenticated user profile.

## 3. Teams

### GET /api/teams
List teams for current organization.

### POST /api/teams
Create team.

### PATCH /api/teams/:id
Update team.

### DELETE /api/teams/:id
Delete/deactivate team if allowed.

## 4. Team Members

### GET /api/team-members
Optional filters:
- teamId
- active

### POST /api/team-members
Create team member.

### PATCH /api/team-members/:id
Update member.

### DELETE /api/team-members/:id
Prefer deactivation rather than hard deletion.

## 5. Planning / Shifts

### GET /api/shifts
Query:
```text
from=2026-08-24
to=2026-08-30
teamId=
teamMemberId=
status=
```

### POST /api/shifts
Create a shift.

Request:
```json
{
  "teamId": "uuid",
  "teamMemberId": "uuid",
  "shiftDate": "2026-08-24",
  "startTime": "09:00",
  "endTime": "17:00",
  "breakMinutes": 30,
  "shiftType": "regular",
  "note": "Morning shift"
}
```

### PATCH /api/shifts/:id
Edit a shift.

### DELETE /api/shifts/:id
Delete a shift.

### POST /api/shifts/:id/reschedule
Reschedule an existing shift.

Request:
```json
{
  "shiftDate": "2026-08-25",
  "startTime": "10:00",
  "endTime": "18:00",
  "teamId": "uuid",
  "teamMemberId": "uuid"
}
```

### POST /api/shifts/recurring
Create recurring shifts.

Request:
```json
{
  "teamId": "uuid",
  "teamMemberId": "uuid",
  "startDate": "2026-08-24",
  "endDate": "2026-09-30",
  "weekdays": [1, 2, 3, 4, 5],
  "startTime": "09:00",
  "endTime": "17:00",
  "breakMinutes": 30
}
```

### POST /api/shifts/bulk
Create/update multiple shifts.

### POST /api/shifts/:id/publish
Publish shift.

### POST /api/shifts/:id/unpublish
Return shift to draft.

## 6. Events

### GET /api/events
Query by date range.

### POST /api/events
Create event.

### PATCH /api/events/:id
Update event.

### DELETE /api/events/:id
Delete event.

## 7. Availability

### GET /api/availability
Query:
```text
from=
to=
teamMemberId=
```

### POST /api/availability
Create/update availability.

### PATCH /api/availability/:id
Modify availability.

### DELETE /api/availability/:id
Delete availability.

## 8. Absence

### GET /api/absences
List absence records.

### POST /api/absences
Create absence.

### PATCH /api/absences/:id
Update absence.

### DELETE /api/absences/:id
Cancel/delete absence.

## 9. Requests

### GET /api/requests
Filters:
- status
- requestType
- requesterId
- date range

### POST /api/requests
Create a request.

Example shift trade:
```json
{
  "requestType": "shift_trade",
  "shiftId": "uuid",
  "targetTeamMemberId": "uuid"
}
```

### POST /api/requests/:id/approve
Approve request.

### POST /api/requests/:id/reject
Reject request.

### POST /api/requests/:id/cancel
Cancel request.

## 10. Templates

### GET /api/templates
List templates.

### POST /api/templates
Create template.

### GET /api/templates/:id
Get template.

### POST /api/templates/:id/apply
Apply template to selected dates.

### DELETE /api/templates/:id
Delete template.

## 11. Planning Summary

### GET /api/planning/summary

Query:
```text
from=
to=
view=team|member
teamId=
```

Response example:
```json
{
  "from": "2026-08-24",
  "to": "2026-08-30",
  "plannedShiftCount": 12,
  "teams": [],
  "teamMembers": [],
  "shifts": [],
  "events": [],
  "availability": [],
  "absences": []
}
```

This endpoint can reduce multiple frontend requests when loading a week.

## 12. Conflict Checking

### POST /api/planning/check-conflicts

Request:
```json
{
  "teamMemberId": "uuid",
  "shiftDate": "2026-08-24",
  "startTime": "09:00",
  "endTime": "17:00",
  "excludeShiftId": "uuid"
}
```

Response:
```json
{
  "hasConflict": true,
  "conflicts": [
    {
      "shiftId": "uuid",
      "reason": "OVERLAPPING_SHIFT"
    }
  ]
}
```

## 13. Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid shift time."
  }
}
```

## 14. API Security

All protected endpoints should:
- Verify authenticated session.
- Verify organization membership.
- Verify role/permission.
- Validate request payload.
- Avoid exposing database internals.

Never trust user-provided organization IDs or role values without server-side checks.
