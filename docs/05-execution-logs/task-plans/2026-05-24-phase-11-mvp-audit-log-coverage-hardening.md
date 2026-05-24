# Task Plan: phase-11-mvp-audit-log-coverage-hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Track steps with checkbox syntax.

**Goal:** Close MVP-GAP-013 for local `audit_log` coverage: prove critical content/system ops mutations write publicId-safe, redacted audit entries with role/result/target coverage, without dependency, schema, migration, script, staging/prod, cloud, secret/env, package, lockfile, or real-provider changes.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Routes remain thin. API responses use `{ code, message, data, pagination? }`, JSON fields use camelCase, and audit evidence must not include tokens, Authorization headers, raw payloads, raw prompt/answer/model output, full content, or private data.

**Boundary:** Current queue allowed files cover audit-log routes, admin UI, contracts, services, tests/e2e, and task docs/state only. Repository, schema, migration, script, dependency, env, staging/prod, cloud, destructive data, or real-provider work is not approved. Exact repository-level audit filtering remains out of scope because repository files were not in the task allowedFiles.

## Task Claim

- Task id: `phase-11-mvp-audit-log-coverage-hardening`
- Branch: `codex/phase-11-mvp-audit-log-coverage-hardening`
- Source gap: `MVP-GAP-013`
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
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-ai-knowledge-recommendation-review-loop.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                       | Runtime surface                                  | Current state   | Implementation evidence                                                                                                     | Downstream effect                                         | Remaining gap          | Decision     |
| -------------------------------------------------------------------------- | ------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------- | ------------ |
| Critical content/system ops mutations write audit entries                  | `admin-flow-runtime` audit callbacks/list route  | runtime_closed  | Existing user lifecycle audit callbacks retained; list route appends `audit_log.list` and target tests verify query surface | Operators can trace sensitive local admin changes         | none                   | implemented  |
| Audit entries use public identifiers and redact sensitive/raw data         | audit DTO/list API and admin UI                  | runtime_closed  | Unit test asserts no `id`, session token, Authorization value, or raw request body appears in API/UI output                 | Evidence remains safe for local review                    | none                   | implemented  |
| Audit list/filter UI exposes searchable coverage without leaking internals | `/api/v1/audit-logs`, admin ops UI               | runtime_closed  | Added `keyword`, `actionType`, `targetResourceType`, `resultStatus` query handling and `Audit log keyword` UI control       | Admin can verify audit coverage locally                   | none                   | implemented  |
| Failure paths record failed audit outcomes where runtime supports actor    | service audit DTOs and filterable `resultStatus` | partial_runtime | Tests prove failed audit entries are filterable and redacted                                                                | Denied or failed operations can be reviewed when recorded | blocked_by_approval    | not_in_scope |
| Repository-level audit filtering across all pages                          | Postgres repository                              | partial_runtime | Service-level current page filtering implemented; repository edits were outside allowedFiles                                | Local UI/API can filter returned runtime rows             | blocked_by_approval P2 | not_in_scope |

## TDD Plan

1. [x] Inspect existing audit_log route/service/UI/tests and confirm allowed files are sufficient.
2. [x] RED: add focused failing tests for missing coverage, publicId-only DTOs, filtering, and redaction.
3. [x] GREEN: implement the smallest audit coverage hardening within allowed files.
4. [x] Record any exact persistence gap as `deferred_with_approval` if repository/schema changes are required.
5. [x] Run validation, update evidence, commit, merge, push, cleanup, then claim the next task only from a clean repo.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-audit-log-coverage-hardening`
- `npm.cmd run test:unit -- tests/unit/phase-11-audit-log-coverage-hardening.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Risk Controls

- Do not read or output `.env.local`.
- Do not call staging/prod, cloud resources, real model providers, vector services, OCR, or object storage.
- Do not record tokens, Authorization headers, raw payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunk text, embeddings, or private data.
- Do not change package files, lockfiles, schema, migrations, scripts, env files, or cloud/deploy configuration.
