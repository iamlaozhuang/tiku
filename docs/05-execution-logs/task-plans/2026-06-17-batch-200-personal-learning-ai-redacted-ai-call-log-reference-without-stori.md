# Task Plan: batch-200 personal-learning-ai redacted ai_call_log reference

## Scope

- Task: `batch-200-personal-learning-ai-redacted-ai-call-log-reference-without-stori`
- Profile: `local_unit_tdd`
- Target closure: redacted ai_call_log reference without storing raw generated AI content
- Allowed implementation surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `src/server/models/personal-ai-generation-ai-call-log-reference.ts`
- `src/server/contracts/personal-ai-generation-ai-call-log-reference-contract.ts`
- `src/server/validators/personal-ai-generation-ai-call-log-reference.ts`
- `src/server/services/personal-ai-generation-ai-call-log-reference-service.ts`
- `src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts`

## TDD Plan

1. RED: add focused unit coverage proving failed ai_call_log references do not echo caller-supplied generated result metadata.
2. GREEN: sanitize result reference metadata to `null`/`none`/`0` unless the generation task succeeded or is reusing a valid non-failed result state.
3. Verify focused ai_call_log reference tests, affected result/local browser request tests where relevant, lint, typecheck, diff check, and module closeout readiness.

## Guardrails

- No provider/model calls.
- No `.env*` read, output, or edit.
- No schema, Drizzle, migration, dependency, package, or lockfile changes.
- No Browser, Playwright, staging, production, cloud, deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- Evidence must remain redacted and must not include raw prompts, raw answers, provider payloads, row data, private data, credentials, tokens, database URLs, Authorization headers, public identifier inventories, or full paper/mock_exam content.
