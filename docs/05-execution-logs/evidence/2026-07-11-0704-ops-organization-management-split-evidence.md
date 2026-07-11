# 0704 Ops Organization Management Split Evidence

## Scope

- Task: `0704-ops-organization-management-split-2026-07-11`
- Branch: `codex/0704-ops-organization-management-split`
- Route label: operations enterprise management, `/ops/organizations`
- Role labels: operations administrator, super administrator
- Evidence mode: redacted role, route, status category, issue category, fix summary, test counts only

## Inputs Reviewed

- Required agent, state, queue, code taste, ADR, requirements, advanced edition, authorization, UI/UX, org auth, employee import, and organization tree documents were read.
- Local private `/ops/organizations` screenshots were reviewed in memory only and were not copied into repository evidence.
- Existing code and tests for enterprise authorization, employee import, organization mutation, and organization tree UI were reviewed before implementation.

## Red Test

- Command: `corepack pnpm@10.26.1 exec vitest run tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- Result: expected fail before implementation
- Count: 1 file, 4 failing tests
- Failure category: old page title and missing task-view split

## Fix Summary

- Changed `/ops/organizations` page title and loading/error/empty copy from enterprise authorization operations to enterprise management.
- Added three task views: organization structure, enterprise authorization, employee operations.
- Default view is organization structure, with user-facing four-level hierarchy copy: province, city, district, station.
- Added URL query persistence for non-default task views without adding dependencies.
- Kept existing organization, enterprise authorization, employee import, transfer, unbind, and confirmation handlers.
- Updated targeted tests to explicitly navigate task views while preserving request-body and redaction assertions.

## Validation

- Targeted tests:
  - Command: `corepack pnpm@10.26.1 exec vitest run tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/admin-ops-summary-first-ui.test.ts`
  - Result: pass
  - Count: 4 files, 43 tests
- Lint:
  - Command: `corepack pnpm@10.26.1 run lint`
  - Result: pass
- Typecheck:
  - Command: `corepack pnpm@10.26.1 run typecheck`
  - Result: pass
- Diff check:
  - Command: `git diff --check`
  - Result: pass
- Module Run v2 pre-commit hardening:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-ops-organization-management-split-2026-07-11`
  - Result: pass
  - Count: 10 files scanned
- Module Run v2 pre-push readiness:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-ops-organization-management-split-2026-07-11 -SkipRemoteAheadCheck`
  - Result: pass after repository checkpoint update

## Sensitive Information Boundary

- No DB URL, env value, credential, session, cookie, token, raw DOM, or full screenshot recorded.
- No raw prompt, raw AI output, Provider payload, DB row, internal numeric id, card plaintext, or full employee/source data recorded.
- Provider-enabled behavior was not executed.
- Staging, production, deploy, env, secret, direct DB, schema, seed, and dependency changes were not executed.
