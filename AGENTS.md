## Project Overview

This is a **web-based Learning Management System (LMS)** built as a Turborepo monorepo. The system consists of three tightly integrated Next.js applications:

| App | Purpose |
|---|---|
| `apps/lms` | Core student & educator interface — course delivery, AI quizzes, feedback |
| `apps/sms` | Student Management System — enrolment, attendance, reporting, analytics |
| `apps/sso` | SSO / Identity Provider — centralized auth powered by `better-auth` |

All apps share packages under `packages/` (e.g., `packages/ui`, `packages/core/lib`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| ORM | Drizzle ORM |
| Database | PostgreSQL (3 databases: `sso`, `lms`, `sms`) |
| Auth | `better-auth` |
| Monorepo | Turborepo + Bun workspaces |
| Styling | Tailwind CSS + shadcn/ui |
| AI APIs | Anthropic / OpenAI / Gemini |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| CI/CD | Vercel (production + preview deployments) |
| Local Dev | Docker Compose |
| Linting | ESLint + Prettier |

---

## Repository Structure

```
/
├── apps/
│   ├── lms/                          # Student & educator app
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── api/auth/         # better-auth route handler (proxied from SSO)
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx
│   │       ├── layouts/
│   │       │   ├── base-layout.tsx
│   │       │   └── dashboard-layout.tsx
│   │       ├── lib/
│   │       │   ├── auth/             # client.ts, config.ts, index.ts, server.ts
│   │       │   └── db/               # schema/, index.ts
│   │       ├── env.ts                # typed env vars (T3 env / zod)
│   │       └── proxy.ts              # SSO proxy config
│   │
│   ├── sms/                          # Admin / Student Management app (mirrors lms structure)
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── api/auth/
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx
│   │       ├── layouts/
│   │       ├── lib/
│   │       │   ├── auth/
│   │       │   └── db/
│   │       ├── env.ts
│   │       └── proxy.ts
│   │
│   └── sso/                          # SSO / Identity Provider app (better-auth IDP)
│       ├── public/                   # Static assets (images etc.)
│       ├── scripts/
│       │   └── seed-oauth-clients.ts # Seed script for OAuth client registration
│       └── src/
│           ├── app/
│           │   ├── (auth)/           # Route group — public auth pages
│           │   │   ├── .well-known/  # OIDC discovery endpoint
│           │   │   ├── consent/
│           │   │   ├── login/
│           │   │   └── signup/
│           │   ├── (dashboard)/      # Route group — admin dashboard (protected)
│           │   │   ├── clients/
│           │   │   ├── roles/
│           │   │   ├── sessions/
│           │   │   ├── users/
│           │   │   ├── layout.tsx
│           │   │   └── page.tsx
│           │   ├── api/
│           │   │   ├── auth/         # better-auth catch-all handler
│           │   │   ├── clients/      # OAuth client management API
│           │   │   ├── sessions/     # Session management API
│           │   │   └── stats/        # Platform stats API
│           │   └── layout.tsx
│           ├── components/
│           │   ├── forms/
│           │   │   ├── login-form.tsx
│           │   │   └── signup-form.tsx
│           │   └── app-logo.tsx
│           ├── hooks/
│           ├── layouts/
│           │   ├── base-layout.tsx
│           │   └── dashboard-layout.tsx
│           ├── lib/
│           │   ├── auth/
│           │   │   ├── access-control.ts  # RBAC rules
│           │   │   ├── client.ts
│           │   │   ├── config.ts
│           │   │   ├── index.ts
│           │   │   └── server.ts
│           │   └── db/               # schema/, index.ts
│           ├── env.ts
│           └── proxy.ts
│
└── packages/
    ├── configs/
    │   ├── eslint-config/            # Shared ESLint configs (base, next, react-internal)
    │   └── typescript-config/        # Shared tsconfig presets (base, nextjs, react-library)
    │
    ├── core/
    │   ├── auth/                     # Shared auth utilities
    │   │   └── src/
    │   │       ├── actions/
    │   │       │   ├── refresh-permissions.ts
    │   │       │   └── validate-token.ts
    │   │       └── plugins/
    │   │           └── oauth-auto-refresh.ts
    │   └── lib/                      # Shared utilities
    │       └── src/
    │           ├── env.ts
    │           ├── flash.ts
    │           ├── logger.ts
    │           └── utils.ts
    │
    └── ui/                           # Shared component library (shadcn/ui based)
        └── src/
            ├── components/           # Composite app-level components
            │   ├── app-header.tsx
            │   ├── app-shell.tsx
            │   ├── breadcrumb-provider.tsx
            │   ├── breadcrumbs.tsx
            │   ├── link-component-provider.tsx
            │   └── theme-provider.tsx
            ├── hooks/
            │   └── use-mobile.ts
            ├── layouts/
            │   ├── dashboard-layout/ # Sidebar layout with nav components
            │   └── base-layout.tsx
            ├── lib/
            │   └── utils.ts
            ├── primitives/           # shadcn/ui primitives (button, input, table, etc.)
            └── styles/
                └── globals.css
```

### Key Structural Notes

- **`apps/lms` and `apps/sms`** share the same internal layout. Auth is handled via a proxy to the `apps/sso` IDP — do not implement auth logic directly in these apps; use `src/lib/auth/` which wraps the shared `packages/core/auth` client.
- **`apps/sso`** is the single source of truth for identity. All sessions, OAuth clients, and role assignments live here. The `(auth)` and `(dashboard)` route groups keep public and protected pages cleanly separated.
- **`packages/core/auth`** holds shared auth actions and plugins consumed by all three apps — do not duplicate this logic per-app.
- **`packages/ui/src/primitives/`** contains all shadcn/ui primitives. **`packages/ui/src/components/`** contains higher-level composite components built on top of those primitives. Always prefer primitives for new low-level UI; add to `components/` only when building something reusable across apps.
- **`packages/configs/`** provides shared ESLint and TypeScript configs. All apps and packages extend these — do not maintain separate ESLint or tsconfig rules per-app.

---

## Code Conventions

### TypeScript

- Always use `strict` mode. Never use `any` — use `unknown` and narrow types explicitly.
- Prefer explicit return types on exported functions.
- Use `type` imports: `import type { Foo } from '...'` where the value is only used as a type.
- Co-locate types with the code that owns them; export from `packages/lib/types` only when shared across apps.

### Next.js (App Router)

- Prefer **Server Components** by default. Only add `"use client"` when the component needs browser APIs, event handlers, or client-side state.
- Use **Server Actions** for form mutations — do not create unnecessary API routes for actions that can be colocated.
- Route handlers live in `app/api/`. Protect every route with a session check from the IDP app before processing.
- Use `loading.tsx` and `error.tsx` at the route segment level.

### Drizzle ORM

- All schema changes go in `packages/db/schema/`. Never alter the DB directly.
- Run migrations via `drizzle-kit` — never hand-edit migration files.
- Use `deletedAt` timestamps (soft-delete) for `users` and `courses`. Hard-deletes are forbidden on those tables.
- Use `JSONB` columns for `quiz.questions` and `quiz_attempt.answers` — do not flatten these into separate tables.
- Always use parameterized queries. Never interpolate user input into raw SQL.

### Styling

- Use Tailwind utility classes. Do not write custom CSS unless absolutely necessary.
- Use components from `packages/ui` (shadcn/ui based) — do not introduce new UI libraries.
- All interfaces must be fully responsive (mobile, tablet, desktop).
- Accessibility: meet **WCAG 2.1 Level AA**. Use semantic HTML elements. Include `aria-*` attributes where native semantics are insufficient.

---

## Authentication & Authorization

- All session management is handled by `better-auth` in the `apps/idp` app.
- API routes in `apps/lms` and `apps/sms` must validate JWT session tokens issued by the IDP before any logic executes.
- Role-Based Access Control (RBAC) roles: `STUDENT`, `EDUCATOR`, `ADMIN`.
- Never expose role-gating only on the client — always enforce on the server.
- Never include user PII or student IDs in AI API prompt payloads (see AI rules below).


---

## Database Schema Reference

Key tables and their owning database:

| Table | DB | Notes |
|---|---|---|
| `users` | `auth` | Managed by better-auth; includes `role`, `passwordHash`, soft-delete via `deletedAt` |
| `sessions` | `auth` | better-auth session store; never query directly — use the auth SDK |
| `courses` | `lms` | Soft-delete; `educatorId` FK to `auth.users` |
| `modules` | `lms` | Ordered within course via `order` integer |
| `enrolments` | `lms` | Composite PK (`studentId`, `courseId`) |
| `assignments` | `lms` | Linked to module; includes `dueDate`, `maxScore` |
| `submissions` | `lms` | `aiFeedback` is nullable; only set after AI processing |
| `quizzes` | `lms` | `questions` stored as JSONB; `isAiGenerated` boolean |
| `quiz_attempts` | `lms` | `answers` stored as JSONB |
| `students` | `sms` | SMS-specific profile; `id` FK to `auth.users` |
| `attendance` | `sms` | Status enum: `PRESENT`, `ABSENT`, `LATE` |

---

## Git Workflow

### Branch Naming

```
feat/short-description      # new feature → targets develop
fix/short-description       # bug fix → targets develop
refactor/short-description  # refactor → targets develop
hotfix/short-description    # urgent fix → targets main directly
```

### Commit Format (Conventional Commits)

```
type(scope): subject
```

| Type | When to use |
|---|---|
| `feat` | New user-visible feature |
| `fix` | Restoring broken behaviour |
| `refactor` | Internal restructure, no behaviour change |
| `perf` | Same behaviour, measurably faster |
| `test` | Adding or improving tests |
| `ci` | CI/CD pipeline changes |
| `chore` | Maintenance, no product impact |
| `docs` | Documentation only |

Example: `feat(lms): add AI quiz generation endpoint`

### PR Rules

- PR title must match commit format.
- Description must include: **What changed**, **How to test**, **Screenshots** (if UI change), **Related issues**.
- Minimum **1 approval** required before merge.
- Feature/fix branches: **Squash and Merge** into `develop`.
- Hotfix/release branches: **Merge Commit** into `main`.
- No `wip` commits may be merged into `develop` or `main`.

### Branch Protection

- `main` — protected; requires PR + 1 approval; no direct pushes.
- `develop` — integration branch; all feature branches target this.

---

## Testing Requirements

- Minimum **70% test coverage** on critical business logic (auth flows, quiz generation, submission grading).
- Unit tests: **Vitest** — colocated with source files as `*.test.ts`.
- E2E tests: **Playwright** — lives in `tests/e2e/`.
- Never mock the database in unit tests — use a test database seeded via `packages/db/seed.ts`.
- AI API calls must always be mocked in tests using the mock client at `packages/lib/ai/mock.ts`.

---

## Environment Variables

Never commit secrets. All sensitive configuration uses environment variables.

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL_AUTH` | `apps/idp`, `packages/db` | Auth DB connection string |
| `DATABASE_URL_LMS` | `apps/lms`, `packages/db` | LMS DB connection string |
| `DATABASE_URL_SMS` | `apps/sms`, `packages/db` | SMS DB connection string |
| `BETTER_AUTH_SECRET` | `apps/idp` | Session signing secret |
| `ANTHROPIC_API_KEY` | `apps/lms` | AI quiz/feedback generation |
| `OPENAI_API_KEY` | `apps/lms` | AI fallback provider |
| `MOCK_AI` | `apps/lms` | Set `true` in dev to skip live AI calls |
| `MAX_AI_SPEND_USD` | `apps/lms` | Hard cap on AI spend per deployment |

Reference `.env.example` for the full list. Never hardcode any of these values.

---

## Performance Targets

| Metric | Target |
|---|---|
| Core LMS page load | < 2 seconds on 3G |
| AI quiz generation | < 8 seconds end-to-end |
| DB query (p95) | < 200 ms |
| Concurrent users | Minimum 100 simultaneous |

When writing data-fetching code, keep these targets in mind:
- Use DB connection pooling.
- Leverage Next.js ISR / `revalidate` for cacheable content.
- Avoid N+1 queries — use Drizzle's `with` for relational data.

---

## Security Checklist

Before opening a PR that touches auth, API routes, or DB access, verify:

- [ ] All inputs sanitized server-side (prevent SQL injection and XSS).
- [ ] API route checks session token before any logic executes.
- [ ] RBAC role check matches the functional requirement for this endpoint.
- [ ] No PII included in AI prompt payloads.
- [ ] No secrets, API keys, or credentials in source code or logs.
- [ ] HTTPS/TLS enforced (Vercel handles this; do not disable).

---

## What AI Assistants Should NOT Do

- Do not suggest `any` types or type assertions (`as Foo`) to silence TypeScript errors — fix the type properly.
- Do not add new npm dependencies without checking if the functionality already exists in the shared `packages/lib`.
- Do not introduce a new UI library — use shadcn/ui components from `packages/ui`.
- Do not write raw SQL — use Drizzle ORM queries.
- Do not hard-delete `users` or `courses` rows — use the soft-delete pattern.
- Do not send student PII to external AI APIs.
- Do not commit directly to `main` or `develop`.
- Do not skip the PR description template.