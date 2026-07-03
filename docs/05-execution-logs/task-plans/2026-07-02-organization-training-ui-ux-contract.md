# Organization Training UI/UX Contract Plan

## Task

Task id: `organization-training-ui-ux-contract-2026-07-02`

Branch: `codex/organization-training-uiux-contract-2026-07-02`

Create a docs-only UI/UX contract for enterprise training creation, source selection, AI result handoff, draft/publish/takedown lifecycle, and employee answer/result experience. This is package 2 of 6 and must be closed before starting package 3.

## Required Reads

Completed before editing:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- package-related requirement modules, stories, traceability docs, and current source surfaces listed in the contract document.

## Scope

Allowed writes:

- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- this task plan
- evidence and audit-review files for this task
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked:

- product source changes;
- tests/source repairs;
- database/schema/migration/seed changes;
- Provider/model calls or configuration changes;
- browser/dev-server/runtime walkthrough;
- dependency changes;
- release readiness, final Pass, production usability, or Cost Calibration claims.

## Method

1. Reconfirm existing requirement decisions from stable advanced-edition modules, stories, ADR-007, AI generation baseline, and current-thread ledger.
2. Inspect current source implementation only to classify existing coverage vs implementation gaps.
3. Write a contract that separates existing decisions, current implementation evidence, UX requirements, and later source tasks.
4. Run two self-review passes:
   - pass 1 for omission and contradiction against `CT-REQ-016` through `CT-REQ-019`, `CT-REQ-024`, `CT-REQ-036`, `CT-REQ-037`, `CT-REQ-048`, `CT-REQ-053`, and `CT-REQ-055`;
   - pass 2 for implementation-evidence accuracy and forbidden claims.
5. Validate formatting, diff hygiene, and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch before package 3.

## Risk Controls

- Do not treat generic "organization admin" wording as standard-admin access; advanced enterprise training means eligible `org_advanced_admin`.
- Do not confuse existing source metadata forms with the confirmed non-technical four-step wizard.
- Do not record raw question/paper/material content, raw employee answers, raw Prompt, Provider payload, AI IO, credentials, sessions, cookies, auth headers, env values, raw DB rows, screenshots, or exports.
- If a new requirement conflict appears, stop for user decision.

## Validation Commands

- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-ui-ux-contract-2026-07-02 -SkipRemoteAheadCheck`

## Closeout Policy

User approved serial package execution with per-package validation, two self-review passes, commit, fast-forward merge, push, cleanup, then next package.

No PR, force push, deployment, dependency change, schema change, Provider execution, or browser runtime is approved.
