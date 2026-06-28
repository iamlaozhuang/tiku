# Local Full Loop Student Answer AI Explanation Smoke Plan

## Task

- Task id: `local-full-loop-student-answer-ai-explanation-smoke-2026-06-28`
- Branch: `codex/local-full-loop-student-ai-20260628`
- Task kind: `implementation`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Approval: current user fresh approval on 2026-06-28 for local full-loop acceleration, including local DB,
  localhost/127.0.0.1 validation, focused unit/e2e tests, redacted evidence, local commit, fast-forward merge to
  `master`, push to `origin/master`, and short branch cleanup.

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
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-knowledge-rag-maintenance-smoke.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-ai-generation-paper-provider-smoke.md`

## Requirement Decision Map

| Decision area           | Active rule for this task                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Student answer loop     | Prove a local `student` can reach a DB-backed answer surface and complete a redacted answer-related smoke.                                   |
| AI explanation loop     | Prove AI explanation output contract is available through the approved local path without storing prompt, Provider payload, or raw output.   |
| AI hint or scoring loop | Reuse existing deterministic service coverage when available; avoid real Provider work unless the existing path requires approved redaction. |
| Mistake/report surface  | Prefer mistake-book or report-linked evidence because requirements explicitly connect wrong objective answers to AI explanation.             |
| Authorization boundary  | Student access must remain scoped to effective local authorization; no internal ids or raw user identifiers may appear in evidence.          |
| Evidence                | Record only command names, pass/fail, role labels, counts, status labels, and redacted coverage summaries.                                   |
| Dependencies/env/schema | No package/lockfile, `.env*`, schema, migration, or `drizzle-kit push` changes.                                                              |
| Cost Calibration        | Cost Calibration Gate remains blocked. No pricing, quota default, release readiness, or final Pass decision.                                 |

## Requirement Mapping

| Requirement source                    | Mapping target                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `modules/03-student-experience.md`    | Practice/mock answer behavior, mistake-book creation or access, report/mistake-book AI explanation availability |
| `modules/04-ai-scoring.md`            | AI explanation, AI hint, deterministic scoring contract, non-blocking failure handling                          |
| `modules/05-rag-knowledge.md`         | RAG citation/evidence status contract for AI explanation/hint/scoring without fabricated citations              |
| `modules/01-user-auth.md`             | Local student authorization and hidden data boundary                                                            |
| Local full-loop traceability sequence | This task follows baseline accounts/auth DB, RAG maintenance, and AI generation provider-gate smoke             |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-knowledge-rag-maintenance-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-ai-generation-paper-provider-smoke.md`

These files are recovery and proof history only. Requirement scope comes from `docs/01-requirements/**` and active
traceability.

## Conflict Check

- No conflict found between standard student experience, AI scoring/explanation, RAG evidence-status rules, and the
  local full-loop sprint queue.
- Advanced edition index is read because the sprint spans advanced capabilities, but this task does not implement
  organization training, organization analytics, quota, pricing, or Cost Calibration.
- If the existing local answer path cannot prove student answer plus AI explanation/hint/scoring without env,
  dependency, schema/migration, Provider configuration, staging/prod, or sensitive evidence, stop and record a blocked
  repair or approval need.

## Implementation Plan

1. Inspect existing student answer, practice/mock, mistake-book, AI explanation, AI hint, and AI scoring services,
   routes, unit tests, and e2e specs.
2. Add the smallest focused test or local e2e smoke that proves the student answer to AI explanation/hint/scoring loop
   using existing deterministic local services and redacted response assertions.
3. Repair only scoped source/test code needed for the local loop; keep route handlers thin and preserve service-layer
   ownership.
4. Write traceability, evidence, audit, acceptance, and state/queue closeout records with redacted metadata only.
5. Run focused tests, scoped local e2e/browser validation, scoped Prettier, lint, typecheck, `git diff --check`,
   `Get-TikuProjectStatus`, and Module Run v2 gates.
6. Commit locally, fast-forward merge to `master`, push `origin/master`, and delete the short branch after gates pass.

## Validation Commands

- Focused student answer and AI explanation unit tests, selected after source inspection.
- Scoped localhost/127.0.0.1 Playwright smoke, selected or created after source inspection.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-student-answer-ai-explanation-smoke-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-student-answer-ai-explanation-smoke-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- Any step requires package/lockfile or `.env*` modification.
- Any step requires Provider configuration change, staging/prod/deploy, payment, OCR/export, external-service, PR,
  force push, Cost Calibration, release readiness, final Pass, or `drizzle-kit push`.
- Evidence would require raw prompt, Provider payload, raw AI output, credential value, token, cookie, localStorage,
  Authorization header, raw DB row, internal id, user email/phone, raw DOM, screenshot, trace, employee subjective
  answer, full question content, or full paper content.
- A repair requires schema or migration work outside this task's allowed local answer fixture boundary.
