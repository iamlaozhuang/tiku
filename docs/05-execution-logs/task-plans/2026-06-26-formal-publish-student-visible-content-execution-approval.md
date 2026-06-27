# Formal Publish Student-Visible Content Execution Approval Plan

Task id: `formal-publish-student-visible-content-execution-approval-2026-06-26`

Branch: `codex/formal-publish-execution-approval-20260626`

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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

The standard content lifecycle allows formal `paper` publish only through the governed formal content path. The AI
generation product boundary package keeps publish and student-visible content separate from generated-result, private
use, organization-owned draft, and content-admin formal draft adoption work.

## Requirement Mapping

- Formal publish can affect `student` visibility and therefore requires a separate fresh approval.
- A future publish execution task must name a specific local draft target and maximum publish call count.
- Student-visible runtime validation is a separate approval flag, not implied by local publish execution.
- Provider/Cost, staging/prod, payment, external-service, release readiness, and final Pass remain separate gates.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- Recent formal draft, Provider, publish approval, and admin AI generation evidence under `docs/05-execution-logs/`.

## Conflict Check

No conflict was found. The owner batch approval explicitly forbids publish and student-visible runtime in this batch, so
this task can only prepare a future approval package and must not run publish.

## Scope

Allowed changes are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- the matching acceptance, evidence, and audit-review package

Blocked:

- source, tests, e2e, scripts, package/lockfile, schema, drizzle, and `.env*`;
- DB connection or mutation;
- publish route/service execution;
- student-visible runtime validation;
- Provider call or credential read;
- browser/e2e/dev server;
- staging/prod/deploy/payment/external-service work;
- PR, force push, release readiness, and final Pass.

## Approval Package Approach

This task defines what a later publish execution fresh approval must include. It records no executable publish task and
does not approve any local DB mutation or runtime validation.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
2. `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId formal-publish-student-visible-content-execution-approval-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId formal-publish-student-visible-content-execution-approval-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if the next step would require publish, DB mutation, student-visible runtime, browser/e2e/dev server, Provider,
staging/prod/deploy/payment/external-service work, PR, force push, release readiness, or final Pass.
