# 2026-07-11 0704 Ops Contact Config Polish Evidence

## Scope

- Task: `0704-ops-contact-config-polish-2026-07-11`
- Branch: `codex/0704-ops-contact-config-polish`
- Route label: `运营后台 / 购买联系方式`
- Role labels covered: `super_admin`, `ops_admin`, `content_admin`, `student`
- Provider-enabled behavior: not executed.
- Staging/prod/deploy/env/secret work: not executed.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`

## Red-Green Evidence

- Red test command:
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`
  - Initial result: failed as expected.
  - Failure categories:
    - Admin editor saved only one contact channel while preview expected multiple channels.
    - Contact config contract omitted channel enabled state and QR image reference.
    - QR image upload route handler was absent.

- Green targeted test command:
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`
  - Result: passed.
  - Count: 3 files, 15 tests.

## Fix Summary

- Refactored purchase contact admin page into a full-width channel editor plus student-facing preview.
- Preserved all configured channels on save instead of collapsing to the first channel.
- Added channel `isEnabled` and `qrImageUrl` contract fields with backward-compatible normalization.
- Added local runtime QR image upload/read route for purchase contact QR images.
- Updated student purchase guidance to hide disabled channels and render QR images when available.
- Kept contact config write permission limited to operations roles; content role remains denied.

## Verification Commands

- `corepack pnpm@10.26.1 run lint`
  - Result: passed.
- `corepack pnpm@10.26.1 run typecheck`
  - Result: passed.
- `git diff --check`
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-ops-contact-config-polish-2026-07-11`
  - Result: passed.
  - Count: 15 files scanned.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-ops-contact-config-polish-2026-07-11 -SkipRemoteAheadCheck`
  - Result: passed.

## Redaction Notes

- No DB URL, environment value, credential, session, cookie, token, Provider payload, raw AI output, raw prompt, QR binary content, card plaintext, internal row data, full question text, full paper text, or raw log content is recorded.
