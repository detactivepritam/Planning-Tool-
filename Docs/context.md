# Proxy Planning Tool - Project Context

## 1. Project goal

Build a real, coded **Planning Tool** inspired by the Eitje Planning interface.

Required user flow:

`Login / Sign up -> Planning Tool`

Scope is **ONLY the Planning Tool**. Do not build unrelated Eitje products/pages such as Communication, Knowledge, Data, Payroll, Time Tracking, etc.

The goal is:
1. Make the UI closely match the actual Eitje Planning Tool.
2. Make the planning functionality genuinely usable.
3. Persist application data with a real database.
4. Keep the application responsive where practical.

---

## 2. Current project

- Product name: **Proxie Planning Tool**
- Current deployed URL: https://proxieplanningtool.vercel.app/
- Planning page: https://proxieplanningtool.vercel.app/planning
- Development environment: **VS Code**
- Coding assistance: **GitHub Copilot**
- Source code: **GitHub**
- Deployment: **Vercel**
- The project is intended to be a real coded application, not a screenshot/static mockup.
- Sir specifically preferred a programming framework such as **Svelte**. Preserve the existing framework/codebase rather than replacing it unnecessarily.

---

## 3. What has already been implemented

Current/previously implemented functionality includes:

- Login / account creation flow
- Planning dashboard
- Weekly planning view
- Week/date navigation
- "Per team" planning view
- "Per team member" planning view
- Add Shift
- Add Event
- Edit Shift
- Edit Event
- Rescheduling existing shifts/events
- Reshifting/reassigning shifts
- Team/member planning
- Events section
- Availability section
- Absent section
- Show menu
- Tools menu
- Existing planning interactions
- Responsive behavior for PC and mobile
- UI refinements toward the Eitje Planning layout

Do **not** blindly rebuild these features. Inspect the existing code first and preserve working behavior.

---

## 4. Meaning of key functionality

### Rescheduling
Changing an existing shift's schedule, for example:
- Change date
- Change start/end time
- Change team
- Change assigned team member
- Move a shift from one day to another

### Reshifting / shift swap
Reassigning an existing shift from one employee to another. In Eitje this is closer to shift trade/swap functionality.

---

## 5. Reference / design target

The main visual reference is the actual Eitje Planning Tool.

The desired UI is close to:
- Top blue announcement bar
- Main navigation/header
- Planning toolbar
- Per team / per team member selector
- Week navigation
- Show / Tools / Publish controls
- Filter row
- Seven-day planning grid
- Events
- Team/member rows
- Availability
- Absent
- Forecast/revenue section where applicable in the reference
- Eitje-style spacing, borders, typography, density, button styling and dropdowns

Important instruction from sir:

> "also try to exactly copy their design"

and:

> "the closer you are to that tool, the better"

So prioritize **visual similarity to Eitje**. Do not introduce a new design system unless needed.

Do not copy Eitje branding/logo/proprietary assets. Use Proxie branding while matching the layout and interaction patterns.

---

## 6. Sir's requirements / feedback so far

Sir clarified:

- The assignment is NOT to recreate the public Eitje marketing website.
- After login, the user should see the actual Planning Tool.
- Focus on **only the Planning Tool**.
- Build **real code**, preferably using Svelte/SvelteKit.
- Work toward the same level of functionality as the real Eitje tool.
- Use the real Eitje tool to inspect what buttons/menus/features do.
- Missing functions include things such as repeating schedules/repeating shifts.
- Connect an actual database.
- Current UI should be made much closer to the real Eitje layout.
- No unnecessary feature expansion outside Planning.

Latest direct feedback:
- UI looks much better.
- The project is still at an early stage functionally.
- Add considerably more functionality so the Planning Tool becomes more usable.
- Inspect the real Eitje tool and implement missing functions.
- Database integration is important.
- A few extra days were granted, with a deadline of **Thursday 11 PM India time**.

---

## 7. Database status

A real database is **not yet successfully integrated**.

Attempts have been made to implement **Supabase / PostgreSQL**, but database setup was not completed due to technical issues on the development laptop.

Target:

Persist at least:
- Users/accounts
- Teams
- Team members
- Shifts
- Events
- Availability
- Absence/planning state
- Shift trades/swaps
- Templates/recurring schedule definitions if implemented

Required behavior:
- Creating/editing/deleting data should save to the database.
- Refreshing the browser should not erase saved data.
- Planning page should load persisted data.
- Secrets/credentials must use environment variables.
- Deployment on Vercel must keep working.

Do not hardcode private credentials.

---

## 8. High-priority missing functionality

Implement in roughly this order, checking existing code before each step:

### A. Shift editing/rescheduling
- Edit an existing shift
- Change date/time/team/team member
- Move shift between days
- Drag-and-drop rescheduling if practical

### B. Recurring/repeating shifts
- Choose selected days
- Repeat pattern
- Optional end date
- Generate corresponding shifts

### C. Multiple shift creation
- Create the same shift across multiple days/team members

### D. Templates
- Save a schedule/shift pattern
- Load/reuse it later

### E. Availability and conflicts
- Show availability in planning
- Warn about unavailable team members
- Warn about overlapping/conflicting shifts

### F. Open shifts
- Create a shift without assigning a team member
- Clearly mark it as open/unassigned

### G. Shift trade/swap
- Offer a shift
- Another employee accepts
- Assigned team member updates

### H. Publish/unpublish
- Draft vs published state
- Publish schedule
- Clear published state in UI

### I. Database persistence
- Connect all existing planning data to a real DB
- Preserve current UI and interactions

---

## 9. Important development rules for a new AI agent

1. **Inspect the existing code before changing anything.**
2. Do not rebuild existing working features.
3. Do not add unrelated Eitje modules.
4. Do not replace the current framework unless there is a strong technical reason.
5. Prefer small, testable changes.
6. Keep existing routes and deployment working.
7. Preserve current responsive behavior.
8. When changing the UI, compare against Eitje screenshots/reference.
9. When adding functionality, make the feature actually work end-to-end, not just add a button.
10. Use reusable components and keep business logic separate from UI where practical.
11. Use persistent storage/database instead of local-only mock state for final functionality.
12. Never include or expose real passwords, API keys, DB credentials, or other secrets in source code or documentation.

---

## 10. Current priority

**Immediate priority:**

1. Finish real database integration.
2. Continue adding missing core planning functionality.
3. Bring the Planning UI even closer to Eitje.
4. Test the whole flow after each change.
5. Keep the final product limited to the Planning Tool.

---

## 11. Useful reference terms

- **Reschedule:** Change the date/time/team/assigned person of an existing shift.
- **Reshift / Swap / Trade:** Reassign or exchange a shift between employees.
- **Recurring shift:** Repeat a shift pattern across selected days/date ranges.
- **Template:** Save a schedule pattern and reuse it later.
- **Open shift:** A shift that is not yet assigned to a team member.

---

## 12. What the next AI agent should do

Start by inspecting:
- Project structure
- package.json
- Svelte/SvelteKit setup
- Existing routes/components
- Current shift/event state and storage
- Existing authentication
- Existing API/database attempts
- Environment configuration

Then report:
1. What is already implemented.
2. What is missing.
3. What database setup currently exists.
4. The safest next implementation step.

Do not rewrite the application from scratch.
