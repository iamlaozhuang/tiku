# Phase 14 Organization Tree Management UI Validation Task Plan

**Task id:** `phase-14-organization-tree-management-ui-validation`

**Branch:** `codex/phase-14-organization-tree-management-ui-validation`

**Date:** 2026-05-26

## Goal

Implement local organization tree maintenance on `/ops/organizations`, covering visual hierarchy display, create/edit/disable/enable operations, tier-parent validation, and e2e coverage for province/city/district management.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-14-org-auth-full-scope-management.md`

## Scope

Allowed:

- Local-only organization tree UI and validation on `/ops/organizations`.
- Existing organization create/update/disable/enable API usage.
- Unit/e2e tests and task documentation.

Forbidden:

- Do not read, modify, output, or summarize `.env.local` or `.env.example`.
- Do not connect to `staging`, `prod`, cloud resources, or real providers.
- Do not deploy, create PRs, or change remote state except the user-approved final push.
- Do not add, remove, or upgrade dependencies.
- Do not modify `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, or `scripts/**`.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full textbooks, full papers, OCR full text, or customer/customer-like private data.

## Requirement Coverage Matrix

| Requirement                          | Implementation target                                                              | Verification target                       |
| ------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| Tree view for province/city/district | Render grouped organization hierarchy with visual depth and public identifiers     | Unit/UI assertions and e2e                |
| Create organization node             | Form for name, `orgTier`, parent organization                                      | Unit payload assertions and e2e           |
| Edit organization node               | Reuse form for selected organization, update name/tier/parent                      | Unit payload assertions                   |
| Disable/enable organization          | Existing protected action buttons and confirmation                                 | Existing route plus e2e visibility        |
| Tier-parent validation               | Province has no parent; city parent must be province; district parent must be city | Validator/unit and UI blocking            |
| Self/cycle prevention                | Prevent self parent in UI; rely on service descendant check for deeper cycles      | Unit and service coverage                 |
| Public identifiers only              | Submit public ids; no numeric id rendering or payload                              | Unit/e2e payload checks                   |
| Authorization integration            | Newly maintained nodes appear in org auth covered organization selector            | E2E create hierarchy then verify selector |

## TDD Plan

1. RED: add validator tests for organization tier-parent rules.
2. GREEN: extend organization validation with explicit tier-parent validation helper.
3. RED: add admin UI unit tests for organization create/edit payloads and invalid parent blocking.
4. GREEN: implement organization tree maintenance panel on `/ops/organizations`.
5. RED/GREEN: add e2e assertions for organization tree maintenance controls and org auth selector integration.
6. Run focused tests, then full gates.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `npm.cmd run test:unit -- src/server/validators/organization.test.ts`
- `npm.cmd run test:e2e -- e2e/staging-required-role-flows.spec.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
