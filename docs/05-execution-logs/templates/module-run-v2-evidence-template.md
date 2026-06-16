# Evidence: @TASK_ID@

## Module Run V2 Anchors

- Task id: `@TASK_ID@`
- Branch: `@BRANCH_NAME@`
- Head at evidence creation: `@HEAD_SHA@`
- Evidence created at: `@CREATED_AT@`
- Task kind: pending.
- Batch range: @BATCH_RANGE@
- localFullLoopGate: pending.
- threadRolloverGate: pending.
- automationHandoffPolicy: pending.
- nextModuleRunCandidate: pending.
- nextTaskPolicy: intentionally_not_seeded
- nextTaskPolicyReason: pending until closeout identifies a valid next task or records why none is seeded.
- Cost Calibration Gate remains blocked.
- RED: pending.
- GREEN: pending.
- Commit: pending.
- result: pending

## Scope

Allowed files:

-

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`

## Implementation Summary

- Pending.

## Needs Recheck

- needs_recheck: false
- nextTaskPolicy: intentionally_not_seeded
- nextTaskPolicyReason: no needs_recheck recorded at evidence creation.

## Validation

```powershell
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `git diff --check`: pending.
- `npm.cmd run lint`: pending.
- `npm.cmd run typecheck`: pending.
- `Test-GitCompletionReadiness.ps1`: pending.

## Review

- Security review required: pending.
- Review result: pending.
- Accepted residual risk: pending.

## Git Closeout

- implementationCommit: pending.
- closeoutEvidenceCommit: pending.
- merge: pending.
- push: pending.
- cleanup: pending.

## Blocked Gates Preserved

- No product source implementation unless explicitly scoped by the task.
- No DB access or row/private data exposure.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload.
- No schema/migration/dependency/package/lockfile change unless explicitly approved by the task.
- No dev server, browser, Playwright, e2e, deploy, payment, external-service, PR, force-push, or Cost Calibration Gate.

## Taste Compliance Self-Check

- Standard API response: not applicable unless API code changed.
- Naming discipline: pending.
- Public ID boundary: pending.
- Layering: pending.
- Dependency isolation: pending.
- Schema and migration boundary: pending.
- Evidence before conclusion: pending.
