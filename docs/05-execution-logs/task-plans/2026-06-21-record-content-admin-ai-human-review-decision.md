# Record Content Admin AI Human Review Decision

**Date:** 2026-06-21
**Task id:** `record-content-admin-ai-human-review-decision`
**Branch:** `codex/record-content-admin-ai-human-review-decision`
**Status:** ready for closeout

## User Decision

The user selected option A for `content_admin` AI 出题 and AI 组卷:

- AI generation produces reviewable drafts or suggestions only.
- `content_admin` human review is mandatory before formal `question`, `paper`, publish, or `mock_exam` use.
- This is a docs/state decision record only. It does not approve implementation, Provider calls, prompt or Provider payload exposure, raw generated AI content evidence, persistence, schema, migration, database work, dependency changes, `.env` access, browser/e2e/dev-server runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Scope

Allowed edits:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- this task plan, evidence, and audit-review document.

Blocked work:

- Source, tests, schema, migration, seed, scripts, dependency files, package or lockfiles.
- `.env` or secret access.
- Provider calls, prompt or provider payload exposure, raw generated AI content evidence, and model output persistence.
- Database connection, browser/dev-server/e2e runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate.

## Implementation Plan

1. Register a follow-up docs decision task in `task-queue.yaml` and `project-state.yaml`.
2. Add the option A decision to the discovered-issue closure batch approval decisions.
3. Update the content_admin AI generation scope decision so the future direction is draft/suggestion-only generation with mandatory human adoption.
4. Run docs/static validation and Module Run v2 gates.
5. Update evidence and audit review before local commit.

## Risk Defense

- Keep ADR-006 explicit: installed AI SDK packages do not permit Provider execution.
- Keep formal `question` and `paper` writes blocked until separate adoption workflows are approved.
- Keep evidence redacted: no raw prompts, model output, provider payloads, full paper content, private answer text, secrets, or database URLs.
- Keep future implementation split across contract, provider/env/cost, isolated result storage, adoption, audit, and runtime verification packages.

## Validation Plan

- `git diff --check`
- Prettier check on changed docs/state files.
- Added-line unfinished-marker search.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId record-content-admin-ai-human-review-decision`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId record-content-admin-ai-human-review-decision -SkipRemoteAheadCheck`
