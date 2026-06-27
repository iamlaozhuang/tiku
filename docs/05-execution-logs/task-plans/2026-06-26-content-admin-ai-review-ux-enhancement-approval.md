# Content Admin AI Review UX Enhancement Approval Plan

Task id: `content-admin-ai-review-ux-enhancement-approval-2026-06-26`

Branch: `codex/content-ai-review-ux-approval-20260626`

Task kind: `docs_only_approval_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

Content admin AI generation is the only approved path that may eventually adopt AI generated output into platform formal
drafts after review. The product boundary package classifies single-result review, validation, adoption action, and
traceability as necessary for the basic loop, while batch review, retry, diff, and richer adoption history are
second-layer enhancements.

## Requirement Mapping

- Content admins need a review surface for AI generated `question` and `paper` results.
- Basic closure requires single-result detail, validate-before-adopt, adopt/reject action, reviewer attribution, source
  attribution, and adoption traceability.
- Direct publish and student-visible content remain blocked.
- Evidence must stay redacted and must not include raw prompts, raw generated output, or Provider payloads.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- Recent content-admin formal draft adoption, Provider, and publish approval evidence under `docs/05-execution-logs/`.

## Conflict Check

No conflict was found. The safe interpretation is that content-admin review can adopt into formal drafts only after
approved source work, but publish remains separate. This task does not authorize source changes or review execution.

## Scope

Allowed changes are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- the matching acceptance, evidence, and audit-review package

Blocked:

- source, tests, e2e, scripts, package/lockfile, schema, drizzle, and `.env*`;
- DB connection or mutation;
- batch adoption or retry execution;
- raw prompt, raw generated output, or Provider payload access in evidence;
- formal publish or student-visible content;
- browser/e2e/dev server;
- staging/prod/deploy/payment/external-service work;
- PR, force push, release readiness, and final Pass.

## Approval Package Approach

This task consumes the batch approval only for docs/state approval-package closure. It classifies content-admin review UX
items into necessary closure and second-layer enhancement buckets.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
2. `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-ai-review-ux-enhancement-approval-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-ai-review-ux-enhancement-approval-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if the next step would require code, tests, DB, browser/e2e/dev server, batch/retry execution, raw prompt/generated
output/Provider payload evidence, publish/student-visible content, staging/prod/deploy/payment/external-service work,
PR, force push, release readiness, or final Pass.
