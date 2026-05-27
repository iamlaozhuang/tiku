# Phase 20 Reaudit RA-01-08 Redeem Code Generation Coverage Plan

**Date:** 2026-05-27

**Task id:** `phase-20-reaudit-ra-01-08-redeem-code-generation-coverage`

**Branch:** `codex/phase-20-reaudit-ra-01-08-redeem-code-generation-coverage`

## Objective

Re-audit the Phase 19 coverage caveat `CV-19-03-001` for `RA-01-08` redeem_code batch generation coverage.

This task is governance and evidence only. It must decide whether the Phase 18/19 record represents missing evidence, a real test coverage gap, inconsistent status marking, missed audit scope, a documentation-only caveat, or a needed Phase 20+ follow-up task.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/01-requirements/stories/epic-01-user-auth.md#us-01-08-卡密批量生成`
- `docs/01-requirements/modules/01-user-auth.md#33-卡密生成与展示`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-audit-catalog.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-total-requirement-audit-report.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-01-user-auth-authorization.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-01-user-auth-authorization.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-finding-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-dedup-severity-taxonomy.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-coverage-matrix-review.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-follow-up-queue-alignment.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-19-04-follow-up-queue-alignment.md`

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Forbidden:

- business bug fixes;
- source, tests, e2e, schema, drizzle, scripts, dependency, package, lockfile, `.env.local`, or `.env.example` changes;
- staging/prod/cloud/deploy/real provider access;
- destructive data operations;
- recording plaintext generated redeem_code values, credentials, tokens, provider payloads, full papers, or customer-like private data.

## Reaudit Method

1. Reconstruct the original `RA-01-08` requirement from requirement SSOT and admin ops contract.
2. Compare Phase 18 RA-01 report/evidence with the Phase 16 traceability matrix.
3. Review Phase 19 coverage caveat and queue alignment decision.
4. Use only minimal read-only checks if needed to distinguish evidence wording from actual test coverage.
5. Produce a re-audit report that classifies the caveat as evidence gap, test gap, status inconsistency, missed audit, no-finding note, or follow-up task need.
6. Update evidence, queue, and project state without changing business implementation.

## Risk Controls

- Treat `redeem_code` plaintext as sensitive: do not include generated card values in evidence.
- Keep long-lived blocked gates blocked.
- Do not run browser flows unless needed; this task can be satisfied from Phase 18/19 evidence plus minimal read-only source/test inspection.
- If a follow-up is needed, register only a Phase 20+ fix/test/re-audit task with scoped allowed files; do not implement it here.

## Validation Plan

Required:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Prettier check for changed Markdown/YAML files

Also run if available/required by local CI:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Expected Deliverables

- Re-audit report: `docs/05-execution-logs/audits-reviews/2026-05-27-phase-20-reaudit-ra-01-08-redeem-code-generation-coverage.md`
- Evidence: `docs/05-execution-logs/evidence/2026-05-27-phase-20-reaudit-ra-01-08-redeem-code-generation-coverage.md`
- Queue/state updates marking this task closed after validation and closeout.
