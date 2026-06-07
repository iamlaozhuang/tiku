# Task Plan: phase-11-mvp-functional-completeness-gap-audit

## Task Claim

- Task id: `phase-11-mvp-functional-completeness-gap-audit`
- Branch: `codex/phase-11-mvp-functional-completeness-gap-audit`
- Phase: `phase-11-staging-release-planning`
- Human approval: user explicitly requested an MVP completeness gap audit across requirements, not limited to the seven named concerns, with P0/P1/P2/P3 classification and prioritized short implementation tasks.

## Boundary

This is a planning and audit task. It must not implement runtime features.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or real/private data.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- latest Phase 10 and Phase 11 local closeout evidence

## Audit Plan

1. Inventory requirement modules and story acceptance criteria.
2. Inventory implemented app routes, API routes, server services, repositories, contracts, and tests.
3. Build an MVP coverage matrix by domain: auth/session, content ops, system ops, student practice/mock_exam/report, AI/RAG/model config, resources/knowledge_base, audit/logging, data/security/release boundaries.
4. Classify gaps as:
   - `P0`: blocks MVP functional completeness or staging entry.
   - `P1`: core MVP feature incomplete, should be implemented before staging acceptance.
   - `P2`: important but can follow once P0/P1 are queued.
   - `P3`: polish, copy, or non-blocking hardening.
5. Split gaps into short lifecycle implementation tasks with dependencies, allowed scope, blocked scope, and validation intent.
6. Update project state and task queue with planning outputs only.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
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

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-functional-completeness-gap-audit`
- `Select-String -Path 'docs\05-execution-logs\audits-reviews\2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md' -Pattern 'P0|P1|P2|P3|content ops|system ops|student|AI|model_config|redeem_code|org_auth|stagingDecision'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Treat local happy path readiness and MVP completeness as separate decisions.
- Mark all entry-only, mock-only, fixture-only, and read-only surfaces explicitly.
- Do not convert audit conclusions into deployment or staging implementation approval.
- Keep future implementation tasks short and independently reviewable.
