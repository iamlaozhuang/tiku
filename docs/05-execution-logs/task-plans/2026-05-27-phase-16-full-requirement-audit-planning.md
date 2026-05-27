# Phase 16 Full Requirement Audit Planning Task Plan

**Task id:** `phase-16-full-requirement-audit-planning`

**Branch:** `codex/phase-16-full-requirement-audit-planning`

**Date:** 2026-05-27

## Scope

Plan a full, systematic implementation audit against the MVP requirement SSOT. This task is documentation and queue planning only.

Allowed output surfaces:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-27-phase-16-full-requirement-audit-planning.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-16-full-requirement-audit-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-audit-catalog.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-full-audit-prerequisites.md`

Forbidden surfaces:

- `.env.local`
- `.env.example`
- package manifests and lockfiles
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- staging/prod/cloud/provider/deploy actions

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/epic-*.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- latest evidence and task plan for `phase-15-mechanism-presentation`

## Requirement SSOT Decision

The formal requirements SSOT is:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`

The audit item index is derived from:

- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`

The story files contain 6 epics and 64 user stories. Each user story becomes one independent audit item.

Architecture and interface files are contract supplements for expected implementation surfaces, not replacements for requirement SSOT.

## Implementation Approach

1. Register the Phase 16 planning task in `task-queue.yaml` as `docs_only`.
2. Create the task plan, evidence file, audit catalog, traceability matrix, and prerequisites document.
3. Use the 64 user stories as the audit item granularity.
4. Seed six follow-up audit execution tasks, one per epic:
   - user/auth/authorization
   - question/paper/content
   - student experience
   - AI scoring/explanation/hint/model
   - RAG/knowledge
   - admin ops/logs/permissions
5. Keep follow-up tasks as audit execution tasks only. Findings are recorded; bug fixes are deferred to Phase 20+ repair planning.

## Risk Controls

- Do not inspect or modify `.env.local` or `.env.example`.
- Do not change dependencies, package manifests, lockfiles, schema, migrations, runtime code, tests, e2e, or scripts.
- Do not start dev server, connect to staging/prod/cloud, deploy, or call real providers in this planning task.
- Do not turn findings into code fixes during audit execution.
- Keep blocked gates explicit in catalog, prerequisites, evidence, and queue tasks.

## Validation Plan

Run before handoff:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Prettier check on changed Markdown/YAML files when available.
