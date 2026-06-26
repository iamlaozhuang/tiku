# Formal publish student-visible content approval package task plan

Task id: `formal-publish-student-visible-content-approval-package-2026-06-26`

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
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Upstream Evidence

- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`

## Objective

Prepare a standalone approval package for whether a formal draft `paper` may be published into student-visible formal
content. This task does not execute publish.

## Execution Plan

1. Create the approval package under `docs/05-execution-logs/acceptance/`.
2. Update evidence and audit review to record that this is a docs-only package.
3. Update task queue and project state with the publish approval boundary.
4. Validate docs/state formatting, diff hygiene, and Module Run v2 gates.
5. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Proposed Future Approval Scope

If a future user approval explicitly allows publish execution, the next task must define:

- exact local-only target route/service path;
- maximum publish calls;
- target draft selection rule without raw public ids in evidence;
- required pre-publish validation checks;
- rollback/archive strategy;
- redacted evidence fields;
- local/staging/prod boundary;
- failure branch when validation or publish fails.

## Blocked In This Task

- Formal publish execution.
- Student-visible content creation.
- Provider calls or credential reads.
- Cost Calibration.
- Local DB mutation or migration.
- Source/test/package/lockfile/env changes.
- Staging/prod, payment, external service, deployment/release readiness, PR, force push, or final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-formal-publish-student-visible-content-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-formal-publish-student-visible-content-approval-package.md docs/05-execution-logs/evidence/2026-06-26-formal-publish-student-visible-content-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-formal-publish-student-visible-content-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-formal-publish-student-visible-content-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-formal-publish-student-visible-content-approval-package.md docs/05-execution-logs/evidence/2026-06-26-formal-publish-student-visible-content-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-formal-publish-student-visible-content-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId formal-publish-student-visible-content-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId formal-publish-student-visible-content-approval-package-2026-06-26 -SkipRemoteAheadCheck`
