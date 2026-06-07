# Task Plan: phase-11-local-product-readiness-audit

## Task

- Task id: `phase-11-local-product-readiness-audit`
- Branch: `codex/phase-11-local-product-readiness-audit`
- Date: 2026-05-23
- Type: planning and audit design

## Human Approval

The user approved Option B: perform a systematic local product readiness audit before continuing broader Phase 11 staging implementation planning.

This approval covers planning, checklist design, issue taxonomy, evidence, and task queue updates only.

It does not approve cloud resources, deployment, staging/prod connections, secret/env changes, dependency changes, schema or migration changes, runtime code changes, provider calls, or production resource changes.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Create a local product readiness audit framework before staging work continues:

- Define the role-play audit objective and staging entry decision boundary.
- Create a complete local experience checklist covering student, admin, content, AI/RAG, auth, and error-state flows.
- Define issue severity, evidence rules, redaction rules, and staging blocker criteria.
- Record the already observed content admin button issue as an initial finding without implementing a fix.
- Seed follow-up task recommendations for audit execution and fix-package planning.

## Allowed Files

- `docs/superpowers/specs/2026-05-23-local-product-readiness-audit-design.md`
- `docs/05-execution-logs/task-plans/2026-05-23-phase-11-local-product-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-audit.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-local-product-readiness-audit.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`
- `scripts/**`

## Risk Controls

- No source code changes.
- No dependency change.
- No database schema, migration, seed, or destructive data operation.
- No staging/prod connection.
- No cloud resource creation or deployment.
- No secret, token, API key, provider payload, raw prompt, raw answer, raw model response, or raw customer/customer-like content in evidence.
- Local browser observations may reference route paths, roles, visible control names, and summarized behavior only.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-product-readiness-audit`
- `Select-String -Path 'docs\05-execution-logs\audits-reviews\2026-05-23-phase-11-local-product-readiness-audit.md' -Pattern 'P0|P1|P2|P3|student|admin|content|staging entry'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
