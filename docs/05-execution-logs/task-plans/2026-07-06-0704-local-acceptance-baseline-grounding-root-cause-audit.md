# 2026-07-06 0704 Local Acceptance Baseline Inventory And Grounding Root-Cause Audit Plan

- Task id: `0704-local-acceptance-baseline-grounding-root-cause-audit-2026-07-06`
- Branch: `codex/0704-baseline-grounding-audit-2026-07-06`
- Mode: local-only docs/evidence/state audit.
- Non-scope: source repair, dependency change, env/secret change, Provider call, browser rerun, staging/prod/deploy, Cost Calibration, destructive DB operation, release readiness, production usability.

## Read Gate

Required recovery and requirement files to read before conclusion:

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
- Latest `2026-07-06` local adversarial recheck, runtime acceptance, learner, organization, content admin, personal standard fixture, residual decision, and active queue evidence.

## Audit Strategy

Use反证优先:

1. Compare the earlier `2026-07-06` runtime acceptance pass evidence with the later local adversarial recheck partial/blocked evidence.
2. Trace fresh Provider gating from request to grounding resolver to decide whether failure is a code defect or expected safety block.
3. Inventory only aggregate local material state: `.runtime/uploads`, local resource catalog presence, 0704 DB aggregate counts, and private fixture pack shape.
4. Avoid opening or recording raw content, ids, credentials, env values, provider payloads, prompts, AI output, DB rows, screenshots, DOM, or private fixture values.
5. If source defect is not proven, do not create a fix branch and do not modify source.

## Planned Checks

- Git/context: branch, base commit relationship, current local docs baseline.
- Source mechanism read-only trace:
  - default upload storage root
  - local resource catalog lookup
  - route-integrated grounding sufficiency gate
  - Provider credential/call ordering after grounding
- Local artifact inventory:
  - `.runtime/uploads` presence and aggregate file count
  - local resource catalog presence
  - private 0704 pack aggregate presence/counts only
- 0704 DB aggregate inventory:
  - local target label check
  - `resource` table aggregate counts
  - AI generation task/result aggregate evidence status and citation counts
  - Provider metadata aggregate status counts

## Validation

Run after docs/state updates:

- Scoped Prettier check for changed docs/state.
- `git diff --check`.
- `Get-TikuNextAction.ps1`.
- `Get-TikuProjectStatus.ps1`.
- `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-local-acceptance-baseline-grounding-root-cause-audit-2026-07-06`.

## Expected Output

- A redacted inventory evidence file.
- An adversarial audit review with root-cause ranking and next decision.
- State/queue update that preserves staging/prod, deploy, env/secret, Provider cost, and Cost Calibration boundaries.
