# Acceptance Role Separated Account Closeout E2E Gate Repair Plan

taskId: acceptance-role-separated-account-closeout-e2e-gate-repair-2026-06-23
status: closed
createdAt: "2026-06-23T08:11:57-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Purpose

Unblock branch closeout after the full e2e gate exposed a pre-existing role-based acceptance spec mismatch.

The failing spec creates a new learner, logs in before redeeming a card code, and expected `/home`. Current product
behavior correctly sends a learner without authorization to `/redeem-code`. The test should read the session on
`/redeem-code`, redeem the generated code, and then assert `/home`.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`

## Red-Green Evidence

RED was observed during closeout verification:

- command: `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e`
- result: failed in `4. Student Positive Flow`
- root cause: the test expected `/home` before redeeming authorization, while runtime correctly redirected the new
  learner to `/redeem-code`.

## Allowed Change

- Update only the failing e2e spec and this task's docs/state evidence.
- Keep production code unchanged.
- Avoid writing passwords or secrets into evidence.
- Keep Provider, Cost Calibration, staging/prod, payment, account provisioning, and final acceptance gates blocked.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run test:unit`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-closeout-e2e-gate-repair-2026-06-23`

## Validation Result

The e2e gate repair is validated. The final rerun completed with 42 e2e tests passed, 297 unit test files passed, 1263
unit tests passed, ESLint passed, TypeScript check passed, Prettier check passed, whitespace check passed, and Module Run
v2 pre-commit hardening passed.
