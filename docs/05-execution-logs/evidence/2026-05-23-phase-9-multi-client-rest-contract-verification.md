# Evidence: phase-9-multi-client-rest-contract-verification

## Metadata

- Task id: `phase-9-multi-client-rest-contract-verification`
- Branch: `codex/phase-9-multi-client-rest-contract-verification`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`
- Security review: evaluated; no separate security review file required because this task only adds verification coverage and does not modify runtime auth/session/authorization behavior.

## Scope

Allowed files followed:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-multi-client-rest-contract-verification.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-multi-client-rest-contract-verification.md`
- `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`
- `e2e/local-business-flow.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `src/**`
- `drizzle/**`

## Verification Summary

- Added static REST route inventory coverage for `src/app/api/v1/**/route.ts` without modifying runtime code.
- Verified all inventoried REST route paths stay under `/api/v1/`, static path segments are kebab-case, dynamic params use `publicId`-style names, and route files do not expose `{id}` params.
- Verified `audit_log` and `ai_call_log` route handlers are read-only at the route export level: `/api/v1/audit-logs`, `/api/v1/ai-call-logs`, and `/api/v1/ai-call-logs/summary` only export `GET`.
- Added representative route-handler tests proving protected admin reads reject unauthenticated access before repository calls.
- Added representative admin DTO tests for standard `{ code, message, data, pagination? }` envelopes, camelCase JSON keys, publicId-only DTOs, and sensitive-field redaction.
- Extended browser E2E coverage to validate student and admin REST responses from the browser context, including standard envelopes, camelCase DTOs, no internal `id`, no sensitive data, unauthenticated `/api/v1/users` rejection, and read-only log write rejection with 405 responses.

## TDD Notes

- RED: `npm.cmd run test:unit -- tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`
  - Failed as expected because the new route inventory helper returned an empty route list.
- GREEN: same focused unit command passed after adding filesystem inventory helpers and contract assertions.
  - `1` file and `4` tests passed.
- E2E debugging: initial focused E2E failed because intentional `POST` probes against read-only log routes generated browser console errors and `requestfailed` entries for 405 responses. The test now precisely treats those three read-only write probes as expected verification artifacts while preserving the existing zero-unexpected-console/network-failure requirement.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-multi-client-rest-contract-verification
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-multi-client-rest-contract-verification`: pass.
- Focused RED `npm.cmd run test:unit -- tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`: failed as expected before helper implementation.
- Focused GREEN `npm.cmd run test:unit -- tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`: pass, `1` file and `4` tests passed.
- Focused E2E `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`: pass after expected 405 console/network handling, `1` Chromium test passed.
- `npm.cmd run test:unit`: pass, `103` files and `379` tests passed.
- `Invoke-QualityGate.ps1`: initial run failed only at `format:check` for the two modified test files after lint/typecheck/unit had passed; rerun passed after formatting, and final rerun after evidence/state updates also passed.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `103` files and `379` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js compiled successfully and listed the `/api/v1/` REST surface including student, admin, audit_log, ai_call_log, RAG, paper, question, material, and auth/session endpoints.
- `npm.cmd run test:e2e`: pass, `2` Chromium tests passed.
- `Test-NamingConventions.ps1`: pass; banned terms absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory on task branch; changed files are within allowed scope and there is no upstream.

## Residual Risk

- This task verifies the existing REST contract but does not repair runtime route defects because `src/**` is blocked by the queue.
- The E2E read-only log write probes intentionally receive 405 responses; their browser console and requestfailed artifacts are narrowly recognized as expected only for those POST probes.
- Full future mini program implementation remains out of scope; this task verifies that the REST boundary remains compatible with that future client.
- No real AI provider, production credential, production resource, dependency, lockfile, schema, migration, deploy, PR, or production-resource change was made.

## Taste Compliance Self-Check

- Frontend visual taste: no UI styling changes, no pure black, no new gradient, no design-token changes.
- Loading/empty/error: existing E2E still covers loading/failure/empty-safe surfaces; this task adds REST failure-state checks for unauthenticated access and read-only write rejection.
- Interaction feedback: no interaction behavior changed.
- Tailwind formatting: Prettier format gate passed after formatting the two modified test files.
- API response contract: unit and E2E assertions verify `{ code, message, data, pagination? }` envelopes on representative REST responses.
- Naming discipline: route inventory and naming gate verify `/api/v1/`, kebab-case paths, `publicId` params, and camelCase DTO keys.
- Public ID boundary: unit and E2E assertions reject internal `id` keys and `{id}` route params.
- Sensitive data: assertions reject session tokens, passwords, secrets, API keys, raw prompts, raw answers, provider payloads, and `code_hash`.
- Auth/session/authorization: representative admin reads reject unauthenticated access before repository calls.
- Dependency/schema isolation: no dependency, lockfile, `.env.example`, `src/**`, `drizzle/**`, schema, migration, deploy, PR, or production-resource changes.
