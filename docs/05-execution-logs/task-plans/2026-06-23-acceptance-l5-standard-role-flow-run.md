# Acceptance L5 Standard Role Flow Run Task Plan

## Task

- taskId: `acceptance-l5-standard-role-flow-run-2026-06-23`
- branch: `codex/runtime-blocker-evidence-batch-20260623`
- task kind: `acceptance_local_runtime_role_flow`
- batchId: `standard-advanced-mvp-runtime-blocker-evidence-batch-2026-06-23`
- approval package: `L5_LOCAL_BROWSER_RUNTIME_SCOPE_2026_06_23`
- fresh approval: user approved `批准 L5_LOCAL_BROWSER_RUNTIME_SCOPE_2026_06_23` in this thread.

## Documents And Source Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/05-execution-logs/acceptance/2026-06-23-runtime-blocker-evidence-batch-plan.md`
- `docs/05-execution-logs/acceptance/2026-06-23-l5-browser-runtime-scope-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-final-decision-review.md`
- `package.json`
- `playwright.config.ts`
- `e2e/home.spec.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/admin-role-denial-browser.spec.ts`
- relevant local route entrypoints under `src/app/(auth)`, `src/app/(student)`, and `src/app/(admin)`.

## Scope

Allowed in this task:

- Start or reuse a local dev server through the existing project script only.
- Use local browser targets only: `http://127.0.0.1:3000` or `http://localhost:3000`.
- Use the in-app browser for local-only walkthrough.
- Run `npm.cmd run test:e2e -- --list`.
- Run existing safe smoke specs:
  - `e2e/home.spec.ts`
  - `e2e/local-auth-route-guard.spec.ts`
  - `e2e/admin-role-denial-browser.spec.ts`
- Record redacted Standard MVP L5 evidence.

Blocked in this task:

- Provider/model calls or Provider configuration.
- Cost Calibration Gate.
- staging/prod/cloud deploy or non-local URLs.
- env/secret access or `.env*` reads/writes.
- schema, migration, seed, database reset, destructive DB work, or data creation.
- dependency/package/lockfile changes.
- payment/external-service work.
- PR or force-push.
- formal acceptance Pass, preview readiness, staging readiness, release readiness, or production readiness claims.

## Execution Approach

1. Materialize the approval in `task-queue.yaml` and keep the task on the existing runtime blocker branch.
2. Run only the approved local e2e list and safe smoke specs.
3. Use the in-app browser against the local URL for a bounded Standard MVP walkthrough:
   - root navigation and login visibility;
   - unauthenticated protected-route redirect;
   - available Standard role surfaces only when they do not require credentials handled by Codex.
4. If student/admin credentials or accounts are unavailable, record the affected role rows as blocked by local account or credential availability instead of creating accounts or touching secrets.
5. Record evidence as summaries only: role label, route family, expected result, actual bounded state, result, command result, and residual gap.

## Risk Defenses

- No screenshots, traces, HTML reports, page dumps, local storage dumps, raw payloads, credentials, tokens, database URLs, Authorization headers, raw prompts, raw AI outputs, full paper/material content, raw answers, or plaintext `redeem_code` values will be committed.
- Any non-local URL, secret exposure risk, Provider/staging/DB/dependency requirement, or unredactable evidence condition stops the task.
- Local-only evidence will not be used to claim staging, production, Provider, Cost Calibration, or release readiness.

## Validation Commands

- `npm.cmd run test:e2e -- --list`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/home.spec.ts`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/admin-role-denial-browser.spec.ts`
- `npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-l5-standard-role-flow-run.md docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-standard-role-flow-run.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-standard-role-flow-run.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l5-standard-role-flow-run-2026-06-23`

## Evidence And Audit

- evidence path: `docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-standard-role-flow-run.md`
- audit review path: `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-standard-role-flow-run.md`

## Stop Conditions

Stop if the task requires Provider, env/secret, staging/prod/cloud, database/schema/migration/seed, dependency, payment/external-service, non-local URL, account creation/recovery, unredactable evidence, or a release/Pass claim.
