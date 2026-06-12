# fix-api-error-envelope-consistency Task Plan

## Task

- Task id: `fix-api-error-envelope-consistency`
- Branch: `codex/fix-api-error-envelope-consistency`
- Task kind: `implementation`
- Date: 2026-06-12
- Source: health audit follow-up queue seeded by `docs-health-followup-queue-seeding`

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-005
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`

## Scope

Allowed files:

- `src/server/services/**`
- `docs/05-execution-logs/task-plans/2026-06-12-fix-api-error-envelope-consistency.md`
- `docs/05-execution-logs/evidence/2026-06-12-fix-api-error-envelope-consistency.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-fix-api-error-envelope-consistency.md`

Blocked work:

- No dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, e2e, PR, force-push, or Cost Calibration Gate work.

## Approach

- Extend `route-error-response.ts` with a typed helper that wraps nested route handler objects.
- Apply the helper at route factory return boundaries so uncaught runtime exceptions return the standard `{ code, message, data: null }` envelope with HTTP 500.
- Preserve all existing explicit business responses and successful response shapes.
- Add focused unit tests for single handler wrapping and nested route tree wrapping.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/route-error-response.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `git diff --check`

## Stop Conditions

- Stop if standardizing the wrapper requires changing public API success response shapes.
- Stop if validation needs dependency, schema/migration, env/secret, provider, deploy, payment, external-service, e2e, PR, force-push, or Cost Calibration Gate work.
