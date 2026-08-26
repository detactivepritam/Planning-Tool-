# Security Requirements - Proxie Planning Tool

## Authentication
- Use managed authentication or secure password hashing.
- Never store raw passwords.
- Use secure sessions/cookies.
- Protect private routes.

## Authorization
- Check user organization membership server-side.
- Check manager/team-member permissions server-side.
- Do not rely on hiding buttons in the UI.

## Database
- Enable Row Level Security if using Supabase.
- Restrict access by organization.
- Keep privileged database credentials server-only.

## Secrets
- Put secrets in environment variables.
- Add `.env` to `.gitignore`.
- Never commit passwords, API keys, tokens or database URLs.

## Input Validation
Validate:
- Dates.
- Times.
- IDs.
- Status values.
- Request types.
- Ownership/organization membership.

## Request Security
- A user can cancel their own request.
- Only authorized reviewers can approve/reject.
- Validate that referenced shifts still exist.
- Prevent duplicate/invalid approvals.

## Audit
For important planning changes, consider recording:
- Actor.
- Action.
- Entity.
- Entity ID.
- Timestamp.
- Old value.
- New value.

## Deployment
- Verify production environment variables.
- Rotate credentials if exposed.
- Do not use service-role database access in client-side code.
