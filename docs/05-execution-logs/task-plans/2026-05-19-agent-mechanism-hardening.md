# Task Plan: agent-mechanism-hardening

## Goal

Strengthen the semi-automation mechanism based on the Phase 0-2 review findings, then review, validate, commit, merge, push, and clean up when the result is ready.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-0-2-mechanism-review.md`

## Scope

- Task id: `agent-mechanism-hardening`
- Branch: `codex/phase-0-2-mechanism-review`
- Base: `master`

Allowed files:

- `docs/03-standards/testing-tdd.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/git-workflow.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/task-plans/2026-05-19-agent-mechanism-hardening.md`
- `docs/05-execution-logs/evidence/2026-05-19-agent-mechanism-hardening.md`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `scripts/agent-system/Test-NamingConventions.ps1`
- `scripts/agent-system/New-TaskEvidence.ps1`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- Runtime application source under `src/**`

## Implementation Plan

1. Update testing standards to reflect the active Vitest and Playwright baseline.
2. Add a security review gate SOP for high-risk authorization, API contract, data contract, schema, session, token, and admin tasks.
3. Add naming and API contract scan script for banned glossary terms, non-kebab API route folders, and risky DTO snake_case patterns.
4. Add task evidence skeleton generator to reduce manual closeout drift.
5. Register the new governance SOP and scripts in readiness checks.
6. Update automation-loop, local-ci, and git workflow references so the new gates are operationally visible.
7. Run self-review and validation before commit.

## Risk Gate

- Dependency change: no.
- Database migration: no.
- Auth or permission model: process gate only, no runtime behavior change.
- Secret or environment change: no.
- Destructive data operation: no.
- Merge and push: user explicitly requested merge/push/cleanup if review confirms OK.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Evidence Plan

- Record implementation scope and changed files.
- Record validation command results.
- Record review findings and residual risks.
- Record commit, merge, push, and cleanup closeout.
