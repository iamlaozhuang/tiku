# Phase 23 Validation Data Prep Mechanism Evidence

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: `scripts/local/Invoke-ValidationDataPrep.ps1`, `e2e/validation-data-prep.spec.ts`, evidence/security review/state.
- Gates: validation data prep command pass after one helper bug fix and one stale fixed-student state fix; unit pass; naming pass.
- Forbidden scope (`forbiddenScope`): no dependency, schema/migration/drizzle, raw SQL, destructive DB, `.env.example`, secret disclosure, staging/prod/cloud/deploy, real provider, or external service.
- Residual gaps (`residualGaps`): fresh DB first-run e2e validation still pending.

## Implementation

Added a local/dev validation data prep mechanism:

- `scripts/local/Invoke-ValidationDataPrep.ps1`
- `e2e/validation-data-prep.spec.ts`

The prep mechanism uses existing local `/api/v1/` routes only. It does not directly write database tables, does not use raw SQL, and does not change schema or migrations.

Prepared prerequisites:

- `org_auth`: create or reuse a synthetic organization authorization through admin API.
- `material`: create or reuse a synthetic material through content API.
- `mistake_book`: create through student practice wrong-answer flow.
- `ai_call_log`: create through local/mock learning suggestion flow after mock_exam report generation.

The student flow uses a new synthetic student per prep run to avoid stale fixed-account `mock_exam` state from previous runs. A plaintext `redeem_code` is used only in memory for the local redemption API call and is not attached, printed, or recorded.

## Debugging Notes

First prep run in sandbox failed with `EPERM` while opening the Playwright CLI under `node_modules`; rerun was approved outside the sandbox for the same local command.

The next run exposed a test helper naming bug: a payload helper and request helper were both named `readFirstPublicId`, causing a payload to be passed where `APIRequestContext` was expected. The helper call was corrected to `readFirstPublicIdFromPayload`.

The following run exposed stale fixed-student state: `mock_exam` answer save returned `409311` because a fixed dev student can encounter old completed/expired `mock_exam` state. The prep flow now creates and authorizes a fresh synthetic student for student-side validation data.

## Commands

### Validation data prep

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-ValidationDataPrep.ps1
```

Initial sandbox result: failed with `EPERM` on local Playwright CLI access.

Approved rerun result after fixes: pass.

Output summary:

```text
Running 1 test using 1 worker
1 passed
```

### Unit tests

Command:

```text
npm.cmd run test:unit
```

Result: pass.

Output summary:

```text
Test Files 153 passed
Tests 631 passed
```

### Naming scan

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Result: pass.

Output summary:

```text
banned terms absent
standalone section/option absent
route folders use kebab-case and public-id route params
contract DTO fields are camelCase
```

## Evidence Hygiene

No `.env.local` values, DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, raw SQL output, plaintext `redeem_code`, full papers, full textbooks, OCR full text, or customer/customer-like private data are recorded.
