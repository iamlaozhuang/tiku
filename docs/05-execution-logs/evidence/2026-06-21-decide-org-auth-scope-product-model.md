# Evidence: Decide Org Auth Scope Product Model

**Date:** 2026-06-21
**Task id:** `decide-org-auth-scope-product-model`
**Branch:** `codex/decide-org-auth-scope-product-model`
**Evidence mode:** command/result summary only.

## Source Facts

- `src/db/schema/auth.ts` defines `org_auth` with one `profession`, one `level`, organization coverage, quota, time window, and status; it does not define `subject`.
- `src/db/schema/auth.ts` defines `org_auth_organization` as the organization coverage relation for `org_auth`.
- `src/server/contracts/organization-auth-contract.ts` exposes `OrgAuthDto` with `profession`, `level`, `authScopeType`, and `organizationPublicIds`; it does not expose `subject` or multi-scope bundle fields.
- `docs/01-requirements/use-cases/use-case-catalog.md` keeps standard organization authorization platform-managed and keeps advanced authorization context upgrades gated.
- The 2026-06-21 audit and role-experience matrix identified `org_auth` scope semantics as a decision blocker before implementation.

## Decision Result

Decision package recorded: `subject` is a product authorization dimension, current records remain compatible as covering both `theory` and `skill`, multi-`profession` and multi-`level` bundles must decompose into atomic scopes, and enterprise backend access is shared by `organization`/`employee` context rather than split per `org_auth`.

## Validation Results

| command                                                                                                                                                             | result | evidence                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                  | pass   | Exit 0, no whitespace errors.                                                                                              |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...`                                                                                                         | pass   | `All matched files use Prettier code style!`                                                                               |
| `rg placeholder marker set ...`                                                                                                                                     | pass   | No placeholder or unselected-option markers found in the new decision package artifacts.                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId decide-org-auth-scope-product-model` | pass   | Changed files stayed inside the task allowed scope; pre-commit hardening passed.                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId decide-org-auth-scope-product-model`   | pass   | Git readiness passed; evidence and audit paths present; pre-push readiness passed before commit and before push to master. |

## Runtime Boundary

No schema, migration, seed, database, source, test, e2e, script, package, lockfile, dependency, `.env`, Provider, prompt, browser/dev-server runtime, deploy, PR, force-push, payment, external-service, authorization runtime, or Cost Calibration Gate work was performed.
