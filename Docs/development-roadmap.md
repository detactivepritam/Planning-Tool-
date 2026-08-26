# Development Roadmap - Proxie Planning Tool

## Phase 0 - Protect Existing Work
- Create Git branch.
- Confirm current app builds.
- Confirm current deployment works.
- Do not start database migration without a backup/commit.

## Phase 1 - Database Foundation
- Choose PostgreSQL provider.
- Configure environment variables.
- Create migrations.
- Create organizations/users/team/team-member tables.
- Test database connection.

## Phase 2 - Persist Existing Planning Data
- Persist shifts.
- Persist events.
- Persist teams/team members.
- Persist availability/absence.
- Load the selected planning week from DB.
- Verify refresh persistence.

## Phase 3 - Requests
- Create `requests` table.
- Implement shift trade request.
- Add approval/rejection.
- Use transactions for approved trade.

## Phase 4 - Missing Eitje-like Planning Features
- Rescheduling.
- Recurring shifts.
- Multiple shift creation.
- Templates.
- Open shifts.
- Conflict detection.
- Publish/unpublish.

## Phase 5 - UI Accuracy
- Compare Planning page against Eitje reference.
- Match spacing.
- Match borders.
- Match typography.
- Match grid density.
- Match controls/dropdowns.
- Keep Proxie branding.

## Phase 6 - Testing
Test:
- Login/signup.
- Shift CRUD.
- Event CRUD.
- Rescheduling.
- Recurring creation.
- Requests.
- Availability.
- Publishing.
- Persistence.
- Authorization.
- Mobile/desktop planning.

## Phase 7 - Deployment
- Push stable code to GitHub.
- Configure Vercel environment variables.
- Apply production migrations.
- Verify APIs against production DB.
- Verify live planning URL.

## Definition of Done

The project is ready for review when:
- Login works.
- Planning is accessible after login.
- Existing planning features still work.
- Database persists the data.
- Core planning actions use the database.
- Requests are stored and processed.
- UI is close to the Eitje Planning reference.
- Deployment works on Vercel.
