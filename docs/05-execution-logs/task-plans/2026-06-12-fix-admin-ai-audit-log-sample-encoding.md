# fix-admin-ai-audit-log-sample-encoding Task Plan

## Task

- Task id: `fix-admin-ai-audit-log-sample-encoding`
- Branch: `codex/fix-admin-ai-audit-log-sample-encoding`
- Task kind: `implementation`
- Date: 2026-06-12
- Source: health audit follow-up queue

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-005
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`

## Scope

Allowed files:

- `src/server/services/admin-ai-audit-log-ops-service.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- This task plan, evidence, and audit review

Blocked work:

- No dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, PR, force-push, or Cost Calibration Gate work.

## Approach

- Repair the unreadable provider/model display text in the admin AI audit sample model config only.
- Keep public IDs, provider keys, model names, aliases, status, fallback linkage, REST paths, and response envelope shape unchanged.
- Add focused assertions in the existing unit test so the fallback model config display text remains readable.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `git diff --check`

## Stop Conditions

- Stop if the repair requires provider integration, env/secret access, dependency changes, or API contract shape changes.
