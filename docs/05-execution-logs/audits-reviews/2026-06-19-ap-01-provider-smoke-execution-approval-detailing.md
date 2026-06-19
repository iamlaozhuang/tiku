# AP-01 Provider Smoke Execution Approval Detailing Audit Review

## Review Decision

APPROVE DETAILING, KEEP EXECUTION BLOCKED.

AP-01 now has a more precise provider smoke approval boundary for `UC-STD-AI-SCORING-EXPLANATION`. This packet does not
authorize provider or model execution.

## Scope Review

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution-approval-detailing`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Scope: docs/state/governance approval detailing only.

## State Review

- Task queue status is `closed` for the detailing task.
- The AP-01 matrix row remains `release_blocked`.
- `freshEvidence` points to the new detailing evidence.
- No `experience_closed`, staging readiness, production readiness, or cost calibration claim is made.

## Provider/Model Review

- DeepSeek is scoped to `openai_compatible`, `deepseek`, `https://api.deepseek.com`, env key alias
  `DEEPSEEK_API_KEY`, and model `deepseek-v4-flash`.
- Qwen is scoped to `alibaba`, env key alias `ALIBABA_API_KEY`, and model `qwen-plus`.
- The old DeepSeek compatibility alias is not used for the new approval template.

## Execution Boundary Review

- First execution route is direct `scripts/ai/run-personal-ai-provider-smoke.mjs`.
- `.env.local` reading is not approved.
- Application route execution, DB writes, provider configuration changes, model config changes, and source/test changes
  are not approved.
- Max request count, timeout, retry limit, and spend ceiling are stated.
- The residual output-token-cap gap is recorded as a possible pre-execution hardening task.

## Blocked Capability Review

The following remain blocked:

- provider/model call;
- provider configuration change;
- `.env*` and secret/env access or output;
- staging/prod/cloud/deploy;
- payment/external-service;
- Cost Calibration Gate;
- schema/drizzle/migration;
- package/lockfile/dependency;
- product source and test source changes;
- e2e changes;
- PR, push, and force push;
- destructive database operation;
- raw sensitive evidence.

## Validation Review

Validation is recorded in
`docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`.

Current completed checks:

- DeepSeek smoke runner dry-run: pass, no provider call;
- Qwen smoke runner dry-run: pass, no provider call;
- provider key capability gate declare-adapter: pass, no execution;
- provider call capability gate declare-adapter: pass, no execution;
- focused smoke runner unit tests: pass, 2 files, 7 tests;
- scoped Prettier write/check: pass;
- `git diff --check`: pass;
- `npm.cmd run lint`: pass;
- `npm.cmd run typecheck`: pass;
- `Test-ModuleRunV2PreCommitHardening.ps1`: pass;
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`: pass.

## Residual Risk

AP-01 cannot proceed to execution until the human provides task-specific fresh approval with the exact provider targets,
approved command or commands, request count, spend ceiling, timeout, retry limit, rollback, and redaction boundary.

Cost Calibration Gate remains blocked unless separately approved.
