# AP-01 Provider Smoke Harness Token Cap Hardening Plan

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-harness-token-cap-hardening`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-token-cap-hardening`
- Created at: `2026-06-19T00:00:00-07:00`
- Task kind: `implementation_tdd`
- Goal: add an explicit output token cap to the local provider smoke runner before any future real provider spend.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- AI SDK local type declarations under `node_modules/ai/dist/index.d.ts` for `maxOutputTokens`.

## Scope

Allowed changed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-harness-token-cap-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-harness-token-cap-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-provider-smoke-harness-token-cap-hardening.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`

Blocked files and actions:

- `.env*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `playwright-report/**`
- `test-results/**`
- real provider/model call;
- provider configuration change;
- Cost Calibration Gate;
- staging/prod/cloud/deploy;
- payment/external-service;
- schema/migration/dependency change;
- PR, push, force push;
- raw sensitive evidence.

## Implementation Plan

- RED: add a focused unit test proving executed smoke calls include a fixed `maxOutputTokens` cap in the provider call
  config.
- GREEN: add a small constant for the smoke output token cap and include it in:
  - CLI config built by `buildCliConfig`;
  - dry-run evidence envelope;
  - real execution provider call config;
  - `generateText` options as `maxOutputTokens`.
- Keep request count at `1`, timeout unchanged, retry limit `0`, and evidence redaction unchanged.
- Do not add CLI configurability for the cap; a fixed small smoke cap is safer for the first real provider smoke.

## Validation Plan

- RED targeted unit test before implementation:
  - `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`
- GREEN targeted unit test after implementation:
  - `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`
- Run provider smoke dry-run commands only:
  - `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
  - `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- Run quality and mechanism gates:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `git diff --check`
  - scoped Prettier write/check
  - `Test-ModuleRunV2PreCommitHardening.ps1`
  - `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`

Cost Calibration Gate remains blocked.
