# Learner AI Generation Private Result Use Loop Approval Plan

Task id: `learner-ai-generation-private-result-use-loop-approval-2026-06-26`

Branch: `codex/learner-ai-private-result-use-20260626`

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

Personal advanced learners and organization advanced employees require discoverable `AI训练` with `AI出题` and `AI组卷`.
The prior product boundary package clarifies that a complete learner AI generation loop cannot stop at entry-only or
metadata-only status; it needs private generated_result/history and a private use loop. The loop must not write formal
`question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records.

## Requirement Mapping

- Personal advanced learner output is private to the owning user.
- Organization advanced employee output is private to the owning employee/user in the selected organization context.
- Organization admins may see redacted usage, quota, and audit summaries only.
- Private question generation needs a private practice/use path.
- Private AI `paper` generation needs a private paper attempt or equivalent non-formal use path.
- Formal content adoption and publish remain separate gates.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- Recent learner/generated-result, Provider, and role-separated runtime evidence under `docs/05-execution-logs/`.

## Conflict Check

No conflict was found. The main safety constraint is that private learner AI output must not be promoted into formal
content or organization-admin raw visibility simply because it was generated under an advanced or organization context.

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
- private generated_result write or runtime use execution;
- formal content or formal learning-record writes;
- browser/e2e/dev server;
- staging/prod/deploy/payment/external-service work;
- PR, force push, release readiness, and final Pass.

## Approval Package Approach

This task consumes the batch approval only for docs/state approval-package closure. It classifies what a future private
learner AI generation loop must include and what remains blocked.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
2. `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-generation-private-result-use-loop-approval-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-generation-private-result-use-loop-approval-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if the next step would require code, tests, DB, Provider, browser/e2e/dev server, formal content writes, private
runtime writes, staging/prod/deploy/payment/external-service work, PR, force push, release readiness, or final Pass.
