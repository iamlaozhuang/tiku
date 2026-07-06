# 2026-07-06 Provider-Enabled Small-Sample Failure Root-Cause Audit Plan

## Scope

- Task id: `provider-enabled-small-sample-failure-root-cause-audit-2026-07-06`
- Branch: `codex/provider-enabled-small-sample-failure-root-cause-audit-2026-07-06`
- Base: `master` / `origin/master` at `82414a8c7`
- User approval: current user approved this local Provider-enabled small-sample failure root-cause audit, merge, push, and cleanup on 2026-07-06.

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
- Latest 2026-07-06 Provider-disabled, admin observability, no-Provider grounding, AI runtime acceptance, and residual decision evidence.

## Boundary

- Local only.
- Provider-enabled is limited to one small-sample runtime bridge probe if local credential and grounding are available.
- No Cost Calibration, cost measurement, staging, production, deploy, env/secret mutation, dependency change, schema/migration, destructive DB operation, screenshot, DOM dump, or raw Provider artifact capture.
- Do not record credential values, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, complete question/paper/material/resource/chunk content, sessions, cookies, tokens, headers, or private fixture values.

## Method

1. Run source health gates: lint, typecheck, and focused unit tests for admin AI generation runtime bridge / route contract.
2. Add a temporary ignored Vitest probe under `.runtime/` using `apply_patch`.
3. Probe existing `createOwnerPreviewQwenAdminRuntimeBridgeControl()` and `executeAdminAiGenerationRouteIntegratedProvider()` with a content-admin question generation request using 0704 local grounding parameters.
4. Print only a redacted aggregate summary:
   - local runner enabled or blocked;
   - credential present boolean only;
   - grounding `evidenceStatus` and citation count only;
   - Provider call executed boolean;
   - result status, failure category, sanitized Provider HTTP status/error code if available;
   - structured preview parse status and count if a pass occurs;
   - `costCalibrationExecuted=false`.
5. Remove the temporary probe before committing.
6. Write redacted evidence and adversarial audit review.
7. Update state/queue metadata for this docs-only audit.
8. Commit, fast-forward merge to `master`, run closeout gates, push `origin/master`, and delete the short branch.

## Risk Controls

- If credential is absent, network/provider fails, grounding is insufficient, or Provider returns an external error, record a blocked/partial root cause without bypassing the boundary.
- If a current source defect is proven, stop this audit and open a separate fix branch; do not mix fix code into this audit branch.
- Old evidence is baseline only; this task records fresh local root-cause evidence and does not claim Provider-enabled success unless the fresh probe actually succeeds.
