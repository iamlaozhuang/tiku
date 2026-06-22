# close-redeem-code-detail-ui Evidence

## Scope

- Branch: `codex/close-redeem-code-detail-ui`
- Base: `883bcd96832faac04446bf7e90230c532c1f9b50`
- Task: admin redacted `redeem_code` detail UI

## Commands

- RED: `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
  - Result: failed as expected because the existing UI detail panel still rendered list summary data and did not show detail-only fields.
- GREEN: `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
  - Result: passed, 2 files, 17 tests.
- `npm.cmd run lint`
  - Result: passed.
- `npm.cmd run typecheck`
  - Result: passed.
- `git diff --check`
  - Result: passed.
- `prettier --check` on task files
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId close-redeem-code-detail-ui`
  - Result: passed. Scope scan matched 7 task files.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId close-redeem-code-detail-ui -SkipRemoteAheadCheck`
  - Result: passed.

## Implementation Notes

- The admin redeem_code detail button now fetches `/api/v1/redeem-codes/{publicId}` with the existing admin session header.
- The detail panel renders the task 9 redacted detail DTO fields, including generation batch reference, duration, redemption time, update time, and redaction metadata.
- The panel keeps `data-public-id` and does not render internal numeric ids, plaintext values, hashes, or credential markers from defensive test payloads.
- Detail loading and failure paths use the existing admin UI loading/toast patterns.

## Notes

- Evidence intentionally excludes plaintext `redeem_code`, hashes, secrets, tokens, database URLs, raw rows, publicId inventories, and internal numeric ids.
