# Local Full Loop Rollup Evidence Plan

## Task

- Task id: `local-full-loop-rollup-evidence-2026-06-28`
- Branch: `codex/local-full-loop-rollup-20260628`
- Task kind: `docs_requirement_alignment`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Approval: current user fresh approval on 2026-06-28 for local full-loop acceleration, including local commit,
  fast-forward merge to `master`, push to `origin/master`, and short branch cleanup after validation.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-knowledge-rag-maintenance-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-ai-generation-paper-provider-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-student-answer-ai-explanation-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-organization-training-analytics-ai-generation-role-flow.md`

## Requirement Mapping Result

| Requirement surface                   | Rollup evidence result                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Local user/auth and role baseline     | Mapped to baseline accounts/auth/DB evidence for all six local sprint roles.                                             |
| Knowledge/RAG maintenance             | Mapped to content admin knowledge node, resource publish, vector rebuild, and retrieval evidence.                        |
| AI question and AI `paper` generation | Mapped to content and organization AI generation local contracts with Provider output redacted/blocked.                  |
| Student answer and AI explanation     | Mapped to practice, mock exam, report, `mistake_book`, AI explanation, AI hint/scoring evidence.                         |
| Organization training and analytics   | Mapped to advanced organization admin training/analytics, employee answer, standard denial, and ops visibility evidence. |
| Residual governance gates             | Cost Calibration, staging/prod, release readiness, final Pass, payment/OCR/export, and external service remain blocked.  |

## Rollup Decision Map

| Decision area     | Active rule for this task                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Runtime execution | Docs-only rollup. Do not run new e2e/browser/DB/Provider/runtime flows beyond approved gate commands.           |
| Evidence          | Summarize prior redacted evidence only; do not introduce raw payloads, screenshots, traces, prompts, or ids.    |
| Residual gates    | Cost Calibration, pricing/quota defaults, staging/prod/deploy, release readiness, and final Pass stay blocked.  |
| Queue/state       | Mark rollup closed and leave no executable local-full-loop task; next action is blocked pending fresh approval. |
| Source scope      | No `src/**`, `tests/**`, `e2e/**`, scripts, package/lockfile, `.env*`, schema, migration, or seed edits.        |

## Implementation Plan

1. Write traceability rollup mapping each local-full-loop batch to its covered role and workflow surface.
2. Write evidence rollup with command summaries, commits, residual gaps, and blocked gates.
3. Write audit and acceptance records, explicitly avoiding release/final Pass language.
4. Update `project-state.yaml` and `task-queue.yaml` so rollup is closed and successor is blocked pending fresh
   approval.
5. Run docs-scoped Prettier, lint, typecheck, `git diff --check`, `Get-TikuProjectStatus`, and Module Run v2 gates.
6. Commit locally, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-full-loop-rollup-evidence.md docs/05-execution-logs/task-plans/2026-06-28-local-full-loop-rollup-evidence.md docs/05-execution-logs/evidence/2026-06-28-local-full-loop-rollup-evidence.md docs/05-execution-logs/audits-reviews/2026-06-28-local-full-loop-rollup-evidence.md docs/05-execution-logs/acceptance/2026-06-28-local-full-loop-rollup-evidence.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-rollup-evidence-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-rollup-evidence-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- Any step requires package/lockfile, `.env*`, source/test/e2e/script, schema, migration, or seed changes.
- Any step requires DB/runtime/browser/Provider execution beyond approved gate commands.
- Any step requires staging/prod/deploy, payment, OCR/export, external service, PR, force push, Cost Calibration,
  pricing/quota defaults, release readiness, or final Pass.
- Evidence would require credential values, session values, connection strings, raw DB rows, internal ids, user
  email/phone values, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI output, raw answers, or full
  question/paper/generated/resource/chunk content.
