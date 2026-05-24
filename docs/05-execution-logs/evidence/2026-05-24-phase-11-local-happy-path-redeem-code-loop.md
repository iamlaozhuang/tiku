# Evidence: phase-11-local-happy-path-redeem-code-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-local-happy-path-redeem-code-loop`
- Goal: make the local `redeem_code` happy path discoverable and closed enough for manual student validation.

## Boundary

- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No provider call.
- No secret/env change.
- No plaintext redeem_code value recorded.

## Validation Results

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-redeem-code-loop`: passed before the task was moved from `pending` to `in_progress`.
- Focused TDD RED:
  - `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
  - Expected failures confirmed missing student card-source readiness copy and admin plaintext-unavailable copy.
- Focused TDD GREEN:
  - `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
  - Passed: 3 files, 13 tests.
- Browser smoke:
  - Opened `http://localhost:3000/profile` in the in-app browser.
  - Result: page rendered successfully and unauthenticated state exposed a login path.
  - Login-state card-source notice was verified by focused unit tests to avoid reading or outputting credentials, tokens, or plaintext card values.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: passed.
  - lint passed.
  - typecheck passed.
  - unit tests passed: 107 files, 395 tests.
  - format:check passed.
- Closeout rerun after marking the task closed:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: inventory completed; all uncommitted files belonged to this task.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: passed.
    - lint passed.
    - typecheck passed.
    - unit tests passed: 107 files, 395 tests.
    - format:check passed.

## Root Cause

- Local dev seed has no fresh, usable plaintext `redeem_code` path available under the approved boundaries:
  - the seeded student already has personal authorization;
  - the seeded card row is not a fresh unused card for a new student flow;
  - admin runtime returns masked card display only and marks plaintext viewing unavailable.
- The student UI exposed a redemption form but did not clearly explain that a usable card must come from system ops.
- The admin redeem-code UI exposed a generation entry and masked card list but did not clearly explain that the current list cannot be used as a student-facing plaintext card source.

## Fix Summary

- Added a student-side preparation notice when no personal authorization exists:
  - status: `等待卡密`;
  - reason: `卡密来源未配置`;
  - action guidance: use an unused card provided by system ops.
- Added an admin-side masked-card notice when unused cards are present but plaintext viewing is unavailable:
  - status: `卡密明文不可用`;
  - guidance: a controlled generation flow must provide one-time card values before student redemption can be validated.
- Added focused unit assertions for both states.
- No plaintext card value was introduced or recorded.
- No runtime contract, persistence model, seed, script, dependency, schema, migration, env, cloud, deployment, staging, or prod change was made.

## Staging Decision

- `stagingDecision`: `blocked_for_redeem_code_generation_source`
- Rationale: the local UI now makes the blocked card-source state explicit, but a true student redemption happy path still needs an approved controlled card generation or local seed/fixture task. That future task is outside this task's allowed boundary because it affects seed/generation/security behavior.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, plaintext redeem_code values, and customer/private data.
