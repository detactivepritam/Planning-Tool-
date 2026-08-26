# System Architecture - Proxie Planning Tool

## 1. High-Level Architecture

```text
                 +----------------------+
                 |   Browser / Mobile   |
                 |   Svelte UI          |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 |     SvelteKit       |
                 | Routes + API Server  |
                 +----------+-----------+
                            |
             +--------------+--------------+
             |                             |
             v                             v
      +-------------+              +---------------+
      | Auth layer  |              | Service layer |
      | session     |              | planning      |
      +-------------+              | requests      |
                                   +-------+-------+
                                           |
                                           v
                                   +---------------+
                                   | PostgreSQL    |
                                   | persistent DB |
                                   +---------------+
```

## 2. Frontend

Responsibilities:
- Render Planning Tool.
- Manage temporary UI state.
- Request server data.
- Display loading/error states.
- Handle user interaction.
- Keep layout close to Eitje.

Do not put database credentials or privileged operations in client code.

## 3. Server

Responsibilities:
- Authenticate requests.
- Authorize users.
- Validate inputs.
- Run business logic.
- Read/write PostgreSQL.
- Handle transactions.
- Return API responses.

## 4. Database

PostgreSQL stores:
- Accounts/profiles
- Organizations
- Teams
- Team members
- Shifts
- Events
- Availability
- Absences
- Requests
- Templates
- Recurring schedules

## 5. Data Flow Example: Create Shift

```text
User clicks Save
       |
       v
Svelte form validation
       |
       v
POST /api/shifts
       |
       v
Auth + permission check
       |
       v
Payload validation
       |
       v
Conflict check
       |
       v
INSERT shifts
       |
       v
Return saved shift
       |
       v
Update planning UI
```

## 6. Data Flow Example: Shift Trade

```text
Employee offers shift
       |
       v
POST /api/requests
       |
       v
Request = PENDING
       |
       v
Reviewer/target accepts
       |
       v
POST /api/requests/:id/approve
       |
       v
Transaction
  - validate shift
  - validate target employee
  - update shift
  - update request
       |
       v
Request = APPROVED
```

## 7. Multi-Tenant Rule

All planning data should belong to an organization/workspace.

Every relevant table should contain `organization_id` so queries can be scoped safely.

## 8. Deployment

Target:

`GitHub -> Vercel -> PostgreSQL/Auth provider`

Production settings must be provided through environment variables.
