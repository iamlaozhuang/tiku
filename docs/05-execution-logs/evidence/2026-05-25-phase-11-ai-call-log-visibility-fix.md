# Evidence: Phase 11 AI Call Log Visibility Fix

## Status

`closed`

## Scope Boundary

This task fixes local `ai_call_log` filtered visibility only.

Forbidden actions not performed:

- no staging/prod connection;
- no deployment;
- no cloud resource, DNS, Tencent Cloud COS, or public object storage URL change;
- no dependency, package, lockfile, schema, migration, script, or environment file change;
- no `.env.local` read or output;
- no real provider call;
- no secret value, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer/customer-like private content recorded.

## Root Cause Record

`listAiCallLogs` applied `aiFuncType` and `callStatus` after repository pagination. This could hide successful `kn_recommendation` and `ai_explanation` rows when the first page was filled by other AI function types.

## TDD Record

| Step            | Command                                                                                                                                                  | Result | Notes                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| Claim readiness | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-ai-call-log-visibility-fix` | pass   | Task was pending and dependency was closed.                                                       |
| RED             | `npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-visibility-fix.test.ts`                                                                        | failed | Focused test proved SQL did not include `ai_func_type` / `call_status` conditions before `limit`. |
| GREEN           | `npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-visibility-fix.test.ts`                                                                        | pass   | Repository query now pushes `aiFuncType` and `callStatus` filters into SQL before pagination.     |

## Implementation Record

- Added SQL-level `ai_func_type` and `call_status` conditions to `listAiCallLogs`.
- Applied the same filter conditions to the list query and total-count query.
- Kept service-level redaction, response envelope, schema, migrations, and API contracts unchanged.
- Added focused repository coverage that inspects the generated SQL shape before pagination.

## Validation Commands

| Command                                                                                                                             | Result | Notes                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-visibility-fix.test.ts`                                                   | pass   | Focused regression test passed after fix.             |
| `npm.cmd run test:unit`                                                                                                             | pass   | 122 files / 452 tests passed.                         |
| `npm.cmd run test:e2e`                                                                                                              | pass   | 15/15 passed with local one-worker Playwright config. |
| `npm.cmd run build`                                                                                                                 | pass   | Local Next.js build completed.                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                      | pass   | Agent state and queue readable.                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                             | pass   | Passed after formatting closeout.                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                         | pass   | Naming gate passed.                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass   | Completion inventory completed.                       |
| `git diff --check`                                                                                                                  | pass   | No whitespace errors.                                 |

## Repository Hygiene Closeout Checklist

| Check                                                                              | Result |
| ---------------------------------------------------------------------------------- | ------ |
| Only allowed task files changed                                                    | pass   |
| No package or lockfile change                                                      | pass   |
| No schema, migration, or script change                                             | pass   |
| No `.env.local` or `.env.example` change                                           | pass   |
| No staging/prod, deployment, cloud, DNS, COS, public URL, or object storage change | pass   |
| No secret/token/raw provider/full content recorded                                 | pass   |

## Staging Decision

Phase 11 staging implementation planning remains paused. External readiness is unchanged: `jiandingtiku.cn` is registered, DNS resolution is not configured, ICP filing is pending, and cloud server/database services have not been purchased.

## Next Recommended Action

Keep staging/prod and cloud work paused until external resources are ready. After DNS, ICP, cloud server, and database readiness change, resume Phase 11 staging planning from the existing release planning contract, resource plan, and secret/env plan.

## Taste Compliance Self-Check

- Frontend visual taste: pass; this task did not change frontend UI.
- Loading/empty/error states: pass; no UI state behavior changed.
- Interaction feedback: pass; no interaction surface changed.
- Tailwind class order: pass; no Tailwind class changes.
- Backend/API contract: pass; response shape and service redaction remain unchanged.
- N+1/SQL/schema: pass; filters now run in SQL before pagination, with no schema/migration change.
- Naming discipline: pass; existing `ai_call_log`, `ai_explanation`, and `kn_recommendation` terminology preserved.
- Clean logic: pass; filter construction is explicit and shared by list/count queries.
- Secret hygiene: pass; no env or secret file was read or recorded.
- Environment isolation: pass; no staging/prod/cloud/deploy action was performed.
