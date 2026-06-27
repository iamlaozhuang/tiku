# Organization analytics redacted statistics source contract TDD

## Task

- Task ID: `organization-analytics-redacted-statistics-source-contract-tdd-approval-2026-06-27`
- Branch: `codex/org-analytics-redacted-statistics-tdd-20260627`
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
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/05-execution-logs/task-plans/2026-06-27-organization-analytics-ux-design-first-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-organization-admin-ai-usage-statistics-ux-enhancement-approval.md`

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
- DB connection, DB mutation, Provider calls, Provider credential reads, Cost Calibration
- Raw employee answer access, raw learner AI generated content access, prompts, Provider payloads, export/download
- Browser, e2e, dev server
- Staging/prod, deploy, payment, external service
- PR, force push, release readiness, final Pass

## TDD Plan

1. Add focused service assertions expecting an explicit `redactedStatisticsBoundary` in dashboard and employee statistics summaries.
2. Run focused Vitest and capture the expected RED failure before implementation.
3. Add a minimal DTO contract and service mapping that declares allowed summary-only statistics and blocked raw-content/export policies.
4. Run focused Vitest GREEN, then scoped formatting, lint, typecheck, diff check, and Module Run v2 gates.

## Expected Contract

The boundary contract must state:

- organization visibility is own-scope summary only;
- employee rows are limited to status, score, timing, and count summaries;
- raw employee subjective answers, raw learner AI content, prompt text, Provider payloads, export/download, and cross-organization analytics are blocked;
- no DB, Provider, browser, export, or external-service execution occurs in this task.
