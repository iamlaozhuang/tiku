# admin-ai-generation-runtime-bridge-and-persistence-plan-2026-06-26

## Task

Create a docs-only decision plan for content admin and organization advanced admin AI generation runtime bridge and
persistence boundaries.

## Branch

`codex/admin-ai-runtime-plan-20260626`

## Task Kind

`docs_only_runtime_bridge_and_persistence_plan`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Content admin and organization advanced admin require discoverable `AI出题` and `AI组卷` entries.
- Generated output must remain outside formal `question` and `paper` until a governed adoption path exists.
- `ai_generation_task` can track task status and redacted references, but evidence must not expose prompts, Provider
  payloads, raw generated content, credentials, or full content.
- Provider and Cost Calibration remain separate gates.

## Requirement Mapping

This task decides implementation boundaries only:

- admin local contract loops may gain an explicit provider-disabled runtime bridge contract;
- real Provider execution must remain injectable and disabled by default;
- durable DB persistence must not be bundled without separate DB runtime mutation approval;
- formal adoption remains out of scope.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-and-organization-analytics-implementation-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`

## Conflict Check

No requirement conflict found. The important implementation conflict is architectural:

- Personal route integration is personal-auth and personal-owner specific.
- Admin AI needs platform and organization owner types.
- Therefore the next source task should not directly reuse the personal route. It should reuse only the shared Provider
  execution summary pattern and keep admin runtime injection separate.

## Allowed Scope

- Update docs/state/evidence/audit files for this task.
- Produce a decision package and next-source-task boundary.

## Blocked Scope

- Source/test/package/lockfile/env/schema/migration/seed changes.
- DB connection or writes.
- Provider calls or credential reads.
- Browser/dev-server/e2e runtime.
- Staging/prod, payment, external service, deployment, release readiness, final Pass.

## Approach

1. Review personal Provider bridge and admin local contract route boundaries.
2. Decide reuse strategy.
3. Define the smallest source task that can run without Provider/env/DB gates.
4. Defer DB persistence and formal adoption to separate approval gates.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-runtime-bridge-and-persistence-plan-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-runtime-bridge-and-persistence-plan-2026-06-26 -SkipRemoteAheadCheck`
