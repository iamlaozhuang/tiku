# Phase 20 Fix RA-02-06 Material Reference List Evidence

## Summary

- Result: validated on branch; pending commit/merge/push/cleanup.
- Scope: implementation.
- Changed surfaces: material DTO contract, material repository reference hydration, material mapper, content admin material UI, focused tests, governance state.
- Gates: claim readiness, focused tests, unit, lint, typecheck, build, e2e, AgentSystemReadiness, GitCompletionReadiness, diff check, changed-file Prettier, naming conventions, and QualityGate passed.
- Forbidden scope (`forbiddenScope`): no dependency/schema/migration/staging/prod/cloud/deploy/real provider work; no `.env.local` or `.env.example` edits.
- Residual gaps (`residualGaps`): none for the task finding.

## Task

- Task id: `phase-20-fix-ra-02-06-material-reference-list`
- Branch: `codex/phase-20-fix-ra-02-06-material-reference-list`
- Finding: `F-RA-02-06-001`
- Started at: `2026-05-27T05:19:34-07:00`
- Human approval: low-risk task registered by Phase 18 RA-02 audit; no high-risk approval required.

## Startup And Claim

- Previous task `phase-20-fix-ra-02-10-paper-copy-disabled-question-marker` was merged to `master`, pushed to `origin/master`, and its short-lived branch was deleted.
- `git status --short --branch` - `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master` - `0 0`.
- `git branch --no-merged master` - no output.
- `git worktree list` - only `D:/tiku  08b95ec [master]`.
- `git switch -c codex/phase-20-fix-ra-02-06-material-reference-list` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-06-material-reference-list` - pass.

## Scope Controls

- Allowed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, `docs/05-execution-logs/task-plans/**`, `docs/05-execution-logs/evidence/**`, `docs/05-execution-logs/audits-reviews/**`, `src/**`, `tests/**`, `e2e/**`.
- Blocked files: `.env.local`, `.env.example`, package manifests/lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`.
- High-risk gates: not triggered.

## TDD Evidence

- RED: `npm.cmd run test:unit -- admin-question-material-ui.test.ts` failed after adding API-backed `material.references.papers[]` to the material fixture and asserting the row displays `paper-material-ref-001`; current UI still rendered `当前 runtime DTO 未提供试卷引用列表`.
- GREEN focused UI: `npm.cmd run test:unit -- admin-question-material-ui.test.ts` - 1 file, 22 tests passed.
- GREEN focused material/runtime set: `npm.cmd run test:unit -- material-service.test.ts material-route.test.ts phase-9-content-question-material-runtime.test.ts admin-question-material-ui.test.ts` - 4 files, 31 tests passed.

## Implementation Evidence

- Added `MaterialReferenceListDto` to `MaterialDto` with `references.questions[]` and `references.papers[]`.
- Hydrated material references in the Postgres material repository from existing `question.material_id` and `question_group.material_id -> paper` relationships.
- Mapped reference rows to public-id-only API JSON fields: `questionPublicId` and `paperPublicId`.
- Replaced content admin material UI's local question-row inference with API-backed `material.references`; paper references now render from the DTO instead of the old placeholder.
- Updated legacy/static admin material fixtures and focused tests to include empty or populated reference lists.

## Validation Evidence

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-06-material-reference-list` - pass.
- `node .\node_modules\prettier\bin\prettier.cjs --write <changed files>` - sandbox EPERM on local Prettier binary; approved retry passed.
- `npm.cmd run test:unit` - 131 files, 531 tests passed.
- `npm.cmd run lint` - sandbox EPERM on local ESLint binary; approved retry passed.
- `npm.cmd run typecheck` - sandbox EPERM on local TypeScript binary; approved retry passed.
- `npm.cmd run build` - passed. Build log mentioned `.env.local` existence via framework environment loading only; contents were not inspected, copied, or modified.
- `npm.cmd run test:e2e` - passed; 25/25 tests.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - inventory completed on task branch.
- `git diff --check` - passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - passed.
- Changed-file Prettier check - sandbox EPERM on local Prettier binary; approved retry passed.
- First `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` failed in `typecheck` because generated `.next/dev/types/routes.d.ts` was corrupted after browser/dev-server activity.
- Generated cache cleanup: verified `.next/dev/types` resolved inside the workspace and removed that generated directory only; no tracked files changed.
- Retry `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - passed (`lint`, `typecheck`, `test:unit`, `format:check`).

## Closeout

- implementationCommit: `633b4e38e258bab6e7f7a3a4ff0f74e29c4e8bb3` (`fix(material): expose API backed material references`).
- merge: fast-forward merged into `master`, `08b95ec..633b4e3`.
- post-merge master validation:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - pass; master ahead of `origin/master` by one implementation commit before closeout evidence commit.
  - `git diff --check` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - pass.
  - Changed-file Prettier check - pass after sandbox EPERM retry with approval.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - pass; `lint`, `typecheck`, `test:unit` (131 files, 531 tests), and `format:check` passed.
  - `npm.cmd run test:e2e` - pass; 25/25 tests.
  - `npm.cmd run build` - pass. Build log mentioned `.env.local` existence via framework environment loading only; contents were not inspected, copied, or modified.
- closeoutEvidenceCommit: pending.
- push: pending.
- cleanup: pending.
