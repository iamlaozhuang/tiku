# Evidence: Admin AI Generation Task Persistence Contract And Repository TDD

Task id: `admin-ai-generation-task-persistence-contract-and-repository-tdd-2026-06-26`

## Initial Boundary

- Branch: `codex/admin-ai-persistence-contract-20260626`
- Entry master/origin master: `8b4a036b5e4f7d9596cfa48624d778a31923bb8b`
- Approval source: `user_request_admin_ai_generation_task_persistence_contract_and_repository_tdd_2026_06_26`

## Redaction And Safety

- Provider calls executed: `false`
- Provider configuration read: `false`
- Env/secret/credential read: `false`
- DB connection/write/schema/migration/seed/account mutation: `false`
- Formal `question`/`paper` write: `false`
- Package/lockfile change: `false`
- Browser/e2e/dev-server/staging/prod/payment/external service: `false`
- Release readiness/final Pass claimed: `false`

## TDD Log

- RED: `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
  failed before implementation with missing `./admin-ai-generation-task-persistence-repository` module.
- GREEN: same focused unit command passed after adding contract and repository port.
- REFACTOR: removed one unused type import warning and reran focused unit/lint/typecheck.

## Implementation Summary

- Added `src/server/contracts/admin-ai-generation-task-persistence-contract.ts`.
- Added `src/server/repositories/admin-ai-generation-task-persistence-repository.ts`.
- Added `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`.
- Repository uses an injected gateway only and does not import `src/db/schema`.
- Covered create/reuse for:
  - content admin AI question local contract as platform-owned pending task metadata;
  - organization advanced admin AI paper local contract as organization-owned pending task metadata.
- Server-owned result metadata remains `resultPublicId: null`, `evidenceStatus: none`, `citationCount: 0`, and `aiCallLogPublicId: null`.
- Unsafe local contracts are rejected before gateway insertion when Provider execution or formal write status is detected.

## DB Adapter Boundary

- Real DB adapter is not implemented.
- Existing `ai_generation_task` adapter compatibility is not claimed by this task.
- Follow-up must decide whether the existing table can support admin AI generation metadata or whether a separate schema/mapping task is required.

## Validation Log

- Focused unit: `pass`, 1 file / 4 tests.
- Lint: `pass`.
- Typecheck: `pass`.
- Scoped prettier write: `pass`.
- `git diff --check`: `pass`.
- Module Run v2 pre-commit hardening: `pass`.
- Module Run v2 pre-push readiness: `pass_skip_remote_ahead_check`.
