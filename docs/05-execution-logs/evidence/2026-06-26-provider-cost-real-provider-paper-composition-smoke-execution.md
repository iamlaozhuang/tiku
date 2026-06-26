# Provider Cost real Provider paper composition smoke execution evidence

Task id: `provider-cost-real-provider-paper-composition-smoke-execution-2026-06-26`

## Scope

- Branch: `codex/provider-cost-paper-composition-smoke-20260626`
- Task kind: `local_provider_paper_composition_smoke`
- Approval consumed: current user fresh approval for one local real Provider paper composition smoke.
- Provider/model: `alibaba-qwen` / `qwen3.7-max`.
- Credential alias: `ALIBABA_API_KEY`.
- Provider call cap: 1.
- Provider retry cap: 0.
- Token cap: 2000 total.
- Budget cap: USD 1.00.

## Requirement Mapping Result

Passed for the approved local boundary. The task executed governed content admin AI `paper` generation through one real
Provider route-integrated runner call, then executed draft-only formal `paper` adoption and composition.

This result does not map to publish, student-visible content, staging/prod readiness, release readiness, or final Pass.

## Planned Boundary

- Content admin workflow: `content_ai_paper_generation`.
- Formal adoption target: draft-only formal `paper`.
- Companion question draft cap: 1.
- `paper_section` cap: 1.
- `paper_question` cap: 1.
- Cost Calibration execution: false.
- Formal publish/student-visible content: false.
- Staging/prod/payment/external-service/deployment/release readiness/final Pass: false.

## Validation Results

### Focused Unit Baseline

- Command:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- Result: `PASS` before Provider smoke.
- Coverage of this command: runtime bridge contract, formal draft adapter contract, formal adoption runtime route
  contract.

### Real Provider Paper Composition Smoke

- Command:
  `node_modules\.bin\tsx.cmd .\.codex-tmp-provider-paper-composition-smoke.ts`
- Transient harness status: created for execution and removed immediately after execution.
- Result: `PASS`.
- Actor preflight: local admin actor state `present`; actor public id not recorded.
- Provider/model: `alibaba-qwen` / `qwen3.7-max`.
- Provider compatibility mode: `openai_compatible`.
- Credential alias read: `ALIBABA_API_KEY`.
- Credential value printed or persisted: `false`.
- Provider call count: `1`.
- Provider retry attempted: `false`.
- Provider result status: `pass`.
- Provider failure category: `null`.
- Provider duration: `10967 ms`.
- Provider usage summary:
  - `inputTokens`: `27`
  - `outputTokens`: `552`
  - `totalTokens`: `579`
  - `reasoningTokens`: `547`
  - `cachedInputTokens`: `0`
- Token cap: `2000`.
- Token cap exceeded: `false`.
- Cost Calibration executed: `false`.
- Budget cap: `USD 1.00`; no pricing calibration or charge assertion was performed.
- Content setup POST count: `1`.
- Formal adoption POST count: `1`.
- Formal adoption response code: `0`.
- Formal target write status: `draft_created`.
- Formal `paper` public-id state: `present`.
- Formal `question` target public-id state in adoption metadata: `missing`, because the target type is `paper`; the
  companion question draft was created and attached through `paper_question`.
- Paper composition status: `composed`.
- Companion `question` draft count: `1`.
- `paper_section` count: `1`.
- `paper_question` count: `1`.
- Publish executed: `false`.
- Student-visible content executed: `false`.
- Staging/prod touched: `false`.
- Payment touched: `false`.
- Deployment/release readiness touched: `false`.
- Final Pass claimed: `false`.

### Post-Smoke Validation

- Command:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- Result: `PASS`, 3 files, 16 tests.
- Command:
  `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- Result: `PASS`, all matched files unchanged after write.
- Command:
  `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- Result: `PASS`.
- Command: `git diff --check`.
- Result: `PASS`.
- Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-cost-real-provider-paper-composition-smoke-execution-2026-06-26`
- Result: `PASS`; scope scan matched 5 task files.
- Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId provider-cost-real-provider-paper-composition-smoke-execution-2026-06-26 -SkipRemoteAheadCheck`
- Result: `PASS`; master, origin/master, and state SHAs matched
  `02f4b757c72c93888a74c28167124dbc706da11f` at validation time.

## Redaction Statement

Evidence must not include raw prompt, raw model output, raw Provider payload, raw generated result body, raw reviewed
draft, full formal `paper`/`question`/`paper_section`/`paper_question` content, raw DB row, internal numeric id, DB URL,
API key, token, cookie, Authorization header, `.env*` value, credential, payment data, or external-service payload.

## Interim Status

Status: `PASS_REAL_PROVIDER_PAPER_COMPOSITION_SMOKE_DRAFT_ONLY_NO_PUBLISH_NO_FINAL_PASS`.
