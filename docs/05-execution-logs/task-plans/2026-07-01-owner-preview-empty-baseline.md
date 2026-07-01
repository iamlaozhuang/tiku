# Task Plan: owner-preview-empty-baseline

## Task

- Task id: `owner-preview-empty-baseline-2026-07-01`
- Branch: `codex/owner-preview-empty-baseline`
- Goal: add a local-only owner preview empty-baseline reset/seed utility with dry-run and guardrails.
- Human approval: current user explicitly requested implementation of the two-stage owner preview preparation plan on 2026-07-01.

## Read Before Coding

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Implement only phase one of the approved plan:

- Add a dedicated owner preview empty-baseline script.
- Preserve the eight owner preview role labels and the minimum `personal_auth` / `org_auth` / `organization` / `employee` binding skeleton needed for edition-aware UI checks.
- Clear business content and workflow state through an explicit guarded execution path.
- Provide dry-run output that contains role labels, table groups, and counts only.

Out of scope:

- No actual destructive reset execution during this implementation task.
- No browser runtime, e2e, Provider call, AI execution, staging/prod/cloud, deployment, Cost Calibration, dependency/package/lockfile, schema, migration, or `.env*` changes.
- No raw DB rows, internal numeric IDs, credentials, account identifiers, PII, plaintext `redeem_code`, complete `question`/`paper`/`material`/`resource`/`chunk` content, prompts, Provider payloads, or raw AI input/output in evidence.

## Implementation Approach

1. Write focused unit tests first for:
   - the exact eight retained role labels;
   - local database URL guard behavior;
   - explicit confirmation requirement for destructive execution;
   - dry-run mode avoiding DB mutation;
   - stdout/evidence summaries avoiding sensitive keys and raw identifiers.
2. Implement `src/db/owner-preview-empty-baseline.ts` as a testable module with:
   - exported role labels and table-plan metadata;
   - validation helpers;
   - dry-run summary generation;
   - guarded execution entrypoint that can accept an injected SQL adapter in tests.
3. Add `scripts/db/Reset-OwnerPreviewEmptyBaseline.ps1` as a thin wrapper around the TypeScript script.
4. Keep existing `src/db/dev-seed.ts` behavior unchanged.

## Validation

- `npm.cmd run test:unit -- tests/unit/owner-preview-empty-baseline.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId owner-preview-empty-baseline-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId owner-preview-empty-baseline-2026-07-01 -SkipRemoteAheadCheck`
