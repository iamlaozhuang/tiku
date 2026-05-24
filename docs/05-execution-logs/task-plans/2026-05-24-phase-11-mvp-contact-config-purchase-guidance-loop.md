# Task Plan: phase-11-mvp-contact-config-purchase-guidance-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Track steps with checkbox syntax.

**Goal:** Close MVP-GAP-009 for local `contact_config` purchase guidance: prove system ops and students can reach purchase guidance when authorization/redeem paths require help, with standard responses, safe copy, and no dependency/schema/migration/script/env/staging/prod/cloud changes.

**Architecture:** Preserve ADR-002 route-handler/server-action -> service -> repository/model layering. Keep any API response as `{ code, message, data, pagination? }`, JSON fields as camelCase, and UI changes inside existing admin/student feature boundaries.

**Boundary:** Allowed files cover admin/student features, server contracts/services, unit/e2e tests, and task docs/state. Schema, migration, repository, script, dependency, env, cloud/deploy, staging/prod, package/lockfile, real provider, and destructive data changes are not approved. If purchase guidance requires persisted `contact_config` schema or admin mutation beyond existing runtime surfaces, pause for explicit approval.

## Task Claim

- Task id: `phase-11-mvp-contact-config-purchase-guidance-loop`
- Branch: `codex/phase-11-mvp-contact-config-purchase-guidance-loop`
- Source gap: `MVP-GAP-009`
- Human approval: user approved routine commit/merge/push/cleanup for the MVP gap queue. Hard-stop gates still require explicit task-specific approval.
- Claim readiness: passed while queue status was `pending`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-system-ops-organization-management-loop.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                    | Runtime surface                                            | Current state   | Implementation evidence               | Downstream effect                                      | Remaining gap                          | Decision    |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- | ------------------------------------- | ------------------------------------------------------ | -------------------------------------- | ----------- |
| Student without usable authorization can see purchase guidance          | student redeem/profile surfaces and contact_config service | partial_runtime | RED/GREEN unit tests                  | Student can recover from no-auth or expired-auth state | none                                   | implemented |
| System ops can verify the published purchase guidance copy/contact data | admin redeem-code surface and contact_config service       | entry-only      | RED/GREEN unit tests                  | Ops can support purchase flow without fixture-only UI  | P2 persisted admin editing deferred    | implemented |
| Guidance response/props do not expose secrets or private data           | server contract/service/UI                                 | not_present     | RED/GREEN unit tests, typecheck       | Prevents evidence or UI leakage                        | none                                   | implemented |
| Flow does not depend on fixture-only/read-only/entry-only behavior      | local service plus student/admin rendered surfaces         | partial_runtime | related UI/runtime regressions, build | Avoids false MVP completion                            | P2 no persisted contact_config storage | implemented |
| No dependency/schema/migration/script/env/staging/prod change           | task boundary and repository state                         | runtime_closed  | Claim readiness passed                | Keeps Phase 11 local-only boundary intact              | none                                   | implemented |

## TDD Plan

1. [x] Read required standards, ADRs, SOP, queue, prior evidence, and active task metadata.
2. [x] Inspect existing contact_config, redeem, authorization, profile, and ops guidance surfaces.
3. [x] RED: add focused failing test(s) for the highest-risk purchase guidance gap.
4. [x] GREEN: implement the smallest local runtime/UI hardening inside allowed files.
5. [x] Record approval-blocked residuals if schema, repository, env, script, or destructive data work is required.
6. [ ] Run validation, update evidence, commit, merge, push, cleanup, then claim the next task only from a clean repo.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-contact-config-purchase-guidance-loop`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Do not read or output `.env.local`.
- Do not change dependencies, package files, lockfiles, schema, migrations, repositories, scripts, env files, cloud, deployment, staging, or prod configuration.
- Do not record secrets, credential values, Authorization header values, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, or private data.
- Pause for approval before adding persisted contact_config storage, admin mutation paths, major permission model changes, or destructive data operations.
