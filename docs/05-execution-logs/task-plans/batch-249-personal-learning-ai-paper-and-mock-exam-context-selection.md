# Batch 249 Personal Learning AI Paper And Mock Exam Context Selection Plan

## Task

- Task id: `batch-249-personal-learning-ai-paper-and-mock-exam-context-selection`
- Module: `personal-learning-ai`
- Target closure: paper and mock_exam context selection.
- Status: closed via historical implementation reconcile and current focused unit validation.

## Initial Boundary

- Local L5 implementation/reconcile only.
- Prefer historical implementation evidence when the behavior is already materialized.
- No Provider/model calls, env/secret access, schema/migration/seed/database work, package/lockfile changes, dev-server/browser/e2e runtime, deploy, PR, force-push, payment, external-service work, formal generated content write, or Cost Calibration Gate execution.

## Planned Validation

- Focused unit validation for the existing context-selection surface.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Module Run v2 precommit, closeout, and prepush gates.

## Reconcile Decision

- Historical implementation anchors:
  - `docs/05-execution-logs/evidence/2026-06-12-batch-120-personal-learning-ai-paper-and-mock-exam-context-selection.md`
  - `docs/05-execution-logs/evidence/batch-237-personal-learning-ai-paper-and-mock-exam-context-selection.md`
- Current implementation surface remains the existing local contract:
  - `src/server/services/personal-ai-generation-request-context-service.ts`
  - `src/server/services/personal-ai-generation-request-context-service.test.ts`
- No source change was required for batch-249 because the service already validates no-context, paper, `mock_exam`,
  ambiguous context rejection, public-id-only references, and redacted context references.
