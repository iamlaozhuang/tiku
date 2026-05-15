# Agent System Automation Design

> Date: 2026-05-15
> Status: Approved for Phase 0 planning
> Scope: Cross-session, persistent, standards-driven project automation for Tiku

## 1. Purpose

Tiku needs an automation mechanism that can continue project work across Codex sessions without losing context, violating project standards, or generating unreviewable changes. The mechanism must preserve the existing Agentic SDLC document structure, respect the naming rules in `AGENTS.md`, and support future extension to a WeChat Mini Program.

The first version will not be a fully autonomous coding robot. It will create the control layer required for safe automation:

- Architecture freeze before business implementation.
- Persistent project state and task queue.
- Skill dispatch rules.
- Task decomposition into verifiable delivery units.
- PowerShell workflow scripts for state inspection, template generation, status updates, and quality gate checks.
- High-risk approval gates.
- Failure reporting and retry fuse.

## 2. Decisions

### 2.1 Runtime Architecture

Before the automation loop starts writing business code, the project must freeze the runtime architecture with a new ADR:

`docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`

The target architecture is:

```text
api/actions -> service -> repository -> model
```

Rules:

- `src/app/api/v1/*` route handlers are the stable external contract for future mini program access.
- Server Actions may be used by the Web client, but only as thin wrappers around services.
- Business logic belongs in `server/services`.
- Drizzle queries belong behind `server/repositories`.
- Drizzle schema and database models belong in `server/models`.
- API responses must follow `{ code, message, data, pagination? }`.
- External URLs must not expose auto-increment primary keys.

### 2.2 DB/API Design Strategy

DB and API design will use a two-layer process:

1. Global skeleton first:
   - Core entities.
   - ID/public identifier strategy.
   - API response and pagination contract.
   - Error code strategy.
   - Authorization, audit, snapshot, and idempotency rules.
   - Cross-module data consistency rules.

2. Module-level detail second:
   - `user-auth`
   - `question-paper`
   - `student-experience`
   - `ai-scoring`
   - `rag-knowledge`
   - `admin-ops`

The global skeleton must be written before the task queue can start normal business implementation.

### 2.3 Workplace Desktop Web Compatibility

The project is "workplace desktop Web friendly", not strict Xinchuang certified.

A new ADR must record this boundary:

`docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`

Rules:

- No mandatory domestic OS, database, middleware, or CPU certification target.
- The Web app must be usable from ordinary workplace desktop browsers.
- The frontend should avoid unnecessary heavy rendering, fragile browser-only experiments, and high resource consumption.
- If a customer later requires strict Xinchuang procurement compliance, a separate ADR will be created.

### 2.4 Open Source Dependency Policy

Dependency introduction is part of the automation mechanism.

Rules:

- Adding a dependency is a high-risk action and requires human approval.
- Every dependency addition must record purpose, version, encapsulation boundary, alternatives, and validation command in the task plan.
- Third-party libraries must be isolated behind project-owned modules when they affect business contracts.
- Naming conflicts must be resolved with project glossary terms and type aliases.

## 3. Automation Scope

The selected automation scope is semi-automated development with draft PR preparation.

Allowed without human approval:

- Normal source edits within the task scope.
- Formatting.
- Local verification commands.
- Local commits.
- Push to allowed working branches.
- Draft PR preparation.

Requires human approval:

- Adding dependencies.
- Database migrations.
- Authorization or permission model changes.
- Secret or environment variable changes.
- External service configuration.
- Destructive data operations.
- Deleting or moving files.
- Deployment.
- PR merge.

Git policy:

- Protected branches: `main`, `master`.
- Allowed working branch prefixes: `feat/`, `fix/`, `codex/`.
- PRs created by the automation are draft by default.
- Auto-merge is forbidden.

## 4. State Model

The main state source is:

`docs/04-agent-system/state/project-state.yaml`

It stores project-level facts and cursors only. Long-form content belongs in ADRs, task plans, issue tracking, and evidence files.

The task queue is separate:

`docs/04-agent-system/state/task-queue.yaml`

This prevents the main state file from becoming large and hard to update safely.

Required state fields:

```yaml
schemaVersion: 1

project:
  name: tiku
  currentPhase: phase-0-architecture-freeze
  updatedAt: "2026-05-15T00:00:00+08:00"

architecture:
  status: pending
  requiredBeforeAutomation:
    - id: adr-002-runtime-architecture-and-multi-client-contract
      path: docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md
      status: pending
    - id: adr-003-workplace-desktop-web-compatibility
      path: docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md
      status: pending
    - id: global-db-api-skeleton
      path: docs/02-architecture/interfaces/global-db-api-skeleton.md
      status: pending

automation:
  mode: semi_auto
  gitBoundary: draft_pr
  approvalPolicy: high_risk_only
  maxRetryPerTask: 3
  branchPolicy:
    protectedBranches: [main, master]
    allowedPrefixes: [feat/, fix/, codex/]
    draftPrOnly: true
    autoMerge: false

taskSource:
  requirementsPath: docs/01-requirements/stories
  queueStrategy: story_to_verifiable_units

taskRegistry:
  path: docs/04-agent-system/state/task-queue.yaml

currentTask:
  id: null
  status: idle
  sourceStory: null
  planPath: null
  evidencePath: null
  branch: null
  commitSha: null
  prUrl: null
  retryCount: 0
  lastFailurePath: null

qualityGates:
  desired:
    - lint
    - typecheck
    - test
    - build_when_relevant
  available:
    - lint
  lastRun: {}

riskGates:
  requireHumanApproval:
    - add_dependency
    - database_migration
    - auth_permission_model
    - secret_or_env_change
    - external_service_config
    - destructive_data_operation
    - delete_or_move_file
    - deploy
    - merge_pr

skills:
  dispatchMatrixPath: docs/04-agent-system/sop/skill-dispatch-matrix.md

handoff:
  lastSummaryPath: null
  nextRecommendedAction: complete_phase_0_architecture_freeze
```

