# Phase4 Requirements Agent Baseline Alignment Task Plan

## Task

- Task ID: `phase4-requirements-agent-baseline-alignment-2026-07-02`
- Branch: `codex/phase4-requirements-agent-baseline-alignment`
- Scope: normalize the Stage4 requirement, AGENTS recovery, and execution-state baseline so future work does not reopen already closed AI出题 / AI组卷 issue classes.

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md`
- Latest AI baseline and Stage3/session evidence listed below.

## Evidence Baseline

- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-20-fix-quick-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md`
- `docs/05-execution-logs/evidence/2026-07-02-session-cookie-contract-login-and-e2e-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-requirements-code-implementation-alignment-audit.md`

## Implementation Plan

1. Record a new Stage4 traceability baseline that explicitly separates closed/superseded AI generation history from future acceptance work.
2. Add narrow references from requirement indexes and `AGENTS.md` to the new baseline as a recovery guard.
3. Update `project-state.yaml` and `task-queue.yaml` with a closed docs-only Module Run v2 task scope.
4. Create redacted evidence and adversarial review records.

## Non-Goals

- No AI出题 / AI组卷 repair.
- No Provider call, prompt change, payload inspection, OCR, import, RAG refresh, browser E2E, DB read/write, dependency, schema, migration, deploy, release readiness, final Pass, or production-usability claim.
- No reopening the first 20 issue classes unless a later task produces fresh current-baseline failure evidence.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown ...`
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase4-requirements-agent-baseline-alignment-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase4-requirements-agent-baseline-alignment-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase4-requirements-agent-baseline-alignment-2026-07-02 -SkipRemoteAheadCheck`
