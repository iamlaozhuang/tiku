# Audit Review: Standing Local E2E Smoke Allowlist Authorization Upgrade

## Verdict

APPROVE.

## Findings

- The 2026-06-16 user prompt requested implementation of the approved local E2E smoke allowlist authorization plan.
- The new approval is durable only through `project-state.yaml`, SOP/schema documentation, and task-level capability fields.
- The approval is narrower than default E2E approval: it permits only local, existing, low-risk smoke specs from the `safe_smoke` allowlist.
- The current pending `advanced-organization-analytics-mapper-validator-route-contract-tdd` task remains mapper, validator, route contract, and unit tests only; no e2e/browser/dev-server scope was added.

## Decision

- Approve `standingLocalE2ESmokeAllowlistApproval` as a guarded local smoke validation fact.
- Approve the initial `safe_smoke` allowlist:
  - `e2e/home.spec.ts`
  - `e2e/admin-role-denial-browser.spec.ts`
  - `e2e/local-auth-route-guard.spec.ts`
- Do not approve `npm test`, full-suite `npm.cmd run test:e2e`, `test:e2e:ui`, headed/debug mode, new specs, non-allowlisted specs, credentialed/data-write/provider/staging tier specs, route runtime wiring, schema/migration, provider/model calls, dependency changes, PR, force push, deploy, external service, payment, or Cost Calibration Gate execution.

## Evidence Integrity

- Evidence records structural task metadata, command names, allowlist spec names, and pass/fail outcomes only.
- No `.env*`, DB row/private data, provider payload, raw prompt, raw answer, secret value, token value, cookie value, DB URL value, Authorization header value, real public identifier list, screenshot, trace, HTML report content, or generated export/download artifact was exposed.

## Validation

- `git diff --check`: PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run typecheck`: PASS.
- `Select-String -Path docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/autodrive-control-schema.yaml,docs/04-agent-system/sop/local-first-validation-governance.md,docs/04-agent-system/sop/automated-advancement-governance.md -Pattern standingLocalE2ESmokeAllowlistApproval,localE2ESmokeTier,safe_smoke,e2e/home.spec.ts,e2e/admin-role-denial-browser.spec.ts,e2e/local-auth-route-guard.spec.ts`: PASS.
- `Select-String -Path docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/autodrive-control-schema.yaml,docs/04-agent-system/sop/local-first-validation-governance.md,docs/04-agent-system/sop/automated-advancement-governance.md -Pattern "npm test","full e2e","test:e2e:ui","headed/debug","Cost Calibration Gate"`: PASS.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: PASS.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standing-local-e2e-smoke-allowlist-authorization-upgrade`: PASS.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standing-local-e2e-smoke-allowlist-authorization-upgrade`: PASS.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId standing-local-e2e-smoke-allowlist-authorization-upgrade`: PASS.
