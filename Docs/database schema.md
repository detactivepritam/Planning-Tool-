# Database Schema - Proxie Planning Tool

## 1. Database

Use **PostgreSQL**.

If using Supabase, these tables can live directly in Supabase PostgreSQL.

## 2. Core Relationships

```text
users
  |
  +-- organization_members -- organizations
  |
  +-- team_members -- teams
  |                    |
  |                    +-- shifts
  |
  +-- requests -- shifts/events/templates

events
availability
absence_records
templates
template_shifts
```

## 3. Organizations

### organizations

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Required |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

An organization/workspace prevents data from different customers mixing.

## 4. Users

### users

If using Supabase Auth, keep authentication credentials in `auth.users` and store application profile data separately.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, matches auth user id |
| full_name | text | Required |
| email | text | Unique |
| role | text | manager/team_member/admin |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

## 5. Organization Membership

### organization_members

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| user_id | uuid | FK |
| role | text | manager/team_member/admin |
| created_at | timestamptz | Default now() |

Unique:
`(organization_id, user_id)`

## 6. Teams

### teams

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| name | text | Required |
| description | text | Optional |
| color | text | Optional UI color |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

## 7. Team Members

### team_members

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| user_id | uuid | Optional if team member is also a login user |
| team_id | uuid | FK |
| display_name | text | Required |
| email | text | Optional |
| active | boolean | Default true |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

## 8. Shifts

### shifts

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| team_id | uuid | FK |
| team_member_id | uuid | Nullable for open shift |
| shift_date | date | Required |
| start_time | time | Required |
| end_time | time | Required |
| break_minutes | integer | Default 0 |
| shift_type | text | Optional |
| note | text | Optional |
| status | text | draft/open/published/cancelled |
| recurring_group_id | uuid | Nullable |
| created_by | uuid | FK users |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

Recommended index:
`(organization_id, shift_date, team_id)`

## 9. Events

### events

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| title | text | Required |
| event_date | date | Required |
| start_time | time | Optional |
| end_time | time | Optional |
| description | text | Optional |
| created_by | uuid | FK users |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

## 10. Availability

### availability

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| team_member_id | uuid | FK |
| availability_date | date | Required |
| status | text | available/unavailable/partial |
| start_time | time | Nullable |
| end_time | time | Nullable |
| note | text | Optional |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

## 11. Absence

### absences

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| team_member_id | uuid | FK |
| start_date | date | Required |
| end_date | date | Required |
| reason | text | Optional |
| status | text | active/cancelled |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

## 12. Requests

This table handles user requests such as shift trades.

### requests

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| requester_id | uuid | FK users |
| request_type | text | shift_trade/open_shift/availability/other |
| status | text | pending/approved/rejected/cancelled |
| shift_id | uuid | Nullable FK |
| target_team_member_id | uuid | Nullable FK |
| payload | jsonb | Flexible request-specific data |
| reviewer_id | uuid | Nullable FK |
| reviewer_comment | text | Optional |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |
| reviewed_at | timestamptz | Nullable |

Use structured columns for frequently queried fields and `payload` only for request-specific information.

## 13. Templates

### templates

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| name | text | Required |
| description | text | Optional |
| created_by | uuid | FK users |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### template_shifts

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| template_id | uuid | FK |
| team_id | uuid | FK |
| team_member_id | uuid | Nullable |
| weekday | smallint | 1-7 |
| start_time | time | Required |
| end_time | time | Required |
| break_minutes | integer | Default 0 |
| shift_type | text | Optional |
| note | text | Optional |

## 14. Recurring Schedules

### recurring_schedules

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | FK |
| team_id | uuid | FK |
| team_member_id | uuid | Nullable |
| start_date | date | Required |
| end_date | date | Required |
| weekdays | integer[] | 1-7 |
| start_time | time | Required |
| end_time | time | Required |
| break_minutes | integer | Default 0 |
| shift_type | text | Optional |
| note | text | Optional |
| created_by | uuid | FK users |
| created_at | timestamptz | Default now() |

Generated shifts can reference `recurring_group_id`.

## 15. Suggested Enums

Prefer DB enums or validated text values for:
- role
- shift status
- availability status
- request type
- request status

## 16. Referential Integrity

Use foreign keys and appropriate delete behavior.

Recommended:
- Organization deletion: restricted or cascaded only when safe.
- Team deletion: restrict if shifts exist.
- Team member deletion: soft-delete/deactivate instead of hard delete.
- Shift deletion: explicit business operation.
- Request deletion: usually retain for audit/history.

## 17. Security / Row-Level Access

If using Supabase:
- Enable Row Level Security.
- Users can access only their organization's data.
- Team members can access their allowed records.
- Managers can manage planning for their organization.
- Service-role key is server-only.

## 18. Audit Consideration

For future improvement, add an `audit_logs` table to track:
- Who changed a shift.
- What changed.
- Old value.
- New value.
- Timestamp.

This is useful for schedule changes and request approvals.
