# Module Run v2 Evidence Redaction Scan Hardening Plan

## Summary

Expand pre-commit evidence redaction scanning so protected AI, provider, auth, database URL, and redeem_code-like content
is blocked before commit.

## Implementation

- Add scanner patterns for database connection URLs, provider-like keys, protected AI request/response fields, provider
  payload fields, generated-content fields, and plaintext redeem_code-like fields.
- Keep string construction split where needed so the scanner does not flag its own implementation.
- Extend smoke fixtures to prove each new protected pattern fails.
- Write final Module Run v2 mechanism closeout evidence and audit review.

## Validation

- `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier write/check with `--ignore-unknown`
- required anchor check
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-mechanism-completion`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
