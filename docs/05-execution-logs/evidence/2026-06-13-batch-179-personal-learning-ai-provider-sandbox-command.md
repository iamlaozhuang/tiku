# Evidence: batch-179-personal-learning-ai-provider-sandbox-command

result: pass

## Batch 179

- Task: `batch-179-personal-learning-ai-provider-sandbox-command`
- Branch: `codex/batch-179-personal-learning-ai-provider-sandbox-command`
- Baseline Commit: `d2ce90649be578990d85b8b91a41a80f11c016c9`
- Scope: add a local provider smoke sandbox command for future `batch-174` approval.

## Readiness Evidence

- Re-read required governing documents before edits:
  - `AGENTS.md`
  - `docs/03-standards/code-taste-ten-commandments.md`
  - `docs/02-architecture/adr/*.md`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - recent batch-172 and batch-173 evidence/audit
- Git baseline before edits:
  - current branch: `master`
  - `HEAD`: `d2ce90649be578990d85b8b91a41a80f11c016c9`
  - `master`: `d2ce90649be578990d85b8b91a41a80f11c016c9`
  - `origin/master`: `d2ce90649be578990d85b8b91a41a80f11c016c9`
  - worktree: clean
  - local/remote `codex/*`: no residual short branches found
- Pre-edit readiness command:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass; inventory showed branch `codex/batch-179-personal-learning-ai-provider-sandbox-command`, no changed files before edits, and base `origin/master`.

## Human Approval Boundary

- The user approved one small task to add a sandbox command before separately approving `batch-174` execution.
- Allowed: local sandbox command, focused unit tests, state/queue/task-plan/evidence/audit.
- Not allowed: real provider calls, model requests, quota use, reading `.env.local`, reading/writing real secrets/env/provider configuration, Cost Calibration, formal generated-content writes, schema/migration, e2e, package/lockfile changes, deploy, payment, external-service, PR creation, or force-push.

## RED:

- Initial test placement under `scripts/ai/*.test.mjs` was not discovered by the current Vitest include surface.
- Corrected the test to `tests/unit/run-personal-ai-provider-smoke.test.ts`.
- RED command:
  - `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`
  - Result: failed before implementation because `../../scripts/ai/run-personal-ai-provider-smoke.mjs` did not exist.

## GREEN:

- Added `scripts/ai/run-personal-ai-provider-smoke.mjs`.
- Added `tests/unit/run-personal-ai-provider-smoke.test.ts`.
- The CLI supports:
  - `--provider alibaba|openai_compatible`;
  - `--model <model>`;
  - `--env-key <approved-env-var-name>`;
  - `--max-requests 1`;
  - `--timeout-ms <1000..120000>`;
  - `--dry-run` as default-safe validation;
  - `--execute` only when `TIKU_PROVIDER_SMOKE_APPROVED=1`.
- Real execution reads only the named process env key after the explicit execution approval gate.
- The CLI does not load dotenv and does not read `.env.local`.
- Output is limited to standard `{ code, message, data }` evidence fields and excludes API keys, Authorization headers, tokens, database URLs, raw prompts, provider payloads, provider responses, and raw generated output.

## Exact Command Prepared For Future Batch-174 Approval

Dry-run validation command:

```powershell
node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run
```

Future real execution command template:

```powershell
$env:TIKU_PROVIDER_SMOKE_APPROVED='1'; node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model <approved-model> --env-key <approved-env-var-name> --max-requests 1 --timeout-ms <approved-timeout-ms> --execute
```

`batch-174` still requires fresh approval before the real command can be run.

## Changed Files

- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `git diff --check`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md docs/05-execution-logs/evidence/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md scripts/ai/run-personal-ai-provider-smoke.mjs tests/unit/run-personal-ai-provider-smoke.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`

## Validation Results

- `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`: pass; Vitest reported 1 test file and 6 tests passed.
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`: pass; returned `code: 0`, `providerCallExecuted: false`, `requestCount: 0`, `resultStatus: dry_run`, `redactionStatus: passed`.
- `npm.cmd run lint`: pass; `eslint` exited 0.
- `npm.cmd run typecheck`: pass; `tsc --noEmit` exited 0.
- `npm.cmd run test:unit`: pass; Vitest reported 251 test files and 926 tests passed.
- `git diff --check`: pass; no whitespace errors reported.
- Initial Module Run v2 hardening rerun exposed two governance issues and both were fixed before closeout:
  - `Test-ModuleRunV2PreCommitHardening.ps1`: failed on provider credential field naming that looked like secret assignment; fixed by avoiding secret-like assignment names in the local command implementation.
  - `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`: failed because strict evidence expected `RED:` and `GREEN:` headings; fixed evidence headings.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`: pass; scope scan approved all 7 changed files and found no sensitive evidence or terminology findings.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`: pass; evidence/audit anchors, RED/GREEN evidence, blocked remainder, threadRolloverGate, and nextModuleRunCandidate were accepted.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`: pass on the short branch; it will be re-run on `master` after fast-forward merge before push.
- `npm.cmd run build`: not run. The local Next.js build has previously reported loading `.env.local`, which conflicts with this task's explicit no real env/secret access boundary.

## Module Run v2 Gates

- `localFullLoopGate`: implementation loop limited to `scripts/ai`, one focused unit test, state/queue/task-plan/evidence/audit.
- `threadRolloverGate`: not required for this short task.
- `nextModuleRunCandidate`: `batch-174-personal-learning-ai-local-provider-sandbox-smoke` only after fresh approval explicitly names provider/model/exact command/request ceiling/spend or quota ceiling/timeout/redaction/stop conditions/env-secret boundary/evidence fields.
- Cost Calibration Gate remains blocked.

## Blocked Remainder

- Provider calls, model requests, quota use, local provider sandbox execution with real access, Cost Calibration, `.env.local`, real env/secret/provider configuration, schema/migration, e2e, package/lockfile changes, formal generated-content writes, staging/prod/cloud, deploy, payment, external-service, PR creation, and force-push remain blocked unless a later prompt grants task-specific fresh approval.

## Residual Risk

- Real provider behavior remains unvalidated until `batch-174` receives fresh approval and the prepared command is executed.
- Provider runtime package behavior may still fail during `batch-174`; evidence must remain sanitized and record only allowed fields.
- Cost Calibration, formal generated-content adoption implementation, and staging/deploy readiness remain blocked.
