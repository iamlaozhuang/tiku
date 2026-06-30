# Repair Organization Training Capability Source Boundary Evidence

## Batch 1: Evidence

- Task id: `repair-organization-training-capability-source-boundary-2026-06-29`
- Branch: `codex/org-training-capability-repair-20260629`
- Base commit: `e05bc0681e5fc3e41a75292507c8ffa02f1ae303`
- Commit: `e05bc0681e5fc3e41a75292507c8ffa02f1ae303` before final task commit creation.
- Scope: focused source/test security repair for organization training runtime admin capability-source boundary.
- Result: pass after RED/GREEN, focused tests, lint, typecheck, formatting, diff check, and pre-commit hardening.
- localFullLoopGate: focused local unit repair only; no browser, DB, Provider, dependency, staging/prod/deploy, release
  readiness, final Pass, or Cost Calibration execution.
- Cost Calibration Gate remains blocked.

## RED Evidence

- RED: `npx.cmd vitest run src/server/services/organization-training-route.test.ts -t "rejects advanced organization admins"`
  failed with 2 expected assertion failures before the production fix.
- RED observed: an advanced organization admin session with missing service-computed capability metadata reached a
  successful publish response instead of admin-context-unavailable.
- RED observed: an advanced organization admin session with false advanced-workspace capability reached a successful
  publish response instead of admin-context-unavailable.
- RED proof: both cases were reachable before visible-scope, lineage, and publish repository operation expectations could
  be satisfied.

## GREEN Evidence

- GREEN: the organization training runtime admin context resolver now requires service-computed organization capability
  metadata with `org_auth`, advanced effective edition, non-null organization context, and advanced workspace capability.
- GREEN: the same focused test command passed after the route guard was added.
- GREEN: the full focused route validation command passed with 2 test files and 43 tests.

## Validation Results

| Command                                                                                                                                                                                                                | Result | Redacted summary                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `npx.cmd vitest run src/server/services/organization-training-route.test.ts -t "rejects advanced organization admins"`                                                                                                 | RED    | 2 expected failures before production fix.                      |
| `npx.cmd vitest run src/server/services/organization-training-route.test.ts -t "rejects advanced organization admins"`                                                                                                 | pass   | 2 focused regression tests passed after fix.                    |
| `npx.cmd vitest run src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts`                                                                              | pass   | 2 files and 43 tests passed.                                    |
| `npm.cmd run lint`                                                                                                                                                                                                     | pass   | ESLint completed with exit code 0.                              |
| `npm.cmd run typecheck`                                                                                                                                                                                                | pass   | TypeScript `tsc --noEmit` completed with exit code 0.           |
| `npx.cmd prettier --write --ignore-unknown ...`                                                                                                                                                                        | pass   | Scoped files formatted.                                         |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                                                        | pass   | Scoped files matched Prettier.                                  |
| `git diff --check`                                                                                                                                                                                                     | pass   | No whitespace errors.                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId repair-organization-training-capability-source-boundary-2026-06-29`                     | pass   | Scope and sensitive-evidence checks passed.                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId repair-organization-training-capability-source-boundary-2026-06-29`                | pass   | Closeout readiness passed after evidence-format refresh.        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId repair-organization-training-capability-source-boundary-2026-06-29 -SkipRemoteAheadCheck` | pass   | Pre-push readiness passed after state repository SHA alignment. |

## Changed Files

- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-repair-organization-training-capability-source-boundary.md`

## Boundary Confirmation

- Source or test changed: true, limited to the two approved files.
- Package or lockfile changed: false.
- Database access, raw row read, mutation, schema, migration, or seed executed: false.
- Provider/AI call, Provider configuration, model configuration, prompt, payload, or raw AI I/O executed: false.
- Browser/dev server/e2e/raw DOM/screenshot/trace executed: false.
- Credential, cookie, token, session, localStorage, Authorization header, env, secret, or connection string evidence
  recorded: false.
- Release readiness, final Pass, deployment, staging/prod/cloud, PR, force-push, or Cost Calibration claimed/executed:
  false.

## Batch Commit Evidence

- Task commit creation is authorized by the task-level closeout policy after validation remains green.
- Batch commit evidence: one scoped task commit will include only the nine allowed files listed above.

## Thread Rollover Decision

- Continue from `project-state.yaml`, `task-queue.yaml`, this evidence file, and the task plan.
- Do not rely on chat memory for allowed files, blocked files, or prohibited boundaries.

## Next Module Run

- Next recommended task after this repair: continue Unit B with a separately materialized auth mapper/source-of-truth
  alignment review or move to the next security unit only after queue approval.
- Status: continue only after this task closes.

## Blocked Remainder

- Broader auth mapper/source-of-truth alignment review remains blocked until a separate task is materialized.
- Browser, DB, Provider/AI, dependency, staging/prod/deploy, release readiness, final Pass, PR, force-push, and Cost
  Calibration remain blocked.
