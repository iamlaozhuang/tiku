# Phase 0 Execution Plan: Architecture Freeze and Agent System

> Date: 2026-05-15
> Status: Draft
> Related design: `docs/superpowers/specs/2026-05-15-agent-system-automation-design.md`

## 1. Read Standards

- [x] `AGENTS.md`
- [x] `docs/03-standards/code-taste-ten-commandments.md`
- [x] `docs/03-standards/doc-management.md`
- [x] `docs/03-standards/ui-code.md`
- [x] `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- [x] `docs/01-requirements/00-index.md`
- [x] `docs/02-architecture/system-design/frontend/03-component-inventory.md`
- [x] `docs/02-architecture/system-design/frontend/04-page-wireframes.md`
- [x] `docs/05-execution-logs/task-plans/2026-05-14-全生命周期双核自动化机制实施方案.md`

## 2. Goal

Complete the architecture and automation control layer required before semi-automated business development starts.

This phase must make the project recoverable across Codex sessions, define the multi-client runtime architecture, and create the first version of the automation state machine.

## 3. Non-Goals

- Do not implement business features.
- Do not introduce new runtime dependencies without explicit approval.
- Do not create database migrations.
- Do not deploy.
- Do not merge pull requests automatically.
- Do not assume newly installed local skills are active until Codex has restarted.

## 4. Deliverables

### 4.1 Architecture Freeze

Create:

- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`

The ADRs must settle:

- Web and future mini program access model.
- `api/actions -> service -> repository -> model` layering.
- REST API contract for `/api/v1/*`.
- Workplace desktop Web compatibility boundary.
- Global DB/API design process.

### 4.2 Agent System SOP

Create:

- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`

The SOPs must settle:

- How sessions start and recover.
- Which skills are used in each phase.
- Which actions require human approval.
- How dependencies are introduced.
- How failures are reported and fused.

### 4.3 State and Queue

Create:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`

The state files must separate:

- Project-level cursor and facts.
- Task-level queue and retry status.
- Roadmap-level milestone order.

### 4.4 Script Skeleton

Create:

- `scripts/agent-system/Read-ProjectState.ps1`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `scripts/agent-system/New-TaskPlan.ps1`
- `scripts/agent-system/Update-TaskStatus.ps1`
- `scripts/agent-system/New-FailureReport.ps1`
- `scripts/agent-system/Invoke-QualityGate.ps1`

The first script version must not call Codex skills directly. It should only inspect files, create templates, update YAML state, and run available local commands.

### 4.5 Local Gate Planning

Plan later edits for:

- `package.json`: add `typecheck`, `test`, and possibly `test:e2e`.
- `.husky/pre-commit`: add typecheck/test strategy after scripts exist.
- `tsconfig.json`: exclude `.agent/`, `archive/`, and non-source execution documents where appropriate.
- `eslint.config.mjs`: ignore `.agent/`, `archive/`, generated logs, and non-source automation artifacts where appropriate.

These are implementation edits and should happen only after this plan is approved.

## 5. Risk Controls

- High-risk actions require approval:
  - Dependency addition.
  - Database migration.
  - Authorization or permission model change.
  - Secret or environment variable change.
  - External service configuration.
  - Destructive data operation.
  - Delete or move file.
  - Deployment.
  - PR merge.

- Git constraints:
  - Do not push to `main` or `master`.
  - Use `feat/`, `fix/`, or `codex/` branches.
  - Draft PR only.
  - No auto-merge.

- Failure fuse:
  - Retry a task at most three times.
  - On the third failure, write an issue tracking report and stop.

## 6. Validation Plan

Documentation validation:

- Confirm all planned files exist.
- Confirm document paths follow kebab-case where applicable.
- Confirm ADRs do not contradict `adr-001`.
- Confirm state files contain short facts and paths only.
- Confirm task queue entries have validation commands and risk markers.

Local command validation:

- Run `pnpm lint` when source files are changed.
- Run `pnpm typecheck` after the script is added.
- Run `pnpm test` only after a test script exists.
- Run `pnpm build` when runtime or build configuration changes.

## 7. Implementation Order

1. Write ADR-002.
2. Write ADR-003.
3. Write global DB/API skeleton.
4. Write automation loop SOP.
5. Write skill dispatch matrix.
6. Write dependency introduction gate.
7. Create `project-state.yaml`.
8. Create `task-queue.yaml`.
9. Create MVP roadmap.
10. Create PowerShell script skeleton.
11. Plan local gate edits.
12. Run available validation.
13. Produce evidence and update state.

## 8. Current Skill Status

The following local skills were copied into `C:\Users\laozhuang\.codex\skills` and contain `SKILL.md`:

- `ralplan`
- `ralph`
- `autopilot`
- `code-review`
- `pipeline`
- `plan`
- `team`
- `worker`
- `ultrawork`
- `ultraqa`
- `omx-setup`
- `prd`
- `code-simplifier`
- `drizzle-orm-expert`
- `nextjs-app-router-patterns`
- `nextjs-best-practices`
- `react-nextjs-development`
- `shadcn`
- `tailwind-design-system`
- `tailwind-patterns`
- `vercel-ai-sdk-expert`
- `rag-engineer`
- `rag-implementation`
- `playwright-skill`
- `postgres-best-practices`
- `postgresql`
- `typescript-expert`
- `auth-implementation-patterns`
- `e2e-testing`
- `webapp-testing`
- `tdd-orchestrator`
- `tdd-workflow`
- `testing-patterns`
- `unit-testing-test-generate`

Codex must be restarted before these newly installed skills are expected to appear in the available skill list.

## 9. Taste Compliance Checklist

- [x] No UI code was changed.
- [x] No pure black or hard-coded visual token changes were introduced.
- [x] No API response shape was changed.
- [x] No database schema or migration was changed.
- [x] No dependency was added to `package.json`.
- [x] Naming follows project document conventions.
- [x] The design keeps business logic out of UI and route shells.
- [x] The design includes validation and failure handling.
