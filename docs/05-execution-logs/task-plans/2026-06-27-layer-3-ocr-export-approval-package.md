# Layer 3 OCR Export Approval Package Plan

Task id: `layer-3-ocr-export-approval-package-2026-06-27`

Branch: `codex/ocr-export-approval-package-20260627`

Task kind: `docs_state_approval_package`

moduleRunVersion: 2

## Approval Source

This task consumes the current user's 2026-06-27 unattended serial high-risk package approval for
`layer-3-ocr-export-approval-package-2026-06-27`.

It is docs/state-only. It may define OCR provider, parser, storage, schema, dependency/import caps, rollback, export
format, download path, privacy, permission, audit, retention, redaction, and follow-up approval text.

It must not execute OCR/export, read credentials, connect to DB, call Providers, execute Cost Calibration, run browser/
dev-server/e2e, mutate runtime data, modify source/tests/scripts/package/lockfiles/schema/migration/seed, execute
staging/prod/deploy/payment external-service work, move archive/index entries, create PRs, force push, or claim release
readiness/final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-payment-external-service-approval-package.md`

## Requirement Decision Map

- Standard MVP excludes PDF/Word automatic import, OCR, PDF/Word side-by-side entry, and Word-like whole-paper marking.
- Scanned PDFs must be preprocessed outside the system before upload in MVP.
- RAG accepts DOCX, Markdown, PPTX, and text-extractable PDF; OCR output is not an approved current ingestion source.
- Organization analytics permits summary views only. Employee answer text export and organization aggregate export remain
  out of scope unless separately approved.
- Export, file generation/download, privacy, external-service, deploy, schema, and raw sensitive viewer gates remain
  blocked.

## Conflict Check

The requirement documents, traceability matrix, and latest Layer 3 packages agree that OCR and export are future scope.
This task can define the approval boundary only. It cannot infer OCR/import/export readiness from existing RAG, resource
download, organization analytics, or retention evidence.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-ocr-export-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-ocr-export-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-ocr-export-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-ocr-export-approval-package.md`

## Blocked Scope

- OCR execution, OCR provider call, parser execution, import execution, export file generation, and download path access.
- Raw OCR output, raw export file, full `paper` or `material` content, employee answer text, and private customer data.
- `.env*`, secret, token, API key, DB URL, Authorization header, DB connection/read/write, schema, migration, seed.
- Source/test/e2e/script/package/lockfile edits, Provider, Cost Calibration, browser/dev-server/e2e, staging/prod/deploy,
  payment/external-service, archive/index movement, PR, force push, release readiness, and final Pass.

## Documentation Approach

1. Record the OCR/import/export approval matrix in acceptance evidence.
2. Update project state and task queue to close this docs/state-only task.
3. Register `active-queue-nonterminal-closeout-retirement-apply-2026-06-27` as the next pending docs/state-only cleanup
   task.
4. Keep OCR/export execution blocked and provide future copyable approval text without executing it.

## Risk Defenses

- Evidence records labels, boundaries, pass/fail/blocked, counts, caps, redaction status, and forbidden-action checklist
  only.
- No OCR payload, OCR output, generated export file, full content, employee answer text, private data, secret, token, or
  credential value is recorded.
- No dependency, parser, storage, schema, or import/export implementation is implied.
- If validation or scope checks fail, stop and record blocked evidence instead of broadening scope.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-ocr-export-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-ocr-export-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-ocr-export-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-ocr-export-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-ocr-export-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-ocr-export-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-ocr-export-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-ocr-export-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-ocr-export-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-ocr-export-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-ocr-export-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- OCR, parser, import, export, file generation, download path access, dependency, schema, storage, DB, Provider,
  Cost Calibration, browser/e2e, staging/prod/deploy, payment/external-service, archive/index, PR, force push, release
  readiness, or final Pass action becomes necessary.
- Evidence would need raw OCR output, raw export file, full content, employee answer text, or private data.
- Changed files exceed allowedFiles or touch blockedFiles.
- A required mechanism gate fails outside the task scope.
