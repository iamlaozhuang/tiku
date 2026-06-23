# Acceptance Role Separated Account Test Fixture Runtime Run Plan

taskId: acceptance-role-separated-account-test-fixture-runtime-run-2026-06-23
status: closed
createdAt: "2026-06-23T06:15:14-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_TEST_FIXTURE_SINGLE_SPEC_RUNTIME_2026_06_23

## Purpose

Run only the approved single Playwright spec for the role-separated test-only fixture supplement and record redacted
runtime evidence. This task must not run the full e2e suite, any other spec, headed/debug mode, account actions,
database work, Provider work, Cost Calibration, staging, or final acceptance.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-test-fixture-supplement.md`

## Approved Scope

- Approval id: `ROLE_SEPARATED_TEST_FIXTURE_SINGLE_SPEC_RUNTIME_2026_06_23`.
- Primary allowed runtime command:

```powershell
npm.cmd run test:e2e -- e2e/role-separated-account-fixture-supplement.spec.ts
```

- If the local app is already listening on `127.0.0.1:3000`, retry may use the existing project opt-in while still
  running only the same spec:

```powershell
$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/role-separated-account-fixture-supplement.spec.ts
```

## Evidence Boundary

Record only command name, spec path, pass/fail status, and test count. Do not record screenshots, traces, HTML report
content, page text dumps, credentials, passwords, tokens, cookies, local storage, env values, database URLs, raw database
rows, Provider payloads, raw prompts, raw answers, or full paper/material content.

## Validation Plan

- `npm.cmd run test:e2e -- e2e/role-separated-account-fixture-supplement.spec.ts`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-test-fixture-runtime-run-2026-06-23`

## Validation Result

Single-spec runtime passed with 6 tests. The first primary command attempt was blocked by the existing local
`127.0.0.1:3000` listener before tests started; the retry used the explicit existing-server opt-in and still ran only
`e2e/role-separated-account-fixture-supplement.spec.ts`.
