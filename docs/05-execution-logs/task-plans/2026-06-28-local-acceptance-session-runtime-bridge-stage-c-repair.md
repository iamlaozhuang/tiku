# Local Acceptance Session Runtime Bridge Stage C Repair Plan

## Task

- Task id: `local-acceptance-session-runtime-bridge-stage-c-repair-2026-06-28`
- Branch: `codex/local-acceptance-session-bridge-20260628`
- Goal alignment: unblock content_admin owner-facing AI generation browser rerun by repairing local safe session runtime
  bridge.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-safe-bootstrap.md`

## Materialized Boundary

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-local-acceptance-session-runtime-bridge-stage-c-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-28-local-acceptance-session-runtime-bridge-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-acceptance-session-runtime-bridge-stage-c-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-local-acceptance-session-runtime-bridge-stage-c-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-28-local-acceptance-session-runtime-bridge-stage-c-repair.md`
- `src/server/services/local-acceptance-session-service.ts`
- `src/server/auth/local-session-runtime.ts`
- `tests/unit/local-acceptance-session-bootstrap.test.ts`

Blocked:

- `.env*`, package/lockfiles, DB schema/migrations/seed, e2e specs, scripts, private fixture/account directories,
  Provider/model configuration, AI generation UI/service source outside read-only inspection.

## Implementation Approach

1. Add a focused RED unit that proves local acceptance session records survive the runtime boundary required by the
   session resolver.
2. Repair the session store with a local/dev/test-only process-level store instead of a module-instance-only `Map`.
3. Keep the local acceptance route response redacted and keep only `content_admin` supported.
4. Run focused unit, full unit, lint, typecheck, optional localhost API smoke, prettier, diff, and Module Run v2 gates.

## Risk Controls

- No Provider, DB, env, dependency, schema, migration, seed, e2e, staging/prod/deploy, PR, force push, final Pass, or Cost
  Calibration.
- No evidence of credentials, cookies, tokens, sessions, localStorage, Authorization headers, raw DOM, screenshots, or
  traces.
- AI 出题/AI 组卷 shared implementation remains untouched.