## 5. Task Decomposition

The full project must be decomposed before continuous automation begins. The decomposition has three layers:

1. Phase-level roadmap:
   - `phase-0-architecture-freeze`
   - `phase-1-foundation`
   - `phase-2-user-auth`
   - `phase-3-question-paper`
   - `phase-4-student-experience`
   - `phase-5-ai-rag`
   - `phase-6-admin-ops`

2. Module backlog:
   - Sourced from `docs/01-requirements/stories/*.md`.
   - Epics are not executed directly.

3. Verifiable delivery units:
   - Small enough for one focused implementation session.
   - Must include source story, dependency, scope, allowed files, risk types, validation commands, evidence path, retry count, and status.

Phase 0 and Phase 1 should be decomposed in detail first. Later modules can remain at medium granularity until the foundation is stable.

## 6. Skill Dispatch

Newly installed local skills must be picked up after restarting Codex. The automation design records them but does not assume the current session can invoke them.

Immediate Superpowers skills:

- `superpowers:brainstorming`
- `superpowers:writing-plans`
- `superpowers:executing-plans`
- `superpowers:test-driven-development`
- `superpowers:systematic-debugging`
- `superpowers:verification-before-completion`
- `superpowers:requesting-code-review`

Installed local skills for later sessions:

- oh-my-codex workflow skills: `ralplan`, `ralph`, `autopilot`, `code-review`, `pipeline`, `plan`, `team`, `worker`, `ultrawork`, `ultraqa`, `omx-setup`.
- Ralph PRD helper: `prd`.
- Code cleanup: `code-simplifier`.
- Technical domain skills: `drizzle-orm-expert`, `nextjs-app-router-patterns`, `nextjs-best-practices`, `react-nextjs-development`, `shadcn`, `tailwind-design-system`, `tailwind-patterns`, `vercel-ai-sdk-expert`, `rag-engineer`, `rag-implementation`, `playwright-skill`, `postgres-best-practices`, `postgresql`, `typescript-expert`, `auth-implementation-patterns`, `e2e-testing`, `webapp-testing`, `tdd-orchestrator`, `tdd-workflow`, `testing-patterns`, `unit-testing-test-generate`.

Skill use is JIT:

- DB work uses Drizzle/Postgres skills.
- Auth work uses auth and permission skills.
- UI work uses shadcn, Tailwind, React, and Next.js skills.
- AI/RAG work uses Vercel AI SDK and RAG skills.
- Testing work uses TDD, Playwright, and testing pattern skills.
- Cleanup work uses `code-simplifier`, then reruns gates.

## 7. PowerShell Script Skeleton

Scripts live in:

`scripts/agent-system/`

First version scripts do not call Codex skills directly. They only read state, create templates, update task status, and run available commands.

Planned scripts:

- `Read-ProjectState.ps1`
- `Test-AgentSystemReadiness.ps1`
- `New-TaskPlan.ps1`
- `Update-TaskStatus.ps1`
- `New-FailureReport.ps1`
- `Invoke-QualityGate.ps1`

The scripts help cross-session recovery, but the Codex session remains responsible for invoking skills according to SOP.

## 8. Failure Handling

Each task has a retry count. If the same task fails three times:

- Mark task as `blocked`.
- Write a failure report to `docs/06-issue-tracking/bug-reports/` or `docs/06-issue-tracking/refactor-debts/`.
- Update `project-state.yaml.currentTask.lastFailurePath`.
- Stop the automation loop.
- Wait for human decision.

## 9. Phase 0 Deliverables

Phase 0 creates:

- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `scripts/agent-system/*.ps1`
- `docs/05-execution-logs/task-plans/2026-05-15-phase-0-architecture-freeze-and-agent-system.md`

Phase 0 may also update project gates:

- `package.json`
- `.husky/pre-commit`
- `tsconfig.json`
- `eslint.config.mjs`

Those updates are implementation work and must be planned before editing.

## 10. Open Questions

- Exact task IDs for Phase 0 and Phase 1 will be generated in `task-queue.yaml`.
- Draft PR automation depends on available GitHub tooling and credentials.
- Strict Xinchuang compliance is explicitly out of scope unless a future customer requirement changes it.
