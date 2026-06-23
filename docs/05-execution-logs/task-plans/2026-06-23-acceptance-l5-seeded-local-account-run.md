# Acceptance L5 Seeded Local Account Run Plan

taskId: acceptance-l5-seeded-local-account-run-2026-06-23
status: closed
createdAt: "2026-06-23T00:22:02-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalPackageId: L5_SEEDED_LOCAL_ACCOUNT_SCOPE_2026_06_23

## Human Approval Boundary

Laozhuang approved `L5_SEEDED_LOCAL_ACCOUNT_SCOPE_2026_06_23`.

This task may execute only the package-scoped local dev run:

- allowed: reuse `http://127.0.0.1:3000` or `http://localhost:3000`;
- allowed: run the existing local dev seed script `scripts/db/Seed-DevDatabase.ps1`;
- allowed: run only the listed existing Playwright specs;
- allowed: record command status, test counts, role labels, and redacted coverage conclusions;
- blocked: `.env*` reading or output, schema migration, `drizzle-kit push`, destructive database reset/drop/truncate,
  source/test/script/package changes, Provider/model calls, Provider configuration, Cost Calibration, staging/prod/cloud,
  payment, external services, push, PR, force push, and final acceptance Pass claims.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-l5-seeded-local-account-scope-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-seeded-local-account-scope-approval.md`
- `package.json`
- `playwright.config.ts`
- `scripts/db/Seed-DevDatabase.ps1`
- existing target specs under `e2e/**`

## Execution Plan

1. Confirm local target is listening on port 3000 and responds to HTTP HEAD at `http://127.0.0.1:3000`.
2. Run `npm.cmd run test:e2e -- --list` to confirm the local Playwright inventory without running the full suite.
3. Run `scripts/db/Seed-DevDatabase.ps1` and record only pass/fail plus redacted synthetic-data summary.
4. Run `e2e/edition-aware-authorization-db-backed-local-flow.spec.ts` with the existing server reused.
5. Run `e2e/organization-training-local-full-flow.spec.ts` with the existing server reused.
6. Run `e2e/role-based-acceptance/role-based-full-flow.spec.ts` with the existing server reused.
7. Run `e2e/validation-data-prep.spec.ts` only if the role-based full flow does not provide enough redacted audit or
   AI call log evidence.
8. Write evidence and audit review with a plain-language role matrix and explicit residual gaps.
9. Run scoped formatting and hardening gates, then commit this task as a single focused commit if validation passes.

## Expected Coverage Classification

| Scenario                              | Expected evidence type                                                  | Expected decision label                                    |
| ------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| Personal standard edition             | DB-backed `personal_auth` and local browser/API checks                  | local DB-backed pass if spec passes                        |
| Personal advanced edition             | DB-backed advanced authorization context                                | local DB-backed pass if spec passes                        |
| Personal standard to advanced upgrade | DB-backed `auth_upgrade` context                                        | local DB-backed pass if spec passes                        |
| Enterprise standard authorization     | DB-backed `org_auth` context                                            | local DB-backed pass if spec passes                        |
| Enterprise advanced authorization     | DB-backed advanced `org_auth` context                                   | local DB-backed pass if spec passes                        |
| Enterprise employee flow              | Dynamic local employee account and training flow                        | local role flow pass if spec passes                        |
| Content operations                    | Local content readiness flow                                            | partial unless dedicated `content_admin` account is proven |
| System operations                     | Local user, organization, `redeem_code`, and `authorization` operations | partial unless dedicated `ops_admin` account is proven     |
| Auditor / oversight                   | Redacted `audit_log` and `ai_call_log` read evidence                    | partial unless dedicated auditor account is proven         |

## Risk Controls

- Do not open, copy, summarize, or output `.env*`.
- Do not record seeded account passwords, tokens, cookies, Authorization headers, local storage, database URLs, raw DB
  rows, plaintext `redeem_code`, raw prompts, raw answers, raw AI output, full `paper`, or full `material` content.
- Treat local seed as synthetic local dev evidence only; do not infer staging, prod, Provider, payment, or Cost
  Calibration readiness.
- If any approved command requires schema migration, destructive database operation, Provider setup, env/secret review,
  dependency change, or non-local resource access, stop and record the blocker.
- If dedicated role-separated accounts are required for `content_admin`, `ops_admin`, enterprise admins, or auditor,
  record the gap rather than claiming formal L5 closure from `super_admin` or dynamic accounts.

## Validation Commands

- `Get-NetTCPConnection -LocalPort 3000 -State Listen`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000 -Method Head`
- `npm.cmd run test:e2e -- --list`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/edition-aware-authorization-db-backed-local-flow.spec.ts`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- conditional: `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/validation-data-prep.spec.ts`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l5-seeded-local-account-run-2026-06-23`
