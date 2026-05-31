# Phase 20 Fix RA-01-09 Contact Config Runtime

## Task

- Task id: `phase-20-fix-ra-01-09-contact-config-runtime`.
- Finding: `F-RA-01-09-001`.
- Branch: `codex/phase-20-fix-ra-01-09-contact-config-runtime`.
- Goal: add a local admin-managed `contact_config` runtime surface for purchase guidance without dependency, schema, drizzle, env, cloud, deploy, external-service, or destructive-data changes.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Current Findings

- Student and admin redeem surfaces render `LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG`.
- `createContactConfigService().getPurchaseGuidance()` returns static local guidance only.
- No route exists for `/api/v1/contact-configs`.
- No admin page exists for `/ops/contact-config`.
- No `contact_config` database schema is present in the current runtime; this task must not introduce one because `src/db/schema/**` and `drizzle/**` are blocked.

## Implementation Plan

1. Add RED unit coverage for the missing `/api/v1/contact-configs` admin runtime:
   - `GET` returns the active `contactConfig`.
   - `PUT` allows `super_admin`/`ops_admin` to update purchase guidance.
   - `content_admin` is denied.
   - audit metadata is redacted and does not contain session tokens.
2. Extend `contact-config` contracts/service with local runtime repository support:
   - keep standard `{ code, message, data }` response shape.
   - keep API JSON camelCase.
   - expose only `publicId`, text fields, channels, `safetyNotice`, and timestamps.
3. Add route handler at `/api/v1/contact-configs`.
4. Add `/ops/contact-config` page with a compact admin management UI.
5. Add focused UI coverage for loading and updating the page, plus existing full unit/e2e gates.

## Risk Defense

- No package or lockfile changes.
- No `.env*` reads or writes.
- No `src/db/schema/**` or `drizzle/**` changes.
- No external provider, cloud, deploy, or real service changes.
- No plaintext secrets in evidence; audit metadata must be redacted.
- Route must require admin session and deny `content_admin` mutations.
- Evidence must include security review for `auth_permission_model`, `local_human_verification`, and `evidence_integrity`.
