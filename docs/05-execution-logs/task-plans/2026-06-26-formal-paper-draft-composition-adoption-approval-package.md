# Formal paper draft composition adoption approval package task plan

Task id: `formal-paper-draft-composition-adoption-approval-package-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content admin AI generated content may become formal `question` or `paper` only through governed review, validation,
  source attribution, reviewer attribution, and `audit_log`.
- A generated AI `paper` must not publish a `paper` or become student-visible in the same action.
- Formal `paper` publish still depends on existing publish validation: non-empty `paper_section`, at least one counting
  `paper_question`, matching total score, scoring-point validation, and draft-only editing rules.
- Existing execution evidence proves only formal `paper` draft metadata creation; it does not prove `paper_section`,
  `paper_question`, source `question` linkage, or companion `question` draft composition.

## Requirement Mapping

This task is docs/state approval only. It maps the next implementation boundary to the formal content separation
requirement by deciding whether a later source TDD task may compose a reviewed generated `paper` into a complete formal
`paper` draft structure while preserving publish, Provider, staging/prod, payment, external-service, and final Pass
blocks.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md`

## Conflict Check

No requirement conflict was found. The approval package narrows an already governed formal adoption path from `paper`
metadata-only draft creation to draft composition. It does not approve publish or student-visible content.

## Scope

Allowed:

- Prepare a docs/state approval package.
- Decide follow-up permissions for `paper_section` / `paper_question` draft composition.
- Seed the next TDD and later local route smoke task boundaries in `task-queue.yaml`.

Blocked:

- Source/test/schema/migration/package/env edits.
- Live DB connection or route smoke in this task.
- Provider/model call, Provider credential access, Cost Calibration, staging/prod, payment, external service, deployment,
  release readiness, formal publish, student-visible content, or final Pass.

## Implementation Plan

1. Write an approval package documenting the composition strategy and blocked gates.
2. Update durable state with the closed approval-package task and pending successors.
3. Write redacted evidence and audit review.
4. Run scoped formatting, diff, precommit hardening, and prepush readiness checks.
5. Commit, fast-forward merge to `master`, push `origin/master`, and clean up the short branch under the current user
   five-step approval.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId formal-paper-draft-composition-adoption-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId formal-paper-draft-composition-adoption-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any required source, test, schema, migration, dependency, env/secret, Provider, publish, staging/prod, payment,
  external-service, deployment, or final Pass work appears.
- Validation fails and cannot be resolved within docs/state scope.
- Evidence would need raw generated content, raw formal content, DB rows, secrets, tokens, Authorization headers, DB URL,
  Provider payload, prompts, or full `paper` content.
