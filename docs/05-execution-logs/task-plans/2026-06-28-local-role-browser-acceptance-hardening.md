# Local Role Browser Acceptance Hardening Plan

## Task

- Task id: `local-role-browser-acceptance-hardening-2026-06-28`
- Branch: `codex/local-role-browser-acceptance-20260628`
- Task kind: `implementation`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Approval: current user approved the recommended next local-only browser acceptance hardening task on 2026-06-28,
  including local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup after
  validation.

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
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-rollup-evidence.md`

## Requirement Decision Map

| Requirement surface            | Active decision for this task                                                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local browser target           | Validate only `localhost` or `127.0.0.1` with local dev data.                                                                                                               |
| Role coverage                  | Cover `student`, `content_admin`, `ops_admin`, `org_standard_admin`, `org_advanced_admin`, and `employee` local surfaces.                                                   |
| Organization advanced surfaces | `org_standard_admin` must see denied or standard-unavailable states; `org_advanced_admin` can use organization training, analytics, and organization AI generation entries. |
| Content AI generation          | `content_admin` can find and submit local contract requests only; formal `question` or `paper` adoption remains blocked.                                                    |
| Student and employee flows     | Verify answer/training/explanation entry points without exposing raw answers, generated content, screenshots, DOM, or session data in evidence.                             |
| Evidence                       | Record redacted command status, route/spec names, role labels, and pass/fail summaries only.                                                                                |
| Residual gates                 | Cost Calibration, pricing/quota defaults, Provider readiness, staging/prod/deploy, payment/OCR/export/external service, release readiness, and final Pass remain blocked.   |

## Requirement Mapping

| Role                 | Local browser acceptance target                                                                   | Expected result                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `student`            | Student home/practice/mock/report/mistake_book or existing local full-loop student route coverage | Role-visible student loop remains reachable locally.                                        |
| `content_admin`      | Content AI generation and knowledge/RAG entry surfaces                                            | Entry is discoverable and local contract submission does not write formal content.          |
| `ops_admin`          | Operations workspace org_auth/user/log visibility                                                 | Ops surfaces remain visible without content authoring escalation.                           |
| `org_standard_admin` | Organization backend advanced routes                                                              | Advanced training, analytics, and AI routes show standard-unavailable or denied state.      |
| `org_advanced_admin` | Organization training, analytics, and organization AI generation routes                           | Advanced organization surfaces render and local contract interactions remain redacted.      |
| `employee`           | Organization training employee surface                                                            | Assigned training participation flow remains reachable without exposing subjective answers. |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-knowledge-rag-maintenance-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-ai-generation-paper-provider-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-student-answer-ai-explanation-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-organization-training-analytics-ai-generation-role-flow.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-rollup-evidence.md`

## Conflict Check

- The previous rollup closed the local full-loop API/e2e evidence and explicitly did not claim strict multi-role
  browser acceptance. This task fills that local browser acceptance gap.
- The previous organization role-flow evidence recorded an over-broad admin UI entry-surface diagnostic where some
  unit fixtures rendered `请先登录后台` instead of the intended advanced/standard states. This task will reproduce that
  diagnostic first and only repair the smallest auth-state fixture or runtime issue confirmed by RED/GREEN evidence.
- No requirement source authorizes Cost Calibration, pricing/quota defaults, staging/prod, formal release/final Pass, or
  committed raw browser evidence.

## Allowed Scope

- Update task state, queue, plan, traceability, evidence, audit review, and acceptance documents for this task.
- Repair focused UI test fixtures when the RED diagnostic shows stale auth capability fixtures.
- Repair focused admin organization workspace runtime only if the failure is in product code rather than test fixtures.
- Add a local browser acceptance e2e spec only if existing specs or the in-app browser check do not provide durable
  enough local role coverage.
- Use the in-app browser against `localhost` or `127.0.0.1` only.
- Start or reuse a local dev server when needed for browser validation.
- Use local dev DB/seeded data only when needed by the browser/e2e path and keep evidence redacted.

## Blocked Scope

- No `package.json` or lockfile change.
- No `.env*` read, write, copy, or evidence output.
- No schema, migration, `drizzle-kit push`, or destructive shared DB operation.
- No Provider/model call, Provider configuration, pricing, quota default, or Cost Calibration execution.
- No staging/prod/cloud/deploy, payment, OCR/export, external-service, PR, force push, release readiness, or final Pass.
- No committed screenshots, traces, raw DOM, localStorage/session/cookie values, credentials, connection strings, raw DB
  rows, internal ids, user email/phone, raw Provider payloads, prompts, raw AI output, employee subjective answers, full
  `question`, `paper`, generated content, resource, or chunk text.

## Implementation Plan

1. Record this task in `project-state.yaml` and `task-queue.yaml`.
2. Run the focused RED unit command for organization training, analytics, and AI generation admin entry surfaces.
3. Inspect whether the failure is stale auth capability fixtures or product runtime state.
4. Apply the smallest focused repair and rerun the same unit command as GREEN.
5. Run relevant existing local e2e specs and an in-app browser acceptance pass against localhost/127.0.0.1 with
   redacted route/role summaries only.
6. Write traceability, evidence, audit review, and acceptance records.
7. Run scoped Prettier, lint, typecheck, `git diff --check`, `Get-TikuProjectStatus`, and Module Run v2 closeout gates.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-baseline-accounts-auth-db.spec.ts e2e/local-full-loop-student-answer-ai-explanation-smoke.spec.ts e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --reporter=line`
- In-app browser local acceptance against `localhost` or `127.0.0.1`, summarized as redacted route/role status only.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/task-plans/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/audits-reviews/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/acceptance/2026-06-28-local-role-browser-acceptance-hardening.md tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/task-plans/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/audits-reviews/2026-06-28-local-role-browser-acceptance-hardening.md docs/05-execution-logs/acceptance/2026-06-28-local-role-browser-acceptance-hardening.md tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-role-browser-acceptance-hardening-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-role-browser-acceptance-hardening-2026-06-28 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must include `Role Mapping Result` and redacted browser route/role status.
- Audit review must cover authorization source-of-truth, evidence redaction, local browser scope, and residual blocked
  gates.
- Acceptance must explicitly state local validation level and non-claims.

## Stop Conditions

- The repair requires package/lockfile, `.env*`, schema/migration, `drizzle-kit push`, staging/prod/deploy, payment,
  OCR/export, external service, Provider/model execution, pricing/quota defaults, Cost Calibration, release readiness,
  final Pass, PR, or force push.
- Evidence would require secrets, credentials, tokens, cookies, localStorage, raw DOM, screenshots, traces, raw DB rows,
  internal ids, user email/phone, raw Provider payloads, prompts, raw AI output, employee subjective answers, or full
  `question`, `paper`, generated content, resource, or chunk text.
- Browser or e2e validation cannot be made local-only against `localhost` or `127.0.0.1`.
