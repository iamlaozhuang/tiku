# Local Full Loop Organization Training Analytics AI Generation Role Flow Plan

## Task

- Task id: `local-full-loop-organization-training-analytics-ai-generation-role-flow-2026-06-28`
- Branch: `codex/local-full-loop-org-role-20260628`
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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-ai-generation-paper-provider-smoke.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-student-answer-ai-explanation-smoke.md`

## Requirement Decision Map

| Decision area               | Active rule for this task                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Organization standard admin | Prove scoped organization workspace/status behavior and denial of training or organization AI generation.                                 |
| Organization advanced admin | Prove organization training, analytics, and organization AI question/AI `paper` generation are reachable through local runtime.           |
| Employee                    | Prove employee can access and answer assigned organization training; evidence must not record raw answer text.                            |
| Ops admin                   | Prove relevant redacted operations/analytics visibility without exposing employee subjective answers or generated content.                |
| Formal content boundary     | Organization AI generation/training must not write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`. |
| Evidence                    | Record only role labels, route labels, status labels, counts, public-id classes, and pass/fail.                                           |
| Dependencies/env/schema     | No package/lockfile, `.env*`, schema, migration, or `drizzle-kit push` changes.                                                           |
| Cost Calibration            | Cost Calibration Gate remains blocked. No pricing, quota default, release readiness, or final Pass decision.                              |

## Requirement Mapping

| Requirement source                         | Mapping target                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `modules/04-organization-training.md`      | Standard/advanced organization admin and employee training allow/deny behavior                     |
| `modules/05-organization-analytics.md`     | Organization-level summaries without raw employee answer text                                      |
| `modules/08-organization-ai-generation.md` | Advanced organization AI question/paper generation and standard admin denial                       |
| `modules/01-authorization-context.md`      | Organization-scoped effective authorization and role context                                       |
| `epic-02`, `epic-03`, `epic-07`            | End-to-end admin/employee training, analytics, and AI generation acceptance scenarios              |
| Local full-loop traceability sequence      | This task follows local accounts/auth, RAG, AI generation, and student answer/AI explanation smoke |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-ai-generation-paper-provider-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-student-answer-ai-explanation-smoke.md`

These files are recovery and proof history only. Requirement scope comes from `docs/01-requirements/**` and active
traceability.

## Conflict Check

- No conflict found between organization training, analytics, organization AI generation, authorization context, and
  role-separated traceability.
- The task proves local role-flow closure only. It does not claim the strict 8-role role-separated runtime gate, staging,
  production, Provider readiness, or final Pass.
- If the existing local runtime cannot prove the role flow without env, dependency, schema/migration, Provider
  configuration, staging/prod, or sensitive evidence, stop and record a blocked repair or approval need.

## Implementation Plan

1. Inspect existing organization training, analytics, organization AI generation, role workspace, unit tests, and e2e
   specs.
2. Prefer a scoped localhost API/browser smoke that covers `org_standard_admin`, `org_advanced_admin`, `employee`, and
   `ops_admin` with redacted assertions.
3. Reuse existing local deterministic Provider-blocked AI generation contracts; do not call a real Provider unless the
   existing path requires it and can stay redacted.
4. Repair only scoped source/test code needed for the local organization role loop; keep route handlers thin and preserve
   service-layer ownership.
5. Write traceability, evidence, audit, acceptance, and state/queue closeout records with redacted metadata only.
6. Run focused tests, scoped local e2e/browser validation, scoped Prettier, lint, typecheck, `git diff --check`,
   `Get-TikuProjectStatus`, and Module Run v2 gates.
7. Commit locally, fast-forward merge to `master`, push `origin/master`, and delete the short branch after gates pass.

## Validation Commands

- Focused organization training, analytics, and organization AI generation unit tests, selected after source inspection.
- Scoped localhost/127.0.0.1 Playwright smoke, selected or created after source inspection.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-organization-training-analytics-ai-generation-role-flow-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-organization-training-analytics-ai-generation-role-flow-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- Any step requires package/lockfile or `.env*` modification.
- Any step requires Provider configuration change, staging/prod/deploy, payment, OCR/export, external-service, PR,
  force push, Cost Calibration, release readiness, final Pass, or `drizzle-kit push`.
- Evidence would require raw employee answer text, prompt, Provider payload, raw AI output, credential value, token,
  cookie, localStorage, Authorization header, raw DB row, internal id, user email/phone, raw DOM, screenshot, trace, full
  generated content, full question content, or full paper content.
- A repair requires schema or migration work outside this task's approved local training fixture boundary.
