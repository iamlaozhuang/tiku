# 2026-07-06 Provider Count Timeout Observability Audit Plan

## Scope

- Task id: `provider-count-timeout-observability-audit-2026-07-06`
- Branch: `codex/provider-count-timeout-observability-audit-2026-07-06`
- Base: `master` / `origin/master` at `8175c5987`
- User approval: current user requested an independent short branch for this local bounded Provider count/timeout observability audit on 2026-07-06.

## Read Gate

Read before execution:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- Latest 2026-07-06 learner, organization, content-admin, runtime acceptance, personal standard fixture, Provider-disabled replay, Provider-enabled root-cause audit, residual decision, and queue slimming evidence.

## Boundary

- Local only.
- Provider-enabled execution is limited to bounded content-admin owner-preview comparison probes.
- No Cost Calibration, cost measurement, staging, production, deploy, env/secret mutation, dependency change, schema/migration, seed, destructive DB operation, screenshot, DOM dump, or raw Provider artifact capture.
- Do not record credential values, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, complete question/paper/material/resource/chunk content, sessions, cookies, tokens, headers, or private fixture values.
- If a code defect is proven, stop and open a separate fix branch instead of mixing source fixes into this audit branch.
- Merge, push, and branch cleanup are not approved by this task plan; they require fresh approval.

## Method

1. Run source health gates: lint, typecheck, and focused unit tests for admin AI generation runtime bridge / route contract.
2. Add a temporary probe file and remove it before commit.
3. Use the real local owner-preview Provider bridge with Next development env semantics.
4. Compare content-admin AI question generation request counts:
   - tiny count `1`, matching the known 0704 bounded success shape;
   - default frontend-equivalent count `10`, matching the latest failure shape.
5. Record only aggregate fields:
   - request label and requested count;
   - grounding `evidenceStatus` and citation count;
   - credential-present boolean;
   - Provider call executed boolean;
   - result status and sanitized failure category;
   - duration bucket;
   - structured preview kind and parsed count if a pass occurs;
   - cost calibration executed false.
6. Classify the result as count-sensitive, timeout-like, provider/network blocked, or inconclusive.
7. Write redacted evidence and adversarial audit review.
8. Update state/queue metadata and run commit gates.

## Risk Controls

- Stop after the bounded comparison set; do not retry into a cost or latency measurement loop.
- If credentials are absent, grounding is insufficient, the network/provider fails, or the Provider returns an external error, record the blocked reason without bypassing the boundary.
- Old evidence is baseline only; this task records fresh local observations and does not claim release readiness, production usability, staging readiness, or Cost Calibration.
