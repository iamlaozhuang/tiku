# Content Admin Review Adoption Command Contract TDD Plan

Task id: `content-admin-review-adoption-command-contract-tdd-2026-06-27`

Branch: `codex/content-admin-adoption-command-tdd-20260627`

Task kind: `implementation_tdd`

moduleRunVersion: 2

## Fresh Approval

User fresh approval on 2026-06-27 allows source/test-only Layer 2 minimum business-loop work for
`content-admin-review-adoption-command-contract-tdd-2026-06-27`.

Approved capabilities:

- TDD source/test changes for content-admin review adopt/reject command contract.
- Focused unit tests.
- Task plan, evidence, audit, acceptance, `project-state.yaml`, and `task-queue.yaml` updates.

Still blocked:

- Browser, dev server, and e2e.
- DB connection, real DB read/write, schema, migration, seed, and rollback.
- Credential or `.env*` reads.
- Provider call or Provider configuration.
- Cost Calibration Gate.
- Real runtime adoption or retry mutation.
- Formal publish and student-visible runtime.
- Staging, production, deploy, payment, OCR/export, and external service work.
- Archive/index movement.
- PR, force push, release readiness, and final Pass.

Closeout source:

- Current user instruction requires each task to use an independent short branch and, after scoped completion, perform
  local commit, ff-only merge to `master`, master gates, push `origin/master`, and merged-branch cleanup.
- PR and force push remain blocked.

## Documents And Source Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/models/admin-ai-generation-formal-adoption.ts`
- `src/server/validators/admin-ai-generation-formal-adoption.ts`
- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Content admin AI generation output must stay in an isolated review surface until governed human review/adoption.
- Formal adoption into `question` or `paper` requires reviewer attribution, source attribution, validation state, and
  `audit_log` traceability.
- Rejection and adoption both require reviewer attribution.
- Adoption may only create editable formal drafts through a separately governed path; it must not publish or make content
  student-visible in the same command.
- Evidence and contracts must stay redacted: no raw prompt, Provider payload, raw generated content, full `paper` content,
  credentials, DB rows, internal numeric ids, or plaintext `redeem_code`.
- Organization-scoped generated content adoption remains a separate blocked task.

## Requirement Mapping

This task maps only the source/test command contract for the content-admin generated-result review decision:

- Add `rejected` as a content-admin review decision.
- Preserve the existing `approved` adoption behavior for `question` and `paper`.
- Ensure a rejected command records redacted traceability and reviewer attribution.
- Ensure a rejected command does not call the formal draft adapter and does not create formal draft metadata.
- Keep DB connection, real runtime mutation, publish, student-visible runtime, Provider, and staging/prod work blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup.md`

These files are historical execution evidence only; they do not replace the requirement SSOT above.

## Conflict Check

No requirement conflict was found for this source/test-only task. The SSOT requires content-admin AI generated content to
remain isolated until review, and the current code already has an approved adoption path. The gap is narrower: reject
decision support is missing from the command contract, repository mapping, DB adapter normalization, service adapter
branching, and focused tests.

## Implementation Approach

Follow strict TDD:

1. RED: add focused tests for a rejected command in repository, DB adapter, service, and runtime route contract.
2. Run the focused test command and record the expected failure.
3. GREEN: implement the smallest model, contract, repository, DB adapter, validator, and service changes needed for the
   tests to pass.
4. Preserve approved adoption behavior.
5. Do not add schema, migration, dependency, browser, Provider, DB, publish, or runtime mutation work.

## Allowed Files

- `src/server/models/admin-ai-generation-formal-adoption.ts`
- `src/server/validators/admin-ai-generation-formal-adoption.ts`
- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.test.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`

## Blocked Files And Actions

- `.env*`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`
- Playwright reports or test artifacts
- `docs/04-agent-system/state/archive/**`
- `docs/04-agent-system/state/task-history-index.yaml`

Blocked actions match the Fresh Approval section.

## Validation Commands

RED/GREEN focused command:

```powershell
npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-service.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts
```

Closeout gates:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown <changed source/docs/state files>
npx.cmd prettier --check --ignore-unknown <changed source/docs/state files>
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-adoption-command-contract-tdd-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-review-adoption-command-contract-tdd-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-adoption-command-contract-tdd-2026-06-27 -SkipRemoteAheadCheck
```

After ff-only merge to `master`, rerun necessary master gates before push.

## Evidence And Review

- Evidence: `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- Audit review: `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- Acceptance: `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`

Evidence must include RED/GREEN output summaries, command results, changed file list, redaction statement, and remaining
blocked gates.

## Stop Conditions

- Tests require real DB connection, schema, migration, seed, or rollback.
- A Provider call, credential read, Cost Calibration, browser/dev-server/e2e, publish, student-visible runtime, deploy,
  payment, OCR/export, external service, archive/index movement, PR, or force push becomes necessary.
- Changed files exceed allowedFiles.
- Evidence would need sensitive or raw generated content.
- Validation fails three consecutive times for the same blocker.
