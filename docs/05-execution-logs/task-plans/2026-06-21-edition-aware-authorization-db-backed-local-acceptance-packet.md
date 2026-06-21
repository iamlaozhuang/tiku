# Edition-Aware Authorization DB-Backed Local Acceptance Plan

- Task id: `edition-aware-authorization-db-backed-local-acceptance-packet`
- Branch: `codex/edition-auth-db-backed-local-acceptance`
- Fresh approval: current user approved serially advancing the next three recommended work items and explicitly allowed task-end FF merge, push `origin/master`, and merged short-branch cleanup.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Scope

Make the edition-aware authorization contract true against the local loopback DB-backed runtime. The minimum allowed runtime surface is:

- Student `/api/v1/authorizations` contexts include source `edition`, derived `effectiveEdition`, `upgradeStatus`, quota owner, and safe display metadata.
- Admin `/api/v1/org-auths` list/detail/create paths preserve org auth `edition` and surface derived `effectiveEdition`/`upgradeStatus`.
- A focused DB-backed local Playwright spec validates synthetic standard/advanced/upgrade data through real localhost API responses.

## Guardrails

- No `.env*` edits or secret output.
- No provider/model calls, Cost Calibration Gate, deploy, PR, force push, payment, dependency/package/lockfile changes.
- No schema or migration file changes in this task; applying existing local migrations is allowed only against loopback dev DB.
- No destructive local DB operations; synthetic fixture writes must be additive/idempotent through existing local DB/app paths.
- Evidence records only command/result summaries and redacted metadata.

## Validation Plan

1. Run capability gates for local full flow, local Docker DB, and schema migration use.
2. Confirm DB target is loopback without printing the database URL.
3. Apply already-generated migrations with `npx.cmd drizzle-kit migrate`.
4. Seed local dev data with `scripts/db/Seed-DevDatabase.ps1`.
5. Run focused unit tests and the DB-backed local Playwright spec.
6. Run lint, typecheck, diff check, pre-commit hardening, module closeout readiness, and pre-push readiness.

## Risk Defense

- If migration apply requires destructive reset, migration table repair, or non-local DB access, stop immediately.
- If a validation step would expose token, Authorization header, database URL, plaintext redeem_code, internal DB rows, raw prompt, raw generated AI content, or provider payloads, stop and redact.
- If runtime gaps require broader source surfaces than the task allowedFiles, stop and request separate approval.
