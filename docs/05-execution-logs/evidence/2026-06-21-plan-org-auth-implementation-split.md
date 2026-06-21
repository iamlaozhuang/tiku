# Evidence: Plan Org Auth Implementation Split

**Date:** 2026-06-21
**Task id:** `plan-org-auth-implementation-split`
**Branch:** `codex/plan-org-auth-implementation-split`
**Evidence mode:** command/result summary only.

## Source Facts

- The org_auth product decision recorded `subject`, `profession`, and `level` as atomic authorization dimensions.
- `src/db/schema/auth.ts` currently stores one `profession`, one `level`, no `subject`, and separate organization coverage through `org_auth_organization`.
- `src/server/contracts/organization-auth-contract.ts` exposes `OrgAuthDto` with current single-scope fields and no subject or bundle fields.
- Static admin UI scans show org_auth creation/detail flows around single `profession`, single `level`, quota, organization coverage, and public identifiers.
- User approval allows docs-only split planning and blocks authorization runtime, schema, migration, database, source, UI, and service implementation.

## Decision Result

Implementation split recorded: follow-up work must proceed through contract design, security preflight, schema approval package, service implementation, UI implementation, compatibility/migration guard, and runtime verification. No schema path is approved by this task.

## Validation Results

| command                                                                                                                                                            | result | evidence                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                 | pass   | Exit 0, no whitespace errors.                                                           |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...`                                                                                                        | pass   | `All matched files use Prettier code style!`                                            |
| `rg placeholder marker set ...`                                                                                                                                    | pass   | No placeholder or unselected-option markers found in the new implementation split docs. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId plan-org-auth-implementation-split` | pass   | Changed files stayed inside the task allowed scope; pre-commit hardening passed.        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId plan-org-auth-implementation-split`   | pass   | Git readiness passed; evidence and audit paths present; pre-push readiness passed.      |

## Runtime Boundary

No runtime authorization, source, test, e2e, schema, migration, seed, database, script, package, lockfile, dependency, `.env`, Provider, browser/dev-server runtime, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work was performed.
