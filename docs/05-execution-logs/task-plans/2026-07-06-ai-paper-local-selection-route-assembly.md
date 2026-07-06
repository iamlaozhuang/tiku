# 2026-07-06 AI Paper Local Selection Route Assembly Plan

## Task

- Task id: `ai-paper-local-selection-route-assembly-2026-07-06`
- Branch: `codex/ai-paper-local-selection-route-assembly-2026-07-06`
- Goal slice: connect parsed AI组卷 plan output to local formal question selection service at service layer.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Current package evidence for AI paper plan/select, source adapters, and route plan integration.

## Scope

Implement a pure service that accepts route-integrated AI组卷 visible plan output plus already resolved selectable question candidates, normalizes the plan into the plan-and-select contract, validates it, and invokes local formal-source selection.

Allowed implementation files:

- `src/server/services/ai-paper-route-assembly-service.ts`
- `src/server/services/ai-paper-route-assembly-service.test.ts`

Allowed governance files:

- this plan
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-06-ai-paper-local-selection-route-assembly.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-local-selection-route-assembly.md`

## Non-Scope

- No DB runtime, direct DB read, mutation, schema, migration, or seed.
- No Provider call, prompt execution, raw payload inspection, env/secret access, or Cost Calibration.
- No browser/dev-server/e2e/runtime acceptance.
- No staging/prod/deploy/PR/force push.
- No dependency, package, or lockfile change.
- No formal paper persistence or content-admin adoption runtime claim.

## TDD Plan

1. RED: add focused unit tests for route-visible AI组卷 plan assembly using synthetic redacted plan content and selectable question candidates.
2. GREEN: implement minimal pure service to parse, normalize, validate, and assemble.
3. Refactor only after all focused tests pass.

## Acceptance

- Parsed plan content can assemble a personal advanced student paper from platform formal candidates.
- Organization advanced role can assemble from platform and same-organization enterprise snapshot candidates.
- Failed structured preview or Provider-generated nested question content is rejected with a safe failure category before selection.
- Insufficient formal sources return the selector's insufficiency result instead of inventing questions.
- Existing AI出题 and route-integrated Provider contract tests remain green.

## Evidence Rules

Evidence records only file paths, command names, pass/fail status, role labels, source categories, aggregate counts, and safe failure categories. It must not record credentials, sessions, cookies, tokens, env values, DB URLs, DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question, full paper, material, resource, chunk content, DOM, screenshots, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.
