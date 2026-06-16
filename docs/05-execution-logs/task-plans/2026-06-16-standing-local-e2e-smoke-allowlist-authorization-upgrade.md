# Task Plan: Standing Local E2E Smoke Allowlist Authorization Upgrade

## Task

- Task id: `standing-local-e2e-smoke-allowlist-authorization-upgrade`
- Branch: `codex/standing-local-e2e-smoke-allowlist-authorization-upgrade`
- Date: 2026-06-16
- Scope: docs/state/SOP/schema authorization upgrade only.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`

## Local State

- Baseline branch before short-branch work: `master`.
- Work branch: `codex/standing-local-e2e-smoke-allowlist-authorization-upgrade`.
- Starting `HEAD == master == origin/master`: `dada2fd501cce99e72611abedc4d2da99b828ab1`.
- No local or remote `codex/*` branch residue was present before this branch was created.

## Implementation Plan

1. Add `standingLocalE2ESmokeAllowlistApproval` to `project-state.yaml`.
2. Add the initial `safe_smoke` allowlist:
   - `e2e/home.spec.ts`
   - `e2e/admin-role-denial-browser.spec.ts`
   - `e2e/local-auth-route-guard.spec.ts`
3. Keep credentialed, data-write/seed, provider/cost-sensitive, and staging-named spec tiers blocked without fresh task approval.
4. Update `local-first-validation-governance.md`, `automated-advancement-governance.md`, and `autodrive-control-schema.yaml` with the allowlist consumption rules.
5. Add this governance task to `task-queue.yaml` as a closed docs/state-only fast lane task with full closeout authorization.
6. Preserve the current pending `advanced-organization-analytics-mapper-validator-route-contract-tdd` task scope: mapper, validator, route contract, and unit tests only; no e2e/browser/dev-server scope.
7. Write redacted evidence and audit review.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `Select-String -Path docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/autodrive-control-schema.yaml,docs/04-agent-system/sop/local-first-validation-governance.md,docs/04-agent-system/sop/automated-advancement-governance.md -Pattern standingLocalE2ESmokeAllowlistApproval,localE2ESmokeTier,safe_smoke,e2e/home.spec.ts,e2e/admin-role-denial-browser.spec.ts,e2e/local-auth-route-guard.spec.ts`
- `Select-String -Path docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/autodrive-control-schema.yaml,docs/04-agent-system/sop/local-first-validation-governance.md,docs/04-agent-system/sop/automated-advancement-governance.md -Pattern "npm test","full e2e","test:e2e:ui","headed/debug","Cost Calibration Gate"`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standing-local-e2e-smoke-allowlist-authorization-upgrade`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standing-local-e2e-smoke-allowlist-authorization-upgrade`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId standing-local-e2e-smoke-allowlist-authorization-upgrade`

## Risk Controls

- No `.env*` access, output, summary, or modification.
- No e2e, Playwright, Browser, dev-server, headed/debug, or UI-mode execution in this governance task.
- No `npm test`, full `npm.cmd run test:e2e`, `npm.cmd run test:e2e:ui`, new spec, or non-allowlisted spec execution is authorized.
- No product source, product tests, scripts, schema, migration, package, lockfile, dependency, generated artifact, or env file changes.
- No staging/prod/cloud/deploy/payment/external-service access, provider/model call, provider configuration, quota/cost measurement, PR, force push, or Cost Calibration Gate execution.
- Evidence must not include secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads, raw prompts, raw answers, publicId lists, row data, private data, screenshots, traces, HTML report content, or generated export/download artifacts.
