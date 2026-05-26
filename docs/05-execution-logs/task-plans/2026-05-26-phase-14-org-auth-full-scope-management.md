# Phase 14 Org Auth Full Scope Management Task Plan

**Task id:** `phase-14-org-auth-full-scope-management`

**Branch:** `codex/phase-14-org-auth-full-scope-management`

**Date:** 2026-05-26

## Goal

Implement full local enterprise authorization management on `/ops/organizations`, replacing the hard-coded local shortcut with a requirement-complete `org_auth` creation flow for province/city/district organization hierarchy, scope selection, quota, dates, overlap validation, and cancellation visibility.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-14-local-human-experience-verification.md`

## Scope

Allowed:

- Local-only implementation and validation.
- Runtime/UI/test/docs/state/queue changes in the task allowlist.
- Existing dependencies only.
- Browser verification against `localhost` / `127.0.0.1`.

Forbidden:

- Do not read, modify, output, or summarize `.env.local` or `.env.example`.
- Do not connect to `staging`, `prod`, cloud resources, or real providers.
- Do not deploy, create PRs, or push without explicit approval.
- Do not add, remove, or upgrade dependencies.
- Do not modify `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, or `scripts/**`.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full textbooks, full papers, OCR full text, or customer/customer-like private data.

## Requirement Coverage Matrix

| Requirement                                                         | Implementation target                                                              | Verification target                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Organization tree up to province/city/district/baseline descendants | Preserve existing `organization` DTO and show parent/child context in UI selection | Unit/UI assertions and browser observation                   |
| Purchase subject differs from usage scope                           | Form field `purchaserOrganizationPublicId` plus scope organization selection       | E2E creates specified-node auth with separate fields visible |
| Scope type: current organization and descendants                    | Form option `current_and_descendants`; submit selected purchaser as root           | Unit validator, UI submit payload, e2e                       |
| Scope type: specified organization list                             | Form option `specified_nodes`; checkbox list controls selected organizations       | Unit validator, UI submit payload, e2e                       |
| Profession and level                                                | Form controls for `profession` and `level`                                         | Unit/e2e payload checks                                      |
| Account quota                                                       | Numeric quota input, positive integer validation                                   | UI disabled/error state and service validation               |
| Valid start/end dates                                               | Date inputs converted to ISO; end must be after start                              | Validator/unit tests                                         |
| No overlapping same profession/level/date/scope                     | Preserve service/repository overlap check and surface clear Chinese error          | Unit/e2e overlap negative path                               |
| Cancel keeps history and terminates affected flows                  | Preserve existing cancel action and improve visibility                             | Existing and focused e2e                                     |
| Public identifiers only                                             | UI submits and renders publicId only; no internal numeric id                       | Existing tests and e2e                                       |

## Implementation Plan

1. Write failing validator/unit tests for full `org_auth` input normalization: dates, quota, current-and-descendants root, specified list, and invalid date range.
2. Update validator/service minimally so tests pass.
3. Write failing React/UI unit tests or focused e2e for the form states and payload shape.
4. Replace hard-coded `createDefaultOrgAuthInput` with state-driven form inputs in `AdminOrgAuthRedeemPage.tsx`.
5. Add browser/e2e coverage for successful specified-list creation and overlap error display.
6. Run focused tests after each change, then full gates.
7. Record evidence and cross-check all requirements in this plan.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
