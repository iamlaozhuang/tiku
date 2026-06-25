# Evidence: learner-ai-and-enterprise-training-entry-runtime-repair-planning-2026-06-24

## Summary

- Task id: `learner-ai-and-enterprise-training-entry-runtime-repair-planning-2026-06-24`.
- Branch: `codex/learner-entry-repair-planning-20260624`.
- Task kind: `docs_requirement_alignment`.
- Scope: plan the learner AI and enterprise training entry repair after visible Chinese UI cleanup closeout.
- Product source changed by this task: none.
- Runtime executed by this task: none.
- Final Pass claim: none.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Mapping Result

- Result: pass_learner_entry_repair_scope_planned.
- Requirement target: close `GAP-LEARNER-01` with a follow-up source task covering learner `AI训练` and `企业训练`
  discoverability and direct-route unavailable/denied states.
- Authorization target: keep learner entry behavior aligned to service-computed `effectiveEdition` and selected
  authorization contexts; do not treat UI visibility as the enforcement boundary.
- Non-goal: no Provider-backed generation, schema/database, dependency, runtime browser, or final Pass work is approved.

## Role Mapping Result

- `personal_standard_student`: advanced AI entry hidden on home; direct AI route must not look like a logged-out state
  when the student is logged in but standard.
- `personal_advanced_student`: `AI训练` discoverable on home; direct AI route uses logged-in session and local contract.
- `org_standard_employee`: no `AI训练` or `企业训练` entry; direct AI/training routes denied or standard-unavailable.
- `org_advanced_employee`: both entries discoverable; direct organization training route uses logged-in organization
  context and shows assigned/empty training state.

## Acceptance Mapping Result

- Planning output path created:
  `docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- Follow-up implementation task queued:
  `learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.
- Runtime/browser acceptance not executed.
- Standard/advanced MVP final Pass not claimed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`
  - Result: pass; all matched files unchanged after the final write.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`
  - Result: pass; `All matched files use Prettier code style!`.
- `git diff --check`
  - Result: pass; no whitespace errors.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-and-enterprise-training-entry-runtime-repair-planning-2026-06-24`
  - Result: pass; `pre-commit hardening passed`.

## Blocked / Not Executed

- Product source/test changes, browser/runtime, dev server, credential/account actions, database read/write/migration,
  dependency changes, `.env*`, Provider/model/cost calibration, staging/prod/deploy, payment/external service,
  PR/force-push, Cost Calibration Gate, and final acceptance Pass were not executed.

## Next Task

- `learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.
