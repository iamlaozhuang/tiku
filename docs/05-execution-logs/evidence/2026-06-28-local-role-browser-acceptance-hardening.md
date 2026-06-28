# 2026-06-28 Local Role Browser Acceptance Hardening Evidence

- Task id: `local-role-browser-acceptance-hardening-2026-06-28`
- Branch: `codex/local-role-browser-acceptance-20260628`
- Local target: `localhost:3000` / `127.0.0.1:3000`
- Evidence mode: redacted role/route/command status only.

## Approval Boundary

The user approved executing the recommended local role browser acceptance hardening task, then approved local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup after validation.

## Redaction Boundary

This evidence intentionally omits credentials, session values, tokens, cookies, localStorage, Authorization headers, connection strings, raw DB rows, internal ids, user email/phone, plaintext redeem_code, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI output, employee subjective answers, and full question/paper/resource/chunk content.

The in-app browser used local private acceptance credentials only as input to localhost login forms. Credential values were not copied into evidence or terminal output.

## Changes

- Updated three focused unit fixtures to include the runtime-required organization admin workspace capability source fields:
  - `organizationAuthorizationSource: "org_auth"`
  - `capabilitySource: "service_computed"`
- No product source file changed.
- No package/lockfile, `.env*`, schema, migration, seed, Provider, or Cost Calibration file changed.

## Focused Unit RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

Result:

- RED before fixture repair.
- 3 focused files ran.
- 8 assertions failed and 12 passed.
- Failure class: organization standard/advanced admin fixtures did not satisfy the current runtime organization workspace capability contract and rendered denied or unauthenticated states instead of expected standard-unavailable/ready states.
- No credential, token, DOM, or raw payload output was recorded here.

## Focused Unit GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

Result:

- PASS.
- 3 focused files passed.
- 20 tests passed.

## Local E2E Smoke

Command:

```powershell
$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-baseline-accounts-auth-db.spec.ts e2e/local-full-loop-student-answer-ai-explanation-smoke.spec.ts e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --reporter=line
```

Result:

- PASS.
- 3 specs passed.
- 3 tests passed.
- Reused the existing localhost dev server.

## In-App Browser Acceptance

Result:

- PASS.
- Local login controls were present and unique.
- Six roles logged in successfully using local private acceptance credentials as input only.
- 18/18 local browser route checks passed.
- Console error count was 0 for every checked route.

| Role                 | Local browser checks | Result |
| -------------------- | -------------------: | ------ |
| `student`            |             3 routes | PASS   |
| `content_admin`      |             2 routes | PASS   |
| `ops_admin`          |             2 routes | PASS   |
| `org_standard_admin` |             4 routes | PASS   |
| `org_advanced_admin` |             5 routes | PASS   |
| `employee`           |             2 routes | PASS   |

Route checks used only expected-route, non-login, non-permission-denied, nonblank structure, stable selector counts, and boolean marker summaries. No raw DOM or screenshot was saved.

## Role Mapping Result

| Role                 | Browser acceptance result                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `student`            | PASS: student home, practice, and mistake_book entry routes reachable.                          |
| `content_admin`      | PASS: content AI question/paper generation entries reachable.                                   |
| `ops_admin`          | PASS: ops users and AI audit/log entries reachable.                                             |
| `org_standard_admin` | PASS: organization portal reachable; advanced-only routes return standard-unavailable boundary. |
| `org_advanced_admin` | PASS: organization portal, training, analytics, and AI generation entries reachable.            |
| `employee`           | PASS: employee home and organization training routes reachable.                                 |

## Final Quality Gates

Result:

| Gate                                                         | Result                               |
| ------------------------------------------------------------ | ------------------------------------ |
| Scoped Prettier write/check                                  | PASS                                 |
| `npm.cmd run lint`                                           | PASS                                 |
| `npm.cmd run typecheck`                                      | PASS                                 |
| `git diff --check`                                           | PASS                                 |
| `Get-TikuProjectStatus.ps1`                                  | PASS, Cost Calibration still blocked |
| `Test-ModuleRunV2PreCommitHardening.ps1`                     | PASS                                 |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck` | PASS                                 |

## Blocked Gates Preserved

- Cost Calibration: blocked.
- Pricing/quota default decision: not executed.
- Provider/model call: not executed by this task.
- Release readiness/final Pass: not claimed.
- Staging/prod/deploy/payment/OCR/export/external service: not executed.
