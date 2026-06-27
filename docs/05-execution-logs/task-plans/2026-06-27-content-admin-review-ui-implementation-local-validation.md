# Content-admin review UI implementation local validation

## Task

- Task ID: `content-admin-review-ui-implementation-local-validation-approval-2026-06-27`
- Branch: `codex/content-admin-review-ui-local-20260627`
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
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-ux-design-traceability-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-single-result-traceability-source-tdd.md`

## Boundary

Allowed:

- Related `src/app/**`, `src/components/**`, `src/server/contracts/**`, `src/server/services/**`
- Existing related feature UI and component/unit tests
- `docs/04-agent-system/state/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`

Task-local implementation target:

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

Blocked:

- DB connection, DB mutation, schema, drizzle, migration, seed
- Provider calls, Provider credential reads, Cost Calibration
- Review/adoption mutation execution, formal publish, student-visible runtime
- Browser, e2e, dev server
- Staging/prod, deploy, payment, external service
- PR, force push, release readiness, final Pass

## TDD Plan

1. Add a focused component test requiring the content AI history surface to render a single-result review traceability panel for persisted generated results.
2. Assert disabled adopt/reject actions and direct publish blocked state, with no raw generated content, public identifiers, Provider payloads, or session tokens in visible text.
3. Run the focused test and capture RED.
4. Implement the smallest UI-only traceability panel in the existing content AI generation entry page.
5. Run focused tests GREEN, scoped formatting, lint, typecheck, diff check, and Module Run v2 gates.

## Non-Scope

This task does not call the formal adoption route, does not create formal drafts, does not reject/adopt any real result, does not publish, and does not validate browser/runtime behavior.
