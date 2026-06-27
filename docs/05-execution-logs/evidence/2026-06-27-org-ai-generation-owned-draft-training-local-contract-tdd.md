# org AI generation owned draft/training local contract TDD evidence

## Scope evidence

- Task id: `org-ai-generation-owned-draft-training-local-contract-tdd-2026-06-27`
- Branch: `codex/org-ai-owned-draft-contract-tdd-20260627`
- Approval source: current user serial batch request on 2026-06-27.
- Runtime exclusions: no DB connection/mutation/migration, no Provider call/credential read, no publish, no student-visible verification, no browser/e2e/dev server, no staging/prod/payment/external-service.

## Validation evidence

- RED: `npm.cmd exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts`
  failed before implementation because `organizationOwnedDraftBoundary` was absent from the organization local contract response.
- RED: `npm.cmd exec vitest run src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
  failed before repository validation because a content workspace contract could carry an organization-private boundary.
- GREEN: `npm.cmd exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
  passed: 2 test files, 24 tests.
- `npx.cmd prettier --write --ignore-unknown ...` completed for scoped changed files.
- `npx.cmd prettier --check --ignore-unknown ...` passed.
- `git diff --check` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-ai-generation-owned-draft-training-local-contract-tdd-2026-06-27` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1` returned `idle_no_pending_task`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId org-ai-generation-owned-draft-training-local-contract-tdd-2026-06-27 -SkipRemoteAheadCheck` passed.

## Boundary evidence

- Added `organizationOwnedDraftBoundary` to admin AI generation local contract and history DTOs.
- Organization workspace boundary:
  - `generatedResultScope`: `organization_private`
  - `organizationDraftAdoptionStatus`: `allowed_as_organization_private_draft`
  - `organizationTrainingSourceStatus`: `allowed_as_organization_private_training_source`
  - `platformFormalDraftStatus`: `blocked_requires_content_admin_review`
  - `publishStatus`: `blocked_requires_fresh_publish_task`
  - `studentVisibleStatus`: `blocked`
- Content workspace boundary remains platform review pool and organization draft/training source adoption is not applicable.
- Repository safety gate rejects workspace/owner boundary contradictions before gateway insertion.
