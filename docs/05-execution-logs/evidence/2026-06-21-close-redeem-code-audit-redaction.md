# close-redeem-code-audit-redaction Evidence

## Scope

- Branch: `codex/close-redeem-code-audit-redaction`
- Base: `ed7f49e7652fcc3af713a2e0a35ef4ff2a0ff1b4`
- Task: redeem_code audit_log and ai_call_log redaction contract

## Commands

- RED: `npm.cmd run test:unit -- src/server/services/redeem-code-reference-service.test.ts`
  - Result: failed as expected because `RedeemCodeReferenceDto` did not yet include explicit audit redaction fields.
- GREEN: `npm.cmd run test:unit -- src/server/services/redeem-code-reference-service.test.ts src/server/services/audit-ai-call-log-reference-service.test.ts src/server/services/ops-governance-redeem-code-redacted-reference-service.test.ts`
  - Result: passed, 3 files, 9 tests.
- `npm.cmd run lint`
  - Result: passed.
- `npm.cmd run typecheck`
  - Result: passed.
- `git diff --check`
  - Result: passed.
- `prettier --check` on task files
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId close-redeem-code-audit-redaction`
  - Result: passed after test-only sensitive marker names were neutralized.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId close-redeem-code-audit-redaction -SkipRemoteAheadCheck`
  - Result: passed.

## Implementation Notes

- Added an explicit `auditRedaction` object to `RedeemCodeReferenceDto`.
- The read model now states that audit_log metadata is redacted and ai_call_log request/response, plaintext code, hash, provider payload, raw prompt, raw answer, internal id, and publicId inventory are not included.
- Related audit/ai_call_log and ops-governance redaction tests remain passing.

## Notes

- Evidence intentionally excludes plaintext `redeem_code`, hashes, Provider payloads, raw prompts, raw answers, secrets, tokens, database URLs, raw rows, publicId inventories, and internal numeric ids.
