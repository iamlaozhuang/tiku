# Full Unit Baseline Repair Plan

- Task id: `full-unit-baseline-repair-2026-06-28`
- Branch: `codex/full-unit-baseline-repair-20260628`
- Status: pass
- Date: `2026-06-28`

## Goal

Repair the local full unit baseline so `npm run test:unit` passes with no known repository baseline failures. This task is the required precondition before full acceptance matrix runtime execution.

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`

## Requirement Decision Map

| Decision area                 | Active source                            | Decision for this repair                                                                                                                          |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit baseline                 | Prior requirements matrix and task queue | Full acceptance cannot proceed until `npm run test:unit` is green.                                                                                |
| Authorization source of truth | ADR-007 and edition-aware requirements   | Do not weaken service-computed `effectiveEdition`, `personal_auth`, `org_auth`, `redeem_code`, or `auth_upgrade` behavior to satisfy stale tests. |
| API/service layering          | ADR-002                                  | Keep route/server action adapters thin; product-contract fixes belong in services/mappers/components as locally appropriate.                      |
| Provider and Cost Calibration | ADR-006 and advanced requirements        | Do not call providers, read model/provider config, or decide cost/quota defaults.                                                                 |

## Requirement Mapping

| Prior failure class                           | Repair mapping                                                   |
| --------------------------------------------- | ---------------------------------------------------------------- |
| Cookie/header baseline assertions             | Auth/session contract and test environment request-header mocks. |
| Organization authorization service validation | Edition-aware authorization service/repository contract.         |
| Organization analytics mapper baseline        | Organization analytics summary mapper contract.                  |
| Personal AI component mock export             | Personal AI UI/component test contract.                          |
| Organization portal link expectation          | Organization workspace navigation contract.                      |
| Ops/content runtime expectations              | Admin workspace permission/copy/runtime contract.                |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-matrix-unit-baseline-repair-requirements.md`

These sources seed known failure classes only. They do not replace RED reproduction from `npm run test:unit`.

## Conflict Check

- No source/test repair may bypass required authorization, redaction, Provider, DB, or Cost Calibration boundaries.
- If a failing unit test asserts stale behavior, update the test only after documenting the current product contract in evidence.
- If a failure requires DB/schema/migration/dependency/provider/browser/e2e work, record it as blocked and stop that repair class.

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-28-full-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-unit-baseline-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-unit-baseline-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-unit-baseline-repair.md`
- `src/app/**`
- `src/components/**`
- `src/features/**`
- `src/hooks/**`
- `src/lib/**`
- `src/server/**`
- `tests/unit/**`

## Blocked

- `.env*`, package/lockfiles, schema/migration/seed, scripts, e2e, browser/dev-server runtime, DB connection/read/write, Provider calls/configuration/credentials, Cost Calibration, staging/prod/deploy, payment/OCR/export/external-service, PR, force-push, release readiness, and final Pass.

## Execution Steps

1. Run `npm.cmd run test:unit` to capture RED baseline.
2. Extract failing files and failure classes into redacted evidence.
3. Run focused `npx.cmd vitest run <failing files>` commands by cluster.
4. Diagnose root cause before editing.
5. Apply narrow TDD repairs inside allowed source/test files.
6. Rerun focused GREEN checks.
7. Rerun full `npm.cmd run test:unit`.
8. Run `npm.cmd run lint`, `npm.cmd run typecheck`, `git diff --check`, Module Run v2 pre-commit/module-closeout/pre-push.
9. Commit, fast-forward merge to `master`, push `origin/master`, delete short branch, then continue to `full-acceptance-matrix-execution-2026-06-28`.

## Validation Commands

- `npm.cmd run test:unit`
- `npx.cmd vitest run <focused failing unit files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-unit-baseline-repair-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-unit-baseline-repair-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-unit-baseline-repair-2026-06-28 -SkipRemoteAheadCheck`

## TDD Discipline

- RED: captured full `npm run test:unit` baseline and focused failing tests.
- GREEN: focused failing clusters pass after repair.
- REFACTOR: only narrow cleanup needed to preserve product contracts; no unrelated formatting churn.

## Closeout Result

- Full unit baseline: pass.
- Scope: source/test fixture and assertion repair only.
- Next task: `full-acceptance-matrix-execution-2026-06-28` after this task is committed, merged, pushed, and the short branch is cleaned.
