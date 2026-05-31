# Phase 20 Fix RA-01-04 Employee Import

## Scope

- Task: `phase-20-fix-ra-01-04-employee-import`
- Branch: `codex/phase-20-fix-ra-01-04-employee-import`
- Source finding: `F-RA-01-04-001`
- Goal: complete local employee batch import without adding parser dependencies, package changes, schema changes, migrations, env access, external services, or destructive data operations.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
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

## Constraints

- No new dependency, package, or lockfile changes.
- No `.env.local` or `.env.example` read/write.
- No `src/db/schema/**`, `drizzle/**`, migration, or destructive data operation.
- No staging/prod/cloud/deploy, real provider, or external service call.
- Do not record plaintext initial passwords, tokens, session values, internal numeric ids, or private env values in evidence.

## TDD Plan

1. Add a failing unit test for `/api/v1/employees/import` accepting Excel-compatible CSV/TSV text with `phone,name,initialPassword,organizationPublicId` headers and returning per-row import results.
2. Add a failing unit test for rejected duplicate/invalid rows proving no plaintext password or token appears in audit evidence.
3. Implement a small local CSV/TSV parser inside the existing admin organization/employee runtime boundary; keep old `userPublicId,organizationPublicId` import compatibility.
4. Wire the admin UI textarea to accept both existing public-id rows and Excel-compatible CSV/TSV text without adding browser parser libraries.
5. Run targeted RED/GREEN, task validation commands, local CI gates, and write redacted evidence.

## Security Review Plan

- `auth_permission_model`: keep employee import behind existing `super_admin`/`ops_admin` employee manager gate; `content_admin` remains denied.
- `admin_ops`: append redaction-safe `audit_log` metadata for success and failure.
- `local_human_verification`: unit/e2e/build/readiness gates as required.
- `evidence_integrity`: evidence omits initial passwords, tokens, env values, raw private content, and numeric internal ids.
