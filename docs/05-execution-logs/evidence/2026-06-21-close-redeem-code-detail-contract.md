# close-redeem-code-detail-contract Evidence

## Scope

- Branch: `codex/close-redeem-code-detail-contract`
- Base: `8142dc9be618543480ba56c0e546522c19111a0d`
- Task: redacted `redeem_code` detail contract and route by `publicId`

## Commands

- RED: `npm.cmd run test:unit -- tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
  - Result: failed as expected because `redeemCodes.detail.GET` did not exist yet; 5 existing tests passed and 3 new detail tests failed.
- GREEN: `npm.cmd run test:unit -- tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
  - Result: passed, 1 file, 8 tests.
- `npm.cmd run lint`
  - Result: passed.
- `npm.cmd run typecheck`
  - Result: passed after keeping the new detail repository method optional for older injected mocks.
- `git diff --check`
  - Result: passed.
- `prettier --check` on task files
  - Result: passed after local formatting of the runtime service file.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId close-redeem-code-detail-contract`
  - Result: passed. Scope scan matched 10 task files.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId close-redeem-code-detail-contract -SkipRemoteAheadCheck`
  - Result: passed.

## Implementation Notes

- Added `RedeemCodeDetailDto` and `RedeemCodeDetailResultDto` with redaction status fields and camelCase JSON names.
- Added `/api/v1/redeem-codes/{publicId}` GET route wiring to the existing admin redeem_code runtime.
- Added server-side admin read authorization, route `publicId` validation, 404 not found envelope, and `cache-control: no-store` on detail responses.
- Added repository detail lookup by `publicId`; internal ids are only used inside the repository and are not returned.
- Focused unit coverage serializes the detail payload and checks that sensitive field names and credential markers are absent.

## Notes

- Evidence intentionally excludes plaintext `redeem_code`, hashes, secrets, database URLs, raw rows, publicId inventories, and internal numeric ids.
