# Proxie Planning Tool - Project Documentation

This folder contains the implementation documentation for the Proxie Planning Tool.

## Files

- `Requirement.md` - Functional and non-functional requirements.
- `backend implementation.md` - Backend architecture and implementation rules.
- `database schema.md` - PostgreSQL schema and relationships.
- `api.md` - API endpoints and payload examples.
- `architecture.md` - System architecture and data flows.
- `development-roadmap.md` - Recommended implementation order.
- `security.md` - Security and authorization requirements.
- `context.md` - Existing project context and progress summary.

## Core Scope

`Login / Sign up -> Planning Tool`

The application focuses only on workforce planning/scheduling.

## Core Technology Direction

- Svelte/SvelteKit
- PostgreSQL
- Supabase Auth and PostgreSQL are a practical managed option
- Vercel deployment
- GitHub source control

## Current Goal

Connect the existing Planning Tool to a real persistent database, then continue implementing missing planning functionality while keeping the UI close to the Eitje reference.
