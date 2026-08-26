# Proxie Planning Tool - Requirements

## 1. Project Overview

Proxie is a workforce planning and scheduling application inspired by the Eitje Planning Tool.

Primary user flow:

`Sign up / Login -> Planning Tool`

The project scope is limited to the **Planning Tool**. Do not add unrelated modules such as payroll, communication, knowledge management, marketing pages, or financial products unless explicitly requested later.

## 2. Requirement Types

This project has two main requirement categories:

### 2.1 Functional Requirements

Functional requirements describe **what the system must do**.

#### Authentication
- Users can create an account.
- Users can log in and log out.
- Users can access the Planning Tool only after authentication.
- User profile information is stored persistently.

#### Planning
- View planning by team.
- View planning by team member.
- Navigate to previous/next week.
- Jump to the current week.
- Display seven-day planning columns.
- Display events, shifts, availability, and absence information.
- Display planned-shift totals.

#### Shift Management
- Create a shift.
- Edit a shift.
- Delete a shift.
- Reschedule a shift by changing date/time.
- Reassign a shift to another team/team member.
- Support shift movement between days.
- Support recurring/repeating shifts.
- Support multiple-shift creation.
- Support open/unassigned shifts.
- Support shift trade/swap requests.
- Support publishing/unpublishing schedules.

#### Event Management
- Create events.
- Edit events.
- Delete events.
- Associate events with dates/times.

#### Availability
- Store team-member availability.
- Display availability in the planning interface.
- Track unavailable/absent states.
- Detect scheduling conflicts where appropriate.

#### Templates
- Save a shift/schedule pattern as a template.
- Load and reuse templates.

#### Requests
The backend must persist user-generated requests, including supported request types such as:
- Shift trade/swap request.
- Open-shift claim/request.
- Availability request/change where applicable.
- Other planning requests added later.

Every request must have:
- Requester.
- Request type.
- Related entity.
- Status.
- Created timestamp.
- Updated timestamp.
- Optional reviewer/approver.
- Optional response/comment.

#### Persistence
- Planning data survives page refresh.
- Data is stored in a real relational database.
- Changes made in the UI are persisted through backend APIs.
- The planning page loads persisted data from the database.

### 2.2 Non-Functional Requirements

Non-functional requirements describe **how the system should behave**.

#### Performance
- Planning data should load quickly.
- API calls should avoid unnecessary repeated queries.
- Week navigation should feel responsive.
- Large team schedules should remain usable.

#### Reliability
- Database failures must return useful errors.
- Invalid operations must be rejected safely.
- Data changes should be transactional where necessary.

#### Security
- Authentication is required for private planning data.
- Passwords must never be stored as plain text.
- Secrets must use environment variables.
- Users should only access data they are authorized to access.
- Server-side authorization must not rely only on frontend checks.
- Database credentials must never be committed to Git.

#### Maintainability
- Keep frontend, API, database and business logic clearly separated.
- Use reusable Svelte components.
- Keep backend validation centralized.
- Keep database queries in a dedicated data-access layer where practical.

#### Scalability
- Use indexed relational tables.
- Avoid storing the entire schedule as one JSON blob.
- Use pagination/filtered queries where data volume can grow.
- Design request handling so new request types can be added later.

#### Responsive Design
- Desktop and tablet should support the full planning grid.
- Mobile should remain usable, using horizontal planning-grid scrolling where necessary.
- Modals and forms must remain usable on small screens.

#### Compatibility
- Application must run locally in development.
- Application must deploy successfully to Vercel.
- Database connectivity must work in production.

## 3. Roles

### Manager/Admin
Can:
- Manage teams and team members.
- Create/edit/delete shifts and events.
- Publish schedules.
- Review requests.
- Approve/reject shift trade requests.
- Manage templates.

### Team Member
Can:
- View assigned planning.
- View availability.
- Submit supported requests.
- Request/accept a shift trade where allowed.
- Claim open shifts where allowed.

## 4. Acceptance Criteria

A feature is considered complete only when:
1. The UI action works.
2. The backend validates the action.
3. The database persists the result.
4. Refreshing the page shows the saved state.
5. Unauthorized users cannot perform restricted actions.
6. Errors are shown clearly.
7. Existing functionality is not broken.

## 5. Scope Priority

### Priority 1
- Authentication
- Real database
- Shift CRUD
- Event CRUD
- Rescheduling/reassignment
- Team/team-member views

### Priority 2
- Recurring shifts
- Multiple shifts
- Availability/conflict handling
- Publish/unpublish

### Priority 3
- Templates
- Open shifts
- Shift trade/swap requests
- Additional planning utilities
