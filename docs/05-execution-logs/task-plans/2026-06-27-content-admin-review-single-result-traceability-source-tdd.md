# Content-admin review single-result traceability source TDD

## Task

- Task ID: `content-admin-review-single-result-traceability-source-tdd-approval-2026-06-27`
- Branch: `codex/content-admin-review-traceability-tdd-20260627`
- Approval source: current user fresh approval on 2026-06-27 for serial batch tasks 1-5.

## Required Readings

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-ux-design-traceability-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-content-admin-ai-review-ux-enhancement-approval.md`

## Boundary

Allowed:

- `src/server/contracts/**`
- `src/server/models/**`
- `src/server/services/**`
- `src/server/repositories/**` only for local contract and pure unit-test needs
- Corresponding `*.test.ts`
- `docs/04-agent-system/state/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`

Blocked:

- `.env*`, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, migration, seed
- Provider calls, Provider credential reads, Cost Calibration
- DB connection, DB mutation, formal publish, student-visible runtime
- Browser, e2e, dev server
- Staging/prod, deploy, payment, external service
- PR, force push, release readiness, final Pass

## TDD Plan

1. Add focused repository contract assertions for a redacted `reviewTraceability` payload on created and draft-created formal adoption records.
2. Run focused Vitest and capture the expected RED failure before implementation.
3. Extend the formal adoption DTO contract and repository mapper with a minimal redacted single-result review traceability object.
4. Run focused Vitest GREEN, then scoped formatting, lint, typecheck, diff check, and Module Run v2 gates.

## Expected Contract

The contract must expose only redacted metadata:

- Source generated result reference.
- Review status, review decision, validation status, reviewer attribution, and reviewed timestamp.
- Adopt action attribution and current formal draft target status.
- Reject action marked not executed for the current approve-only flow.
- Formal draft target reference when draft creation has completed.
- Direct publish blocked flag requiring a separate publish task.
- Redacted audit summary.

The contract must not expose raw prompt, raw generated output, raw Provider payload, internal numeric ids, or student-visible content.
