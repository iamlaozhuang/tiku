# Task Plan: batch-199 personal-learning-ai local UI/browser experience contract

## Scope

- Task: `batch-199-personal-learning-ai-local-ui-browser-experience-for-request-and`
- Profile: `local_unit_tdd`
- Target closure: local UI/browser experience for request and result reference where approved
- Actual execution boundary: server-side `local_contract_only` read-model; no Browser, Playwright, route, or UI execution.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `src/server/models/personal-ai-generation-local-browser-experience.ts`
- `src/server/contracts/personal-ai-generation-local-browser-experience-contract.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`

## TDD Plan

1. RED: require the local browser experience read model to carry the redacted paper/mock_exam `contextReferences` created by batch-198 in `requestState`.
2. GREEN: add the minimal contract and service mapping from `requestFlow.contextSelection.contextReferences`.
3. Verify focused local browser experience tests plus affected request-flow/context tests, lint, typecheck, diff check, and module closeout readiness.

## Guardrails

- No real Browser, Playwright, e2e, route, UI, provider/model, schema, Drizzle, migration, dependency, package, lockfile, env/secret, cloud, deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- Evidence must remain redacted and must not include raw prompts, raw answers, provider payloads, row data, private data, credentials, tokens, database URLs, Authorization headers, public identifier inventories, or full paper/mock_exam content.
