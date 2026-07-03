# Source Landing Evidence Closeout Correction Plan

## Task

- Task id: `source-landing-evidence-closeout-correction-2026-07-03`
- Branch: `codex/source-landing-evidence-closeout-correction-2026-07-03`
- Goal: correct stale commit and closeout placeholders found during the 16-package pre-acceptance review before any acceptance design work begins.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Finding

The 16-package pre-acceptance review found stale closeout placeholders in package evidence files. The packages are closed and pushed, but several evidence files still contained local-closeout placeholder wording.

## Correction Scope

- Update affected source-landing evidence files with their actual implementation commit ids.
- Replace stale `pending_commit_merge_push_cleanup` and `local_commit_merge_push_cleanup_to_follow` lines with completed closeout wording.
- Do not change product source, tests, schema, dependencies, Provider configuration, browser/e2e assets, or deployment files.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-07-03-*-source-landing.md docs/05-execution-logs/task-plans/2026-07-03-source-landing-evidence-closeout-correction.md docs/05-execution-logs/evidence/2026-07-03-source-landing-evidence-closeout-correction.md docs/05-execution-logs/audits-reviews/2026-07-03-source-landing-evidence-closeout-correction.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId source-landing-evidence-closeout-correction-2026-07-03`
