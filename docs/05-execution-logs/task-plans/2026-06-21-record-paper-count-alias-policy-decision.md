# Record Paper Count Alias Policy Decision

**Date:** 2026-06-21
**Task id:** `record-paper-count-alias-policy-decision`
**Branch:** `codex/record-paper-count-alias-policy-decision`
**Status:** ready for closeout

## User Decision

The user selected option A for `paper` question-count and legacy `question_type` alias policy:

- Draft `paper` remains valid at 0 to 100 questions.
- Published `paper` must contain 1 to 100 `paper_question` rows.
- The 100-question limit is counted across all `paper_section` and `question_group` rows.
- Legacy aliases remain compatibility inputs only: `multiple_choice` maps to `multi_choice`; `subjective` maps to `short_answer`.
- Alias removal, over-limit imports, validator/service/UI implementation, runtime verification, and performance acceptance require separate approval.

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
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- this task plan, evidence, and audit-review document.

Blocked work:

- Source, tests, schema, migration, seed, scripts, dependency files, package or lockfiles.
- Validator/service/UI implementation, alias removal, and over-limit import exception work.
- `.env` or secret access.
- Provider calls, database connection, browser/dev-server/e2e runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate.

## Implementation Plan

1. Register a follow-up docs decision task in `task-queue.yaml` and `project-state.yaml`.
2. Add the option A decision to the discovered-issue closure batch approval decisions.
3. Update the paper policy document so future work treats the existing 100-question and alias policy as explicitly confirmed.
4. Run docs/static validation and Module Run v2 gates.
5. Update evidence and audit review before local commit.

## Risk Defense

- Keep formal enforcement blocked until separately approved implementation tasks.
- Keep any over-100 `paper` exception blocked behind product exception and performance acceptance.
- Keep alias removal blocked until inventory and deprecation requirements are satisfied.
- Preserve canonical `question_type` values and avoid introducing unregistered aliases.

## Validation Plan

- `git diff --check`
- Prettier check on changed docs/state files.
- Added-line unfinished-marker search.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId record-paper-count-alias-policy-decision`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId record-paper-count-alias-policy-decision -SkipRemoteAheadCheck`
