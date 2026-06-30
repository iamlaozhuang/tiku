# Unit B Auth Mapper Source Of Truth Alignment Review Evidence

## Batch 1: Evidence

- Task id: `unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29`
- Branch: `codex/unit-b-auth-mapper-review-20260629`
- Base commit: `921439f4835c1d5c81485d9c87e3f474aa12c158`
- Commit: `921439f4835c1d5c81485d9c87e3f474aa12c158` before final task commit creation.
- Scope: docs/state-only bounded read-only review and repair task split if needed.
- Result: pass auth mapper source-of-truth review completed; repair task seeded pending materialization.
- localFullLoopGate: docs/state plus source read-only static review; no source/test edit, runtime, DB, Provider,
  dependency, staging/prod, release readiness, final Pass, or Cost Calibration execution.
- Cost Calibration Gate remains blocked.

## RED Evidence

- RED: prior Unit B review deferred auth mapper/source-of-truth alignment because it needed a separate materialized task.
- RED: auth mapper projects organization workspace capability from admin role and organization public id while labeling
  it `service_computed` and `org_auth`.
- RED: the mapper input row does not include active `org_auth`, `auth_upgrade`, computed `effectiveEdition`, or
  capability-source facts needed to prove ADR-007 service-computed authorization.

## GREEN Evidence

- GREEN: downstream organization workspace guards reject explicit `session_fallback` summaries.
- GREEN: organization analytics, organization AI generation, and organization training runtime routes now require
  capability summaries marked service-computed before privileged advanced organization actions.
- GREEN: first minimal repair task was seeded as
  `repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29`; source/test edits remain blocked until that
  task materializes exact boundaries.

## Review Coverage

| Surface                                       | Status         | Redacted summary                                                                                      |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `src/server/mappers/auth-mapper.ts`           | candidate risk | Role-derived organization capability is labeled `service_computed` without source auth facts.         |
| `src/server/contracts/auth-contract.ts`       | covered        | DTO carries capability summary without raw DB rows, internal ids, or session token in auth context.   |
| Admin workspace role guard service            | covered        | Guard rejects fallback and missing `org_auth` summaries for advanced organization routes.             |
| Organization workspace frontend access helper | covered        | Helper treats only `service_computed` plus `org_auth` plus advanced capability as advanced available. |
| `/api/v1/sessions` service path               | candidate risk | Session GET/POST maps repository user rows through the auth mapper.                                   |
| Effective authorization service               | covered        | Service computes authorization contexts from source auth and upgrades, but is not wired into mapper.  |
| Focused source contract test                  | candidate risk | Current test asserts mapper-produced role-derived summary as service-side capability.                 |

## Validation Results

| Command                                                                                                                                                                                                            | Result | Redacted summary                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------- |
| `rg -n effectiveEdition ...`                                                                                                                                                                                       | pass   | Reviewed effectiveEdition and source authorization references.  |
| `rg -n session_fallback org_auth personal_auth auth_upgrade capability ...`                                                                                                                                        | pass   | Reviewed fallback, source auth, and capability references.      |
| `npx.cmd prettier --write --ignore-unknown ...`                                                                                                                                                                    | pass   | Scoped docs/state formatting completed with no content changes. |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                                                    | pass   | All scoped files use Prettier style.                            |
| `git diff --check`                                                                                                                                                                                                 | pass   | No whitespace errors.                                           |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e drizzle migrations seed scripts playwright-report test-results .next .env`                                                  | pass   | No blocked package, source, test, runtime, DB, or report path.  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29`                     | pass   | Module Run v2 pre-commit hardening passed for 7 scoped files.   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29`                | pass   | Module Run v2 closeout readiness passed.                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29 -SkipRemoteAheadCheck` | pass   | Module Run v2 pre-push readiness passed.                        |

## Boundary Confirmation

- Source or test changed: false.
- Package or lockfile changed: false.
- Database access, raw row read, mutation, schema, migration, or seed executed: false.
- Provider/AI call, Provider configuration, model configuration, prompt, payload, or raw AI I/O executed: false.
- Browser/dev server/e2e/raw DOM/screenshot/trace executed: false.
- Credential, cookie, token, session, localStorage, Authorization header, env, secret, or connection string evidence
  recorded: false.
- Release readiness, final Pass, deployment, staging/prod/cloud, PR, force-push, or Cost Calibration claimed/executed:
  false.

## Thread Rollover Decision

- Continue from `project-state.yaml`, `task-queue.yaml`, this evidence file, and the task plan.
- Do not rely on chat memory for the approval or prohibited boundaries.

## Next Module Run

- nextModuleRunCandidate: `repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29`.
- Status: pending task materialization under centralized local security repair authorization.

## Blocked Remainder

- Source/test repair, DB, Provider/AI, dependency, browser/dev-server/e2e, staging/prod/cloud/deploy, release readiness,
  final Pass, PR, force-push, and Cost Calibration remain blocked unless a later task explicitly materializes and
  approves the required boundaries.
