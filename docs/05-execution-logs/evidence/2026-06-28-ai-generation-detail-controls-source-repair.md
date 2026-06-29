# AI Generation Detail Controls Source Repair Evidence

## Status

- Task: `ai-generation-detail-controls-source-repair-2026-06-28`
- Branch: `codex/ai-generation-detail-controls-repair-20260628`
- Status: validated_pending_closeout
- Result: pass_source_unit_repair_browser_role_rerun_required
- Batch range: AI question and AI paper generation detail-control source repair
- Pre-task master checkpoint: `66e23e229f544dad69d41258010ec04c7c38045c`
- Commit: pending_initial_commit

## RED

RED:

Prior acceptance evidence shows route reachability is not enough: the AI question and AI paper generation surfaces need
visible detail controls for scope, type, quantity, difficulty, coverage, and draft/review boundaries.

- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts`
  - RED result before implementation: failed.
  - Test count: 12 passed, 2 failed.
  - Failure class: required detail-control section absent on content AI question and organization AI paper surfaces.

## GREEN

GREEN:

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
  - Added shared admin AI generation detail controls for AI question and AI paper generation.
  - AI question controls include profession, level, subject, knowledge node, question type, count, difficulty, and
    learning objective categories.
  - AI paper controls include profession, level, subject, question count, type distribution, difficulty, knowledge
    coverage, paper section structure, and objective categories.
  - Draft/review boundary remains visible before any local contract request.
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Added focused coverage for content AI question generation detail controls.
  - Added focused coverage for organization AI paper generation detail controls before Provider execution.
  - Added local selectability assertion for profession and question type controls.

## Boundary Materialization

- Goal materialized: full acceptance matrix plus full unit baseline repair.
- Current task scope: shared admin AI generation detail-control source/test repair.
- Mandatory owner-facing checklist:
  `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.
- Requirement Mapping Result: relevant rows mapped to `content_admin` content AI generation and `org_advanced_admin`
  organization AI generation rows; durable completion remains blocked until role browser reruns cover every applicable
  checklist row.
- Cost Calibration Gate remains blocked.

## Evidence Boundary

Allowed evidence: role labels, route labels, control category labels, status labels, counts, command names, test counts,
and commit SHA.

Forbidden evidence: credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, DB URLs,
raw DOM, screenshots, traces, raw DB rows, internal IDs, PII, plaintext `redeem_code`, Provider payloads, prompts, raw
AI input/output, employee subjective answers, and complete question/paper/material/resource/chunk content.

## Validation Results

- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts`
  - GREEN result after implementation: passed.
  - Test count: 1 file, 14 tests passed.
- `npm.cmd run test:unit`
  - First full baseline result after implementation: timed out at 184 seconds; not accepted as pass evidence.
  - Re-run result: passed.
  - Test count: 317 files, 1432 tests passed.
- `npx.cmd prettier --write src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: formatted scoped source file; focused test unchanged.
- `npx.cmd prettier --write --ignore-unknown <task-scoped files>`
  - Result: passed; no additional file changes.
- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Post-format result: passed.
  - Test count: 1 file, 14 tests passed.
- `npm.cmd run format:check`
  - Result: passed.
- `npx.cmd prettier --check --ignore-unknown <task-scoped files>`
  - Result: passed.
- `npm.cmd run lint`
  - Result: passed.
- `npm.cmd run typecheck`
  - Result: passed.
- `git diff --check`
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-detail-controls-source-repair-2026-06-28`
  - Result: passed.
  - Scope scan: 9 changed task-scoped files.
  - Sensitive evidence scan: passed.
- `npm.cmd run test:unit`
  - Final full baseline result after formatting: passed.
  - Test count: 317 files, 1432 tests passed.
- `browser-ai-generation-detail-control-presence-read-only`
  - Result: attempted but not accepted as pass evidence for this source repair.
  - Redacted summary: existing localhost 3000 tab did not render the target entry surface; temporary 3001 dev server
    verification was unavailable because the repository already had a Next dev server lock on localhost 3000.
  - No submit action, UI/API mutation, credential capture, raw DOM evidence, screenshot evidence, trace, Provider call,
    or DB access was performed.
  - Follow-up: role-specific browser rerun remains required under the full acceptance matrix.

## Local Full Loop

- localFullLoopGate: passed for source/test repair based on focused unit, full unit baseline, format, lint, typecheck,
  and diff checks.
- Blocked remainder: full durable goal remains blocked by required role-specific browser reruns and all remaining
  owner-facing checklist rows. Final Pass remains blocked without fresh approval.
- threadRolloverGate: not required for this task; repository governance files and evidence contain the next task
  pointer.
- nextModuleRunCandidate: `full_acceptance_role_matrix_rerun_for_ai_generation_detail_controls_after_source_repair`.
