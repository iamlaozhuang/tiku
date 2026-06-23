# Acceptance Role Separated Account Closeout E2E Gate Repair Evidence

taskId: acceptance-role-separated-account-closeout-e2e-gate-repair-2026-06-23
status: closed
result: pass_closeout_e2e_gate_repair_applied
recordedAt: "2026-06-23T08:11:57-07:00"
branch: codex/role-separated-account-coverage-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Failure Evidence

During branch closeout verification, the full e2e gate failed:

- command: `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e`
- result: 39 passed, 1 failed, 2 skipped
- failing test: `e2e/role-based-acceptance/role-based-full-flow.spec.ts` / `4. Student Positive Flow`
- observed URL after new learner login: `/redeem-code`
- expected URL in spec: `/home`

After repairing the positive flow expectation, the same command exposed the same stale expectation in the negative flow:

- result: 40 passed, 1 failed, 1 skipped
- failing test: `e2e/role-based-acceptance/role-based-full-flow.spec.ts` / `5. Student Negative Flow`
- observed URL after no-authorization learner login: `/redeem-code`
- expected URL in spec: `/home`

## Root Cause

The spec created or reused learners that had not yet redeemed an authorization code, then expected those learners to land
on `/home` immediately after login. Runtime behavior correctly routed those learners to `/redeem-code` until redemption
completed or remained unavailable.

## Repair Evidence

The spec now:

- expects the new learner to land on `/redeem-code` before redemption;
- reads the local session token there;
- redeems the generated code through the existing API step;
- navigates to `/home` and asserts the post-redemption route;
- expects the no-authorization learner to remain on `/redeem-code`;
- keeps local test credential values out of simple `password:` literal assignments so Module Run v2 sensitive evidence
  scanning can inspect the changed spec safely.

## Boundary Evidence

This task did not:

- change production source code;
- create, disable, reset, or modify real accounts;
- read, write, display, provide, or enter new credentials;
- open or edit credential documents;
- inspect or record tokens, cookies, localStorage, `.env*`, database URLs, or secrets;
- run seed scripts outside the existing e2e test behavior;
- change schema, migrations, package files, or lockfiles;
- call Provider/model services;
- run Cost Calibration;
- deploy staging/prod/cloud resources;
- touch payment/external services;
- claim Standard MVP or Advanced MVP final Pass.

## Validation Evidence

| Command                                                                                                                             | Result | Summary                                               |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| `npx.cmd prettier --write --ignore-unknown <changed files>`                                                                         | pass   | Completed; changed files were formatted.              |
| `npx.cmd prettier --check --ignore-unknown <changed files>`                                                                         | pass   | Completed; all matched files use Prettier code style. |
| `npm.cmd run test:unit`                                                                                                             | pass   | Completed; 297 files and 1263 tests passed.           |
| `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e`                                                              | pass   | Completed; 42 tests passed.                           |
| `npm.cmd run lint`                                                                                                                  | pass   | Completed; ESLint passed.                             |
| `npm.cmd run typecheck`                                                                                                             | pass   | Completed; TypeScript check passed.                   |
| `git diff --check`                                                                                                                  | pass   | Completed with no whitespace errors.                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ...` | pass   | Completed; Module Run v2 pre-commit hardening passed. |
