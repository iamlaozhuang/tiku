# Organization AI Generation Owned Draft Boundary And Local Contract Loop Approval Plan

Task id: `org-ai-generation-owned-draft-boundary-and-local-contract-loop-approval-2026-06-26`

Branch: `codex/org-ai-owned-draft-boundary-20260626`

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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

Organization advanced admin AI generation maps to the advanced organization AI generation requirement surface and the
role-separated alignment for `org_advanced_admin`. The active product boundary package already decided that
organization admin AI output may move into organization-owned draft or training content only after future approval, and
must not become platform formal `question` or `paper` draft directly.

## Requirement Mapping

- Organization-owned AI output must stay scoped to `organization` ownership.
- Generated result/history is necessary for traceability and later organization-owned draft decisions.
- Organization-owned draft or training content requires organization admin confirmation before employee-visible use.
- Platform formal content remains under content-admin review and platform formal content lifecycle.
- Direct publish and student-visible platform content remain blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- Recent admin AI generated result, formal draft, Provider, publish approval, evidence, and audit review records under
  `docs/05-execution-logs/`.

## Conflict Check

No conflict was found between the requirement SSOT, ADR boundaries, and the prior product boundary package. The only
important risk is over-reading local generated-result or formal-draft evidence as permission for organization admins to
write platform formal content. This task keeps that path blocked.

## Scope

Allowed changes are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- the matching acceptance, evidence, and audit-review package

Blocked:

- source, tests, e2e, scripts, package/lockfile, schema, drizzle, and `.env*`;
- DB connection or mutation;
- Provider call or credential read;
- organization-owned draft write;
- platform formal draft write;
- publish, student-visible runtime, browser/e2e, staging/prod, payment, external service, PR, force push, release
  readiness, and final Pass.

## Approval Package Approach

This task consumes the owner batch approval only for a docs/state approval package. It prepares follow-up task boundaries
for later implementation but does not make those follow-up tasks executable.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
2. `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-ai-generation-owned-draft-boundary-and-local-contract-loop-approval-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId org-ai-generation-owned-draft-boundary-and-local-contract-loop-approval-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if a required next step needs implementation files, DB access, Provider access, publish/student-visible validation,
browser/e2e/dev server, staging/prod/deploy/payment/external-service work, PR, force push, release readiness, or final
Pass.
